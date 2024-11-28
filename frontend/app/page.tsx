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
import { useSearchParams } from "next/navigation";
import { Trash } from "lucide-react";

interface FlashcardSet {
  title: string;
  code: string;
}



export default function Home() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [sets, setSets] = useState<{ title: string; code: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const savedSets = document.cookie
      .split("; ")
      .find((row) => row.startsWith("flashcard-sets="));
    if (savedSets) {
      setSets(JSON.parse(decodeURIComponent(savedSets.split("=")[1])));
    }

    const sharedTitle = searchParams.get("title");
    const sharedCode = searchParams.get("code");

    if (sharedTitle && sharedCode) {
      setCode(sharedCode);
      setTitle(sharedTitle);
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  const copyLink = async (code: string, title: string) => {
    const link = `${window.location.host}/?code=${code}&title=${title}`;
    await navigator.clipboard.writeText(link);

    toast({
      title: `Link copied!`,
      description: "Share this code to friends.",
    });
  }

  const handleAddSet = async () => {
    if (!title || !code) return;

    const isDuplicate = sets.some((set) => set.code === code);
    if (isDuplicate) {
      toast({
        title: "Error: Duplicate set!",
        description: "This set has already been added.",
      });
      return;
    } else {
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

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 400);

        document.cookie = `flashcard-sets=${encodeURIComponent(
          JSON.stringify(updatedSets)
        )}; path=/; samesite=strict; expires=${futureDate.toUTCString()}`;

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
    }
  };

  const handleRemoveSet = (code: string) => {
    try {
      const setsCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("flashcard-sets="));

      if (!setsCookie) {
        toast({
          title: "Error",
          description: "No sets found to remove.",
        });
        return;
      }

      const sets: FlashcardSet[] = JSON.parse(
        decodeURIComponent(setsCookie.split("=")[1])
      );

      const updatedSets = sets.filter((set: FlashcardSet) => set.code !== code);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 400);

      document.cookie = `flashcard-sets=${encodeURIComponent(
        JSON.stringify(updatedSets)
      )}; path=/; samesite=strict; expires=${futureDate.toUTCString()}`;

      toast({
        title: "Set Removed",
        description: "The set has been removed successfully.",
      });

      setSets(updatedSets);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };


  return (
    <div className="mx-8 my-8 sm:mx-16">
      <h1 className="font-bold text-3xl mb-4">Automated Flashcards</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger>
          <Button>Add new set</Button>
        </DialogTrigger>
        <DialogContent className="rounded-md">
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
              <TableCell className="w-1/3">
                <div className="flex items-center">
                  <Link href={`/study/${set.code}`}>
                    <Button variant="outline" size="sm">
                      Study
                    </Button>
                  </Link>
                  <Link href={`/quiz/${set.code}`}>
                    <Button variant="outline" size="sm" className="ml-2">
                      Quiz
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => copyLink(set.code, set.title)}
                  >
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 flex items-center justify-center"
                    onClick={() => handleRemoveSet(set.code)}
                  >
                    <Trash
                      color="black"
                      size={16}
                      className="inline-block align-middle"
                    />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
