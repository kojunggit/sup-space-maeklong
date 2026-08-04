"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";

// Bot backend — separate service at bot.supspacemaeklong.com (see sup-space-webhook repo).
// Public, unauthenticated endpoint; not a secret.
const API_BASE = "https://bot.supspacemaeklong.com";
const POLL_INTERVAL_MS = 3500;

type Msg = { role: "user" | "assistant"; content: string };
type Lang = "th" | "en";

const STRINGS: Record<Lang, {
  title: string;
  placeholder: string;
  greeting: string;
  handoffBadge: string;
  errorText: string;
}> = {
  th: {
    title: "คุยกับน้องปลาทู AI",
    placeholder: "พิมพ์ข้อความ...",
    greeting:
      "สวัสดีครับ! ผมน้องปลาทู AI ของ SUP Space Maeklong ครับ 🐟\n" +
      "ให้บริการพาย Stand Up Paddleboard ชมตลาดน้ำและวิถีชีวิตริมคลองแม่กลองครับ\n" +
      "สอบถามข้อมูลทริป ราคา หรือจองได้เลยนะครับ 🛶",
    handoffBadge: "ทีมงานกำลังดูแลอยู่",
    errorText: "ขออภัยครับ เชื่อมต่อไม่ได้ชั่วคราว ลองใหม่อีกครั้งนะครับ 🙏",
  },
  en: {
    title: "Chat with Nong Pratu AI",
    placeholder: "Type a message...",
    greeting:
      "Hi! I'm Nong Pratu AI from SUP Space Maeklong 🐟\n" +
      "We offer Stand Up Paddleboard tours of the floating market and life along the Maeklong canal.\n" +
      "Ask about trips, pricing, or book right here 🛶",
    handoffBadge: "Our team is helping you now",
    errorText: "Sorry, connection failed for a moment. Please try again. 🙏",
  },
};

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function readLang(): Lang {
  try {
    return localStorage.getItem("sup-lang") === "en" ? "en" : "th";
  } catch {
    return "th";
  }
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [handedOff, setHandedOff] = useState(false);
  const [lang, setLang] = useState<Lang>("th");

  const sessionIdRef = useRef<string>("");
  const cursorRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const t = STRINGS[lang];

  // Init: load or create a session id, restore any cached transcript, show the greeting once.
  useEffect(() => {
    setLang(readLang());
    let id = "";
    try {
      id = localStorage.getItem("sup-chat-session-id") || "";
      if (!id) {
        id = genId();
        localStorage.setItem("sup-chat-session-id", id);
      }
      const cachedMsgs = localStorage.getItem("sup-chat-messages");
      const cachedCursor = localStorage.getItem("sup-chat-cursor");
      if (cachedMsgs) setMessages(JSON.parse(cachedMsgs));
      if (cachedCursor) cursorRef.current = parseInt(cachedCursor, 10) || 0;
    } catch {
      id = genId();
    }
    sessionIdRef.current = id;

    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [{ role: "assistant", content: STRINGS[readLang()].greeting }];
    });
  }, []);

  // Persist transcript + cursor locally so a page reload doesn't lose the visible chat.
  useEffect(() => {
    try {
      localStorage.setItem("sup-chat-messages", JSON.stringify(messages.slice(-40)));
      localStorage.setItem("sup-chat-cursor", String(cursorRef.current));
    } catch {}
  }, [messages]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const poll = useCallback(async () => {
    if (!sessionIdRef.current) return;
    try {
      const res = await fetch(
        `${API_BASE}/webchat/poll?sessionId=${sessionIdRef.current}&since=${cursorRef.current}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages((prev) => [
          ...prev,
          ...data.messages.map((content: string) => ({ role: "assistant" as const, content })),
        ]);
      }
      if (typeof data.seq === "number") cursorRef.current = data.seq;
      setHandedOff(data.status === "handed_off");
    } catch {
      // best-effort — next tick retries
    }
  }, []);

  // Poll while the panel is open (picks up admin manual replies from /admin); one
  // immediate poll on open catches anything sent while the visitor had it closed.
  useEffect(() => {
    if (!open) return;
    void poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open, poll]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/webchat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, messageId: genId(), text }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
      if (typeof data.seq === "number") cursorRef.current = data.seq;
      setHandedOff(data.status === "handed_off");
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t.errorText }]);
    } finally {
      setSending(false);
    }
  }

  // Internal admin dashboard — not a customer-facing page, don't show the customer widget there.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-kanit">
      {open && (
        <div className="mb-3 flex h-[70vh] max-h-[560px] w-[92vw] max-w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-sup-xl">
          <div className="flex items-center justify-between bg-sup-teal px-4 py-3 text-white">
            <div>
              <div className="text-sm font-medium">{t.title}</div>
              {handedOff && (
                <div className="text-xs text-sup-teal-100 opacity-90">{t.handoffBadge}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="close"
              className="rounded-full border-0 bg-transparent p-1 text-white hover:bg-white/15"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={bodyRef} className="flex-1 space-y-2 overflow-y-auto bg-sup-sand-50 px-3 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-sup-orange text-white"
                      : "bg-white text-sup-dark shadow-sup-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-3 py-2 text-sm text-sup-slate-400 shadow-sup-sm">
                  …
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-sup-slate-100 bg-white p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={t.placeholder}
              className="flex-1 rounded-full border border-sup-slate-200 bg-white px-3 py-2 font-kanit text-sm text-sup-dark outline-none focus:border-sup-teal"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending || !input.trim()}
              aria-label="send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-0 bg-sup-orange text-white disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="chat"
        className="flex h-14 w-14 items-center justify-center rounded-full border-0 bg-sup-orange text-white shadow-glow-orange transition-transform hover:scale-105"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
