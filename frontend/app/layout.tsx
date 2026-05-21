import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GovLens AI - DAO Governance Platform",
  description: "AI-Driven DAO Governance Summarizer & Voting Platform on Stellar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
