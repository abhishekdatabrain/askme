import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import Script from 'next/script';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  buildSocialMetadata,
} from "@/config/seo";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "FuturePast Ventures LLP", url: SITE_URL }],
  creator: "FuturePast",
  publisher: "FuturePast",
  keywords: [
    "Ask-Me.Live",
    "AskMe",
    "ask-me.live",
    "FuturePast",
    "live stream questions",
    "creator discovery",
    "super ask",
    "YouTube Live",
    "Instagram Live",
    "Twitch",
    "Kick",
    "LinkedIn Live",
  ],
  ...buildSocialMetadata(),
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
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
      className={`${plusJakartaSans.variable} ${inter.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#0A0A0F] text-[#F5F5F7] font-sans selection:bg-[#00F5D4] selection:text-[#0A0A0F]"
        suppressHydrationWarning
      >
        <ToastProvider>{children}</ToastProvider>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QKXYQZBEQX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-QKXYQZBEQX');
          `}
        </Script>
        <Script
          src="https://apis.google.com/js/platform.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
