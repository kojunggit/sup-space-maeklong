"use client";

import { useState } from "react";
import DanceChallengeJoinModal from "./DanceChallengeJoinModal";

interface Props {
  label: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function DanceChallengeJoinButton({ label, className, style }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className={className} style={{ cursor: "pointer", border: "none", ...style }}>
        {label}
      </button>
      <DanceChallengeJoinModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
