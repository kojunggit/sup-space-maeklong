"use client";

import { useState, useTransition } from "react";
import {
  listMembers, createMember, addPackage, cancelPackage, recordVisit,
  undoVisit, getMemberVisits,
  type MemberView, type PackageView, type PackageType,
} from "@/app/actions/members";

interface Props { initialMembers: MemberView[]; }

const EMPTY = {
  name: "", phone: "", email: "", channel: "", contactId: "", note: "",
  initialPackage: "" as "" | PackageType,
};

const CHANNELS = [
  { v: "", label: "— ช่องทางติดต่อ —" },
  { v: "line", label: "LINE" },
  { v: "whatsapp", label: "WhatsApp" },
  { v: "messenger", label: "Messenger" },
];

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "8px 12px",
  borderRadius: 8, border: "1.5px solid var(--border-2)",
  fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-1)",
  background: "#fafafa", outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 500,
  color: "var(--fg-3)", fontFamily: "var(--font-kanit)", marginBottom: 4,
};
const cardStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 12, padding: 18,
  boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-1)",
};

function PackageBadge({ p }: { p: PackageView }) {
  const cancelled = p.status === "CANCELLED" || (!p.usable && p.type === "COUNT" && p.remaining === 0);
  const expired = p.type === "MONTH" && !p.usable && p.status !== "PENDING" && p.startDateIso;
  const dim = cancelled || expired || p.status === "CANCELLED";
  const bg = p.type === "MONTH" ? "#F3E5F5" : "var(--teal-50)";
  const fg = p.type === "MONTH" ? "#7B1FA2" : "var(--teal-700)";
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 999,
      fontFamily: "var(--font-kanit)", fontSize: 11, fontWeight: 600,
      background: dim ? "var(--sand-50)" : bg, color: dim ? "var(--fg-4)" : fg,
      textDecoration: p.status === "CANCELLED" ? "line-through" : "none",
    }}>{p.label}</span>
  );
}

