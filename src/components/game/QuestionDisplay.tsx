"use client";

import type { FC } from 'react';
import type { Player } from './Scoreboard';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface QuestionDisplayProps {
  question: string;
  timer: number;
  totalTime: number;
  isRoundActive: boolean;
  roundWinner: Player | null;
  correctAnswer: string;
}

export const QuestionDisplay: FC<QuestionDisplayProps> = ({ question, timer, totalTime, isRoundActive, roundWinner, correctAnswer }) => {
  const progress = (timer / totalTime) * 100;

  const renderContent = () => {
    if (roundWinner) {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">Correct!</h2>
          <p className="text-xl mt-2">
            <span className="font-headline font-bold text-accent">{roundWinner.name}</span> wins the round!
          </p>
          <p className="text-lg text-muted-foreground mt-1">Answer: {correctAnswer}</p>
        </div>
      );
    }
    if (!isRoundActive && !roundWinner) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-destructive">Time's Up!</h2>
                 <p className="text-lg text-muted-foreground mt-1">The correct answer was: {correctAnswer}</p>
            </div>
        )
    }
    return (
      <>
        <p className="text-center text-2xl font-medium leading-relaxed">
          {question}
        </p>
        <div className="w-full mt-4">
          <Progress value={progress} className="h-4" />
        </div>
      </>
    );
  };
  
  return (
    <Card className="w-full max-w-3xl min-h-[250px] flex items-center justify-center p-8 shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-0 w-full flex flex-col items-center justify-center">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
