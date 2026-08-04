import LogoutButton from "../_components/LogoutButton";
import AdminNav from "../_components/AdminNav";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--sand-50)] font-kanit">
      {/* Header */}
      <div className="bg-[var(--sup-teal)] text-white px-4 py-2.5 md:px-6 md:py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 md:gap-3">
          <span className="text-xl md:text-2xl">🏄</span>
          <div>
            <div className="font-bold text-base md:text-lg leading-tight">Sup Space Admin</div>
            <div className="hidden md:block text-xs opacity-75 font-light">จัดการการจองทั้งหมด</div>
          </div>
        </div>
        <LogoutButton />
      </div>

      {/* Tab nav (desktop top bar / mobile bottom bar) */}
      <AdminNav />

      {/* Page content — bottom padding clears the mobile bottom nav */}
      <div className="pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
    </div>
  );
}
