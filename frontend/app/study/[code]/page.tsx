'use client'

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useParams } from 'next/navigation'

interface Flashcard {
  front: string
  back: string
}

export default function StudyPage() {
  const params = useParams()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch flashcards when component mounts
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch("/api/sets/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codes: [params.code],
          }),
        });

        const { sets } = await response.json();
        console.log(sets[0]);
        setFlashcards(sets[0].cards)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching flashcards:', error)
        setIsLoading(false)
      }
    }
    fetchFlashcards()
  }, [params.code])

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const toggleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (flashcards.length === 0) {
    return <div className="flex justify-center items-center min-h-screen">No flashcards found</div>
  }

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card 
          className={`p-8 min-h-[300px] flex items-center justify-center cursor-pointer transition-transform duration-500 ${
            isFlipped ? 'transform rotate-y-180' : ''
          }`}
          onClick={toggleFlip}
        >
          <div className="text-center text-xl">
            {isFlipped ? flashcards[currentIndex].back : flashcards[currentIndex].front}
          </div>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-center">
            {currentIndex + 1} / {flashcards.length}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
