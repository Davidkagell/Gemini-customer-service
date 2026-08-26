"use client";

import { useEffect, useId, useState } from "react";
import Chat from "@/components/Chat";
import ChatButton from "@/components/ChatButton";

export default function ChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!isExpanded) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsExpanded(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isExpanded]);

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 origin-bottom-right overflow-hidden bg-purple-900 shadow-lg transition-[width,height,border-radius,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        isExpanded
          ? "h-[min(32rem,calc(100dvh-5rem))] w-[min(24rem,calc(100vw-2rem))] rounded-2xl shadow-2xl"
          : "h-[30px] w-[30px] rounded-full"
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
        <Chat onClose={() => setIsExpanded(false)} />
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