export default function MembersManager({ initialMembers }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery]     = useState("");
  const [form, setForm]       = useState(EMPTY);
  const [created, setCreated] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [banner, setBanner]   = useState<{ ok: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<Record<string, Array<{ id: string; packageType: string; visitNumber: number | null; via: string; createdAtIso: string }>>>({});
  const [isPending, startTransition] = useTransition();

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const refresh = () => startTransition(async () => { setMembers(await listMembers()); });

  const flash = (ok: boolean, text: string) => {
    setBanner({ ok, text });
    setTimeout(() => setBanner(null), 4000);
  };

  const handleCreate = () => {
    setCreated(false); setError(null);
    const missing: string[] = [];
    if (!form.name.trim()) missing.push("ชื่อ");
    if (!form.phone.trim()) missing.push("เบอร์โทร");
    if (missing.length) { setError(`กรุณากรอก: ${missing.join(", ")}`); return; }
    startTransition(async () => {
      const res = await createMember({
        name: form.name, phone: form.phone,
        email: form.email || undefined, channel: form.channel || undefined,
        contactId: form.contactId || undefined, note: form.note || undefined,
        initialPackage: form.initialPackage || undefined,
      });
      if (res.ok) {
        setCreated(true); setForm(EMPTY);
        setTimeout(() => setCreated(false), 3000);
        setMembers(await listMembers());
      } else {
        setError(res.error ?? "บันทึกไม่สำเร็จ");
      }
    });
  };

  const handleAddPackage = (m: MemberView, type: PackageType) => {
    const name = type === "COUNT" ? "แพค 10 ครั้ง (฿2,900)" : "แพครายเดือน (฿3,500)";
    if (!window.confirm(`เพิ่ม ${name} ให้ ${m.name}?`)) return;
    startTransition(async () => {
      const res = await addPackage(m.id, type);
      if (res.ok) { flash(true, `เพิ่ม${name}ให้ ${m.name} แล้ว`); setMembers(await listMembers()); }
      else flash(false, res.error ?? "เพิ่มแพคไม่สำเร็จ");
    });
  };

  const handleRecord = (m: MemberView, p: PackageView) => {
    if (!window.confirm(`บันทึกการมาของ ${m.name} (${p.type === "MONTH" ? "รายเดือน" : "10 ครั้ง"})?`)) return;
    startTransition(async () => {
      const res = await recordVisit({ memberId: m.id, packageId: p.id, via: "admin" });
      flash(res.ok, stripHtml(res.summary));
      setMembers(await listMembers());
    });
  };

  const handleCancelPackage = (m: MemberView, p: PackageView) => {
    if (!window.confirm(`ยกเลิก${p.label} ของ ${m.name}? (กู้คืนไม่ได้)`)) return;
    startTransition(async () => {
      const res = await cancelPackage(p.id);
      if (res.ok) { flash(true, "ยกเลิกแพคแล้ว"); setMembers(await listMembers()); }
      else flash(false, "ยกเลิกไม่สำเร็จ");
    });
  };

  const toggleHistory = (m: MemberView) => {
    if (history[m.id]) { setHistory((h) => { const n = { ...h }; delete n[m.id]; return n; }); return; }
    startTransition(async () => {
      const visits = await getMemberVisits(m.id);
      setHistory((h) => ({ ...h, [m.id]: visits }));
    });
  };

  const handleUndo = (m: MemberView, visitId: string) => {
    if (!window.confirm("ยกเลิกการบันทึกครั้งนี้?")) return;
    startTransition(async () => {
      const res = await undoVisit(visitId);
      if (res.ok) {
        flash(true, "ยกเลิกการบันทึกแล้ว");
        const [visits, list] = await Promise.all([getMemberVisits(m.id), listMembers()]);
        setHistory((h) => ({ ...h, [m.id]: visits }));
        setMembers(list);
      } else flash(false, "ยกเลิกไม่สำเร็จ");
    });
  };

  const q = query.trim().toLowerCase();
  const shown = q
    ? members.filter((m) => m.name.toLowerCase().includes(q) || m.phone.includes(q.replace(/\D/g, "")))
    : members;

  const tealBtn = (label: string, onClick: () => void, extra?: React.CSSProperties): React.ReactNode => (
    <button onClick={onClick} disabled={isPending} style={{
      padding: "6px 12px", borderRadius: 7, border: "1.5px solid var(--sup-teal)",
      background: "#fff", color: "var(--sup-teal)", fontFamily: "var(--font-kanit)",
      fontSize: 12, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", ...extra,
    }}>{label}</button>
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {banner && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 500,
          background: banner.ok ? "#F6FFED" : "#FFF1F0", color: banner.ok ? "#237804" : "var(--danger)",
          border: `1px solid ${banner.ok ? "#B7EB8F" : "#FFCCC7"}`, whiteSpace: "pre-line",
        }}>{banner.text}</div>
      )}

      {/* ─── Create member ─── */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>👥</span>
          <div>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600, color: "var(--fg-1)" }}>เพิ่มสมาชิกใหม่</div>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 11, color: "var(--fg-4)", marginTop: 2 }}>เบอร์โทรใช้เป็นรหัสสมาชิก (แก้ไม่ได้ภายหลัง)</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>ชื่อสมาชิก *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="มะลิ สุวรรณ" style={inputStyle} /></div>
            <div><label style={labelStyle}>เบอร์โทร *</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0812345678" style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>อีเมล</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="(ไม่บังคับ)" style={inputStyle} /></div>
            <div><label style={labelStyle}>ช่องทาง / ID ติดต่อ</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select value={form.channel} onChange={(e) => set("channel", e.target.value)} style={{ ...inputStyle, width: 130 }}>
                  {CHANNELS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
                </select>
                <input value={form.contactId} onChange={(e) => set("contactId", e.target.value)} placeholder="LINE ID / username" style={inputStyle} />
              </div></div>
          </div>
          <div><label style={labelStyle}>หมายเหตุ</label>
            <input value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="(ไม่บังคับ)" style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>แพคเกจเริ่มต้น (ไม่บังคับ)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {([["", "ยังไม่ซื้อ"], ["COUNT", "10 ครั้ง · ฿2,900"], ["MONTH", "รายเดือน · ฿3,500"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => set("initialPackage", v)} style={{
                  padding: "7px 14px", borderRadius: 8, fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 600,
                  cursor: "pointer",
                  border: form.initialPackage === v ? "2px solid var(--sup-teal)" : "1.5px solid var(--border-2)",
                  background: form.initialPackage === v ? "var(--teal-50)" : "#fff",
                  color: form.initialPackage === v ? "var(--sup-teal)" : "var(--fg-2)",
                }}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
          {created && <span style={{ fontSize: 13, color: "#389E0D", fontWeight: 600 }}>✓ เพิ่มสมาชิกแล้ว</span>}
          {error && <span style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{error}</span>}
          <button onClick={handleCreate} disabled={isPending} style={{
            marginLeft: "auto", padding: "9px 24px", borderRadius: 8, border: "none",
            background: isPending ? "var(--border-2)" : "var(--sup-teal)",
            color: isPending ? "var(--fg-4)" : "#fff",
            fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
          }}>{isPending ? "..." : "เพิ่มสมาชิก"}</button>
        </div>
      </div>

      {/* ─── Search ─── */}
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`🔍 ค้นหาชื่อ / เบอร์ (${members.length} สมาชิก)`} style={inputStyle} />

      {/* ─── Member list ─── */}
      <div style={{ display: "grid", gap: 10 }}>
        {shown.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", fontFamily: "var(--font-kanit)", color: "var(--fg-4)", fontSize: 14 }}>
            {members.length === 0 ? "ยังไม่มีสมาชิก" : "ไม่พบสมาชิกที่ค้นหา"}
          </div>
        )}
        {shown.map((m) => (
          <div key={m.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 16, color: "var(--fg-1)" }}>{m.name}</div>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--fg-2)", marginTop: 2 }}>{m.phoneDisplay}
                  {m.channel && m.contactId && <span style={{ color: "var(--fg-4)" }}> · {m.channel}: {m.contactId}</span>}
                </div>
                {m.note && <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "var(--fg-4)", marginTop: 2 }}>📝 {m.note}</div>}
              </div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "var(--fg-3)", whiteSpace: "nowrap" }}>มาแล้ว {m.totalVisits} ครั้ง</div>
            </div>

            {/* Packages */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
              {m.packages.length === 0
                ? <span style={{ fontFamily: "var(--font-kanit)", fontSize: 12, color: "var(--fg-4)" }}>ยังไม่มีแพคเกจ</span>
                : m.packages.map((p) => (
                    <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <PackageBadge p={p} />
                      {p.status !== "CANCELLED" && (p.usable || p.type === "MONTH") && (
                        <button onClick={() => handleCancelPackage(m, p)} title="ยกเลิกแพค" style={{
                          border: "none", background: "transparent", cursor: "pointer", color: "var(--fg-4)", fontSize: 13, padding: 0,
                        }}>✕</button>
                      )}
                    </span>
                  ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px dashed var(--border-1)", paddingTop: 12 }}>
              {m.usablePackages.map((p) =>
                tealBtn(
                  `✅ บันทึกการมา${m.usablePackages.length > 1 ? ` (${p.type === "MONTH" ? "รายเดือน" : `เหลือ ${p.remaining}`})` : ""}`,
                  () => handleRecord(m, p),
                  { borderColor: "var(--sup-orange)", color: "var(--sup-orange)" },
                ),
              )}
              {tealBtn("+ แพค 10 ครั้ง", () => handleAddPackage(m, "COUNT"))}
              {tealBtn("+ แพครายเดือน", () => handleAddPackage(m, "MONTH"))}
              {tealBtn(history[m.id] ? "ซ่อนประวัติ" : "ประวัติ", () => toggleHistory(m), { border: "1.5px solid var(--border-2)", color: "var(--fg-2)" })}
            </div>

            {/* History */}
            {history[m.id] && (
              <div style={{ marginTop: 12, borderTop: "1px dashed var(--border-1)", paddingTop: 10, display: "grid", gap: 6 }}>
                {history[m.id].length === 0
                  ? <span style={{ fontFamily: "var(--font-kanit)", fontSize: 12, color: "var(--fg-4)" }}>ยังไม่มีประวัติการมา</span>
                  : history[m.id].map((v) => (
                      <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--font-kanit)", fontSize: 12, color: "var(--fg-2)" }}>
                        <span>{new Date(v.createdAtIso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })} · {v.packageType === "MONTH" ? "รายเดือน" : `ครั้งที่ ${v.visitNumber}`} · {v.via}</span>
                        <button onClick={() => handleUndo(m, v.id)} disabled={isPending} style={{
                          border: "none", background: "transparent", color: "var(--danger)", cursor: "pointer", fontSize: 11, fontWeight: 600,
                        }}>ยกเลิก</button>
                      </div>
                    ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
