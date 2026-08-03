"use client";

import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import type { ChatMessage } from "@/types/portfolio";

const SUGGESTIONS = [
  "What can Reo build?",
  "Tell me about his projects",
  "How can I contact Reo?",
] as const;

const REQUEST_TIMEOUT_MS = 25_000;
const MAX_CONTEXT_MESSAGES = 9;

type DisplayMessage = ChatMessage & {
  id: number;
  time: string;
  isError?: boolean;
};

type ChatResponse = {
  message?: unknown;
  error?: unknown;
};

function messageTime() {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function errorMessage(error: unknown, timedOut: boolean) {
  if (timedOut) return "That took too long. Please try again in a moment.";
  if (error instanceof Error && error.message.trim()) return error.message;
  return "The assistant is unavailable right now.";
}

export default function PortfolioAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: 0,
      role: "assistant",
      time: "NOW",
      content:
        "Hey! I’m Reo’s portfolio assistant. Ask me about his projects, skills, experience, or how to get in touch.",
    },
  ]);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<ChatMessage[]>([]);
  const requestControllerRef = useRef<AbortController | null>(null);
  const requestTimeoutRef = useRef(0);
  const launcherFocusFrameRef = useRef(0);
  const inputFocusFrameRef = useRef(0);
  const nextMessageId = useRef(1);
  const isBusyRef = useRef(false);
  const isMountedRef = useRef(true);

  const closeAssistant = useCallback((restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) {
      if (launcherFocusFrameRef.current) window.cancelAnimationFrame(launcherFocusFrameRef.current);
      launcherFocusFrameRef.current = window.requestAnimationFrame(() => {
        launcherFocusFrameRef.current = 0;
        launcherRef.current?.focus();
      });
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestControllerRef.current?.abort();
      if (requestTimeoutRef.current) window.clearTimeout(requestTimeoutRef.current);
      if (launcherFocusFrameRef.current) window.cancelAnimationFrame(launcherFocusFrameRef.current);
      if (inputFocusFrameRef.current) window.cancelAnimationFrame(inputFocusFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#assistant") setIsOpen(true);
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 180);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAssistant();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAssistant, isOpen]);

  useEffect(() => {
    const messageList = messagesRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [isBusy, messages]);

  const addMessage = useCallback((role: ChatMessage["role"], content: string, isError = false) => {
    setMessages((current) => [
      ...current,
      {
        id: nextMessageId.current++,
        role,
        content,
        time: messageTime(),
        isError,
      },
    ]);
  }, []);

  const sendMessage = useCallback(
    async (value: string) => {
      const clean = value.trim().slice(0, 500);
      if (!clean || isBusyRef.current) return;

      isBusyRef.current = true;
      setIsBusy(true);
      setShowSuggestions(false);
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "";
      addMessage("user", clean);

      const previousConversation = conversationRef.current;
      const userMessage: ChatMessage = { role: "user", content: clean };
      const requestConversation = [...previousConversation, userMessage].slice(-MAX_CONTEXT_MESSAGES);
      conversationRef.current = requestConversation;

      const controller = new AbortController();
      requestControllerRef.current = controller;
      let timedOut = false;
      const timeout = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, REQUEST_TIMEOUT_MS);
      requestTimeoutRef.current = timeout;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: requestConversation }),
          signal: controller.signal,
        });
        const data = (await response.json().catch(() => ({}))) as ChatResponse;

        if (!response.ok) {
          const serverError = typeof data.error === "string" ? data.error.trim() : "";
          throw new Error(serverError || "The assistant is unavailable right now.");
        }

        const answer = typeof data.message === "string" ? data.message.trim() : "";
        if (!answer) throw new Error("The assistant returned an empty response.");
        if (!isMountedRef.current) return;

        addMessage("assistant", answer);
        conversationRef.current = [
          ...requestConversation,
          { role: "assistant", content: answer.slice(0, 500) } satisfies ChatMessage,
        ].slice(-MAX_CONTEXT_MESSAGES);
      } catch (error) {
        if (!isMountedRef.current) return;
        conversationRef.current = previousConversation;
        addMessage("assistant", errorMessage(error, timedOut), true);
      } finally {
        window.clearTimeout(timeout);
        if (requestTimeoutRef.current === timeout) requestTimeoutRef.current = 0;
        if (requestControllerRef.current === controller) requestControllerRef.current = null;
        isBusyRef.current = false;
        if (isMountedRef.current) {
          setIsBusy(false);
          if (inputFocusFrameRef.current) window.cancelAnimationFrame(inputFocusFrameRef.current);
          inputFocusFrameRef.current = window.requestAnimationFrame(() => {
            inputFocusFrameRef.current = 0;
            inputRef.current?.focus();
          });
        }
      }
    },
    [addMessage],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <>
      <button
        ref={launcherRef}
        className={`chat-launcher${isOpen ? " hidden" : ""}`}
        id="chatLauncher"
        type="button"
        aria-label="Open Reo AI assistant"
        aria-expanded={isOpen}
        aria-controls="chatPanel"
        aria-hidden={isOpen}
        tabIndex={isOpen ? -1 : 0}
        onClick={() => setIsOpen(true)}
      >
        <span className="chat-launcher-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7 18.5 3.5 21v-5.2A8.4 8.4 0 0 1 3 13C3 8 7 4 12 4s9 4 9 9-4 9-9 9c-1.9 0-3.6-.5-5-1.5Z" />
            <path d="M8 12h.01M12 12h.01M16 12h.01" />
          </svg>
          <i />
        </span>
        <span className="chat-launcher-copy">
          <small>PORTFOLIO ASSISTANT</small>
          <b>ASK REO AI</b>
        </span>
        <span className="chat-launcher-arrow" aria-hidden="true">
          ↗
        </span>
      </button>

      <aside
        className={`chat-panel${isOpen ? " open" : ""}`}
        id="chatPanel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="chatTitle"
        aria-hidden={!isOpen}
      >
        <header className="chat-header">
          <div className="chat-identity">
            <span className="chat-avatar">
              RT<i />
            </span>
            <div>
              <h2 id="chatTitle">REO AI</h2>
              <p>
                <span /> GROQ-POWERED · ONLINE
              </p>
            </div>
          </div>
          <button className="chat-close" id="chatClose" type="button" aria-label="Close assistant" onClick={() => closeAssistant()}>
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="chat-context mono">
          <span>PORTFOLIO_INTELLIGENCE</span>
          <b>v1.0</b>
        </div>

        <div
          ref={messagesRef}
          className="chat-messages"
          id="chatMessages"
          aria-live="polite"
          aria-busy={isBusy}
          aria-label="Conversation"
        >
          {messages.map((message) => (
            <div
              className={`chat-message ${message.role}${message.isError ? " error" : ""}`}
              key={message.id}
            >
              <span className="message-label">
                {message.role === "user" ? "YOU" : "REO AI"} / {message.time}
              </span>
              <div className="message-bubble">{message.content}</div>
            </div>
          ))}

          {isBusy ? (
            <div className="chat-message assistant typing" aria-label="Reo AI is thinking">
              <span className="message-label">REO AI / THINKING</span>
              <div className="message-bubble typing-bubble" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
          ) : null}
        </div>

        {showSuggestions ? (
          <div className="chat-suggestions" id="chatSuggestions" aria-label="Suggested questions">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" disabled={isBusy} onClick={() => void sendMessage(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <form className="chat-form" id="chatForm" onSubmit={handleSubmit}>
          <label htmlFor="chatInput" className="sr-only">
            Ask Reo AI a question
          </label>
          <textarea
            ref={inputRef}
            id="chatInput"
            name="message"
            rows={1}
            maxLength={500}
            placeholder="Ask something about Reo…"
            required
            disabled={isBusy}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              event.target.style.height = "auto";
              event.target.style.height = `${Math.min(event.target.scrollHeight, 96)}px`;
            }}
            onKeyDown={handleInputKeyDown}
          />
          <button className="chat-send" type="submit" aria-label="Send message" disabled={isBusy || !input.trim()}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m5 12 14-7-4.8 14-2.8-5.9L5 12Z" />
            </svg>
          </button>
        </form>

        <footer className="chat-footer">
          <span>POWERED BY GROQ</span>
          <span>SERVER-SIDE API KEY</span>
        </footer>
      </aside>
    </>
  );
}
