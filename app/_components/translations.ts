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
  routesPage: {
    navHome: string; navBook: string;
    badge: string;
    titlePre: string; titleAccent: string; titleSub: string;
    intro: string;
    catJumpPrefix: string;          // "ระยะ" / "" (prefix before category label in quick-jump)
    catEyebrowPrefix: string;       // "ทริประยะ" / "" — before label in section eyebrow
    catEyebrowSuffix: string;       // "" / " routes" — after label
    routeCount: (n: number) => string;
    perBoard: string; bookThis: string; recommend: string;
    km: string; hours: string;
    customEyebrow: string; customTitle: string; customDesc: string; customCta: string;
    pkgEyebrow: string; pkgDesc: string;
    pkg1Title: string; pkg1Hint: string; pkg2Title: string; pkg2Hint: string;
    catLabels: Record<string, string>;
    catSubs: Record<string, string>;
    catSkills: Record<string, string>;
    routeNames: Record<string, string>;
    routeDesc: Record<string, string>;
    routeWarn: Record<string, string>;
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
  routesPage: {
    navHome: "← หน้าหลัก", navBook: "จองทริปเลย →",
    badge: "SUP Space Maeklong · แม่กลอง สมุทรสงคราม",
    titlePre: "13 เส้นทาง", titleAccent: "พายซับ", titleSub: "ริมแม่กลอง · สมุทรสงคราม",
    intro: "สั้น กลาง ไกล — ตั้งแต่กาแฟริมคลองเม็ง ไปจนถึงผจญภัย 3 ตลาดน้ำ 25 กม มือใหม่ก็พายได้ · ทีมไกด์รู้น้ำขึ้นน้ำลง · รวมถ่ายภาพ",
    catJumpPrefix: "ระยะ",
    catEyebrowPrefix: "ทริประยะ", catEyebrowSuffix: "",
    routeCount: (n) => `${n} เส้นทาง`,
    perBoard: "/ บอร์ด", bookThis: "จองทริปนี้ →", recommend: "RECOMMEND",
    km: "กม", hours: "ชม",
    customEyebrow: "CUSTOM YOUR OWN TRIP",
    customTitle: "อยากได้เส้นทางแบบอื่น?",
    customDesc: "นอกจากเส้นทางที่มีให้เลือกตามระยะทางแล้ว เรายังสามารถจัดเส้นทางพายให้เหมาะกับความต้องการของคุณได้อีกด้วย ติดต่อทีมงานเพื่อออกแบบทริปพิเศษสำหรับคุณโดยเฉพาะ",
    customCta: "ติดต่อออกแบบทริป →",
    pkgEyebrow: "SUP HEALTHY · แพคเกจรายเดือน",
    pkgDesc: "พายบ่อยๆ ไม่จำกัดจำนวน ฿3,500/เดือน · หรือ 10 ครั้ง ฿2,900",
    pkg1Title: "พาย 10 ครั้ง", pkg1Hint: "ครั้งละไม่เกิน 3 ชม",
    pkg2Title: "รายเดือน ไม่จำกัด", pkg2Hint: "พายได้ไม่จำกัดจำนวน",
    catLabels: { short: "สั้น", medium: "กลาง", long: "ไกล" },
    catSubs: { short: "~2 ชม · 2-4 กม", medium: "3-4 ชม · 6-12 กม", long: "ครึ่งวัน · 16-25 กม" },
    catSkills: { short: "มือใหม่ก็พายได้", medium: "เคยพายมาก่อน", long: "พายเชี่ยวชาญ" },
    routeNames: {
      phoprak: "ร้านกาแฟภพรัก", pakhiao: "หอยทอดป้าเขียว", kaodrip: "ร้านกาแฟเก๋าจะดริป",
      prokcharoen: "วัดปรกเจริญ + ให้อาหารปลา", rongsuan: "ตลาดนัดร่องสวนยายแพง",
      damnoenpwa: "ร้านอาหารดำเนินพวา", thaka: "ตลาดน้ำท่าคา", damnoen: "ตลาดน้ำดำเนินสะดวก",
      bangnoi: "บางน้อย / Somdul Bee", watyai: "สะพานแขวนวัดใหญ่", "three-mkts": "ทริป 3 ตลาดน้ำ",
      bangruahak: "คลองบางเรือหัก", khaoyisarn: "เขายี่สาร — ข้าวใหม่ปลามัน",
    },
    routeDesc: {
      phoprak: "เส้นทางพายเข้าสู่คลองเม็ง ชมธรรมชาติสวนมะพร้าว และวิถีชีวิตริมน้ำ จอดพักดื่มกาแฟจากร้านกาแฟสวยๆ ที่มีเมล็ดกาแฟให้เลือกหลากหลาย ทิวทัศน์สองข้างทางร่มรื่น เหมาะสำหรับมือใหม่และคนที่อยากสัมผัสบรรยากาศริมคลองแบบชิลๆ",
      pakhiao: "เส้นทางพายเข้าคลองเม็ง แล้วเลี้ยวขวาไปร้านหอยทอดป้าเขียวที่ขายมานานมากกว่า 40 ปี นอกจากหอยทอดแสนอร่อยแล้ว ยังมีอาหารที่หลากหลายให้เลือกทาน รวมทั้งกาแฟและเครื่องดื่มราคาน่ารัก หากโชคดีอาจได้เมนูกุ้งเผาพร้อมน้ำจิ้มสุดแซบอีกด้วย",
      kaodrip: "เส้นทางพายระยะสั้นๆ น่ารักๆ แวะร้านกาแฟเล็กๆ บรรยากาศในสวน เจ้าของร้านอารมณ์ดีและเป็นกันเอง เหมาะสำหรับคนที่อยากพายเบาๆ และจิบกาแฟชมวิว",
      prokcharoen: "เส้นทางระยะสั้น เหมาะสำหรับพาเด็กๆ พาย เราจะพายไปวัดปรกเจริญ แวะให้อาหารปลาในลำน้ำ และไหว้พระขอพรก่อนพายกลับแบบชิลๆ ไม่ต้องการทักษะพายสูง มือใหม่พาเด็กมาได้เลย",
      rongsuan: "เส้นทางไปตลาดนัดเปิดใหม่ที่เน้นของกินราคาน่ารักแต่รสชาติน่ายกนิ้วให้ ตลาดนัดร่องสวนยายแพงเปิดให้บริการเฉพาะวันเสาร์-อาทิตย์ เส้นทางนี้จึงเหมาะสำหรับทริปสุดสัปดาห์",
      damnoenpwa: "เส้นทางสำหรับทริประยะสั้นรอบเย็น แวะร้านอาหารริมน้ำที่บรรยากาศโรแมนติก เส้นทางนี้แม้จะดูไม่ไกลแต่กระแสน้ำค่อนข้างแรง และมีการพายทวนน้ำครึ่งทาง ได้ออกกำลังกายจนหลับสบายแน่นอน",
      thaka: "เส้นทางที่พาให้เราได้พบกับความสวยงามและร่มรื่นของคลองบ้านใต้ และวิถีชีวิตเรียบง่ายของชาวสวน จุดหมายปลายทางคือตลาดน้ำโบราณที่ยังคงความเป็นวิถีชุมชนอยู่ มีอาหารอร่อยๆ และสินค้าเกษตรที่พ่อค้าแม่ค้าพายเรือมาขาย",
      damnoen: "เราจะเริ่มที่วัดโชติทายการาม พายเข้าสู่ตลาดน้ำดำเนินสะดวก ชมตลาดน้ำในตำนาน แวะชมเตาตาลบังเละ และพายกลับมาจบที่ SUP Space Maeklong เส้นทางนี้เต็มไปด้วยบรรยากาศย้อนยุคและวิถีชีวิตดั้งเดิมของชาวสมุทรสงคราม",
      bangnoi: "เส้นทางพายสำหรับช่วงน้ำลง เราจะล่องไปตามสายน้ำในคลองบางน้อย แวะพักที่ตลาดน้ำบางน้อย จากนั้นเดินทางต่อไปจบที่ร้าน Somdul Bee Sanctuary (6 กม) หรือสะพานแขวนวัดปากน้ำ (7 กม) แล้วแต่ลูกค้าเลือก จากนั้นนั่งรถกลับมาที่จุดเริ่มต้น",
      watyai: "เส้นทางพายชมแลนด์มาร์คแห่งใหม่ของสมุทรสงคราม สะพานปลาทูหรือสะพานแขวนวัดใหญ่ เส้นทางนี้เราจะพายล่องไปตามแม่น้ำแม่กลองเป็นส่วนใหญ่ กระแสน้ำสงบ พายง่าย เหมาะสำหรับผู้ที่เคยพายมาแล้ว",
      "three-mkts": "เราจะพายชม 3 ตลาดน้ำที่ดังที่สุดของสมุทรสงคราม ได้แก่ ตลาดน้ำอัมพวา, ตลาดน้ำท่าคา, และตลาดน้ำบางน้อย เป็นเส้นทางที่มีการผจญภัยครบรส ผ่านทั้งคลองแคบ แม่น้ำกว้าง และวิถีชีวิตชุมชนที่หลากหลาย",
      bangruahak: "เส้นทางพายผ่านอุโมงป่าจากในคลองบางเรือหัก คลองที่กระแสน้ำมีความท้าทายสูง จากนั้นพายออกคลองประชาชมชื่น เข้าสู่แม่น้ำแม่กลอง รวมระยะทาง 20 กม เหมาะสำหรับนักพายที่มีประสบการณ์และต้องการความท้าทาย",
      khaoyisarn: "เราจะเริ่มลงพายที่เขายี่สาร ชมบรรยากาศวิถีชีวิตคนเผาถ่านที่มีธุรกิจแบบ sustainable พายชมธรรมชาติร่มรื่นและสวยงาม แวะทานอาหารที่ปลายทางร้านข้าวใหม่ปลามัน ก่อนพายกลับมาที่เขายี่สาร",
    },
    routeWarn: {
      damnoen: "⚠ ควรเริ่มพายก่อน 08:00 น. — การพายเข้าตลาดน้ำดำเนินสะดวกหลัง 09:00 น. จะมีการจราจรทางน้ำที่คับคั่งและค่อนข้างอันตรายสำหรับผู้ที่ไม่เคยพายมาก่อน",
      rongsuan: "📅 เปิดเฉพาะเสาร์–อาทิตย์ — ตลาดนัดร่องสวนยายแพงเปิดให้บริการเฉพาะวันหยุดสุดสัปดาห์",
      bangnoi: "🌊 เหมาะช่วงน้ำลง — เส้นทางนี้พายง่ายและสนุกกว่าในช่วงน้ำลง",
      damnoenpwa: "🌊 กระแสน้ำแรง — เส้นทางนี้มีกระแสน้ำค่อนข้างแรงและต้องพายทวนน้ำครึ่งทาง",
    },
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
  routesPage: {
    navHome: "← Home", navBook: "Book a Trip →",
    badge: "SUP Space Maeklong · Maeklong, Samut Songkhram",
    titlePre: "13 SUP", titleAccent: "Paddling Routes", titleSub: "along the Maeklong River · Samut Songkhram",
    intro: "Short, medium & long — from canal-side coffee on Khlong Meng to a 25 km, 3-floating-market adventure. Beginner-friendly · our guides know the tides · photos included",
    catJumpPrefix: "",
    catEyebrowPrefix: "", catEyebrowSuffix: " routes",
    routeCount: (n) => `${n} route${n > 1 ? "s" : ""}`,
    perBoard: "/ board", bookThis: "Book this trip →", recommend: "RECOMMEND",
    km: "km", hours: "hrs",
    customEyebrow: "CUSTOM YOUR OWN TRIP",
    customTitle: "Want a different route?",
    customDesc: "Beyond the routes listed by distance, we can also tailor a paddling route to fit exactly what you're looking for. Contact our team to design a special trip just for you.",
    customCta: "Contact us to design a trip →",
    pkgEyebrow: "SUP HEALTHY · Monthly Package",
    pkgDesc: "Paddle as often as you like — ฿3,500/month unlimited · or 10 sessions for ฿2,900",
    pkg1Title: "10 Sessions", pkg1Hint: "max 3 hrs per session",
    pkg2Title: "Monthly · Unlimited", pkg2Hint: "Unlimited sessions per month",
    catLabels: { short: "Short", medium: "Medium", long: "Long" },
    catSubs: { short: "~2 hrs · 2–4 km", medium: "3–4 hrs · 6–12 km", long: "Half day · 16–25 km" },
    catSkills: { short: "Total beginners", medium: "Some experience", long: "Good fitness" },
    routeNames: {
      phoprak: "Phoprak Coffee", pakhiao: "Pa Khiao Oyster Omelette", kaodrip: "Kao Ja Drip Coffee",
      prokcharoen: "Wat Prok Charoen + Fish Feeding", rongsuan: "Rong Suan Yai Phaeng Market",
      damnoenpwa: "Damnoen Phwa Riverside Restaurant", thaka: "Tha Kha Floating Market", damnoen: "Damnoen Saduak Floating Market",
      bangnoi: "Bang Noi / Somdul Bee", watyai: "Wat Yai Suspension Bridge", "three-mkts": "3 Floating Markets Trip",
      bangruahak: "Bang Rua Hak Canal", khaoyisarn: "Khao Yi San — Khao Mai Pla Man",
    },
    routeDesc: {
      phoprak: "Paddle into Khlong Meng to enjoy coconut groves and riverside life, then stop for coffee at a lovely café offering a wide choice of beans. Shaded scenery on both banks makes this perfect for beginners and anyone wanting a relaxed canal-side vibe.",
      pakhiao: "Paddle into Khlong Meng, then turn right to Pa Khiao's oyster-omelette shop that's been around for over 40 years. Besides the famous oyster omelette there's a varied menu plus coffee and drinks at friendly prices — if you're lucky, grilled prawns with a fiery dipping sauce too.",
      kaodrip: "A short, charming route with a stop at a cozy little café set in a garden. The owner is cheerful and welcoming — ideal for those who want an easy paddle and a coffee with a view.",
      prokcharoen: "A short route great for bringing kids. We paddle to Wat Prok Charoen, stop to feed the fish in the canal, and make merit before an easy paddle back. No advanced skills needed — beginners with children are very welcome.",
      rongsuan: "A route to a newly opened market focused on cute-priced eats that punch well above their weight. Rong Suan Yai Phaeng market opens only on Saturdays and Sundays, making this a perfect weekend trip.",
      damnoenpwa: "A short evening route with a stop at a romantic riverside restaurant. Though it looks short, the current is fairly strong with half the route paddling upstream — a workout that guarantees a good night's sleep.",
      thaka: "A route that reveals the lush beauty of Khlong Ban Tai and the simple life of the orchard folk. The destination is an ancient floating market that still keeps its community ways, with delicious food and farm produce sold straight from the boats.",
      damnoen: "We start at Wat Chotithayakaram, paddle into Damnoen Saduak Floating Market to see the legendary market, stop by the Bang Le palm-sugar stoves, and paddle back to finish at SUP Space Maeklong. This route is full of nostalgic atmosphere and the traditional life of Samut Songkhram.",
      bangnoi: "A low-tide route drifting along Khlong Bang Noi, stopping at Bang Noi Floating Market, then continuing to finish at Somdul Bee Sanctuary (6 km) or Wat Pak Nam suspension bridge (7 km) — your choice — before a ride back to the start.",
      watyai: "Paddle to see Samut Songkhram's newest landmark, the Pla Thu (mackerel) suspension bridge at Wat Yai. This route mostly drifts along the Maeklong River with calm currents — easy paddling, ideal for those who've paddled before.",
      "three-mkts": "We paddle past Samut Songkhram's three most famous floating markets — Amphawa, Tha Kha, and Bang Noi. A full-flavored adventure through narrow canals, wide rivers, and the diverse life of riverside communities.",
      bangruahak: "Paddle through the Nipa-palm tunnel of Khlong Bang Rua Hak, a canal with a challenging current, then out via Khlong Pracha Chom Chuen into the Maeklong River — 20 km total. Best for experienced paddlers seeking a challenge.",
      khaoyisarn: "We put in at Khao Yi San to see the sustainable charcoal-makers' way of life, paddle through lush, beautiful nature, stop to eat at the Khao Mai Pla Man restaurant, then paddle back to Khao Yi San.",
    },
    routeWarn: {
      damnoen: "⚠ Start before 08:00 — entering Damnoen Saduak after 09:00 brings heavy boat traffic that can be dangerous for those who've never paddled before.",
      rongsuan: "📅 Weekends only — Rong Suan Yai Phaeng market opens only on weekends.",
      bangnoi: "🌊 Best at low tide — this route is easier and more fun during low tide.",
      damnoenpwa: "🌊 Strong current — this route has a fairly strong current with half the way paddling upstream.",
    },
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
