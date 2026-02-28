import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { UserSync } from "@/components/user-sync";
import { PresenceSync } from "@/components/presence-sync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Live Chat",
  description: "A simple real-time chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <UserSync />
          <PresenceSync />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
