// src/app/messages/index.ts
import sv from "./sv.json";
import en from "./en.json";

export const messages = { sv, en };
export type Locale = keyof typeof messages;