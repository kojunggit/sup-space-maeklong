"use client";

import { useState, useTransition } from "react";
import { setTelegramConfig, testTelegramConfig } from "@/app/actions/settings";

interface Props {
  initialToken:  string;
  initialChatId: string;
}

export default function TelegramSettings({ initialToken, initialChatId }: Props) {
  const [token,  setToken]  = useState(initialToken);
  const [chatId, setChatId] = useState(initialChatId);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty = token !== initialToken || chatId !== initialChatId;

  const handleSave = () => {
    setSaved(false);
    setError(null);
    setTestMsg(null);
    startTransition(async () => {
      const res = await setTelegramConfig(token, chatId);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError("ไม่สามารถบันทึกได้ กรุณาตรวจสอบข้อมูล");
      }
    });
  };

  const handleTest = () => {
    setTestMsg(null);
    startTransition(async () => {
      const res = await testTelegramConfig();
      setTestMsg(
        res.ok
          ? { ok: true,  text: "✓ ส่งข้อความทดสอบสำเร็จ" }
          : { ok: false, text: `⚠ ${res.error ?? "เกิดข้อผิดพลาด"}` },
      );
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "8px 12px", borderRadius: 8,
    border: "1.5px solid var(--border-2)",
    fontFamily: "var(--font-inter)", fontSize: 13,
    color: "var(--fg-1)", background: "#fafafa",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
    fontFamily: "var(--font-kanit)", marginBottom: 4, display: "block",
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "20px",
      boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-1)",
      fontFamily: "var(--font-kanit)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>🤖</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-3)" }}>Telegram Bot</div>
          <div style={{ fontSize: 11, fontWeight: 300, color: "var(--fg-4)", marginTop: 2 }}>
            แจ้งเตือนเมื่อมีการจองใหม่
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label style={labelStyle}>Bot Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => { setToken(e.target.value); setSaved(false); setError(null); }}
            placeholder="123456789:ABCdef..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Chat ID</label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => { setChatId(e.target.value); setSaved(false); setError(null); }}
            placeholder="123456789"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        {saved && (
          <span style={{ fontSize: 13, color: "#389E0D", fontWeight: 600 }}>✓ บันทึกแล้ว</span>
        )}
        {error && (
          <span style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{error}</span>
        )}
        {testMsg && (
          <span style={{ fontSize: 13, fontWeight: 600, color: testMsg.ok ? "#389E0D" : "var(--danger)" }}>
            {testMsg.text}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            onClick={handleTest}
            disabled={isPending || isDirty}
            style={{
              padding: "8px 16px", borderRadius: 8,
              border: "1.5px solid var(--sup-teal)",
              background: "#fff", color: !isPending && !isDirty ? "var(--sup-teal)" : "var(--fg-4)",
              borderColor: !isPending && !isDirty ? "var(--sup-teal)" : "var(--border-2)",
              fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
              cursor: !isPending && !isDirty ? "pointer" : "not-allowed",
              transition: "all 160ms",
            }}
          >
            {isPending ? "..." : "ทดสอบ"}
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isPending}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: isDirty && !isPending ? "var(--sup-teal)" : "var(--border-2)",
              color: isDirty && !isPending ? "#fff" : "var(--fg-4)",
              fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
              cursor: isDirty && !isPending ? "pointer" : "not-allowed",
              transition: "all 160ms",
            }}
          >
            {isPending ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
