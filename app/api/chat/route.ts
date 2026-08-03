import { NextResponse } from "next/server";

import { PORTFOLIO_SYSTEM_PROMPT } from "@/lib/chat/prompt";
import {
  getClientId,
  isRateLimited,
  RATE_LIMIT_RETRY_SECONDS,
} from "@/lib/chat/rate-limit";
import { validateChatPayload } from "@/lib/chat/validation";

export const runtime = "nodejs";
export const maxDuration = 15;

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const MAX_REQUEST_BYTES = 16 * 1_024;
const GROQ_TIMEOUT_MS = 12_000;

type GroqCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

class RequestBodyTooLargeError extends Error {}

function jsonResponse(
  payload: { error: string } | { message: string },
  status: number,
  headers?: HeadersInit,
) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      ...headers,
    },
  });
}

async function readRequestBody(request: Request) {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_REQUEST_BYTES) {
    throw new RequestBodyTooLargeError();
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteLength += value.byteLength;
    if (byteLength > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new RequestBodyTooLargeError();
    }

    text += decoder.decode(value, { stream: true });
  }

  return text + decoder.decode();
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: Request) {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    return jsonResponse({ error: "The request must use JSON." }, 415);
  }

  let bodyText: string;
  try {
    bodyText = await readRequestBody(request);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return jsonResponse({ error: "The request is too large." }, 413);
    }
    return jsonResponse({ error: "The request could not be read." }, 400);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return jsonResponse({ error: "The request contains invalid JSON." }, 400);
  }

  const validation = validateChatPayload(payload);
  if (!validation.ok) {
    return jsonResponse({ error: "A valid user message is required." }, 400);
  }

  if (isRateLimited(getClientId(request))) {
    return jsonResponse(
      { error: "Too many messages. Please wait a minute and try again." },
      429,
      { "Retry-After": String(RATE_LIMIT_RETRY_SECONDS) },
    );
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return jsonResponse({ error: "The assistant is unavailable right now." }, 503);
  }

  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
  const completionRequest: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: PORTFOLIO_SYSTEM_PROMPT },
      ...validation.messages,
    ],
    temperature: 0.4,
    max_completion_tokens: 320,
  };

  if (model.toLowerCase().includes("gpt-oss")) {
    completionRequest.reasoning_effort = "low";
  }

  try {
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(completionRequest),
      cache: "no-store",
      signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
    });

    const completion = await groqResponse.json().catch(() => null) as GroqCompletionResponse | null;

    if (!groqResponse.ok) {
      if (groqResponse.status === 429) {
        return jsonResponse({ error: "The assistant is busy. Please try again shortly." }, 429);
      }
      return jsonResponse({ error: "The assistant could not respond right now." }, 502);
    }

    const message = completion?.choices?.[0]?.message?.content;
    if (typeof message !== "string" || !message.trim()) {
      return jsonResponse({ error: "The assistant could not respond right now." }, 502);
    }

    return jsonResponse({ message: message.trim() }, 200);
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return jsonResponse(
      { error: timedOut ? "The assistant took too long to respond." : "The assistant could not respond right now." },
      timedOut ? 504 : 502,
    );
  }
}
