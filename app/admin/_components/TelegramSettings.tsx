"use client";

import { useState, useTransition } from "react";
import {
  setTelegramConfig, testTelegramConfig,
  setTelegramWebhook, getTelegramWebhookInfo, deleteTelegramWebhook,
} from "@/app/actions/settings";

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

  // Webhook (membership bot — receives phone numbers)
  const [baseUrl, setBaseUrl] = useState("https://supspacemaeklong.com");
  const [hookMsg, setHookMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isDirty = token !== initialToken || chatId !== initialChatId;

  const handleRegisterHook = () => {
    setHookMsg(null);
    startTransition(async () => {
      const res = await setTelegramWebhook(baseUrl);
      setHookMsg(res.ok
        ? { ok: true,  text: `✓ เชื่อมต่อ webhook แล้ว: ${res.url}` }
        : { ok: false, text: `⚠ ${res.error ?? "ไม่สำเร็จ"}` });
    });
  };
  const handleHookInfo = () => {
    setHookMsg(null);
    startTransition(async () => {
      const res = await getTelegramWebhookInfo();
      setHookMsg(res.ok
        ? { ok: !res.lastError, text: `URL: ${res.url} · ค้าง ${res.pending} · ${res.lastError ? "error: " + res.lastError : "ปกติ"}` }
        : { ok: false, text: `⚠ ${res.error ?? "ไม่สำเร็จ"}` });
    });
  };
  const handleDeleteHook = () => {
    setHookMsg(null);
    startTransition(async () => {
      const res = await deleteTelegramWebhook();
      setHookMsg(res.ok ? { ok: true, text: "✓ ลบ webhook แล้ว" } : { ok: false, text: `⚠ ${res.error ?? "ไม่สำเร็จ"}` });
    });
  };

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

      {/* ─── Membership bot webhook ─── */}
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px dashed var(--border-1)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", marginBottom: 2 }}>
          🤝 Webhook สมาชิก (รับเบอร์โทรเช็คสิทธิ์)
        </div>
        <div style={{ fontSize: 11, fontWeight: 300, color: "var(--fg-4)", marginBottom: 10 }}>
          เชื่อมต่อให้ bot รับข้อความเข้าได้ · ต้องตั้ง Bot Token + Chat ID และบันทึกก่อน
        </div>
        <label style={labelStyle}>โดเมนเว็บ (สำหรับ webhook URL)</label>
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://supspacemaeklong.com"
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={handleRegisterHook} disabled={isPending} style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: isPending ? "var(--border-2)" : "var(--sup-teal)", color: "#fff",
            fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer",
          }}>เชื่อมต่อ Webhook</button>
          <button onClick={handleHookInfo} disabled={isPending} style={{
            padding: "8px 16px", borderRadius: 8, border: "1.5px solid var(--sup-teal)",
            background: "#fff", color: "var(--sup-teal)", fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
          }}>ตรวจสอบสถานะ</button>
          <button onClick={handleDeleteHook} disabled={isPending} style={{
            padding: "8px 16px", borderRadius: 8, border: "1.5px solid var(--border-2)",
            background: "#fff", color: "var(--danger)", fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
          }}>ลบ Webhook</button>
        </div>
        {hookMsg && (
          <div style={{
            marginTop: 10, fontSize: 12, fontWeight: 500, lineHeight: 1.5,
            color: hookMsg.ok ? "#389E0D" : "var(--danger)", wordBreak: "break-all",
          }}>{hookMsg.text}</div>
        )}
      </div>
    </div>
  );
}
