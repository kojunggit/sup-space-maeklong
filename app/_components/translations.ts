import type { Lang } from "./lang-context";

export interface SectionTitle { pre: string; accent: string; post: string; }

export interface Translations {
  header: {
    services: string; trips: string; about: string;
    gallery: string; contact: string; book: string;
  };
  hero: {
    badge: string; title: string; subtitle: string;
    trust: string[];
    ctaPrimary: string; ctaSecondary: string;
    proofReviews: (count: number) => string;
    proofPaddlers: string;
  };
  services: {
    eyebrow: string; title: SectionTitle; sub: string; priceCta: string;
    cards: Array<{ eyebrow: string; title: string; desc: string; bullets: string[]; badge?: string; linkText?: string }>;
    packageEyebrow: string; packageTitle: string; packageDesc: string;
    pkg1Title: string; pkg1Hint: string;
    pkg2Title: string; pkg2Hint: string;
  };
  booking: {
    eyebrow: string;
    titleLine1: string; titleAccent: string; titleLine2: string;
    pitch: string;
    r1: string; r2: string; r3: string; r4: string;
  };
  about: {
    eyebrow: string; title: SectionTitle;
    p1: string; p2: string; p3: string; p4: string;
    s1n: string; s1l: string; s2n: string; s2l: string; s3n: string; s3l: string;
    reviewCount: (count: number) => string;
  };
  gallery: {
    eyebrow: string; title: SectionTitle; sub: string; cta: string;
  };
  reviews: {
    eyebrow: string; title: SectionTitle;
    fromCount: (count: number) => string;
    scrollHint: string; mapsLink: string;
  };
  trips: {
    eyebrow: string; title: SectionTitle; sub: string;
    route: string; bookedBy: string; boards: string;
    full: string; join: string; viewPlan: string; noTrips: string;
    joining: (host: string, joined: number, max: number) => string;
    newTrip: string;
  };
  footer: {
    tagline: string;
    locTitle: string; mapLink: string;
    hoursTitle: string; hours: string; hoursNote: string;
    contactTitle: string; bookCta: string;
    copyright: string; footerLine: string;
  };
  widget: {
    eyebrow: string; title: string; sub: string; perBoard: string;
    steps: string[];
    // Date
    dateLabel: string; dateTip: (loading: boolean) => string;
    // Time
    timeLabel: string; timeAvail: string; timeBooked: string; timeSelected: string; timeHint: string;
    // Route
    routeLabel: string; routeFit: string;
    cats: Array<{ label: string; sub: string; skill: string }>;
    // Boards
    boardsLabel: string; adultLabel: string; ageNote: string; boardsNote: string;
    // Contact
    nameLabel: string; namePlaceholder: string; nameError: string;
    phoneLabel: string; phoneError: string;
    channelLabel: string; channelOpt: string;
    channelPlaceholders: string[];
    pickupLabel: string; pickupNote: string; pickupPlaceholder: string;
    notesLabel: string; notesPlaceholder: string;
    // Photo
    photoLabel: string; photoExplain: string;
    photoOpts: Array<{ label: string; sub: string; badge?: string; minPeople?: string }>;
    // Summary
    summaryTitle: string;
    sumDate: string; sumTime: string; sumRoute: string; sumBoards: string;
    sumPhoto: string; sumTotal: string;
    // Nav
    back: string; next: string; confirm: string; joinConfirm: string;
    submitting: string; totalLabel: string;
    // Trust
    chip1: string; chip2: string; chip3: string; chip4: string;
    // Join banner
    joiningTrip: (host: string) => string;
    joinBoards: (joined: number, max: number) => string;
    newTrip: string;
    // Confirmed
    confirmedTitle: string;
    confirmedJoin: (host: string) => string;
    bookingRef: string;
    confirmedMsg: (name: string, boards: number, route: string, time: string, date: string, photo: string) => string;
    resetBook: string; resetJoin: string;
    errorGeneric: string;
    // Calendar locale
    dow: string[]; dowFull: string[];
    monthsFull: string[]; monthsShort: string[];
    yearOffset: number;
    formatTime: (slot: string) => string;
  };
}

