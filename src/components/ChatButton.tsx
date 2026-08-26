"use client";

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
      className="h-full w-full cursor-pointer rounded-full bg-green-600"
    />
  );
}
