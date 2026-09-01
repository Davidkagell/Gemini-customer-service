"use client";

import { useEffect, useId, useRef, useState } from "react";
import Chat from "@/components/Chat";
import ChatButton from "@/components/ChatButton";

export default function ChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExpanded) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsExpanded(false);
    }

    function onPointerDown(event: PointerEvent) {
      const widget = widgetRef.current;
      if (!widget?.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isExpanded]);

  return (
    <div
      ref={widgetRef}
      className={`fixed right-12 bottom-12 z-50 origin-bottom-right overflow-hidden bg-purple-900 transition-[width,height,border-radius,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        isExpanded
          ? "h-[min(32rem,calc(100dvh-5rem))] w-[min(24rem,calc(100vw-2rem))] rounded-2xl shadow-2xl"
          : "h-20 w-20 rounded-full shadow-[0_10px_28px_rgba(88,28,135,0.5)] hover:scale-105 hover:shadow-[0_14px_36px_rgba(88,28,135,0.6)] active:scale-95"
      }`}
    >
      <div
        id={panelId}
        className={`flex h-full w-full flex-col transition-opacity motion-reduce:transition-none ${
          isExpanded
            ? "opacity-100 delay-150 duration-200"
            : "pointer-events-none opacity-0 duration-100"
        }`}
        inert={!isExpanded}
      >
        <Chat isOpen={isExpanded} onClose={() => setIsExpanded(false)} />
      </div>

      <div
        className={`absolute inset-0 transition-opacity motion-reduce:transition-none ${
          isExpanded
            ? "pointer-events-none opacity-0 duration-150"
            : "opacity-100 delay-150 duration-200"
        }`}
      >
        <ChatButton
          ariaControls={panelId}
          ariaExpanded={isExpanded}
          onClick={() => setIsExpanded(true)}
        />
      </div>
    </div>
  );
}