const th: Translations = {
  header: {
    services: "บริการ", trips: "ทริป", about: "เกี่ยวกับเรา",
    gallery: "ภาพถ่าย", contact: "ติดต่อ", book: "จองเลย",
  },
  hero: {
    badge: "แม่กลอง · สมุทรสงคราม",
    title: "พาย SUP เที่ยวตลาดน้ำและวิถีชีวิตริมคลองแม่กลอง",
    subtitle: "สัมผัสเสน่ห์ของสมุทรสงครามจากมุมมองที่ไม่เหมือนใคร ผ่านตลาดน้ำ สวนมะพร้าว และชุมชนเก่าแก่ริมคลอง",
    trust: ["มือใหม่พายได้", "ใกล้กรุงเทพฯ", "มีผู้สอนดูแลตลอดทริป", "รวมถ่ายภาพ", "อุปกรณ์ความปลอดภัย"],
    ctaPrimary: "จองทริป", ctaSecondary: "ดูเส้นทางพาย",
    proofReviews: (n) => `จาก ${n.toLocaleString()} รีวิว Google`,
    proofPaddlers: "นักพายกว่า 1,200 คน ร่วมทริปกับเรา",
  },
  services: {
    eyebrow: "บริการของเรา",
    title: { pre: "มากกว่าให้", accent: "เช่าบอร์ด", post: "" },
    sub: "สี่อย่างที่เราทำได้ดี · ทัวร์ไกด์พร้อม 13 เส้นทาง · สอนพายฟรี · ถ่ายภาพ · รับ-ส่งถึงที่พัก",
    priceCta: "ดูราคาทั้งหมด",
    cards: [
      { eyebrow: "ทัวร์ไกด์", title: "13 เส้นทางพาย", desc: "สั้น กลาง ไกล · กาแฟริมคลอง · ตลาดน้ำในตำนาน · 3 ตลาดน้ำ 25 กม · ทีมเรารู้น้ำขึ้นน้ำลง และจุดถ่ายภาพดีที่สุด", bullets: ["ระยะใกล้ ฿500/บอร์ด · 2 ชม", "ระยะกลาง ฿700–750", "ระยะไกล ฿900 · 16–25 กม"], linkText: "ดูเส้นทางทั้งหมด" },
      { eyebrow: "มือใหม่ ฟรี!", title: "สอนพายเบื้องต้น", desc: "ครั้งแรกเลย? เราสอนพื้นฐานให้ก่อนลงน้ำเสมอ · ทรงตัว · พาย · เลี้ยว · ฟรีไม่มีค่าใช้จ่ายเพิ่ม", bullets: ["บรีฟความปลอดภัย", "ฝึกบนฝั่งก่อนลงน้ำ", "เสื้อชูชีพทุกคน"] },
      { eyebrow: "เก็บความทรงจำ", title: "ทีมถ่ายภาพ", desc: "เราถ่ายให้ฟรีสำหรับลง Social media · ถ้าอยากเก็บส่วนตัว มีบริการ private +฿500/คน", bullets: ["ฟรี: ภาพประชาสัมพันธ์", "ส่งทาง LINE", "Private +฿500/คน (ขั้นต่ำ 2 คน)"], badge: "ยอดนิยม" },
      { eyebrow: "สะดวกถึงประตู", title: "รับ-ส่งถึงที่พัก", desc: "ในรัศมี 5 กิโลเมตรจาก SUP Space Maeklong เรารับ-ส่งฟรี · เกินกว่านั้นคิดกิโลเมตรละ 7 บาท", bullets: ["ใน 5 กม · ฟรี", "เกิน 5 กม · 7฿/กม", "ไม่ต้องห่วงเรื่องที่จอด"] },
    ],
    packageEyebrow: "SUP HEALTHY · แพคเกจรายเดือน",
    packageTitle: "พายบ่อยๆ จ่ายน้อยลง",
    packageDesc: "สำหรับคนที่รักการพายเป็นประจำ · ไม่สามารถยกสิทธิ์ให้ผู้อื่นได้",
    pkg1Title: "พาย 10 ครั้ง", pkg1Hint: "ครั้งละไม่เกิน 3 ชม",
    pkg2Title: "รายเดือน · ไม่จำกัด", pkg2Hint: "พายได้ไม่จำกัดจำนวน",
  },
  booking: {
    eyebrow: "วิธีที่เร็วที่สุด",
    titleLine1: "เลือกวัน", titleAccent: "ที่เหลือ", titleLine2: " เราจัดการให้",
    pitch: "ยกเลิกฟรี · จ่ายหน้างาน · ทีมเรายืนยันใน LINE ภายใน 1 ชั่วโมง พร้อมแผนที่และของที่ต้องเตรียม",
    r1: "ไม่ต้องใช้บัตรเครดิตในการจอง",
    r2: "ยืนยันโดยทีมงานจริง (ไม่ใช่บอท)",
    r3: "ยกเลิกฟรี 24 ชม. ก่อนวันทัวร์",
    r4: "รับประกัน rain check ทุกกรณี",
  },
  about: {
    eyebrow: "เกี่ยวกับเรา",
    title: { pre: "มากกว่าการพาย SUP คือการได้เห็น", accent: "แม่กลองในมุมที่คนส่วนใหญ่ไม่เคยเห็น", post: "" },
    p1: "คลองสายเล็กที่ซ่อนตัวอยู่หลังตลาดน้ำ สวนมะพร้าวริมฝั่งน้ำ บ้านไม้เก่าแก่ที่ยังคงวิถีชีวิตดั้งเดิม",
    p2: "SUP Space Maeklong เกิดขึ้นจากความหลงใหลในเสน่ห์ของลุ่มน้ำแม่กลอง และความตั้งใจที่อยากให้ผู้คนได้สัมผัสธรรมชาติ วัฒนธรรม และชุมชนท้องถิ่นอย่างใกล้ชิด ผ่านการเดินทางที่เรียบง่ายบน Stand Up Paddle Board",
    p3: "เราไม่ได้พาคุณมาเพียงเพื่อพาย SUP แต่พาคุณออกไปค้นพบมุมเล็กๆ ที่นักท่องเที่ยวส่วนใหญ่อาจไม่มีโอกาสได้เห็น และเราเชื่อว่าจะทำให้คุณหลงรักสมุทรสงครามมากขึ้น",
    p4: "ไม่ว่าคุณจะเป็นมือใหม่ นักท่องเที่ยวสายธรรมชาติ หรือคนที่กำลังมองหาช่วงเวลาสงบๆ ห่างจากความวุ่นวายของเมือง SUP Space Maeklong พร้อมดูแลให้ทุกการพายเป็นประสบการณ์ที่สนุก ปลอดภัย และน่าจดจำ",
    s1n: "600+", s1l: "ลูกค้าฤดูกาลนี้",
    s2n: "6 ปี", s2l: "บนแม่กลอง",
    s3n: "100%", s3l: "ปลอดภัยมือใหม่",
    reviewCount: (n) => `${n.toLocaleString()} รีวิว Google`,
  },
  gallery: {
    eyebrow: "สัปดาห์ที่แล้ว",
    title: { pre: "เรา", accent: "ถ่ายให้", post: "" },
    sub: "บางส่วนจากสัปดาห์ที่แล้ว · ทีมเราถ่ายทั้งหมดบนน้ำ ไม่มีการจัดท่า",
    cta: "มาให้เราถ่ายให้ →",
  },
  reviews: {
    eyebrow: "รีวิวจากผู้ใช้จริง",
    title: { pre: "เสียงจาก", accent: "นักพาย", post: "ของเรา" },
    fromCount: (n) => `จาก ${n.toLocaleString()} รีวิวบน Google`,
    scrollHint: "← เลื่อนเพื่ออ่านเพิ่มเติม →",
    mapsLink: "ดูรีวิวทั้งหมดบน Google Maps →",
  },
  trips: {
    eyebrow: "กำลังจะมาถึง",
    title: { pre: "ทริป", accent: "ที่กำลังจะมา", post: "" },
    sub: "จองร่วมกับกลุ่มที่มีแล้วเพื่อลดต้นทุน หรือเปิดทริปใหม่ของคุณเอง",
    route: "เส้นทาง", bookedBy: "จองโดย", boards: "บอร์ด",
    full: "เต็มแล้ว", join: "ร่วมทริป", viewPlan: "ดูแผน →",
    noTrips: "ยังไม่มีทริปที่กำลังจะมา",
    joining: (host, joined, max) => `กำลังร่วมทริปของ ${host} · ${joined}/${max} บอร์ด`,
    newTrip: "เริ่มทริปใหม่",
  },
  footer: {
    tagline: "พายซับบอร์ดริมแม่กลอง · มือใหม่ก็พายได้ · รวมถ่ายภาพ",
    locTitle: "ที่ตั้ง", mapLink: "📍 ดูแผนที่ →",
    hoursTitle: "เวลาเปิด", hours: "7.00 น. – 18.00 น.", hoursNote: "กรุณานัดหมายล่วงหน้า",
    contactTitle: "ติดต่อ", bookCta: "จองทริปเลย",
    copyright: "© SUP Space Maeklong · พายซับมาตั้งแต่ 2562",
    footerLine: "เจอกันที่แม่กลอง",
  },
  widget: {
    eyebrow: "จองง่ายใน 30 วินาที", title: "จองทริปพายซับ",
    sub: "ยกเลิกฟรี · จ่ายหน้างาน · รวมถ่ายภาพ", perBoard: "/ บอร์ด",
    steps: ["วัน", "รอบ", "เส้นทาง", "ผู้พาย", "ติดต่อ"],
    dateLabel: "เลือกวันที่",
    dateTip: (loading) => loading ? "กำลังตรวจสอบวันว่าง..." : "จุดเขียว = ยังมีที่ว่าง · จุดแดง = เต็ม/ปิด · จองล่วงหน้าได้ไม่จำกัด",
    timeLabel: "เลือกเวลา",
    timeAvail: "ว่าง", timeBooked: "มีทริปแล้ว", timeSelected: "เลือกอยู่",
    timeHint: "ปุ่มสีแดง = ช่วงเวลานั้นมีทริปอยู่แล้ว (รวมเวลาที่ทริปนั้นใช้) · เลือกเวลาสีเขียว",
    routeLabel: "เลือกเส้นทาง", routeFit: "เหมาะกับ:",
    cats: [
      { label: "สั้น",  sub: "~2 ชม · 2-4 กม",     skill: "มือใหม่ก็พายได้" },
      { label: "กลาง",  sub: "3-4 ชม · 6-12 กม",   skill: "เคยพายมาก่อน" },
      { label: "ไกล",   sub: "ครึ่งวัน · 16-25 กม", skill: "พายเชี่ยวชาญ" },
    ],
    boardsLabel: "จำนวนบอร์ด", adultLabel: "ผู้ใหญ่ · 1 บอร์ด/คน", ageNote: "อายุ 12+ ปี",
    boardsNote: "เรามีบอร์ดและเสื้อชูชีพหลายขนาดเตรียมไว้ให้ ทีมงานจะช่วยจัดบอร์ดให้เหมาะกับแต่ละคนหน้างาน — มือใหม่ก็พายได้ ไม่ต้องมีประสบการณ์",
    nameLabel: "ชื่อผู้จอง", namePlaceholder: "มะลิ สุวรรณภา", nameError: "กรุณากรอกชื่อผู้จอง",
    phoneLabel: "เบอร์โทร", phoneError: "กรุณากรอกเบอร์โทรหรือ LINE ID",
    channelLabel: "ช่องทางติดต่อ", channelOpt: "ไม่บังคับ",
    channelPlaceholders: ["LINE ID หรือ @username", "เบอร์โทร WhatsApp", "ชื่อ Facebook / username"],
    pickupLabel: "ที่อยู่รับ-ส่ง", pickupNote: "ถ้าต้องการบริการ · ใน 5 กม ฟรี",
    pickupPlaceholder: "บ้านเลขที่ / ชื่อโรงแรม / สถานที่",
    notesLabel: "หมายเหตุเพิ่มเติม", notesPlaceholder: "เช่น มีเด็กเล็ก มีผู้สูงอายุ ความต้องการพิเศษ ฯลฯ",
    photoLabel: "การถ่ายภาพ",
    photoExplain: "การอนุญาตหมายถึงให้สิทธิ์กับทาง Sup Space Maeklong นำภาพไปเผยแพร่ในสื่อ social ได้ และลูกค้าจะได้รับภาพที่ถ่ายเป็นที่ระลึก แต่ถ้าลูกค้าไม่ต้องการให้เผยแพร่ภาพในสื่อแต่ต้องการรูป สามารถเลือกเป็น Private ได้ โดยมีค่าใช้จ่าย 500 บาท",
    photoOpts: [
      { label: "อนุญาต", sub: "ให้ใช้ภาพใน Social ได้ · ได้รับภาพเป็นที่ระลึก" },
      { label: "ไม่อนุญาต", sub: "ไม่ต้องการให้ถ่ายภาพ" },
      { label: "Private", sub: "ได้ภาพส่วนตัว · ไม่เผยแพร่ใน Social", badge: "+฿500/คน", minPeople: "ต้องมีอย่างน้อย 2 คน" },
    ],
    summaryTitle: "สรุปการจอง",
    sumDate: "วันที่", sumTime: "เวลา", sumRoute: "เส้นทาง",
    sumBoards: "ผู้พาย", sumPhoto: "ถ่ายภาพ", sumTotal: "รวมทั้งหมด",
    back: "← ย้อน", next: "ต่อไป →", confirm: "ยืนยันการจอง", joinConfirm: "ร่วมทริปเลย",
    submitting: "กำลังส่ง...", totalLabel: "รวม",
    chip1: "ยกเลิกฟรี 24 ชม.", chip2: "ไม่ต้องใช้บัตรเครดิต", chip3: "จ่ายหน้างาน", chip4: "ภาษาไทย & EN",
    joiningTrip: (host) => `กำลังร่วมทริปของ ${host}`,
    joinBoards: (j, m) => `· ${j}/${m} บอร์ด`,
    newTrip: "เริ่มทริปใหม่",
    confirmedTitle: "เจอกันที่แม่กลอง!",
    confirmedJoin: (host) => `ร่วมทริปกับ ${host} แล้ว!`,
    bookingRef: "หมายเลขจอง",
    confirmedMsg: (name, boards, route, time, date, photo) =>
      `ขอบคุณ ${name || "คุณ"} · ${boards} บอร์ด เส้นทาง${route} · ${time} ${date} · ถ่ายภาพ: ${photo}`,
    resetBook: "จองอีก", resetJoin: "ร่วมทริปอื่น",
    errorGeneric: "เกิดข้อผิดพลาด กรุณาลองใหม่",
    dow: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
    dowFull: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"],
    monthsFull: ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],
    monthsShort: ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],
    yearOffset: 543,
    formatTime: (slot) => {
      if (slot === "MORNING")   return "รอบเช้า";
      if (slot === "AFTERNOON") return "รอบบ่าย";
      return `${slot} น.`;
    },
  },
};

