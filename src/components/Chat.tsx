"use client";

import { useChat } from "@ai-sdk/react";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { DefaultChatTransport, isTextUIPart } from "ai";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { renderTextWithLinks } from "@/lib/chat/render-text-with-links";
import { routing } from "@/i18n/routing";
import { MAX_MESSAGE_LENGTH, type ChatUIMessage } from "@/types/chat";

const INPUT_MAX_ROWS = 2;

function getMessageText(message: ChatUIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

const STICK_TO_BOTTOM_THRESHOLD_PX = 64;

function isNearBottom(element: HTMLElement) {
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <=
    STICK_TO_BOTTOM_THRESHOLD_PX
  );
}

function useStickToBottom() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  function pinToBottom() {
    stickToBottomRef.current = true;
  }

  useEffect(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;

    const observer = new ResizeObserver(() => {
      if (!stickToBottomRef.current) return;
      scroller.scrollTop = scroller.scrollHeight;
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  function onScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    stickToBottomRef.current = isNearBottom(scroller);
  }

  return { scrollerRef, contentRef, onScroll, pinToBottom };
}

type ChatProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Chat({ isOpen, onClose }: ChatProps) {
  const t = useTranslations();
  const requestedLocale = useLocale();
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { scrollerRef, contentRef, onScroll, pinToBottom } = useStickToBottom();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { locale },
      }),
    [locale],
  );

  const { messages, sendMessage, status, error, clearError, stop } =
    useChat<ChatUIMessage>({
      transport,
    });

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const assistantHasStartedWriting =
    lastMessage?.role === "assistant" && getMessageText(lastMessage).length > 0;
  const showGenerating = isBusy && !assistantHasStartedWriting;

  useEffect(() => {
    if (!isOpen || isBusy) return;

    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => window.clearTimeout(id);
  }, [isOpen, isBusy]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    el.style.height = "auto";
    const styles = getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight);
    const paddingY =
      Number.parseFloat(styles.paddingTop) +
      Number.parseFloat(styles.paddingBottom);
    const maxHeight = lineHeight * INPUT_MAX_ROWS + paddingY;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [input]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;

    if (text.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    clearError();
    setInput("");
    pinToBottom();
    await sendMessage({ text });
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-purple-900">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-foreground/10 px-4 py-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-textColor">
            {t("common.title")}
          </h1>
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

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-6 [overflow-anchor:none]"
      >
        <div
          ref={contentRef}
          className="mx-auto flex w-full max-w-2xl flex-col gap-4"
        >
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-purple-400/10 bg-purple-700 px-4 py-5 text-center text-sm text-textColor">
              {t("common.empty")}
            </div>
          )}

          {messages.map((message) => {
            const text = getMessageText(message);
            const isUser = message.role === "user";
            const isPendingAssistant =
              !isUser &&
              !text &&
              showGenerating &&
              message.id === lastMessage?.id;

            if (isPendingAssistant) {
              return null;
            }

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
                    <p className="mb-1 text-xs font-medium text-textColor/60">
                      {t("common.assistantLabel")}
                    </p>
                  )}
                  {text ? (
                    <span>{renderTextWithLinks(text)}</span>
                  ) : (
                    <span className="text-textColor/40">...</span>
                  )}
                </div>
              </div>
            );
          })}

          {showGenerating ? (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl border border-foreground/10 bg-foreground/3 px-4 py-3 text-sm leading-relaxed text-textColor">
                <span className="text-textColor/40">
                  {t("common.generating")}
                </span>
              </div>
            </div>
          ) : null}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error.message}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-foreground/10 px-4 py-4"
      >
        <div className="mx-auto flex w-full max-w-2xl items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={t("common.placeholder")}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={isBusy}
            rows={1}
            className="min-h-0 min-w-0 flex-1 resize-none overflow-y-auto rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm leading-5 text-black shadow-sm outline-none transition placeholder:text-black focus-visible:border-foreground/20 focus-visible:ring-4 focus-visible:ring-foreground/5 disabled:opacity-60"
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
        <p className="mx-auto mt-2 max-w-2xl text-xs text-textColor/80">
          {t("common.maxLength", { max: MAX_MESSAGE_LENGTH })}
        </p>
      </form>
    </div>
  );
}
