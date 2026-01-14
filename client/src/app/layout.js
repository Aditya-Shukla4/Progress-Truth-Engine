import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Progress Truth Engine",
  description: "Track your gym progress honestly.",
  manifest: "/manifest.json", // 👈 YE LINE ADD KAR
  themeColor: "#000000",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // 👈 YE BHI (Zoom rokne ke liye mobile pe)
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
