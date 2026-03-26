import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Readme Auto Doctor — Fix Your README in Seconds",
  description:
    "AI-powered tool to analyze, improve, and ship better README documentation instantly. Generate, preview, diff, and create pull requests in one click.",
  keywords: ["README", "GitHub", "AI", "documentation", "developer tools"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: { url: "/favicon.svg", type: "image/svg+xml" },
  },
  openGraph: {
    title: "Readme Auto Doctor",
    description: "Fix your README in seconds with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
