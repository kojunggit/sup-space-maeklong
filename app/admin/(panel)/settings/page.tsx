import { getMaxBoards, getClosedSlots } from "@/app/actions/settings";
import { getCampaignStats } from "@/app/actions/campaign";
import { readTelegramConfig } from "@/app/lib/telegram-config";
import AdminSettings from "../../_components/AdminSettings";
import ClosedSlotsSettings from "../../_components/ClosedSlotsSettings";
import TelegramSettings from "../../_components/TelegramSettings";
import CampaignSettings from "../../_components/CampaignSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [maxBoards, closedSlots, telegramConfig, campaignStats] = await Promise.all([
    getMaxBoards(),
    getClosedSlots(),
    readTelegramConfig(),
    getCampaignStats(),
  ]);

  return (
    <div className="px-4 py-5 md:px-6 md:py-7 max-w-[680px]">
      <h2 style={{ fontFamily: "var(--font-kanit)", fontSize: 20, fontWeight: 700, color: "var(--fg-1)", margin: "0 0 6px" }}>
        ตั้งค่าระบบ
      </h2>
      <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 13, color: "var(--fg-3)", margin: "0 0 24px" }}>
        ปรับค่าที่ใช้ทั่วทั้งระบบการจอง
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {/* Capacity */}
        <SectionLabel label="ความจุต่อรอบ" />
        <AdminSettings initialMaxBoards={maxBoards} />

        {/* Closed dates / times */}
        <SectionLabel label="วันปิดบริการ" />
        <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "var(--fg-3)", margin: "0 0 4px", lineHeight: 1.5 }}>
          วันหรือเวลาที่ตั้งค่าไว้จะไม่สามารถจองได้ และจะไม่แสดงเป็นตัวเลือกให้ลูกค้า
        </p>
        <ClosedSlotsSettings initialSlots={closedSlots} />

        {/* Telegram notifications */}
        <SectionLabel label="การแจ้งเตือน" />
        <TelegramSettings
          initialToken={telegramConfig?.token ?? ""}
          initialChatId={telegramConfig?.chatId ?? ""}
        />

        {/* Dance Challenge campaign */}
        <SectionLabel label="แคมเปญ Dance Challenge" />
        <CampaignSettings initialStats={campaignStats} />
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700,
      color: "var(--sup-teal)", textTransform: "uppercase", letterSpacing: "0.14em",
      marginTop: 8,
    }}>
      {label}
    </div>
  );
}
