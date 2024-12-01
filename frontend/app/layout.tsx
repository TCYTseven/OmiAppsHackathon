import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";


import Link from "next/link";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ListenLearn",
  description: "Generate flashcards and quizzes from lessons and lectures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="mx-8 sm:mx-16">
          <Link href="/">
            <p className="text-lg my-4 inline-block">Home</p>
          </Link>
          <Link href="https://omiappshackathon.onrender.com/docs">
            <p className="text-lg my-4 float-right inline-block">Docs</p>
          </Link>
        </div>

        <Suspense>
          <main>{children}</main>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
