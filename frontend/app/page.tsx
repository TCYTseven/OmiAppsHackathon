"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <h1>Automated Flashcards</h1>
      <Button>Add new set</Button>
      <h1>Your Sets</h1>
    </div>
  );
}
