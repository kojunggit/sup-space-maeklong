import { prisma } from "@/app/lib/prisma";
import { formatSlot } from "@/app/_components/trips-data";

const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "booking@supspacemaeklong.com";
const MAPS_LINK  = "https://maps.app.goo.gl/1FF1x9UUKbrid2kb6";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Booking confirmation email ───────────────────────────────────────────────

export async function sendBookingConfirmationEmail(booking: {
  id: string;
  guestName: string | null;
  guestEmail: string | null;
  date: string;
  timeSlot: string;
  routeId: string | null;
  paddlers: number;
  total: number | null;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !booking.guestEmail) return;

  // Fetch live route name from DB (not static map)
  let routeName = "—";
  if (booking.routeId) {
    const route = await prisma.paddleRoute.findUnique({
      where: { id: booking.routeId },
      select: { name: true },
    }).catch(() => null);
    routeName = route?.name ?? booking.routeId;
  }

  const ref       = booking.id.slice(-8).toUpperCase();
  const timeLabel = formatSlot(booking.timeSlot);
  const total     = (booking.total ?? 0).toLocaleString("th-TH");
  const name      = booking.guestName || "คุณลูกค้า";

  try {
    const res = await fetch(RESEND_API, {
      method:  "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:    `SUP Space Maeklong <${FROM_EMAIL}>`,
        to:      [booking.guestEmail],
        subject: `[#${ref}] ได้รับการจองแล้ว · SUP Space Maeklong`,
        html:    buildEmailHtml({ ref, name, date: booking.date, timeLabel, routeName, paddlers: booking.paddlers, total }),
      }),
    });
    if (!res.ok) {
      console.error("Resend email error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Resend email fetch failed:", err);
  }
}

// ─── HTML template ────────────────────────────────────────────────────────────

function buildEmailHtml(p: {
  ref: string; name: string; date: string; timeLabel: string;
  routeName: string; paddlers: number; total: string;
}): string {
  // Escape all user-supplied values before interpolating into HTML
  const safeName      = escapeHtml(p.name);
  const safeDate      = escapeHtml(p.date);
  const safeTimeLabel = escapeHtml(p.timeLabel);
  const safeRouteName = escapeHtml(p.routeName);
  const safeTotal     = escapeHtml(p.total);
  const safeRef       = escapeHtml(p.ref);

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#111827;font-weight:600;">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;">

      <!-- Header -->
      <tr>
        <td style="background:#0d9488;padding:28px 32px;text-align:center;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-bottom:8px;">SUP SPACE MAEKLONG</div>
          <div style="font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
            ได้รับการจองของคุณแล้ว<br>
            <span style="font-size:15px;font-weight:400;opacity:0.85;">We've received your booking</span>
          </div>
        </td>
      </tr>

      <!-- Greeting -->
      <tr>
        <td style="padding:28px 32px 0;">
          <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">
            สวัสดีคุณ <strong>${safeName}</strong> ครับ/ค่ะ<br>
            <span style="color:#6b7280;font-size:13px;">Hi <strong>${safeName}</strong>,</span>
          </p>
          <p style="margin:12px 0 0;font-size:14px;color:#374151;line-height:1.7;">
            เราได้รับการจองของคุณเรียบร้อยแล้ว และทีมงานจะยืนยันการจองผ่าน LINE ภายใน 1 ชั่วโมง พร้อมแผนที่นัดพบและสิ่งที่ต้องเตรียม
          </p>
          <p style="margin:6px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
            Your booking has been received. Our team will confirm via LINE within 1 hour with a meeting point map and what to bring.
          </p>
        </td>
      </tr>

      <!-- Booking ref badge -->
      <tr>
        <td style="padding:20px 32px 0;">
          <div style="display:inline-block;background:#f0fdf9;border:1.5px solid #99f6e4;border-radius:999px;padding:8px 20px;">
            <span style="font-size:12px;color:#0f766e;margin-right:8px;">หมายเลขจอง / Booking ref</span>
            <strong style="font-size:16px;color:#134e4a;letter-spacing:0.08em;">#${safeRef}</strong>
          </div>
        </td>
      </tr>

      <!-- Booking details -->
      <tr>
        <td style="padding:20px 32px 0;">
          <div style="background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row("📅 วันที่ / Date", safeDate)}
              ${row("⏰ เวลา / Time", safeTimeLabel)}
              ${row("🗺 เส้นทาง / Route", safeRouteName)}
              ${row("🏄 บอร์ด / Boards", `${p.paddlers} บอร์ด`)}
              ${row("💰 ยอดรวม / Total", `฿${safeTotal}`)}
            </table>
          </div>
        </td>
      </tr>

      <!-- Location -->
      <tr>
        <td style="padding:24px 32px 0;">
          <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:16px 18px;">
            <div style="font-size:13px;font-weight:700;color:#1e40af;margin-bottom:8px;">📍 จุดนัดพบ · Meeting Point</div>
            <div style="font-size:13px;color:#1d4ed8;line-height:1.6;margin-bottom:10px;">
              SUP Space Maeklong · แม่กลอง สมุทรสงคราม<br>
              <span style="color:#3b82f6;font-size:12px;">Maeklong, Samut Songkhram</span>
            </div>
            <a href="${MAPS_LINK}" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:13px;font-weight:600;padding:9px 18px;border-radius:8px;text-decoration:none;">
              เปิดแผนที่ / Open Maps →
            </a>
          </div>
        </td>
      </tr>

      <!-- Contact -->
      <tr>
        <td style="padding:20px 32px 0;">
          <div style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:10px;padding:14px 18px;">
            <div style="font-size:13px;font-weight:700;color:#9a3412;margin-bottom:6px;">💬 สอบถามข้อมูลเพิ่มเติม</div>
            <div style="font-size:13px;color:#7c2d12;line-height:1.8;">
              WhatsApp: <a href="https://wa.me/66837146958" style="color:#c2410c;font-weight:600;">66837146958</a><br>
              Line: <strong>@256pyxrx</strong>
            </div>
          </div>
        </td>
      </tr>

      <!-- Note -->
      <tr>
        <td style="padding:20px 32px 0;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;border-top:1px solid #f3f4f6;padding-top:16px;">
            ยกเลิกฟรีภายใน 24 ชั่วโมงก่อนวันทัวร์ · จ่ายหน้างาน ไม่ต้องโอนล่วงหน้า<br>
            <span style="color:#d1d5db;">Free cancellation up to 24h before the tour · Pay on site, no advance transfer needed</span>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 32px 28px;text-align:center;">
          <div style="font-size:11px;color:#d1d5db;">
            © SUP Space Maeklong · supspacemaeklong.com<br>
            แม่กลอง สมุทรสงคราม · Maeklong, Samut Songkhram
          </div>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
