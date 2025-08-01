
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GameState, onGameStateChange, updateGameState, Question } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { Scoreboard } from '@/components/Scoreboard';

export default function HostPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const unsubscribe = onGameStateChange((state) => {
      setGameState(state);
      if (state.questions && state.questions.length > 0) {
        setCurrentQuestion(state.questions[state.questionIndex]);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!gameState || !currentQuestion) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <p className="text-2xl font-headline">Waiting for game to start...</p>
      </main>
    );
  }

  const { players, buzzers, roundWinner, questionIndex, questions } = gameState;

  // Sort buzzers by timestamp, fastest first
  const sortedBuzzers = [...buzzers].sort((a, b) => a.timestamp - b.timestamp);

  const handleApprove = (playerName: string) => {
    const winner = players.find(p => p.name === playerName);
    if (winner) {
        const newPlayers = players.map(p => 
            p.name === playerName ? { ...p, score: p.score + 10 } : p
        );
        updateGameState({ roundWinner: playerName, players: newPlayers });
    }
  };

  const handleReject = (playerName: string) => {
    // Remove the rejected player from this round's buzzers list
    const updatedBuzzers = buzzers.filter(b => b.playerName !== playerName);
    updateGameState({ buzzers: updatedBuzzers });
  };

  const nextRound = () => {
    const newQuestionIndex = (questionIndex + 1) % questions.length;
    updateGameState({
      buzzers: [],
      roundWinner: null,
      questionIndex: newQuestionIndex,
    });
  };
  
  const isRoundOver = !!roundWinner;

  return (
    <main className="container mx-auto p-8">
       <div className="absolute top-4 right-4 flex items-center gap-4">
          <Link href="/" passHref>
            <Button variant="outline">Main Game View</Button>
          </Link>
          <Link href="/admin" passHref>
            <Button variant="outline">Admin</Button>
          </Link>
        </div>
      <h1 className="text-3xl font-headline mb-8 text-center">Host Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4 text-center">Buzzer Queue (Fastest First)</h3>
            {sortedBuzzers.length > 0 ? (
              <ul className="space-y-2">
                {sortedBuzzers.map((buzzer, index) => (
                  <li key={buzzer.playerName} className={`p-4 rounded-lg flex justify-between items-center transition-all ${index === 0 && !isRoundOver ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
                    <div>
                      <span className="font-bold text-lg">{index + 1}. {buzzer.playerName}</span>
                      <span className="text-sm text-muted-foreground ml-2">({new Date(buzzer.timestamp).toLocaleTimeString()})</span>
                    </div>
                    {!isRoundOver && (
                        <div className="flex gap-2">
                            <Button size="icon" variant="outline" className="text-green-500 hover:text-green-600" onClick={() => handleApprove(buzzer.playerName)}>
                                <Check />
                            </Button>
                            <Button size="icon" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleReject(buzzer.playerName)}>
                                <X />
                            </Button>
                        </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center">No one has buzzed in yet.</p>
            )}

            {isRoundOver && (
                 <div className="mt-8 text-center">
                    <p className="text-2xl font-bold text-accent">Winner: {roundWinner}</p>
                    <p className="text-lg mt-2">Correct Answer: <span className="font-semibold text-primary">{currentQuestion.answer}</span></p>
                    <Button onClick={nextRound} className="mt-6">
                        Next Question
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-1">
            <Scoreboard players={players} buzzedInPlayer={roundWinner} />
        </div>
      </div>
    </main>
  );
}
