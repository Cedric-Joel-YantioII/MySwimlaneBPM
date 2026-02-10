"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Bot, X, Send } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
}

const MOCK_RESPONSES = [
  "I've delegated that to The Researcher. They'll have results within the hour.",
  "The Q3 evaluation workflow is 73% complete. Two tasks are pending review.",
  "I've created a new task and assigned it to the document review queue.",
  "All agents are currently active. Would you like me to prioritize a specific workflow?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const [responseIdx, setResponseIdx] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(1);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || typing) return;
    const userMsg: Message = { id: nextId.current++, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    const idx = responseIdx;
    setResponseIdx((i) => (i + 1) % MOCK_RESPONSES.length);

    setTimeout(() => {
      setTyping(false);
      const agentMsg: Message = { id: nextId.current++, role: "agent", text: MOCK_RESPONSES[idx] };
      setMessages((m) => [...m, agentMsg]);
      if (!open) setUnread(true);
    }, 1500);
  }, [input, typing, responseIdx, open]);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 max-md:bottom-36 max-md:right-4 max-md:left-4 z-50 transition-all duration-300 origin-bottom-right ${
          open ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
        }`}
        style={{ width: "min(380px, calc(100vw - 32px))" }}
      >
        <div
          className="rounded-2xl overflow-hidden flex flex-col shadow-2xl border"
          style={{
            height: "min(500px, 70vh)",
            background: "var(--glass-bg, rgba(255,255,255,0.85))",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "var(--border-primary, rgba(0,0,0,0.1))",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ background: "var(--accent-primary, #2563EB)" }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={18} color="white" />
            </div>
            <span className="text-white font-semibold text-sm flex-1">EvalFlow Assistant</span>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={16} color="white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {messages.length === 0 && !typing && (
              <div className="text-center py-8 opacity-50 text-sm" style={{ color: "var(--text-secondary)" }}>
                Ask me anything about your workflows.
              </div>
            )}
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end">
                  <div
                    className="max-w-[75%] px-3 py-2 rounded-2xl rounded-br-md text-sm text-white whitespace-pre-wrap"
                    style={{ background: "var(--accent-primary, #2563EB)" }}
                  >
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex gap-2 items-end">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent-primary, #2563EB)" }}
                  >
                    <Bot size={12} color="white" />
                  </div>
                  <div
                    className="max-w-[75%] px-3 py-2 rounded-2xl rounded-bl-md text-sm whitespace-pre-wrap"
                    style={{
                      background: "var(--glass-bg, rgba(0,0,0,0.05))",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-primary, rgba(0,0,0,0.1))",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            )}
            {typing && (
              <div className="flex gap-2 items-end">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent-primary, #2563EB)" }}
                >
                  <Bot size={12} color="white" />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-md flex gap-1"
                  style={{
                    background: "var(--glass-bg, rgba(0,0,0,0.05))",
                    border: "1px solid var(--border-primary, rgba(0,0,0,0.1))",
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 shrink-0" style={{ borderTop: "1px solid var(--border-primary, rgba(0,0,0,0.1))" }}>
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2"
              style={{
                background: "var(--glass-bg, rgba(0,0,0,0.03))",
                border: "1px solid var(--border-primary, rgba(0,0,0,0.1))",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-sm max-h-20"
                style={{ color: "var(--text-primary)" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || typing}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:opacity-30"
                style={{ background: "var(--accent-primary, #2563EB)" }}
              >
                <Send size={14} color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 max-md:bottom-20 max-md:right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          unread ? "animate-pulse" : ""
        }`}
        style={{ background: "var(--accent-primary, #2563EB)" }}
      >
        {open ? <X size={24} color="white" /> : <Bot size={24} color="white" />}
        {unread && !open && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
        )}
      </button>
    </>
  );
}
