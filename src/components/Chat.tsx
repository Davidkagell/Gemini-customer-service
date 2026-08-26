"use client";

import { useChat } from "@ai-sdk/react";
import { useTranslations } from "next-intl";
import { DefaultChatTransport, isTextUIPart } from "ai";
import { useMemo, useState, type FormEvent } from "react";
import { MAX_MESSAGE_LENGTH, type ChatUIMessage } from "@/types/chat";

function getMessageText(message: ChatUIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

type ChatProps = {
  onClose: () => void;
};

export default function Chat({ onClose }: ChatProps) {
  const t = useTranslations();
  const [input, setInput] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, clearError, stop } =
    useChat<ChatUIMessage>({
      transport,
    });

  const isBusy = status === "submitted" || status === "streaming";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;

    if (text.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    clearError();
    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-purple-900">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-foreground/10 px-4 py-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-textColor">
            {t("common.title")}
          </h1>
          <p className="text-sm text-textColor/60">{t("common.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.closeChat")}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-textColor/70 transition hover:bg-foreground/10 hover:text-textColor"
        >
          ×
        </button>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-purple-400/10 bg-purple-700 px-4 py-10 text-center text-sm text-textColor">
            {t("common.empty")}
          </div>
        )}

        {messages.map((message) => {
          const text = getMessageText(message);
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-foreground text-background"
                    : "border border-foreground/10 bg-foreground/3 text-textColor"
                }`}
              >
                {!isUser && (
                  <p className="mb-1 text-xs font-medium text-textColor/45">
                    {t("common.assistantLabel")}
                  </p>
                )}
                {text || <span className="text-textColor/40">...</span>}
              </div>
            </div>
          );
        })}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error.message}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-foreground/10 px-4 py-4"
      >
        <div className="mx-auto flex w-full max-w-2xl gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t("common.placeholder")}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={isBusy}
            className="min-w-0 flex-1 rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-black shadow-sm outline-none transition placeholder:text-black focus:border-foreground/20 focus:ring-4 focus:ring-foreground/5 disabled:opacity-60"
          />
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="rounded-2xl border border-foreground/15 px-4 py-3 text-sm font-medium text-textColor transition hover:bg-foreground/5"
            >
              {t("common.stop")}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background transition disabled:opacity-40"
            >
              {t("common.send")}
            </button>
          )}
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-textColor/40">
          {t("common.maxLength", { max: MAX_MESSAGE_LENGTH })}
        </p>
      </form>
    </div>
  );
}
