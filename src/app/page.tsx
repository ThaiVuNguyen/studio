'use client';

import { useState } from 'react';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { Buzzer } from '@/components/Buzzer';
import { Scoreboard } from '@/components/Scoreboard';
import { Button } from '@/components/ui/button';

interface Player {
  name: string;
  score: number;
}

const mockQuestions = [
    { id: 'q1', text: 'What is the capital of France?', answer: 'Paris', options: ['London', 'Berlin', 'Madrid', 'Paris'] },
    { id: 'q2', text: 'Which planet is known as the Red Planet?', answer: 'Mars', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'] },
    { id: 'q3', text: 'Who wrote "To Kill a Mockingbird"?', answer: 'Harper Lee', options: ['Mark Twain', 'Harper Lee', 'F. Scott Fitzgerald', 'Ernest Hemingway'] },
];

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 },
    { name: 'Player 3', score: 0 },
  ]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [buzzedInPlayer, setBuzzedInPlayer] = useState<string | null>(null);

  const currentQuestion = mockQuestions[questionIndex];
  const isRoundOver = !!buzzedInPlayer;

  const handleBuzz = (playerName: string) => {
    if (!isRoundOver) {
      setBuzzedInPlayer(playerName);
      // Award point to the winner of the buzz
      setPlayers(prevPlayers => 
        prevPlayers.map(p => 
          p.name === playerName ? { ...p, score: p.score + 10 } : p
        )
      );
    }
  };

  const handleTimeUp = () => {
    if (!isRoundOver) {
      // Mark round as over without a winner to show the answer
      setBuzzedInPlayer(''); // Empty string indicates time up, null means active
    }
  };

  const nextRound = () => {
    setBuzzedInPlayer(null);
    setQuestionIndex((prevIndex) => (prevIndex + 1) % mockQuestions.length);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 space-y-8">
      <div className="flex w-full max-w-6xl justify-around items-start">
        <div className="w-full max-w-3xl">
          <QuestionDisplay 
            question={currentQuestion}
            onTimeUp={handleTimeUp}
            winner={buzzedInPlayer}
          />
        </div>
        <Scoreboard players={players} buzzedInPlayer={buzzedInPlayer} />
      </div>

      <div className="flex justify-center items-end space-x-8 pt-8">
        {players.map((player) => (
          <Buzzer
            key={player.name}
            playerName={player.name}
            onBuzz={handleBuzz}
            disabled={isRoundOver}
            isWinner={player.name === buzzedInPlayer}
          />
        ))}
      </div>
      
      {isRoundOver && (
        <Button onClick={nextRound} className="mt-8 animate-in fade-in">
          Next Question
        </Button>
      )}
    </main>
  );
}
