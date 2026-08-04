"use client";

import { useEffect, useState, useTransition } from "react";
import { useLang } from "./lang-context";
import { T } from "./translations";
import { submitDanceChallengeEntry } from "@/app/actions/dance-challenge";

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-kanit)", fontSize: 15, padding: "11px 13px",
  borderRadius: 8, border: "1.5px solid var(--border-2)",
  background: "#fff", color: "var(--fg-1)", outline: "none", width: "100%",
};

export default function DanceChallengeJoinModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLang();
  const t = T[lang].danceChallenge;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setName(""); setPhone(""); setClipUrl(""); setError(""); setSuccess(false);
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    setError("");
    startTransition(async () => {
      const res = await submitDanceChallengeEntry({ name, phone, clipUrl });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(res.error || t.joinFormErrorGeneric);
      }
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(26,32,44,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, padding: "28px 26px",
          maxWidth: 420, width: "100%", position: "relative",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={onClose}
          aria-label={t.joinFormClose}
          style={{
            position: "absolute", top: 14, right: 14,
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 18, color: "var(--fg-3)", padding: 4, lineHeight: 1,
          }}
        >
          ✕
        </button>

        {success ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 19, color: "var(--fg-1)", marginBottom: 8 }}>
              {t.joinFormSuccessTitle}
            </div>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-2)", lineHeight: 1.65, margin: "0 0 20px" }}>
              {t.joinFormSuccessBody}
            </p>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: "10px 24px", fontSize: 14 }}
            >
              {t.joinFormClose}
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 20, color: "var(--fg-1)", margin: "0 0 6px" }}>
              {t.joinFormTitle}
            </div>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 13, color: "var(--fg-3)", lineHeight: 1.6, margin: "0 0 20px" }}>
              {t.joinFormIntro}
            </p>

            <div style={{ display: "grid", gap: 14 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)" }}>{t.joinFormNameLabel}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.joinFormNamePlaceholder} style={inputStyle} />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)" }}>{t.joinFormPhoneLabel}</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.joinFormPhonePlaceholder} style={inputStyle} />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)" }}>{t.joinFormClipLabel}</span>
                <input value={clipUrl} onChange={(e) => setClipUrl(e.target.value)} placeholder={t.joinFormClipPlaceholder} style={inputStyle} />
              </label>

              {error && (
                <span style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 500 }}>⚠ {error}</span>
              )}

              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="btn"
                style={{
                  background: "var(--campaign-accent)", color: "#fff",
                  padding: "13px 20px", fontSize: 15, fontWeight: 700,
                  opacity: isPending ? 0.7 : 1, marginTop: 4,
                }}
              >
                {isPending ? t.joinFormSubmitting : t.joinFormSubmit}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
