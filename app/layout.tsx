import type { Metadata } from "next";
import { Inter, Kanit } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const kanit = Kanit({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "500", "700"],
  variable: "--font-kanit",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://supspacemaeklong.com"),
  title: "SUP Space Maeklong | พาย SUP เที่ยวตลาดน้ำแม่กลอง สมุทรสงคราม",
  description:
    "พาย SUP เที่ยวตลาดน้ำและวิถีชีวิตริมคลองแม่กลอง · SUP Maeklong & Paddle Board Thailand floating market tours in Samut Songkhram — beginner-friendly, guided, and one of the best things to do near Bangkok. A true Thailand local experience.",
  keywords: [
    "SUP Maeklong",
    "Paddle Board Thailand",
    "Floating Market Tour",
    "Samut Songkhram",
    "Things to do near Bangkok",
    "Thailand Local Experience",
    "พาย SUP แม่กลอง",
    "ตลาดน้ำ",
    "สมุทรสงคราม",
  ],
  openGraph: {
    title: "SUP Space Maeklong | พาย SUP เที่ยวตลาดน้ำแม่กลอง",
    description:
      "SUP Maeklong paddle board floating market tours in Samut Songkhram — beginner-friendly guided trips, ~1 hour from Bangkok.",
    url: "https://supspacemaeklong.com",
    siteName: "SUP Space Maeklong",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/images/KOSI2067.jpg",
        width: 1200,
        height: 630,
        alt: "SUP Maeklong floating market paddle tour",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${kanit.variable} ${inter.variable} font-kanit antialiased`}>
        {children}
      </body>
      <GoogleAnalytics gaId="G-DN16M1J9SN" />
    </html>
  );
}