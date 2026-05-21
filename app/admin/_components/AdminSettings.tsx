"use client";

import { useState, useTransition } from "react";
import { setMaxBoards } from "@/app/actions/settings";

interface Props {
  initialMaxBoards: number;
}

export default function AdminSettings({ initialMaxBoards }: Props) {
  const [value, setValue]         = useState(initialMaxBoards);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState(false);
  const [isPending, startTransition] = useTransition();

  const isDirty = value !== initialMaxBoards;

  const handleSave = () => {
    setSaved(false);
    setError(false);
    startTransition(async () => {
      const res = await setMaxBoards(value);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(true);
      }
    });
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "16px 20px",
      boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-1)",
      display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      fontFamily: "var(--font-kanit)",
    }}>
      {/* Icon + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🏄</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-3)" }}>ความจุสูงสุดต่อรอบ</div>
          <div style={{ fontSize: 11, fontWeight: 300, color: "var(--fg-4)", marginTop: 2 }}>บอร์ดต่อ 1 time slot</div>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => setValue((v) => Math.max(1, v - 1))}
          style={{ width: 34, height: 34, borderRadius: 999, border: "1.5px solid var(--sup-teal)", background: "#fff", color: "var(--sup-teal)", fontSize: 20, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >−</button>

        <div style={{ fontFamily: "var(--font-inter)", fontSize: 28, fontWeight: 700, color: "var(--fg-1)", minWidth: 36, textAlign: "center" }}>
          {value}
        </div>

        <button
          onClick={() => setValue((v) => Math.min(50, v + 1))}
          style={{ width: 34, height: 34, borderRadius: 999, border: "1.5px solid var(--sup-teal)", background: "#fff", color: "var(--sup-teal)", fontSize: 20, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >+</button>

        <span style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 300, whiteSpace: "nowrap" }}>บอร์ด / รอบ</span>
      </div>

      {/* Save button + feedback */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
        {saved && (
          <span style={{ fontSize: 13, color: "#389E0D", fontWeight: 600 }}>✓ บันทึกแล้ว</span>
        )}
        {error && (
          <span style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>⚠ เกิดข้อผิดพลาด</span>
        )}
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
  );
}
