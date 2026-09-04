    import type { Metadata } from "next";
    import { Inter, JetBrains_Mono } from "next/font/google";
    import "./globals.css"; // Make sure globals.css exists with your Tailwind /    styles
  
    const inter = Inter({
      variable: "--font-sans",
      subsets: ["latin"],
    });
  
    const jetbrainsMono = JetBrains_Mono({
      variable: "--font-mono",
      subsets: ["latin"],
    });
  
    export const metadata: Metadata = {
      title: "AI Content Pipeline Dashboard",
      description: "Multi-agent LLM orchestration and revision pipeline",           
    };
  
    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <html
          lang="en"
          data-theme="dark"
          suppressHydrationWarning
          className={`${inter.variable} ${jetbrainsMono.variable}`}
        >
          <body className="antialiased">{children}</body>
        </html>
      );
    }