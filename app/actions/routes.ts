"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/auth";

export type RoutePhotoRecord = {
  id: string;
  src: string;
  caption: string;
  order: number;
};

export type DBRoute = {
  id: string;
  cat: string;
  name: string;
  note: string;
  nameEn: string;
  noteEn: string;
  descTh: string;
  descEn: string;
  warnTh: string;
  warnEn: string;
  km: number;
  price: number;
  duration: number;
  recommend: boolean;
  order: number;
  photos: RoutePhotoRecord[];
};

export type RouteFormData = Omit<DBRoute, "photos" | "order">;

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_ROUTES: Omit<DBRoute, "photos">[] = [
  { id: "phoprak",     cat: "short",  order: 0,  recommend: true,  km: 3,  price: 500, duration: 2, name: "ร้านกาแฟภพรัก",            note: "พายเข้าคลองเม้ง · สวนมะพร้าว · กาแฟพิเศษ",       nameEn: "Phoprak Coffee",                     noteEn: "Paddle into Khlong Meng · coconut groves · specialty coffee",          descTh: "เส้นทางพายเข้าสู่คลองเม็ง ชมธรรมชาติสวนมะพร้าว และวิถีชีวิตริมน้ำ จอดพักดื่มกาแฟจากร้านกาแฟสวยๆ ที่มีเมล็ดกาแฟให้เลือกหลากหลาย ทิวทัศน์สองข้างทางร่มรื่น เหมาะสำหรับมือใหม่และคนที่อยากสัมผัสบรรยากาศริมคลองแบบชิลๆ", descEn: "Paddle into Khlong Meng to enjoy coconut groves and riverside life, then stop for coffee at a lovely café offering a wide choice of beans. Shaded scenery on both banks makes this perfect for beginners and anyone wanting a relaxed canal-side vibe.", warnTh: "", warnEn: "" },
  { id: "pakhiao",     cat: "short",  order: 1,  recommend: true,  km: 3,  price: 500, duration: 2, name: "หอยทอดป้าเขียว",           note: "เลี้ยวขวาเข้าคลองเม้ง · ร้าน 40 ปี · กุ้งเผา",     nameEn: "Pa Khiao Oyster Omelette",           noteEn: "Turn into Khlong Meng · 40-year-old shop · grilled prawns",            descTh: "เส้นทางพายเข้าคลองเม็ง แล้วเลี้ยวขวาไปร้านหอยทอดป้าเขียวที่ขายมานานมากกว่า 40 ปี นอกจากหอยทอดแสนอร่อยแล้ว ยังมีอาหารที่หลากหลายให้เลือกทาน รวมทั้งกาแฟและเครื่องดื่มราคาน่ารัก หากโชคดีอาจได้เมนูกุ้งเผาพร้อมน้ำจิ้มสุดแซบอีกด้วย", descEn: "Paddle into Khlong Meng, then turn right to Pa Khiao's oyster-omelette shop that's been around for over 40 years. Besides the famous oyster omelette there's a varied menu plus coffee and drinks at friendly prices — if you're lucky, grilled prawns with a fiery dipping sauce too.", warnTh: "", warnEn: "" },
  { id: "kaodrip",     cat: "short",  order: 2,  recommend: false, km: 3,  price: 500, duration: 2, name: "ร้านกาแฟเก๋าจะดริป",        note: "เส้นทางสั้นๆ · บรรยากาศในสวน",                   nameEn: "Kao Ja Drip Coffee",                 noteEn: "Short route · garden café atmosphere",                                  descTh: "เส้นทางพายระยะสั้นๆ น่ารักๆ แวะร้านกาแฟเล็กๆ บรรยากาศในสวน เจ้าของร้านอารมณ์ดีและเป็นกันเอง เหมาะสำหรับคนที่อยากพายเบาๆ และจิบกาแฟชมวิว", descEn: "A short, charming route with a stop at a cozy little café set in a garden. The owner is cheerful and welcoming — ideal for those who want an easy paddle and a coffee with a view.", warnTh: "", warnEn: "" },
  { id: "prokcharoen", cat: "short",  order: 3,  recommend: false, km: 3,  price: 500, duration: 2, name: "วัดปรกเจริญ + ให้อาหารปลา", note: "เหมาะพาเด็กๆ · ไหว้พระ · ระยะสั้นชิลๆ",           nameEn: "Wat Prok Charoen + Fish Feeding",    noteEn: "Great for kids · temple visit · easy paddling",                         descTh: "เส้นทางระยะสั้น เหมาะสำหรับพาเด็กๆ พาย เราจะพายไปวัดปรกเจริญ แวะให้อาหารปลาในลำน้ำ และไหว้พระขอพรก่อนพายกลับแบบชิลๆ ไม่ต้องการทักษะพายสูง มือใหม่พาเด็กมาได้เลย", descEn: "A short route great for bringing kids. We paddle to Wat Prok Charoen, stop to feed the fish in the canal, and make merit before an easy paddle back. No advanced skills needed — beginners with children are very welcome.", warnTh: "", warnEn: "" },
  { id: "rongsuan",    cat: "short",  order: 4,  recommend: false, km: 3,  price: 500, duration: 2, name: "ตลาดนัดร่องสวนยายแพง",      note: "ของกินราคาน่ารัก · เปิดเสาร์-อาทิตย์เท่านั้น",    nameEn: "Rong Suan Yai Phaeng Market",        noteEn: "Affordable food · weekends only",                                       descTh: "เส้นทางไปตลาดนัดเปิดใหม่ที่เน้นของกินราคาน่ารักแต่รสชาติน่ายกนิ้วให้ ตลาดนัดร่องสวนยายแพงเปิดให้บริการเฉพาะวันเสาร์-อาทิตย์ เส้นทางนี้จึงเหมาะสำหรับทริปสุดสัปดาห์", descEn: "A route to a newly opened market focused on cute-priced eats that punch well above their weight. Rong Suan Yai Phaeng market opens only on Saturdays and Sundays, making this a perfect weekend trip.", warnTh: "📅 เปิดเฉพาะเสาร์–อาทิตย์ — ตลาดนัดร่องสวนยายแพงเปิดให้บริการเฉพาะวันหยุดสุดสัปดาห์", warnEn: "📅 Weekends only — Rong Suan Yai Phaeng market opens only on weekends." },
  { id: "damnoenpwa",  cat: "short",  order: 5,  recommend: false, km: 4,  price: 500, duration: 2, name: "ร้านอาหารดำเนินพวา",        note: "รอบเย็น · บรรยากาศโรแมนติก · กระแสน้ำแรง",       nameEn: "Damnoen Phwa Riverside Restaurant",  noteEn: "Evening trip · romantic atmosphere · strong current",                   descTh: "เส้นทางสำหรับทริประยะสั้นรอบเย็น แวะร้านอาหารริมน้ำที่บรรยากาศโรแมนติก เส้นทางนี้แม้จะดูไม่ไกลแต่กระแสน้ำค่อนข้างแรง และมีการพายทวนน้ำครึ่งทาง ได้ออกกำลังกายจนหลับสบายแน่นอน", descEn: "A short evening route with a stop at a romantic riverside restaurant. Though it looks short, the current is fairly strong with half the route paddling upstream — a workout that guarantees a good night's sleep.", warnTh: "🌊 กระแสน้ำแรง — เส้นทางนี้มีกระแสน้ำค่อนข้างแรงและต้องพายทวนน้ำครึ่งทาง", warnEn: "🌊 Strong current — this route has a fairly strong current with half the way paddling upstream." },
  { id: "thaka",       cat: "medium", order: 6,  recommend: true,  km: 8,  price: 700, duration: 4, name: "ตลาดน้ำท่าคา",             note: "คลองบ้านใต้ · ตลาดน้ำโบราณ",                     nameEn: "Tha Kha Floating Market",            noteEn: "Khlong Ban Tai · ancient floating market",                              descTh: "เส้นทางที่พาให้เราได้พบกับความสวยงามและร่มรื่นของคลองบ้านใต้ และวิถีชีวิตเรียบง่ายของชาวสวน จุดหมายปลายทางคือตลาดน้ำโบราณที่ยังคงความเป็นวิถีชุมชนอยู่ มีอาหารอร่อยๆ และสินค้าเกษตรที่พ่อค้าแม่ค้าพายเรือมาขาย", descEn: "A route that reveals the lush beauty of Khlong Ban Tai and the simple life of the orchard folk. The destination is an ancient floating market that still keeps its community ways, with delicious food and farm produce sold straight from the boats.", warnTh: "", warnEn: "" },
  { id: "damnoen",     cat: "medium", order: 7,  recommend: true,  km: 6,  price: 700, duration: 3, name: "ตลาดน้ำดำเนินสะดวก",       note: "ตลาดน้ำในตำนาน · ออกก่อน 08.00 น.",              nameEn: "Damnoen Saduak Floating Market",     noteEn: "Legendary floating market · depart before 08:00",                       descTh: "เราจะเริ่มที่วัดโชติทายการาม พายเข้าสู่ตลาดน้ำดำเนินสะดวก ชมตลาดน้ำในตำนาน แวะชมเตาตาลบังเละ และพายกลับมาจบที่ SUP Space Maeklong เส้นทางนี้เต็มไปด้วยบรรยากาศย้อนยุคและวิถีชีวิตดั้งเดิมของชาวสมุทรสงคราม", descEn: "We start at Wat Chotithayakaram, paddle into Damnoen Saduak Floating Market to see the legendary market, stop by the Bang Le palm-sugar stoves, and paddle back to finish at SUP Space Maeklong. This route is full of nostalgic atmosphere and the traditional life of Samut Songkhram.", warnTh: "⚠ ควรเริ่มพายก่อน 08:00 น. — การพายเข้าตลาดน้ำดำเนินสะดวกหลัง 09:00 น. จะมีการจราจรทางน้ำที่คับคั่งและค่อนข้างอันตรายสำหรับผู้ที่ไม่เคยพายมาก่อน", warnEn: "⚠ Start before 08:00 — entering Damnoen Saduak after 09:00 brings heavy boat traffic that can be dangerous for those who've never paddled before." },
  { id: "bangnoi",     cat: "medium", order: 8,  recommend: false, km: 7,  price: 750, duration: 4, name: "บางน้อย / Somdul Bee",      note: "ช่วงน้ำลง · ตลาดน้ำ + ผึ้ง + สะพานแขวน",        nameEn: "Bang Noi / Somdul Bee",              noteEn: "Low tide · floating market + bees + suspension bridge",                  descTh: "เส้นทางพายสำหรับช่วงน้ำลง เราจะล่องไปตามสายน้ำในคลองบางน้อย แวะพักที่ตลาดน้ำบางน้อย จากนั้นเดินทางต่อไปจบที่ร้าน Somdul Bee Sanctuary (6 กม) หรือสะพานแขวนวัดปากน้ำ (7 กม) แล้วแต่ลูกค้าเลือก จากนั้นนั่งรถกลับมาที่จุดเริ่มต้น", descEn: "A low-tide route drifting along Khlong Bang Noi, stopping at Bang Noi Floating Market, then continuing to finish at Somdul Bee Sanctuary (6 km) or Wat Pak Nam suspension bridge (7 km) — your choice — before a ride back to the start.", warnTh: "🌊 เหมาะช่วงน้ำลง — เส้นทางนี้พายง่ายและสนุกกว่าในช่วงน้ำลง", warnEn: "🌊 Best at low tide — this route is easier and more fun during low tide." },
  { id: "watyai",      cat: "medium", order: 9,  recommend: false, km: 8,  price: 700, duration: 4, name: "สะพานแขวนวัดใหญ่",         note: "สะพานปลาทู · ล่องไปตามแม่น้ำแม่กลอง",            nameEn: "Wat Yai Suspension Bridge",          noteEn: "Mackerel bridge · drift along the Maeklong River",                      descTh: "เส้นทางพายชมแลนด์มาร์คแห่งใหม่ของสมุทรสงคราม สะพานปลาทูหรือสะพานแขวนวัดใหญ่ เส้นทางนี้เราจะพายล่องไปตามแม่น้ำแม่กลองเป็นส่วนใหญ่ กระแสน้ำสงบ พายง่าย เหมาะสำหรับผู้ที่เคยพายมาแล้ว", descEn: "Paddle to see Samut Songkhram's newest landmark, the Pla Thu (mackerel) suspension bridge at Wat Yai. This route mostly drifts along the Maeklong River with calm currents — easy paddling, ideal for those who've paddled before.", warnTh: "", warnEn: "" },
  { id: "three-mkts",  cat: "long",   order: 10, recommend: true,  km: 25, price: 900, duration: 6, name: "ทริป 3 ตลาดน้ำ",           note: "อัมพวา + ท่าคา + บางน้อย · ผจญภัยครบรส",         nameEn: "3 Floating Markets Trip",            noteEn: "Amphawa + Tha Kha + Bang Noi · full adventure",                         descTh: "เราจะพายชม 3 ตลาดน้ำที่ดังที่สุดของสมุทรสงคราม ได้แก่ ตลาดน้ำอัมพวา, ตลาดน้ำท่าคา, และตลาดน้ำบางน้อย เป็นเส้นทางที่มีการผจญภัยครบรส ผ่านทั้งคลองแคบ แม่น้ำกว้าง และวิถีชีวิตชุมชนที่หลากหลาย", descEn: "We paddle past Samut Songkhram's three most famous floating markets — Amphawa, Tha Kha, and Bang Noi. A full-flavored adventure through narrow canals, wide rivers, and the diverse life of riverside communities.", warnTh: "", warnEn: "" },
  { id: "bangruahak",  cat: "long",   order: 11, recommend: false, km: 20, price: 900, duration: 5, name: "คลองบางเรือหัก",           note: "อุโมงป่าจาก · กระแสน้ำท้าทาย",                   nameEn: "Bang Rua Hak Canal",                 noteEn: "Nipa-palm tunnel · challenging current",                                 descTh: "เส้นทางพายผ่านอุโมงป่าจากในคลองบางเรือหัก คลองที่กระแสน้ำมีความท้าทายสูง จากนั้นพายออกคลองประชาชมชื่น เข้าสู่แม่น้ำแม่กลอง รวมระยะทาง 20 กม เหมาะสำหรับนักพายที่มีประสบการณ์และต้องการความท้าทาย", descEn: "Paddle through the Nipa-palm tunnel of Khlong Bang Rua Hak, a canal with a challenging current, then out via Khlong Pracha Chom Chuen into the Maeklong River — 20 km total. Best for experienced paddlers seeking a challenge.", warnTh: "", warnEn: "" },
  { id: "khaoyisarn",  cat: "long",   order: 12, recommend: false, km: 16, price: 900, duration: 5, name: "เขายี่สาร — ข้าวใหม่ปลามัน", note: "วิถีคนเผาถ่าน · ทานริมน้ำ",                    nameEn: "Khao Yi San — Khao Mai Pla Man",     noteEn: "Charcoal-makers' way of life · riverside dining",                       descTh: "เราจะเริ่มลงพายที่เขายี่สาร ชมบรรยากาศวิถีชีวิตคนเผาถ่านที่มีธุรกิจแบบ sustainable พายชมธรรมชาติร่มรื่นและสวยงาม แวะทานอาหารที่ปลายทางร้านข้าวใหม่ปลามัน ก่อนพายกลับมาที่เขายี่สาร", descEn: "We put in at Khao Yi San to see the sustainable charcoal-makers' way of life, paddle through lush, beautiful nature, stop to eat at the Khao Mai Pla Man restaurant, then paddle back to Khao Yi San.", warnTh: "", warnEn: "" },
];

