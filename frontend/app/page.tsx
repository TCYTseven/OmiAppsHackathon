"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [sets, setSets] = useState<{ title: string; code: string }[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    // Parse the cookies and load the flashcard sets
    const savedSets = document.cookie
      .split("; ")
      .find((row) => row.startsWith("flashcard-sets="));
    if (savedSets) {
      setSets(JSON.parse(decodeURIComponent(savedSets.split("=")[1])));
    }
  }, []);

  const handleAddSet = async () => {
    if (!title || !code) return;

    try {
      const response = await fetch("/api/sets/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codes: [code],
        }),
      });

      const { sets: apiSets } = await response.json();

      if (!response.ok || apiSets.length === 0) {
        toast({
          title: `Error: Could not find set!`,
          description: "Check your code again.",
        });
        return;
      }

      const newSet = { title, code };
      const updatedSets = [...sets, newSet];
      setSets(updatedSets);

      document.cookie = `flashcard-sets=${encodeURIComponent(
        JSON.stringify(updatedSets)
      )}; path=/; samesite=strict`;

      toast({
        title: `Set Added: ${title}`,
        description: "Start studying!",
      });

      setTitle("");
      setCode("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="mx-16 my-8">
      <h1 className="font-bold text-3xl mb-4">Automated Flashcards</h1>
      <Dialog>
        <DialogTrigger>
          <Button>Add new set</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new set</DialogTitle>
            <DialogDescription>
              <Input
                placeholder="Title"
                className="inline-block w-1/2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Your code"
                className="inline-block ml-2 w-[calc(50%-0.5rem)]"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button className="mt-2" onClick={handleAddSet}>
                Create
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <p className="mt-4 mb-8">
        Obtain your set code after making a memory using{" "}
        <Link href="https://www.omi.me/" target="_blank" className="underline">
          Omi
        </Link>
        .
      </p>
      <h1 className="font-bold text-3xl mb-4">Your Sets</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sets.map((set, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{set.title}</TableCell>
              <TableCell>{set.code}</TableCell>
              <TableCell>
                <Link href={`/study/${set.code}`}>
                  <Button variant="outline" size="sm">
                    Study
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
