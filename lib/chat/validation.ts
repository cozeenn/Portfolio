export type ValidatedChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const MAX_MESSAGES = 9;
export const MAX_MESSAGE_CHARACTERS = 500;
export const MAX_TOTAL_CHARACTERS = 4_000;

type ValidationResult =
  | { ok: true; messages: ValidatedChatMessage[] }
  | { ok: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateChatPayload(payload: unknown): ValidationResult {
  if (!isRecord(payload) || !Array.isArray(payload.messages)) {
    return { ok: false };
  }

  if (payload.messages.length < 1 || payload.messages.length > MAX_MESSAGES) {
    return { ok: false };
  }

  const messages: ValidatedChatMessage[] = [];
  let totalCharacters = 0;

  for (const [index, candidate] of payload.messages.entries()) {
    if (!isRecord(candidate)) {
      return { ok: false };
    }

    if (candidate.role !== "user" && candidate.role !== "assistant") {
      return { ok: false };
    }

    const expectedRole = index % 2 === 0 ? "user" : "assistant";
    if (candidate.role !== expectedRole) {
      return { ok: false };
    }

    if (typeof candidate.content !== "string") {
      return { ok: false };
    }

    if (candidate.content.length < 1 || candidate.content.length > MAX_MESSAGE_CHARACTERS) {
      return { ok: false };
    }

    const content = candidate.content.trim();
    if (!content) {
      return { ok: false };
    }

    totalCharacters += content.length;
    if (totalCharacters > MAX_TOTAL_CHARACTERS) {
      return { ok: false };
    }

    messages.push({ role: candidate.role, content });
  }

  if (messages.at(-1)?.role !== "user") {
    return { ok: false };
  }

  return { ok: true, messages };
}
