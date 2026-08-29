import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "AskMe PRO | Super Admin Control Room",
  description: "Live Signal Broadcast & Creator Discovery Control Room",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0F] text-[#F5F5F7] font-sans selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
