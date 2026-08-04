import Link from "next/link";

export const metadata = {
  title: "Data Deletion Instructions | SUP Space Maeklong",
  description:
    "How to request deletion of your data collected via our Facebook Messenger chatbot. วิธีขอลบข้อมูลที่เก็บผ่านแชทบอท Facebook Messenger ของเรา",
};

const h2: React.CSSProperties = {
  fontFamily: "var(--font-kanit)",
  fontSize: 20,
  fontWeight: 600,
  color: "var(--sup-dark)",
  margin: "32px 0 10px",
};

const p: React.CSSProperties = {
  fontFamily: "var(--font-kanit)",
  fontWeight: 300,
  fontSize: 15,
  lineHeight: 1.75,
  color: "var(--fg-2)",
  margin: "0 0 12px",
};

const ul: React.CSSProperties = { ...p, paddingLeft: 22, margin: "0 0 12px" };

export default function DataDeletionPage() {
  return (
    <main style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--sup-teal)",
            textDecoration: "none",
          }}
        >
          ← SUP Space Maeklong
        </Link>

        <h1
          style={{
            fontFamily: "var(--font-kanit)",
            fontSize: 32,
            fontWeight: 700,
            color: "var(--sup-dark)",
            margin: "18px 0 4px",
          }}
        >
          Data Deletion Instructions · วิธีขอลบข้อมูล
        </h1>
        <p style={{ ...p, fontSize: 13, color: "var(--fg-3, #888)" }}>
          Last updated: July 7, 2026 · ปรับปรุงล่าสุด: 7 กรกฎาคม 2569
        </p>

        {/* ─── English ─────────────────────────────────────────────── */}
        <h2 style={h2}>What data our chatbot collects</h2>
        <p style={p}>
          When you message our Facebook Page, our automated assistant (&ldquo;น้องปลาทู&rdquo;)
          receives your Page-Scoped ID (PSID — an identifier unique to our Page, not your Facebook
          account), the text of your messages, and timestamps. This is used only to hold a
          conversation with you and, if you choose to book a trip, to process your booking.
        </p>

        <h2 style={h2}>Automatic deletion</h2>
        <p style={p}>
          Conversation data is deleted automatically — if you don&rsquo;t message us again within{" "}
          <strong>7 days</strong>, your conversation history is permanently removed from our
          systems. No action is needed on your part for this.
        </p>

        <h2 style={h2}>Requesting deletion immediately</h2>
        <p style={p}>
          If you&rsquo;d like your data deleted sooner, contact us through any channel below with
          the name or phone number you used, and we will delete it within 30 days:
        </p>
        <ul style={ul}>
          <li>
            Email:{" "}
            <a href="mailto:mrkosit@gmail.com" style={{ color: "var(--sup-teal)" }}>
              mrkosit@gmail.com
            </a>
          </li>
          <li>Phone / WhatsApp: 083-714-6958</li>
          <li>LINE: @256pyxrx</li>
          <li>
            Facebook:{" "}
            <a href="https://www.facebook.com/SUPSpaceMaeklong" style={{ color: "var(--sup-teal)" }}>
              facebook.com/SUPSpaceMaeklong
            </a>
          </li>
        </ul>
        <p style={p}>
          This applies to data collected through Facebook Messenger, LINE, and WhatsApp. It does
          not affect confirmed booking records we&rsquo;re required to keep for accounting or legal
          purposes — see our{" "}
          <Link href="/privacy" style={{ color: "var(--sup-teal)" }}>
            Privacy Policy
          </Link>{" "}
          for details.
        </p>

        {/* ─── Thai ────────────────────────────────────────────────── */}
        <hr style={{ border: "none", borderTop: "1px solid var(--border-1, #eee)", margin: "40px 0" }} />

        <h2 style={h2}>ข้อมูลที่แชทบอทของเราเก็บ</h2>
        <p style={p}>
          เมื่อคุณทักแชทมาที่เพจ Facebook ของเรา ผู้ช่วยอัตโนมัติ &ldquo;น้องปลาทู&rdquo;
          จะได้รับ Page-Scoped ID (PSID — รหัสเฉพาะสำหรับเพจนี้ ไม่ใช่บัญชี Facebook ของคุณโดยตรง)
          เนื้อหาข้อความ และเวลาที่ส่ง ใช้เพียงเพื่อสนทนากับคุณ
          และเพื่อดำเนินการจองหากคุณเลือกจองทริปผ่านแชท
        </p>

        <h2 style={h2}>การลบข้อมูลอัตโนมัติ</h2>
        <p style={p}>
          ข้อมูลบทสนทนาจะถูกลบอัตโนมัติ — หากคุณไม่ได้ทักแชทมาอีกภายใน <strong>7 วัน</strong>
          ประวัติการสนทนาของคุณจะถูกลบออกจากระบบอย่างถาวร ไม่ต้องดำเนินการใดๆ เพิ่มเติม
        </p>

        <h2 style={h2}>ขอให้ลบข้อมูลทันที</h2>
        <p style={p}>
          หากต้องการให้ลบข้อมูลเร็วกว่านั้น ติดต่อเราผ่านช่องทางด้านล่าง
          พร้อมแจ้งชื่อหรือเบอร์โทรศัพท์ที่ใช้ เราจะลบข้อมูลภายใน 30 วัน:
        </p>
        <ul style={ul}>
          <li>อีเมล: mrkosit@gmail.com</li>
          <li>โทร / WhatsApp: 083-714-6958</li>
          <li>LINE: @256pyxrx</li>
          <li>Facebook: facebook.com/SUPSpaceMaeklong</li>
        </ul>
        <p style={p}>
          ข้อนี้ครอบคลุมข้อมูลที่เก็บผ่าน Facebook Messenger, LINE และ WhatsApp
          แต่ไม่รวมถึงข้อมูลการจองที่ยืนยันแล้วซึ่งเราต้องเก็บไว้ตามข้อกำหนดทางบัญชีหรือกฎหมาย
          ดูรายละเอียดเพิ่มเติมที่{" "}
          <Link href="/privacy" style={{ color: "var(--sup-teal)" }}>
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>
      </div>
    </main>
  );
}
