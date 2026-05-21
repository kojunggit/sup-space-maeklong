import type { Metadata } from "next";
import { Inter, Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "500", "700"],
  variable: "--font-kanit",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SUP Space Maeklong | พายซับแม่กลอง",
  description: "สัมผัสประสบการณ์พายซับบอร์ดที่แม่กลอง พร้อมทีมงานมืออาชีพ",
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
    </html>
  );
}