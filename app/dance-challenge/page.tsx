import DanceChallengeClient from "./DanceChallengeClient";
import { getCampaignStats } from "@/app/actions/campaign";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "พาย พาย พาย Dance Challenge | SUP Space Maeklong",
  description:
    "เต้นท่าพายง่าย ๆ ถ่ายคลิปลง TikTok/Reels แท็กเรา รับสิทธิ์พาย SUP ฟรี 1 เที่ยว จำกัด 30 สิทธิ์แรก และลุ้นรางวัลใหญ่ · Dance-cover our song, post on TikTok/Reels, and win a free SUP trip.",
};

export default async function DanceChallengePage() {
  const campaignStats = await getCampaignStats();
  return <DanceChallengeClient campaignStats={campaignStats} />;
}
