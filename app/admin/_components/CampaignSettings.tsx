"use client";

import { useState, useTransition } from "react";
import { setCampaignStats, type CampaignStats } from "@/app/actions/campaign";
import { TOTAL_FREE_SLOTS } from "@/app/_components/campaign-config";

interface Props {
  initialStats: CampaignStats;
}

function Stepper({
  icon, label, sub, value, onChange, min, max, unit,
}: {
  icon: string; label: string; sub: string;
  value: number; onChange: (v: number) => void;
  min: number; max: number; unit: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-3)" }}>{label}</div>
          <div style={{ fontSize: 11, fontWeight: 300, color: "var(--fg-4)", marginTop: 2 }}>{sub}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          style={{ width: 34, height: 34, borderRadius: 999, border: "1.5px solid var(--campaign-accent)", background: "#fff", color: "var(--campaign-accent)", fontSize: 20, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >−</button>

        <div style={{ fontFamily: "var(--font-inter)", fontSize: 28, fontWeight: 700, color: "var(--fg-1)", minWidth: 36, textAlign: "center" }}>
          {value}
        </div>

        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          style={{ width: 34, height: 34, borderRadius: 999, border: "1.5px solid var(--campaign-accent)", background: "#fff", color: "var(--campaign-accent)", fontSize: 20, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >+</button>

        <span style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 300, whiteSpace: "nowrap" }}>{unit}</span>
      </div>
    </div>
  );
}

export default function CampaignSettings({ initialStats }: Props) {
  const [remainingSlots, setRemainingSlots] = useState(initialStats.remainingSlots);
  const [participants, setParticipants]     = useState(initialStats.participants);
  const [saved, setSaved]                   = useState(false);
  const [error, setError]                   = useState(false);
  const [isPending, startTransition]        = useTransition();

  const isDirty = remainingSlots !== initialStats.remainingSlots || participants !== initialStats.participants;

  const handleSave = () => {
    setSaved(false);
    setError(false);
    startTransition(async () => {
      const res = await setCampaignStats({ remainingSlots, participants });
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
      display: "flex", flexDirection: "column", gap: 16,
      fontFamily: "var(--font-kanit)",
    }}>
      <Stepper
        icon="🎟️" label="สิทธิ์พายฟรีคงเหลือ" sub={`เต็มโควตาคือ ${TOTAL_FREE_SLOTS}`}
        value={remainingSlots} onChange={setRemainingSlots} min={0} max={TOTAL_FREE_SLOTS} unit={`/ ${TOTAL_FREE_SLOTS} สิทธิ์`}
      />
      <Stepper
        icon="🎉" label="ผู้เข้าร่วมทั้งหมด" sub="แสดงบนหน้าแรก"
        value={participants} onChange={setParticipants} min={0} max={999999} unit="คน"
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
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
            background: isDirty && !isPending ? "var(--campaign-accent)" : "var(--border-2)",
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
