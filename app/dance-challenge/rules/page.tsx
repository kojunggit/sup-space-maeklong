import Link from "next/link";

export const metadata = {
  title: "กติกากิจกรรม Dance Challenge | SUP Space Maeklong",
  description:
    "กติกาการเข้าร่วมกิจกรรม \"พาย พาย พาย Dance Challenge\" · Rules of participation for the Pai Pai Pai Dance Challenge campaign.",
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

export default function DanceChallengeRulesPage() {
  return (
    <main style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
        <Link
          href="/dance-challenge"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--campaign-accent)",
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
          กติกากิจกรรม Dance Challenge · Dance Challenge Rules
        </h1>
        <p style={{ ...p, fontSize: 13, color: "var(--fg-3, #888)" }}>
          ระยะเวลากิจกรรม: 14 กรกฎาคม 2569 – 15 สิงหาคม 2569 · ปรับปรุงล่าสุด: 14 กรกฎาคม 2569
        </p>

        {/* ─── ภาษาไทย (หลัก) ──────────────────────────────────────── */}
        <h2 style={h2}>1. เกี่ยวกับกิจกรรม</h2>
        <p style={p}>
          SUP Space Maeklong ขอเชิญชวนทุกคนร่วมสนุกกับกิจกรรม &ldquo;พาย พาย พาย Dance
          Challenge&rdquo; โดยการถ่ายคลิปเต้นประกอบเพลงต้นฉบับของแบรนด์ &ldquo;พาย พาย
          พาย&rdquo; (ฟังเพลงได้ที่{" "}
          <a href="https://suno.com/s/RHmG3Xm6PhFoZSKu" target="_blank" rel="noopener noreferrer" style={{ color: "var(--campaign-accent)" }}>
            suno.com/s/RHmG3Xm6PhFoZSKu
          </a>
          ) ด้วยท่าเต้นง่าย ๆ ที่ได้แรงบันดาลใจจากท่าพายบอร์ด แล้วโพสต์ลงโซเชียลมีเดียสาธารณะ
          เพื่อรับสิทธิ์พาย SUP ฟรี และลุ้นรางวัลใหญ่
        </p>

        <h2 style={h2}>2. คุณสมบัติผู้เข้าร่วม</h2>
        <ul style={ul}>
          <li>เปิดรับผู้เข้าร่วมทุกเพศ ทุกวัย ไม่จำกัดอายุ</li>
          <li>
            ผู้เข้าร่วม 1 ท่านสามารถส่งคลิปเข้าร่วมได้ไม่จำกัดจำนวน แต่มีสิทธิ์รับ
            &ldquo;ทริปพายฟรี&rdquo; ได้เพียง <strong>1 สิทธิ์ต่อ 1 ท่าน</strong>{" "}
            ตลอดระยะเวลากิจกรรมเท่านั้น
          </li>
          <li>ไม่จำกัดว่าต้องเป็นลูกค้าเก่าหรือเคยพายกับเรามาก่อน</li>
          <li>
            พนักงาน SUP Space Maeklong และครอบครัวโดยตรงของพนักงาน{" "}
            <strong>ไม่มีสิทธิ์รับรางวัล</strong> เพื่อความเป็นธรรมต่อผู้เข้าร่วมทุกท่าน
          </li>
        </ul>

        <h2 style={h2}>3. วิธีการเข้าร่วม</h2>
        <ul style={ul}>
          <li>ฟังเพลง &ldquo;พาย พาย พาย&rdquo; และดูตัวอย่างท่าเต้นได้ที่หน้ากิจกรรมของเรา</li>
          <li>
            ถ่ายคลิปวิดีโอเต้นตามท่าที่กำหนด (ไม่จำเป็นต้องเต้นสวยหรือแม่นยำ
            ขอแค่ทำตามท่าหลักและสนุกไปกับมัน) <strong>เต้นช่วงไหนของเพลงก็ได้
            แต่คลิปต้องมีความยาวอย่างน้อย 30 วินาที</strong>
          </li>
          <li>
            โพสต์คลิปลง <strong>TikTok</strong> (ช่องทางหลัก) หรือ{" "}
            <strong>Instagram Reels</strong> (ช่องทางรอง) โดยตั้งค่าโพสต์เป็น{" "}
            <strong>สาธารณะ (Public)</strong>
          </li>
          <li>
            ใส่แฮชแท็ก <strong>#dancechallenge</strong> และ{" "}
            <strong>#supspacemaeklong</strong> พร้อม
            <strong>แท็ก/เมนชันบัญชี @SUPSpaceMaeklong</strong> ในแคปชันหรือคลิป
          </li>
          <li>
            กดปุ่ม &ldquo;ร่วมกิจกรรม&rdquo; บนหน้าเว็บไซต์ (หรือสแกน QR โค้ดบนโปสเตอร์
            ซึ่งจะพามาที่หน้านี้) กรอกฟอร์มลงทะเบียน แนบชื่อ-นามสกุล เบอร์โทรศัพท์
            และลิงก์คลิปที่โพสต์ เพื่อยืนยันการเข้าร่วม
          </li>
        </ul>

        <h2 style={h2}>4. เงื่อนไขของคลิปวิดีโอที่ร่วมกิจกรรม</h2>
        <ul style={ul}>
          <li>
            คลิปต้องมีท่าเต้นตามที่กิจกรรมกำหนด และต้องใช้เพลง &ldquo;พาย พาย พาย&rdquo;
            ประกอบคลิป
          </li>
          <li>
            <strong>คลิปต้องมีความยาวอย่างน้อย 30 วินาที</strong> โดยสามารถเลือกเต้นประกอบเพลงช่วงใดก็ได้
            ไม่จำเป็นต้องเป็นท่อนเดียวกับคลิปตัวอย่าง
          </li>
          <li>
            คลิปต้องเป็นเนื้อหาที่เหมาะสม ไม่ขัดต่อกฎหมาย ศีลธรรม หรือข้อกำหนดของแพลตฟอร์ม
            (TikTok/Instagram)
          </li>
          <li>
            คลิปต้องคงสถานะ <strong>สาธารณะและไม่ถูกลบ</strong>{" "}
            อย่างน้อยตลอดระยะเวลากิจกรรมจนกว่าจะประกาศผลรางวัลใหญ่เรียบร้อยแล้ว
            หากลบหรือปิดเป็นส่วนตัวก่อนขั้นตอนนี้เสร็จสิ้น ถือว่าสละสิทธิ์
          </li>
          <li>
            ห้ามใช้วิธีปั่นยอดผู้ติดตาม/ไลก์/แชร์ที่ไม่สุจริต หากตรวจพบ
            ทางร้านขอสงวนสิทธิ์ตัดสิทธิ์ทันที
          </li>
        </ul>

        <h2 style={h2}>5. การยืนยันสิทธิ์</h2>
        <ul style={ul}>
          <li>
            หลังจากกรอกฟอร์มลงทะเบียนบนเว็บไซต์แล้ว
            ทีมงานจะตรวจสอบว่าคลิปเป็นไปตามเงื่อนไขข้อ 3–4 ครบถ้วนหรือไม่
          </li>
          <li>
            หากผ่านการตรวจสอบ ทีมงานจะติดต่อกลับเพื่อยืนยัน &ldquo;สิทธิ์เข้าร่วมกิจกรรม&rdquo;
            ผ่านเบอร์โทรศัพท์ที่ให้ไว้ ภายใน 1–3 วันทำการ
          </li>
          <li>
            การยืนยันสิทธิ์เรียงลำดับตามเวลาที่ข้อมูลผ่านการตรวจสอบ ไม่ใช่เวลาที่กรอกฟอร์ม
          </li>
        </ul>

        <h2 style={h2}>6. โควตาสิทธิ์พายฟรี (30 สิทธิ์)</h2>
        <ul style={ul}>
          <li>
            สิทธิ์ &ldquo;พาย SUP ฟรี 1 เที่ยว&rdquo; มีจำนวนจำกัดที่{" "}
            <strong>30 สิทธิ์เท่านั้น ตลอดทั้งแคมเปญ</strong>{" "}
            พิจารณาจากผู้เข้าร่วมที่ผ่านการตรวจสอบและยืนยันแล้ว เรียงตามลำดับก่อน-หลัง
          </li>
          <li>
            เมื่อครบ 30 สิทธิ์แล้ว
            ทางร้านจะประกาศปิดรับสิทธิ์ทริปฟรีผ่านเว็บไซต์และโซเชียลมีเดียทันที
          </li>
          <li>
            <strong>
              ผู้ที่ส่งคลิปเข้าร่วมหลังจากสิทธิ์ทริปฟรีครบ 30 คนแล้ว
              ยังคงมีสิทธิ์เข้าร่วมกิจกรรมและลุ้นรางวัลใหญ่ในข้อ 8
              ได้ตามปกติ เพียงแต่จะไม่ได้รับสิทธิ์ทริปฟรี 1 เที่ยว
            </strong>
          </li>
        </ul>

        <h2 style={h2}>7. รางวัลสำหรับผู้เข้าร่วมที่ผ่านเงื่อนไข (สิทธิ์พายฟรี)</h2>
        <p style={p}>
          ผู้เข้าร่วมที่ผ่านการตรวจสอบและอยู่ใน 30 สิทธิ์แรก จะได้รับ{" "}
          <strong>สิทธิ์พาย SUP ฟรี 1 เที่ยว สำหรับ 1 ท่าน</strong> ครอบคลุมเฉพาะ
          <strong>เส้นทางระยะใกล้ (ปกติราคา 500 บาท/ท่าน)</strong>{" "}
          หากต้องการอัปเกรดเป็นเส้นทางอื่น ผู้ใช้สิทธิ์ชำระส่วนต่างเพิ่มเติมเอง
        </p>

        <h2 style={h2}>8. เงื่อนไขการใช้สิทธิ์ทริปฟรี (การจองและวันหมดอายุ)</h2>
        <ul style={ul}>
          <li>
            ผู้ได้รับสิทธิ์ต้องทำการจองคิวล่วงหน้าผ่าน LINE OA
            หรือระบบจองออนไลน์ของเว็บไซต์ โดยแจ้งรหัสยืนยันสิทธิ์ที่ได้รับ
          </li>
          <li>การจองขึ้นอยู่กับคิวว่างของร้านในแต่ละวัน</li>
          <li>
            <strong>สิทธิ์นี้ใช้ได้ถึงวันที่ 30 ธันวาคม 2569</strong> เท่านั้น
            หากไม่มาใช้สิทธิ์ภายในระยะเวลาที่กำหนด ถือว่าสละสิทธิ์โดยไม่มีการชดเชยใด ๆ
          </li>
          <li>
            สิทธิ์นี้ไม่สามารถแลกเปลี่ยนเป็นเงินสด โอนสิทธิ์ให้ผู้อื่น
            หรือใช้ร่วมกับโปรโมชันอื่นได้
          </li>
        </ul>

        <h2 style={h2}>9. รางวัลใหญ่ (Grand Prize)</h2>
        <ul style={ul}>
          <li>
            จากผู้เข้าร่วมทุกท่านที่ผ่านการตรวจสอบและยืนยันสิทธิ์ถูกต้องครบถ้วนตามข้อ 3–5
            ตลอดระยะเวลากิจกรรม (ไม่ว่าจะได้รับสิทธิ์ทริปฟรีในข้อ 6–7 หรือไม่ก็ตาม)
            จะถูกนำรายชื่อเข้าสู่การจับรางวัลใหญ่ 1 รางวัล
          </li>
          <li>
            ผู้โชคดี 1 ท่าน จะได้รับ:
            <ul style={{ ...ul, margin: "6px 0 0" }}>
              <li>สิทธิ์พาย SUP ฟรีสำหรับทั้งกลุ่ม/ทีมของผู้ชนะ <strong>สูงสุดไม่เกิน 7 คน</strong></li>
              <li>
                เงินสนับสนุนค่าเดินทางมูลค่า{" "}
                <strong>2,000 บาท โอนเข้าบัญชีทันทีเมื่อประกาศผลและยืนยันตัวตนผู้ชนะเรียบร้อย</strong>
              </li>
            </ul>
          </li>
          <li>
            การจับรางวัลจะดำเนินการโดยทีมงาน (ไม่มีการถ่ายทอดสด) และ
            <strong>ประกาศผลผ่านเว็บไซต์ เพจ Facebook, Instagram, TikTok และ LINE OA ของร้าน</strong>
          </li>
          <li>
            ทางร้านจะติดต่อผู้โชคดีผ่านช่องทาง LINE OA ที่ใช้ลงทะเบียนไว้
            หากติดต่อไม่ได้ภายใน <strong>7 วัน</strong> นับจากวันประกาศผล
            ทางร้านขอสงวนสิทธิ์จับรางวัลสำรองใหม่
          </li>
        </ul>

        <h2 style={h2}>10. เงื่อนไขการใช้สิทธิ์รางวัลใหญ่</h2>
        <ul style={ul}>
          <li>ผู้ชนะต้องนัดหมายวันเดินทางล่วงหน้ากับทางร้าน โดยขึ้นอยู่กับคิวว่างของร้าน</li>
          <li>สิทธิ์นี้ใช้ได้ถึงวันที่ 30 ธันวาคม 2569 เช่นเดียวกับข้อ 8</li>
          <li>
            สมาชิกในกลุ่ม/ทีมที่ร่วมทริปต้องเดินทางมาพร้อมกันในวันเดียวกับผู้ชนะ
            ไม่สามารถแยกใช้สิทธิ์คนละวันได้
          </li>
          <li>
            รางวัลนี้ไม่สามารถแลกเปลี่ยนเป็นเงินสด (ยกเว้นเงินสนับสนุนค่าเดินทาง 2,000 บาทที่ระบุไว้แล้ว)
            โอนสิทธิ์ให้ผู้อื่น หรือใช้ร่วมกับโปรโมชันอื่น
          </li>
        </ul>

        <h2 style={h2}>11. ลิขสิทธิ์และการอนุญาตใช้สื่อ</h2>
        <p style={p}>
          ผู้เข้าร่วมยืนยันว่าคลิปที่ส่งเข้าร่วมเป็นผลงานของตนเอง และ
          <strong>
            อนุญาตให้ SUP Space Maeklong นำคลิปหรือบางส่วนของคลิปไปใช้ประกอบการประชาสัมพันธ์ทางเว็บไซต์และช่องทางโซเชียลมีเดียของร้านได้
            โดยจะให้เครดิตเจ้าของคลิปตามความเหมาะสม
          </strong>
        </p>

        <h2 style={h2}>12. ความปลอดภัยและข้อจำกัดความรับผิดชอบ</h2>
        <p style={p}>
          ทริปพาย SUP ทุกทริป (รวมถึงทริปที่ได้รับจากกิจกรรมนี้)
          อยู่ภายใต้มาตรฐานความปลอดภัยเดียวกับทริปปกติของ SUP Space Maeklong ได้แก่
          การบรรยายสรุปความปลอดภัยก่อนออกทริป และอุปกรณ์เสื้อชูชีพครบถ้วน
          ผู้เข้าร่วมควรมีสุขภาพร่างกายแข็งแรงเหมาะสมกับกิจกรรมทางน้ำ
        </p>

        <h2 style={h2}>13. สิทธิ์ของผู้จัดกิจกรรม</h2>
        <ul style={ul}>
          <li>
            SUP Space Maeklong ขอสงวนสิทธิ์ในการเปลี่ยนแปลง แก้ไข เพิ่มเติม หรือยกเลิกกติกา
            เงื่อนไข ของรางวัล หรือระยะเวลากิจกรรม
            โดยจะแจ้งให้ทราบผ่านเว็บไซต์และช่องทางโซเชียลมีเดียของร้าน
          </li>
          <li>
            ทางร้านขอสงวนสิทธิ์ในการตัดสิทธิ์ผู้เข้าร่วมที่ไม่ปฏิบัติตามกติกา ใช้ข้อมูลเท็จ
            หรือกระทำการใด ๆ ที่ส่อไปในทางทุจริตหรือไม่เป็นธรรมต่อผู้เข้าร่วมท่านอื่น
            โดยไม่ต้องแจ้งเหตุผลล่วงหน้า
          </li>
          <li>ผลการตัดสินของทีมงาน SUP Space Maeklong ในทุกกรณีถือเป็นที่สิ้นสุด</li>
        </ul>

        <h2 style={h2}>14. ช่องทางติดต่อสอบถาม</h2>
        <ul style={ul}>
          <li>LINE OA: @256pyxrx</li>
          <li>โทรศัพท์: 083-714-6958</li>
          <li>อีเมล: <a href="mailto:mrkosit@gmail.com" style={{ color: "var(--campaign-accent)" }}>mrkosit@gmail.com</a></li>
          <li>Instagram / Facebook / TikTok: @SUPSpaceMaeklong</li>
        </ul>

        {/* ─── English (secondary) ────────────────────────────────── */}
        <hr style={{ border: "none", borderTop: "1px solid var(--border-1, #eee)", margin: "40px 0" }} />

        <h2 style={h2}>Rules of Participation — &ldquo;Pai Pai Pai Dance Challenge&rdquo;</h2>
        <p style={{ ...p, fontSize: 13, color: "var(--fg-3, #888)" }}>
          Campaign period: July 14 – August 15, 2026 · Last updated: July 14, 2026
        </p>

        <p style={p}>
          <strong>About</strong>: Dance-cover our original song &ldquo;Pai Pai Pai&rdquo; (
          <a href="https://suno.com/s/RHmG3Xm6PhFoZSKu" target="_blank" rel="noopener noreferrer" style={{ color: "var(--campaign-accent)" }}>
            suno.com/s/RHmG3Xm6PhFoZSKu
          </a>
          ) using simple paddle-themed moves, post it publicly, and earn a free SUP trip plus a shot at
          the grand prize.
        </p>

        <p style={p}>
          <strong>Eligibility</strong>: Open to all ages, no age restriction. You may submit unlimited
          clips, but each person is eligible for only 1 free-trip reward. Staff and immediate family of
          SUP Space Maeklong are not eligible to win.
        </p>

        <p style={p}>
          <strong>How to enter</strong>: Film the dance — you may dance to any part of the song, but
          the clip must be <strong>at least 30 seconds long</strong> — then post publicly on TikTok
          (primary) or IG Reels (secondary) with hashtags <strong>#dancechallenge</strong> and{" "}
          <strong>#supspacemaeklong</strong>, tag @SUPSpaceMaeklong. Then click the &ldquo;Join&rdquo;
          button on our website (or scan the QR code on the campaign poster, which links here) and
          submit the registration form with your name, phone number, and video link to confirm entry.
          After your clip passes review, our team will call the phone number you provided to confirm
          your entry, within 1–3 business days — confirmations are processed in the order entries pass
          review, not the order forms are submitted.
        </p>

        <p style={p}>
          <strong>Free trip quota</strong>: Limited to the first 30 valid, verified entries. Once
          filled, free-trip rewards close, but entries submitted afterward remain eligible for the
          grand-prize draw.
        </p>

        <p style={p}>
          <strong>Reward for entering</strong>: 1 free SUP paddle trip (short/near route only, normally
          500 THB) per qualifying participant, redeemable through{" "}
          <strong>December 30, 2026</strong>. Non-transferable, non-cash, not combinable with other
          promotions.
        </p>

        <p style={p}>
          <strong>Grand prize</strong>: 1 winner selected from all qualifying entries (whether or not
          they received the free-trip reward). Prize: a free paddle trip for the winner&rsquo;s group,
          capped at <strong>7 people</strong>, plus a{" "}
          <strong>2,000 THB travel allowance paid by bank transfer immediately upon confirmation</strong>.
          The draw will be conducted by the team (not livestreamed) and results announced across the
          website, Facebook, Instagram, TikTok, and LINE OA. If the winner cannot be reached within 7
          days of announcement, a backup winner will be drawn. Redeemable through December 30, 2026;
          the whole group must travel together on the same day.
        </p>

        <p style={p}>
          <strong>Media rights</strong>: Entrants grant SUP Space Maeklong permission to reuse
          submitted videos for marketing purposes, with credit given to the original poster.
        </p>

        <p style={p}>
          <strong>Organizer&rsquo;s rights</strong>: SUP Space Maeklong reserves the right to amend,
          suspend, or cancel any part of this campaign, and to disqualify any entry that violates these
          rules or is fraudulent. All decisions by the SUP Space Maeklong team are final.
        </p>

        <p style={p}>
          <strong>Contact</strong>: LINE OA @256pyxrx · Tel 083-714-6958 ·{" "}
          <a href="mailto:mrkosit@gmail.com" style={{ color: "var(--campaign-accent)" }}>mrkosit@gmail.com</a>{" "}
          · IG/FB/TikTok @SUPSpaceMaeklong
        </p>
      </div>
    </main>
  );
}
