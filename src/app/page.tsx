
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { Buzzer } from '@/components/Buzzer';
import { Scoreboard } from '@/components/Scoreboard';
import { Button } from '@/components/ui/button';
import { GameState, initializeGame, onGameStateChange, updateGameState, fetchQuestions } from '@/lib/firebase';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const setupGame = async () => {
      await initializeGame();
      const unsubscribe = onGameStateChange(async (state) => {
        if (!state.questions || state.questions.length === 0) {
          const questions = await fetchQuestions();
          await updateGameState({ questions });
          setGameState({ ...state, questions });
        } else {
          setGameState(state);
        }
      });
      return unsubscribe;
    };

    const unsubscribePromise = setupGame();
    
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  if (!gameState || !gameState.questions || gameState.questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <p className="text-2xl font-headline">Loading game...</p>
      </main>
    );
  }

  const { players, questionIndex, buzzedInPlayer, questions } = gameState;
  const currentQuestion = questions[questionIndex];
  const isRoundOver = !!buzzedInPlayer;

  const handleBuzz = (playerName: string) => {
    if (!isRoundOver) {
      const newPlayers = players.map(p => 
        p.name === playerName ? { ...p, score: p.score + 10 } : p
      );
      updateGameState({ buzzedInPlayer: playerName, players: newPlayers });
    }
  };

  const handleTimeUp = () => {
    if (!isRoundOver) {
      updateGameState({ buzzedInPlayer: '' }); // Empty string indicates time up
    }
  };

  const nextRound = () => {
    const newQuestionIndex = (questionIndex + 1) % questions.length;
    updateGameState({
      buzzedInPlayer: null,
      questionIndex: newQuestionIndex,
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 space-y-8">
       <div className="absolute top-4 right-4">
          <Link href="/admin" passHref>
            <Button variant="outline">Admin Dashboard</Button>
          </Link>
        </div>
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
