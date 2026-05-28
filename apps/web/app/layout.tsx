import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
  title: "Fiche",
  description:
    "The Figma playground for PMs. Collaborate with delight on PRDs, briefs, and plans with your AI agent.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
