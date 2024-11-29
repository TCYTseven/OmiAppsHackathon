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
import { Trash, Edit2 } from "lucide-react";

interface FlashcardSet {
  title: string;
  code: string;
  uid?: string | null;
}

interface TitleChange {
  code: string;
  newTitle: string;
}

type Card = {
  front: string;
  back: string;
};

type Set = {
  _id: string;
  cards: Card[];
  code: string;
  title: string;
  uid: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  __v: number;
};

type FlashcardSetArray = Set[];


export default function Home() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [uid, setUid] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sync, setSync] = useState<{ uid? : string | null, username? : string, sets?: FlashcardSetArray }>({ uid: null });
  const [editingSet, setEditingSet] = useState<FlashcardSet | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const init = async () => {
      // Extend cookie expiration dates
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 400);

      const cookies = document.cookie.split("; ");
      cookies.forEach(cookie => {
        const [name, value] = cookie.split("=");
        document.cookie = `${name}=${value}; path=/; expires=${futureDate.toUTCString()}`;
      });

      const sync = await getSync();
      if (sync) {
        setSync(sync);
        console.log(sync);
        let syncedSets = sync.sets;

        // Get deleted synced sets
        const deletedSetsCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("deleted-synced-sets="));
        
        const deletedSets = deletedSetsCookie 
          ? JSON.parse(decodeURIComponent(deletedSetsCookie.split("=")[1]))
          : [];

        // Filter out deleted sets
        syncedSets = syncedSets.filter((set: FlashcardSet) => 
          !deletedSets.includes(set.code)
        );

        // Apply any title changes to synced sets
        const titleChangesCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("title-changes="));
        
        if (titleChangesCookie) {
          const titleChanges: TitleChange[] = JSON.parse(
            decodeURIComponent(titleChangesCookie.split("=")[1])
          );
          
          syncedSets = syncedSets.map((set: FlashcardSet) => {
            const titleChange = titleChanges.find(change => change.code === set.code);
            return titleChange ? {...set, title: titleChange.newTitle} : set;
          });
        }

        setSets(syncedSets);
        
        const savedSets = document.cookie
          .split("; ")
          .find((row) => row.startsWith("flashcard-sets="));
        if (savedSets) {
          setSets([
            ...syncedSets,
            ...JSON.parse(decodeURIComponent(savedSets.split("=")[1])),
          ]);
        }
      } else {
        const savedSets = document.cookie
          .split("; ")
          .find((row) => row.startsWith("flashcard-sets="));
        if (savedSets) {
          setSets([
            ...sets,
            ...JSON.parse(decodeURIComponent(savedSets.split("=")[1])),
          ]);
        }
      }

      const sharedTitle = searchParams.get("title");
      const sharedCode = searchParams.get("code");

      if (sharedTitle && sharedCode) {
        setCode(sharedCode);
        setTitle(sharedTitle);
        setIsDialogOpen(true);
      }
    };
    init();
  }, [searchParams]);

  const handleTitleEdit = (set: FlashcardSet) => {
    setEditingSet(set);
    setNewTitle(set.title);
  };

  const handleTitleSave = () => {
    if (!editingSet || !newTitle.trim()) return;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 400);

    if (editingSet.uid) {
      // For synced sets, store changes in title-changes cookie
      const titleChangesCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("title-changes="));

      let titleChanges: TitleChange[] = [];
      if (titleChangesCookie) {
        titleChanges = JSON.parse(decodeURIComponent(titleChangesCookie.split("=")[1]));
      }

      const updatedChanges = [
        ...titleChanges.filter(change => change.code !== editingSet.code),
        { code: editingSet.code, newTitle }
      ];

      document.cookie = `title-changes=${encodeURIComponent(
        JSON.stringify(updatedChanges)
      )}; path=/; expires=${futureDate.toUTCString()}`;

    } else {
      // For imported sets, update flashcard-sets cookie
      const setsCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("flashcard-sets="));

      if (setsCookie) {
        const savedSets: FlashcardSet[] = JSON.parse(
          decodeURIComponent(setsCookie.split("=")[1])
        );

        const updatedSets = savedSets.map(set => 
          set.code === editingSet.code ? {...set, title: newTitle} : set
        );

        document.cookie = `flashcard-sets=${encodeURIComponent(
          JSON.stringify(updatedSets)
        )}; path=/; samesite=strict; expires=${futureDate.toUTCString()}`;
      }
    }

    // Update local state
    setSets(sets.map(set => 
      set.code === editingSet.code ? {...set, title: newTitle} : set
    ));

    setEditingSet(null);
    setNewTitle("");

    toast({
      title: "Title Updated",
      description: "The set title has been updated successfully.",
    });
  };

  const handleDeleteSyncedSet = (code: string) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 400);

    // Get current deleted sets
    const deletedSetsCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("deleted-synced-sets="));
    
    let deletedSets: string[] = [];
    if (deletedSetsCookie) {
      deletedSets = JSON.parse(decodeURIComponent(deletedSetsCookie.split("=")[1]));
    }

    // Add new deleted set
    deletedSets.push(code);

    // Update cookie
    document.cookie = `deleted-synced-sets=${encodeURIComponent(
      JSON.stringify(deletedSets)
    )}; path=/; expires=${futureDate.toUTCString()}`;

    // Update local state
    setSets(sets.filter(set => set.code !== code));

    toast({
      title: "Set Removed",
      description: "The synced set has been removed successfully.",
    });
  };

  const copyLink = async (code: string, title: string) => {
    const link = `${window.location.host}/?code=${code}&title=${title}`;
    await navigator.clipboard.writeText(link);

    toast({
      title: `Link copied!`,
      description: "Share this code to friends.",
    });
  };

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

  const handleSync = async () => {
    try {
      const response = await fetch(`/api/user/get?uid=${uid}`, {
        method: "GET",
      });
      const data = await response.json();
      if (data?.message === "User not found") {
        toast({
          title: "Error: Could not sync.",
          description: "User was not found.",
        });
      } else {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 400);

        document.cookie = `uid=${uid}; path=/; expires=${futureDate.toUTCString()}`;
        toast({
          title: "User synced!",
          description: `You are now synced to ${data.user.username}`,
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error: Could not sync.",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const getSync = async () => {
    const cookies = document.cookie;

    const uidCookie = cookies
      .split("; ")
      .find((cookie) => cookie.startsWith("uid="));

    if (uidCookie) {
      const uid = uidCookie.split("=")[1];

      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 400);

      document.cookie = `uid=${uid}; path=/; expires=${newExpiryDate.toUTCString()}`;

      const response = await fetch(`/api/user/get?uid=${uid}`, {
        method: "GET",
      });
      const data = await response.json();

      return { uid, username: data.user.username, sets: data.sets };
    } else {
      return null;
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
      {sync?.uid ? (
        <p className="mt-4 mb-8">
          Make memories on your Omi and see your sets here.
        </p>
      ) : (
        <p className="mt-4 mb-8">
          Download the{" "}
          <Link
            href="https://www.omi.me/"
            target="_blank"
            className="underline"
          >
            Omi
          </Link>{" "}
          app or{" "}
          <Dialog>
            <DialogTrigger>
              <span className="underline">sync with your account</span>.
            </DialogTrigger>
            <DialogContent className="rounded-md">
              <DialogHeader>
                <DialogTitle>Sync with Omi</DialogTitle>
                <DialogDescription>
                  <Input
                    placeholder="uid"
                    className="inline-block w-full"
                    onChange={(e) => setUid(e.target.value)}
                  />
                  <Button className="mt-2" onClick={handleSync}>
                    Create
                  </Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </p>
      )}
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
              <TableCell className="font-medium">
                {editingSet?.code === set.code ? (
                  <div className="flex items-center">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="mr-2"
                    />
                    <Button size="sm" onClick={handleTitleSave}>Save</Button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {set.title}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleTitleEdit(set)}
                    >
                      <Edit2 size={16} />
                    </Button>
                  </div>
                )}
              </TableCell>
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
                  {set.uid ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 flex items-center justify-center"
                      onClick={() => handleDeleteSyncedSet(set.code)}
                    >
                      <Trash size={16} />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 flex items-center justify-center"
                      onClick={() => handleRemoveSet(set.code)}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