const en: Translations = {
  header: {
    services: "Services", trips: "Trips", about: "About",
    gallery: "Gallery", contact: "Contact", book: "Book Now",
  },
  hero: {
    badge: "Maeklong · Samut Songkhram",
    title: "Paddle SUP through floating markets and Maeklong's canal life",
    subtitle: "Experience the charm of Samut Songkhram from a unique perspective — through floating markets, coconut palm gardens, and ancient riverside communities",
    trust: ["Beginner-friendly", "1.5h from Bangkok", "Guided throughout", "Photos included", "Safety equipment"],
    ctaPrimary: "Book a Trip", ctaSecondary: "View Routes",
    proofReviews: (n) => `from ${n.toLocaleString()} Google reviews`,
    proofPaddlers: "Over 1,200 paddlers have joined us",
  },
  services: {
    eyebrow: "Our Services",
    title: { pre: "More than just ", accent: "board rental", post: "" },
    sub: "Four things we do best · 13 guided routes · free paddling lesson · photography · hotel transfers",
    priceCta: "View pricing",
    cards: [
      { eyebrow: "Guided Tours", title: "13 Paddling Routes", desc: "Short, medium & long · canal coffee stops · legendary floating markets · 3 markets over 25 km · our team knows the tides and best photo spots", bullets: ["Short route ฿500/board · 2 hrs", "Medium route ฿700–750", "Long route ฿900 · 16–25 km"], linkText: "View all routes" },
      { eyebrow: "Beginners Free!", title: "Basic Paddling Lesson", desc: "First time ever? We always teach you the basics before getting on the water · Balance · Paddle · Turn · Completely free, no extra charge", bullets: ["Safety briefing", "Practice on land first", "Life jacket for everyone"] },
      { eyebrow: "Capture Memories", title: "Photography Team", desc: "We shoot for free for social media · For private-use photos add ฿500/person", bullets: ["Free: promotional shots", "Sent via LINE", "Private +฿500/person (min. 2 people)"], badge: "Most Popular" },
      { eyebrow: "Door-to-Door", title: "Hotel Transfer", desc: "Within 5 km of SUP Space Maeklong we pick up & drop off for free · Beyond that ฿7/km", bullets: ["Within 5 km · Free", "Over 5 km · ฿7/km", "No need to worry about parking"] },
    ],
    packageEyebrow: "SUP HEALTHY · Monthly Package",
    packageTitle: "Paddle more, pay less",
    packageDesc: "For regular paddlers · Non-transferable",
    pkg1Title: "10 Sessions", pkg1Hint: "max 3 hrs per session",
    pkg2Title: "Monthly · Unlimited", pkg2Hint: "Unlimited sessions per month",
  },
  booking: {
    eyebrow: "Fastest way to book",
    titleLine1: "Choose a date,", titleAccent: "leave the rest", titleLine2: " to us",
    pitch: "Cancel free · Pay on site · Our team confirms via LINE within 1 hour with a map and what to bring",
    r1: "No credit card required to book",
    r2: "Confirmed by real staff (not a bot)",
    r3: "Cancel free up to 24 hrs before the tour",
    r4: "Rain check guaranteed",
  },
  about: {
    eyebrow: "About Us",
    title: { pre: "More than SUP paddling — it's seeing ", accent: "Maeklong from a perspective most have never seen", post: "" },
    p1: "Small canals hidden behind the floating market, riverside coconut palm groves, old wooden houses that still carry the rhythm of traditional life.",
    p2: "SUP Space Maeklong was born from a deep love of the Maeklong River basin and a desire to let people experience nature, culture, and local communities up close — through the simple joy of Stand Up Paddle Boarding.",
    p3: "We don't just take you paddling — we take you to discover the small corners that most tourists never get to see. We believe it will make you fall even more in love with Samut Songkhram.",
    p4: "Whether you're a first-timer, a nature-loving traveler, or someone searching for a peaceful escape from the city, SUP Space Maeklong is here to make every paddle stroke a fun, safe, and unforgettable experience.",
    s1n: "600+", s1l: "Guests this season",
    s2n: "6 yrs", s2l: "on Maeklong",
    s3n: "100%", s3l: "Beginner-safe",
    reviewCount: (n) => `${n.toLocaleString()} Google reviews`,
  },
  gallery: {
    eyebrow: "Last week",
    title: { pre: "We ", accent: "shoot for you", post: "" },
    sub: "Some shots from last week · our team shoots everything on the water, no staged poses",
    cta: "Come let us shoot you →",
  },
  reviews: {
    eyebrow: "Real guest reviews",
    title: { pre: "What our ", accent: "paddlers", post: " say" },
    fromCount: (n) => `from ${n.toLocaleString()} reviews on Google`,
    scrollHint: "← Scroll to read more →",
    mapsLink: "View all reviews on Google Maps →",
  },
  trips: {
    eyebrow: "Coming up",
    title: { pre: "", accent: "Upcoming", post: " Trips" },
    sub: "Join an existing group to share costs, or open your own new trip",
    route: "Route", bookedBy: "Booked by", boards: "boards",
    full: "Full", join: "Join Trip", viewPlan: "View plan →",
    noTrips: "No upcoming trips yet",
    joining: (host, joined, max) => `Joining ${host}'s trip · ${joined}/${max} boards`,
    newTrip: "New trip",
  },
  footer: {
    tagline: "SUP boarding on Maeklong River · Beginner-friendly · Photos included",
    locTitle: "Location", mapLink: "📍 Get directions →",
    hoursTitle: "Hours", hours: "7:00 AM – 6:00 PM", hoursNote: "By appointment only",
    contactTitle: "Contact", bookCta: "Book a Trip",
    copyright: "© SUP Space Maeklong · Paddling since 2019",
    footerLine: "See you at Maeklong",
  },
  widget: {
    eyebrow: "Book in 30 seconds", title: "Book a SUP Trip",
    sub: "Cancel free · Pay on site · Photos included", perBoard: "/ board",
    steps: ["Date", "Time", "Route", "Boards", "Details"],
    dateLabel: "Select date",
    dateTip: (loading) => loading ? "Checking availability..." : "Green dot = available · Red dot = full/closed · Book any date in advance",
    timeLabel: "Select time",
    timeAvail: "Available", timeBooked: "Booked", timeSelected: "Selected",
    timeHint: "Red = that time slot already has a trip (including its duration) · Choose a green slot",
    routeLabel: "Select route", routeFit: "Best for:",
    cats: [
      { label: "Short",  sub: "~2 hrs · 2–4 km",     skill: "Total beginners" },
      { label: "Medium", sub: "3–4 hrs · 6–12 km",   skill: "Some experience" },
      { label: "Long",   sub: "Half day · 16–25 km",  skill: "Good fitness" },
    ],
    boardsLabel: "Number of boards", adultLabel: "Adult · 1 board/person", ageNote: "Age 12+",
    boardsNote: "We have boards and life jackets in various sizes. Our team will match the right board for each person on the day — beginners are very welcome, no experience needed.",
    nameLabel: "Your name", namePlaceholder: "Jane Smith", nameError: "Please enter your name",
    phoneLabel: "Phone number", phoneError: "Please enter a phone number or LINE ID",
    channelLabel: "Contact channel", channelOpt: "optional",
    channelPlaceholders: ["LINE ID or @username", "WhatsApp phone number", "Facebook name / username"],
    pickupLabel: "Pickup address", pickupNote: "optional · free within 5 km",
    pickupPlaceholder: "Hotel name or address",
    notesLabel: "Additional notes", notesPlaceholder: "e.g. young children, elderly, special requirements…",
    photoLabel: "Photography",
    photoExplain: "Allowing photos means SUP Space Maeklong may share them on social media — and you'll receive the photos as a keepsake. If you'd prefer to keep them private and not have them posted, choose Private for an additional ฿500.",
    photoOpts: [
      { label: "Allow", sub: "Can be shared on social · receive photos as a keepsake" },
      { label: "No photos", sub: "Prefer not to be photographed" },
      { label: "Private", sub: "Personal photos · not shared on social", badge: "+฿500/person", minPeople: "Requires 2+ people" },
    ],
    summaryTitle: "Booking Summary",
    sumDate: "Date", sumTime: "Time", sumRoute: "Route",
    sumBoards: "Boards", sumPhoto: "Photos", sumTotal: "Total",
    back: "← Back", next: "Next →", confirm: "Confirm Booking", joinConfirm: "Join this trip",
    submitting: "Sending…", totalLabel: "Total",
    chip1: "Cancel free 24h", chip2: "No credit card", chip3: "Pay on site", chip4: "Thai & English",
    joiningTrip: (host) => `Joining ${host}'s trip`,
    joinBoards: (j, m) => `· ${j}/${m} boards`,
    newTrip: "New trip",
    confirmedTitle: "See you at Maeklong!",
    confirmedJoin: (host) => `You've joined ${host}'s trip!`,
    bookingRef: "Booking ref",
    confirmedMsg: (name, boards, route, time, date, photo) =>
      `Thank you, ${name || "you"} · ${boards} board${boards > 1 ? "s" : ""}, ${route} route · ${time} on ${date} · Photo: ${photo}`,
    resetBook: "Book another", resetJoin: "Join another trip",
    errorGeneric: "An error occurred, please try again",
    dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dowFull: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthsFull: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    monthsShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    yearOffset: 0,
    formatTime: (slot) => {
      if (slot === "MORNING")   return "Morning session";
      if (slot === "AFTERNOON") return "Afternoon session";
      return slot;
    },
  },
};

export const T: Record<Lang, Translations> = { th, en };
