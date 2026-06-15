import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Venture Investor — asymmetric small-cap screener",
  description:
    "A venture-style public-market screener for finding small companies entering huge markets, growing fast, and riding major technology shifts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-muted">
          <p>
            Educational tool, not investment advice. Scores are a heuristic
            ranking of fit to a growth thesis — always do your own research.
          </p>
        </footer>
      </body>
    </html>
  );
}
