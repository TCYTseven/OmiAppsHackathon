"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface Flashcard {
  front: string;
  back: string;
}

interface QuizResult {
  date: string;
  score: number;
  totalQuestions: number;
  answers: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export default function QuizPage() {
  const params = useParams();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

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
        setFlashcards(sets[0].cards);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setIsLoading(false);
      }
    };
    fetchFlashcards();
  }, [params.code]);

  useEffect(() => {
    const generateAnswers = () => {
      const correctAnswer = flashcards[currentIndex].back;
      const otherAnswers = flashcards
        .filter((card, idx) => idx !== currentIndex)
        .map((card) => card.back)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allAnswers = [...otherAnswers, correctAnswer].sort(
        () => Math.random() - 0.5
      );

      setAnswers(allAnswers);
    };

    if (flashcards.length > 0) {
      generateAnswers();
    }
  }, [currentIndex, flashcards]);

  const saveQuizResult = (userAnswers: string[], _score: number) => {
      const quizResult: QuizResult = {
        date: new Date().toISOString(),
        score: _score,
        totalQuestions: flashcards.length,
        answers: flashcards.map((flashcard, index) => ({
          question: flashcard.front,
          userAnswer: userAnswers[index],
          correctAnswer: flashcard.back,
          isCorrect: userAnswers[index] === flashcard.back,
        })),
      };

      console.log(flashcards);
      console.log(userAnswers);

      const storedData = localStorage.getItem(`quiz-results-${params.code}`);

      let results: QuizResult[] = [];
      if (storedData) {
        results = JSON.parse(storedData).results;
      }

      results.push(quizResult);

     const futureDate = new Date();
     futureDate.setDate(futureDate.getDate() + 400);

     const quizData = {
       results: results,
       expires: futureDate.getTime(),
     };

     localStorage.setItem(
       `quiz-results-${params.code}`,
       JSON.stringify(quizData)
     );

     const stored = localStorage.getItem(`quiz-results-${params.code}`);
     if (stored) {
       console.log("Data successfully stored:", JSON.parse(stored));
     } else {
       console.error("Failed to store data in localStorage.");
     }
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === flashcards[currentIndex].back;
    const newScore = score + 1;
    if (isCorrect) {
      setScore(score + 1);
    }

    setUserAnswers([...userAnswers, selectedAnswer]);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer("");
    } else {
      setShowResults(true);
      saveQuizResult([...userAnswers, selectedAnswer], newScore);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResults(false);
    setUserAnswers([]);
    setSelectedAnswer("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        No questions found
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
          <Progress
            value={(score / flashcards.length) * 100}
            className="mb-4"
          />
          <p className="text-xl mb-0">
            You scored {score} out of {flashcards.length} (
            {Math.round((score / flashcards.length) * 100)}%)
          </p>
          <div className="w-full mt-4">
            {flashcards.map((flashcard, index) => (
              <div key={index} className="mb-4 border-b pb-4">
                <p className="font-semibold">{flashcard.front}</p>
                <p
                  className={`mt-2 ${
                    userAnswers[index] === flashcard.back
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  Your Answer: {userAnswers[index]}
                </p>
                {userAnswers[index] !== flashcard.back && (
                  <p className="text-green-500">
                    Correct Answer: {flashcard.back}
                  </p>
                )}
              </div>
            ))}
          </div>
          <Link href={`/progress/${params.code}`}>
          <Button className="mt-4 w-full">
            See Progress
          </Button>
          </Link>
          <Button onClick={restartQuiz} className="mt-4 w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-4">
            Question {currentIndex + 1} of {flashcards.length}
          </h2>
          <Progress
            value={(currentIndex / flashcards.length) * 100}
            className="mb-4"
          />
          <div className="text-lg mb-4">{flashcards[currentIndex].front}</div>

          <div className="grid grid-cols-2 gap-4">
            {answers.map((answer, index) => (
              <Button
                key={index}
                variant={selectedAnswer === answer ? "default" : "outline"}
                className="h-24 whitespace-normal"
                onClick={() => setSelectedAnswer(answer)}
              >
                {answer}
              </Button>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            onClick={handleNext}
            disabled={!selectedAnswer}
          >
            {currentIndex === flashcards.length - 1
              ? "Finish Quiz"
              : "Next Question"}
          </Button>
        </Card>
      </div>
    </div>
  );
}