// ─── Fetch (with auto-seed) ───────────────────────────────────────────────────

export async function getRoutes(): Promise<DBRoute[]> {
  const rows = await prisma.paddleRoute.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { photos: { orderBy: { order: "asc" } } },
  });

  if (rows.length === 0) {
    await prisma.paddleRoute.createMany({
      data: SEED_ROUTES,
      skipDuplicates: true,
    });
    return prisma.paddleRoute.findMany({
      orderBy: [{ order: "asc" }],
      include: { photos: { orderBy: { order: "asc" } } },
    }) as Promise<DBRoute[]>;
  }

  return rows as unknown as DBRoute[];
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function createRoute(data: RouteFormData): Promise<void> {
  await assertAdmin();
  const count = await prisma.paddleRoute.count();
  const slug = data.id.trim() || `route-${Date.now().toString(36)}`;
  await prisma.paddleRoute.create({
    data: { ...data, id: slug, order: count },
  });
  revalidatePath("/routes");
  revalidatePath("/");
}

export async function updateRoute(id: string, data: Partial<RouteFormData>): Promise<void> {
  await assertAdmin();
  await prisma.paddleRoute.update({ where: { id }, data });
  revalidatePath("/routes");
  revalidatePath("/");
}

export async function deleteRoute(id: string): Promise<void> {
  await assertAdmin();
  await prisma.paddleRoute.delete({ where: { id } });
  revalidatePath("/routes");
  revalidatePath("/");
}

// ─── Route photos ─────────────────────────────────────────────────────────────

export async function addRoutePhoto(routeId: string, src: string, caption: string): Promise<void> {
  await assertAdmin();
  const count = await prisma.routePhoto.count({ where: { routeId } });
  await prisma.routePhoto.create({ data: { routeId, src, caption, order: count } });
  revalidatePath("/routes");
  revalidatePath("/");
}

export async function deleteRoutePhoto(id: string): Promise<void> {
  await assertAdmin();
  await prisma.routePhoto.delete({ where: { id } });
  revalidatePath("/routes");
  revalidatePath("/");
}

export async function updateRoutePhotoCaption(id: string, caption: string): Promise<void> {
  await assertAdmin();
  await prisma.routePhoto.update({ where: { id }, data: { caption } });
  revalidatePath("/routes");
}
