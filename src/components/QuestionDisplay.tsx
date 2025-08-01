'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: string;
  text: string;
  answer: string;
  options: string[];
}

interface QuestionDisplayProps {
  question: Question;
  roundDuration?: number; // in seconds
  onTimeUp: () => void;
  winner?: string | null;
}

export function QuestionDisplay({ question, roundDuration = 10, onTimeUp, winner }: QuestionDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(roundDuration);

  useEffect(() => {
    setTimeLeft(roundDuration);
  }, [question, roundDuration]);

  useEffect(() => {
    if (timeLeft > 0 && !winner) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !winner) {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp, winner]);

  const progress = (timeLeft / roundDuration) * 100;
  const isRoundOver = timeLeft === 0 || !!winner;

  return (
    <Card className="w-full max-w-2xl mx-auto text-center shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="relative h-6 w-full rounded-full bg-secondary overflow-hidden border">
             <Progress value={progress} className="h-full" />
             <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary-foreground drop-shadow-sm">
                {!isRoundOver && `${timeLeft}s`}
             </span>
          </div>
         
          {isRoundOver && (
            <div className="p-4 bg-muted rounded-md animate-in fade-in">
                <p className="text-lg">The correct answer is: <span className="font-bold text-primary">{question.answer}</span></p>
                {winner && <p className="text-lg mt-2">Winner: <span className="font-bold text-accent">{winner}</span></p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
