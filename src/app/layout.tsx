import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "JalRakshak | AI Flood Intelligence for North East India",
  description: "Autonomous multimodal disaster intelligence platform converting satellite data into multilingual voice alerts for last-mile connectivity in Assam and NER.",
  keywords: ["Flood AI", "Disaster Management", "North East India", "Assam Floods", "Voice Alerts", "Sentinel-1", "IndiaAI"],
  openGraph: {
    title: "JalRakshak | Voice-First Flood Guardian",
    description: "AI-powered flood risk assessment and multilingual voice alerts for North East India.",
    url: "https://jalrakshak.site",
    siteName: "JalRakshak",
    images: [
      {
        url: "/og-image.png", // Placeholder for actual OG image
        width: 1200,
        height: 630,
        alt: "JalRakshak Dashboard",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JalRakshak | AI Flood Intelligence",
    description: "Saving lives in North East India with AI-driven flood alerts.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased font-outfit">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="d272edbf-f8eb-46b9-930d-74f41e505ad8"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <VisualEditsMessenger />
        </ThemeProvider>
      </body>
    </html>
  );
}
