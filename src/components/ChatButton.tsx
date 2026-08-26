"use client";

import { CircleQuestionMark } from "lucide-react";
import { useTranslations } from "next-intl";

type ChatButtonProps = {
  ariaControls?: string;
  ariaExpanded?: boolean;
  onClick: () => void;
};

export default function ChatButton({
  ariaControls,
  ariaExpanded,
  onClick,
}: ChatButtonProps) {
  const t = useTranslations();

  return (
    <button
      type="button"
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-label={t("common.openChat")}
      onClick={onClick}
      className="group relative flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-violet-400 via-purple-600 to-purple-950 text-white"
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-white/30 via-white/5 to-black/20" />
      <CircleQuestionMark
        aria-hidden="true"
        strokeWidth={2.25}
        className="relative size-10"
      />
    </button>
  );
}
