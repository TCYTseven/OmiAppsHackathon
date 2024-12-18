"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [cards, setCards] = useState([{ front: "", back: "" }]);

  const handleSubmit = async () => {
    console.log(cards);
    const uid = "T6AdXK2jKddPmIv01YM0NZc5QVM2";
    const title = "Automatically Created Set"
    try {
      const response = await fetch("/api/sets/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cards,
          uid,
          title
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create set ${response}`);
      }

      const data = await response.json();
      console.log("Success:", data);
    
      setCards([{ front: "", back: "" }]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Flashcard Set</h1>
      
      <div className="space-y-4">

        {cards.map((card, index) => (
          <div key={index} className="border p-4 rounded">
            <h3>Card {index + 1}</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Front"
                value={card.front}
                onChange={(e) => {
                  const newCards = [...cards];
                  newCards[index].front = e.target.value;
                  setCards(newCards);
                }}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Back"
                value={card.back}
                onChange={(e) => {
                  const newCards = [...cards];
                  newCards[index].back = e.target.value;
                  setCards(newCards);
                }}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        ))}

        <Button onClick={addCard}>Add Card</Button>
        <Button onClick={handleSubmit}>Create Set</Button>
      </div>
    </div>
  );
}
