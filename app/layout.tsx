import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArtistLei — Remote AR Tracer",
  description: "The ultimate tracing tool for muralists and painters. Connect your camera and monitor in seconds.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}
