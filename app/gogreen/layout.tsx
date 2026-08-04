import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GoGreen พายเรือ | ระบบลงทะเบียน",
  description: "ระบบเช็คอินและสรุปข้อมูลผู้ลงทะเบียนกิจกรรม GoGreen",
  robots: { index: false, follow: false },
};

export default function GoGreenLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f9f9f7] text-[#0b0b0b] print:bg-white">{children}</div>;
}
