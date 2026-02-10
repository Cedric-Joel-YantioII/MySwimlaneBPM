"use client";

import { ChatWidget } from "./chat-widget";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
