"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Trophy, Target, Flame } from "lucide-react";

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

interface ChartDataPoint {
  date: string;
  score: number;
  percentage: number;
}

interface HardQuestion {
  question: string;
  correctAnswer: string;
  wrongCount: number;
  totalAttempts: number;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
  percentage: {
    label: "Percentage",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const getLetterGrade = (score: number) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
};

export default function QuizPage() {
  const params = useParams();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [hardestQuestions, setHardestQuestions] = useState<HardQuestion[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    streak: 0,
    letterGrade: "F"
  });

  useEffect(() => {
    const resultsCookie = localStorage.getItem(`quiz-results-${params.code}`);
    console.log(resultsCookie);

    if (resultsCookie) {
      const { results: parsedResults } = JSON.parse(
        resultsCookie
      );
      setResults(parsedResults);

      const totalQuizzes = parsedResults.length;
      const percentages = parsedResults.map((r: QuizResult) =>
        Math.round((r.score / r.totalQuestions) * 100)
      );
      const averageScore = Math.round(
        percentages.reduce((a: number, b: number) => a + b, 0) / totalQuizzes
      );
      const bestScore = Math.max(...percentages);

      // Calculate streak
      const dates = parsedResults.map((r: QuizResult) =>
        new Date(r.date).toDateString()
      );
      const uniqueDates = new Set(dates);
      const today = new Date().toDateString();
      let streak = 0;
      let currentDate = new Date();

      while (uniqueDates.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      setStats({
        totalQuizzes,
        averageScore,
        bestScore,
        streak,
        letterGrade: getLetterGrade(averageScore),
      });

      // Convert results to chart data
      const chartData = parsedResults.map((result: QuizResult) => ({
        date: new Date(result.date).toLocaleDateString(),
        score: result.score,
        percentage: Math.round((result.score / result.totalQuestions) * 100),
      }));

      setChartData(chartData);

      // Calculate hardest questions
      const questionStats = new Map<
        string,
        { wrong: number; total: number; answer: string }
      >();

      parsedResults.forEach((result: QuizResult) => {
        result.answers.forEach((answer) => {
          const current = questionStats.get(answer.question) || {
            wrong: 0,
            total: 0,
            answer: answer.correctAnswer,
          };
          questionStats.set(answer.question, {
            wrong: current.wrong + (answer.isCorrect ? 0 : 1),
            total: current.total + 1,
            answer: answer.correctAnswer,
          });
        });
      });

      const hardQuestions = Array.from(questionStats.entries())
        .map(([question, stats]) => ({
          question,
          correctAnswer: stats.answer,
          wrongCount: stats.wrong,
          totalAttempts: stats.total,
        }))
        .sort(
          (a, b) =>
            b.wrongCount / b.totalAttempts - a.wrongCount / a.totalAttempts
        )
        .slice(0, 5);

      setHardestQuestions(hardQuestions);
    }
  }, [params.code]);

  console.log(results);

  return (
    <div className="mx-8 my-8 sm:mx-16">
      <h1 className="font-bold text-3xl mb-4">Progress / {params.code}</h1>
      <div className="grid gap-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your overall performance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg h-full">
                <Target className="h-8 w-8 mb-2 text-primary" />
                <div className="text-xl font-bold">{stats.totalQuizzes}</div>
                <div className="text-sm text-muted-foreground">
                  Quizzes Taken
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg h-full">
                <div className="text-3xl font-bold mb-2">
                  {stats.letterGrade}
                </div>
                <div className="text-xl font-bold">{stats.averageScore}%</div>
                <div className="text-sm text-muted-foreground">
                  Average Score
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg h-full">
                <Trophy className="h-8 w-8 mb-2" />
                <div className="text-xl font-bold">{stats.bestScore}%</div>
                <div className="text-sm text-muted-foreground">Best Score</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg h-full">
                <Flame className="h-8 w-8 mb-2" />
                <div className="text-xl font-bold">{stats.streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Quiz Performance</CardTitle>
              <CardDescription>Your quiz scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="w-full">
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 8,
                    right: 8,
                    top: 8,
                    bottom: 8,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 100]}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="percentage"
                    type="monotone"
                    fill="var(--color-percentage)"
                    fillOpacity={0.4}
                    stroke="var(--color-percentage)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  {chartData.length > 1 && (
                    <div className="flex items-center gap-2 font-medium leading-none">
                      {chartData[chartData.length - 1].percentage >
                      chartData[chartData.length - 2].percentage
                        ? "Improving, keep it up!"
                        : "Keep practicing to improve your score"}
                    </div>
                  )}
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    {chartData.length} quiz attempts
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Hardest Questions</CardTitle>
              <CardDescription>
                Questions you most frequently got wrong
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {hardestQuestions.map((q, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">{q.question}</div>
                      <div className="text-muted-foreground text-sm">
                        {Math.round((q.wrongCount / q.totalAttempts) * 100)}%
                        wrong
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Correct answer: {q.correctAnswer}
                    </div>
                    <Progress
                      value={(q.wrongCount / q.totalAttempts) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
                {hardestQuestions.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    Complete some quizzes to see your hardest questions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Link href={`/quiz/${params.code}`}>
          <Button className="mt-8">Retry the quiz</Button>
        </Link>
      </div>
    </div>
  );
}
