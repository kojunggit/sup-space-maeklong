import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | SUP Space Maeklong",
  description:
    "Privacy Policy for SUP Space Maeklong — how we collect, use, and protect your personal information. นโยบายความเป็นส่วนตัวของ SUP Space Maeklong",
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

export default function PrivacyPage() {
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
          Privacy Policy · นโยบายความเป็นส่วนตัว
        </h1>
        <p style={{ ...p, fontSize: 13, color: "var(--fg-3, #888)" }}>
          Last updated: July 7, 2026 · ปรับปรุงล่าสุด: 7 กรกฎาคม 2569
        </p>

        {/* ─── English ─────────────────────────────────────────────── */}
        <h2 style={h2}>1. Who we are</h2>
        <p style={p}>
          SUP Space Maeklong (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates
          stand-up paddleboard tours in Samut Songkhram, Thailand, and the website{" "}
          <strong>supspacemaeklong.com</strong>, including our related Facebook Page, Instagram,
          LINE, and WhatsApp channels. This policy explains how we collect, use, and protect your
          personal information.
        </p>

        <h2 style={h2}>2. Information we collect</h2>
        <ul style={ul}>
          <li>
            <strong>Booking information</strong> — your name, phone number, email address, number
            of participants, and the trip date, time, and route you select when you make a booking
            on our website or via chat (Facebook Messenger, LINE, or WhatsApp).
          </li>
          <li>
            <strong>Membership information</strong> — name, phone number, and visit history if you
            join one of our membership packages.
          </li>
          <li>
            <strong>Usage data</strong> — anonymous analytics (pages visited, device type) via
            Google Analytics cookies.
          </li>
          <li>
            <strong>Messages</strong> — the content of messages you send us through Facebook
            Messenger or other chat channels, used only to respond to you.
          </li>
        </ul>

        <h2 style={h2}>3. How we use your information</h2>
        <ul style={ul}>
          <li>To process and confirm your bookings and send booking confirmations.</li>
          <li>To contact you about your trip (changes, weather, safety information).</li>
          <li>To manage membership packages and record visits.</li>
          <li>To respond to your questions and messages.</li>
          <li>To improve our website and services through anonymous analytics.</li>
        </ul>
        <p style={p}>
          We do <strong>not</strong> sell, rent, or trade your personal information to any third
          party, and we do not use it for third-party advertising.
        </p>

        <h2 style={h2}>4. Sharing and third-party services</h2>
        <p style={p}>Your data is shared only with service providers needed to run our business:</p>
        <ul style={ul}>
          <li>
            <strong>Meta Platforms (Facebook / Messenger / Instagram / WhatsApp)</strong> — when
            you contact us through these channels, your messages are processed by Meta under{" "}
            <a href="https://www.facebook.com/privacy/policy" style={{ color: "var(--sup-teal)" }}>
              Meta&rsquo;s Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Google Analytics</strong> — anonymous website usage statistics.
          </li>
          <li>
            <strong>Telegram</strong> — internal booking notifications sent to our staff only.
          </li>
          <li>
            <strong>Email provider</strong> — to send you booking confirmation emails.
          </li>
        </ul>

        <h2 style={h2}>5. Data retention and security</h2>
        <p style={p}>
          Booking and membership records are kept only as long as needed for operations,
          accounting, and legal requirements. Data is stored on secured servers with access limited
          to authorized staff.
        </p>

        <h2 style={h2}>6. Your rights &amp; data deletion</h2>
        <p style={p}>
          You may request access to, correction of, or <strong>deletion</strong> of your personal
          data at any time. To request deletion, contact us via any channel below with the name and
          phone number used for your booking, and we will delete your data within 30 days:
        </p>
        <ul style={ul}>
          <li>Email: <a href="mailto:mrkosit@gmail.com" style={{ color: "var(--sup-teal)" }}>mrkosit@gmail.com</a></li>
          <li>Phone / WhatsApp: 083-714-6958</li>
          <li>LINE: @256pyxrx</li>
          <li>
            Facebook:{" "}
            <a href="https://www.facebook.com/SUPSpaceMaeklong" style={{ color: "var(--sup-teal)" }}>
              facebook.com/SUPSpaceMaeklong
            </a>
          </li>
        </ul>

        <h2 style={h2}>7. Cookies</h2>
        <p style={p}>
          We use only essential cookies (admin session) and Google Analytics cookies. You can block
          cookies in your browser settings without affecting your ability to make a booking.
        </p>

        <h2 style={h2}>8. Children</h2>
        <p style={p}>
          Our services are not directed at children under 13. Bookings for minors must be made by a
          parent or guardian.
        </p>

        <h2 style={h2}>9. Changes to this policy</h2>
        <p style={p}>
          We may update this policy from time to time. The latest version will always be available
          at this page.
        </p>

        {/* ─── Thai ────────────────────────────────────────────────── */}
        <hr style={{ border: "none", borderTop: "1px solid var(--border-1, #eee)", margin: "40px 0" }} />

        <h2 style={h2}>1. เราคือใคร</h2>
        <p style={p}>
          SUP Space Maeklong (&ldquo;เรา&rdquo;) ให้บริการทัวร์พายซับบอร์ดในจังหวัดสมุทรสงคราม
          และดูแลเว็บไซต์ <strong>supspacemaeklong.com</strong> รวมถึงเพจ Facebook, Instagram, LINE
          และ WhatsApp ของเรา นโยบายนี้อธิบายว่าเราเก็บ ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณอย่างไร
        </p>

        <h2 style={h2}>2. ข้อมูลที่เราเก็บ</h2>
        <ul style={ul}>
          <li>
            <strong>ข้อมูลการจอง</strong> — ชื่อ เบอร์โทรศัพท์ อีเมล จำนวนผู้เข้าร่วม วันที่ เวลา
            และเส้นทางที่เลือก เมื่อคุณจองผ่านเว็บไซต์หรือช่องทางแชท (Facebook Messenger, LINE,
            WhatsApp)
          </li>
          <li>
            <strong>ข้อมูลสมาชิก</strong> — ชื่อ เบอร์โทรศัพท์ และประวัติการใช้บริการ
            หากคุณสมัครแพ็กเกจสมาชิก
          </li>
          <li>
            <strong>ข้อมูลการใช้งานเว็บไซต์</strong> — สถิติแบบไม่ระบุตัวตนผ่านคุกกี้ Google
            Analytics
          </li>
          <li>
            <strong>ข้อความ</strong> — เนื้อหาที่คุณส่งถึงเราผ่าน Facebook Messenger
            หรือช่องทางแชทอื่น ใช้เพื่อตอบกลับคุณเท่านั้น
          </li>
        </ul>

        <h2 style={h2}>3. เราใช้ข้อมูลอย่างไร</h2>
        <ul style={ul}>
          <li>ดำเนินการและยืนยันการจอง รวมถึงส่งอีเมลยืนยัน</li>
          <li>ติดต่อคุณเกี่ยวกับทริป (การเปลี่ยนแปลง สภาพอากาศ ข้อมูลความปลอดภัย)</li>
          <li>จัดการแพ็กเกจสมาชิกและบันทึกการใช้บริการ</li>
          <li>ตอบคำถามและข้อความของคุณ</li>
          <li>ปรับปรุงเว็บไซต์และบริการผ่านสถิติแบบไม่ระบุตัวตน</li>
        </ul>
        <p style={p}>
          เรา<strong>ไม่</strong>ขาย ให้เช่า หรือแลกเปลี่ยนข้อมูลส่วนบุคคลของคุณกับบุคคลที่สาม
          และไม่นำไปใช้เพื่อการโฆษณาของบุคคลที่สาม
        </p>

        <h2 style={h2}>4. การแบ่งปันข้อมูลกับบริการภายนอก</h2>
        <ul style={ul}>
          <li>
            <strong>Meta (Facebook / Messenger / Instagram / WhatsApp)</strong> —
            เมื่อคุณติดต่อเราผ่านช่องทางเหล่านี้ ข้อความจะถูกประมวลผลโดย Meta
            ตามนโยบายความเป็นส่วนตัวของ Meta
          </li>
          <li><strong>Google Analytics</strong> — สถิติการใช้งานเว็บไซต์แบบไม่ระบุตัวตน</li>
          <li><strong>Telegram</strong> — การแจ้งเตือนการจองภายในถึงทีมงานของเราเท่านั้น</li>
          <li><strong>ผู้ให้บริการอีเมล</strong> — เพื่อส่งอีเมลยืนยันการจอง</li>
        </ul>

        <h2 style={h2}>5. การเก็บรักษาและความปลอดภัยของข้อมูล</h2>
        <p style={p}>
          ข้อมูลการจองและสมาชิกจะถูกเก็บไว้เท่าที่จำเป็นต่อการดำเนินงาน บัญชี และข้อกำหนดทางกฎหมาย
          ข้อมูลถูกเก็บบนเซิร์ฟเวอร์ที่ปลอดภัย และจำกัดการเข้าถึงเฉพาะทีมงานที่ได้รับอนุญาต
        </p>

        <h2 style={h2}>6. สิทธิของคุณและการขอลบข้อมูล</h2>
        <p style={p}>
          คุณสามารถขอเข้าถึง แก้ไข หรือ<strong>ลบ</strong>ข้อมูลส่วนบุคคลของคุณได้ตลอดเวลา
          โดยติดต่อเราผ่านช่องทางด้านล่าง พร้อมแจ้งชื่อและเบอร์โทรศัพท์ที่ใช้จอง
          เราจะลบข้อมูลภายใน 30 วัน:
        </p>
        <ul style={ul}>
          <li>อีเมล: mrkosit@gmail.com</li>
          <li>โทร / WhatsApp: 083-714-6958</li>
          <li>LINE: @256pyxrx</li>
          <li>Facebook: facebook.com/SUPSpaceMaeklong</li>
        </ul>

        <h2 style={h2}>7. คุกกี้</h2>
        <p style={p}>
          เราใช้เฉพาะคุกกี้ที่จำเป็น (เซสชันผู้ดูแลระบบ) และคุกกี้ Google Analytics
          คุณสามารถปิดคุกกี้ในเบราว์เซอร์ได้โดยไม่กระทบต่อการจอง
        </p>

        <h2 style={h2}>8. ผู้เยาว์</h2>
        <p style={p}>
          บริการของเราไม่ได้มุ่งเป้าไปที่เด็กอายุต่ำกว่า 13 ปี
          การจองสำหรับผู้เยาว์ต้องดำเนินการโดยผู้ปกครอง
        </p>

        <h2 style={h2}>9. การเปลี่ยนแปลงนโยบาย</h2>
        <p style={p}>
          เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว เวอร์ชันล่าสุดจะแสดงอยู่ที่หน้านี้เสมอ
        </p>
      </div>
    </main>
  );
}
