
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
      // Initialize game, which creates doc if it doesn't exist
      await initializeGame();
      
      // Listen for real-time changes
      const unsubscribe = onGameStateChange(async (state) => {
        if (!state) {
          // This can happen if the document is deleted
          console.log("No game state found, re-initializing.");
          await initializeGame(); // Re-initialize
          return;
        }

        // If questions are missing from the game state, fetch them and update the state
        if (!state.questions || state.questions.length === 0) {
          const questions = await fetchQuestions();
          if (questions.length > 0) {
            await updateGameState({ questions, questionIndex: 0 });
            // The listener will pick up this change and update the state, no need to set it here
          } else {
            // Handle case where there are no questions in DB
             setGameState(state);
          }
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

  const { players, questionIndex, buzzers, roundWinner, questions } = gameState;
  const currentQuestion = questions[questionIndex];
  const isRoundOver = !!roundWinner;

  // A player has buzzed if their name is in the buzzers array for this round.
  const hasBuzzed = (playerName: string) => buzzers.some(b => b.playerName === playerName);


  const handleBuzz = (playerName: string) => {
    // Players can only buzz if the round isn't over and they haven't already buzzed.
    if (!isRoundOver && !hasBuzzed(playerName)) {
      const newBuzz = { playerName, timestamp: Date.now() };
      const newBuzzers = [...buzzers, newBuzz];
      updateGameState({ buzzers: newBuzzers });
    }
  };

  const nextRound = () => {
    const newQuestionIndex = (questionIndex + 1) % questions.length;
    updateGameState({
      buzzers: [],
      roundWinner: null,
      questionIndex: newQuestionIndex,
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 space-y-8">
       <div className="absolute top-4 right-4 flex items-center gap-4">
          <Link href="/host" passHref>
            <Button variant="outline">Host View</Button>
          </Link>
          <Link href="/admin" passHref>
            <Button variant="outline">Admin</Button>
          </Link>
        </div>
      <div className="flex w-full max-w-6xl justify-around items-start">
        <div className="w-full max-w-3xl">
          <QuestionDisplay 
            question={currentQuestion}
            winner={roundWinner}
            // The onTimeUp callback is now less critical as the host controls flow
            // but we can keep it for visual indication
            onTimeUp={() => {}} 
          />
        </div>
        <Scoreboard players={players} buzzedInPlayer={roundWinner} />
      </div>

      <div className="flex justify-center items-end space-x-8 pt-8">
        {players.map((player) => (
          <Buzzer
            key={player.name}
            playerName={player.name}
            onBuzz={handleBuzz}
            // Disable if round is over OR if this player has already buzzed
            disabled={isRoundOver || hasBuzzed(player.name)}
            isWinner={player.name === roundWinner}
          />
        ))}
      </div>
      
      {isRoundOver && (
        <p className="text-2xl font-bold animate-in fade-in">
          Round Over! Winner: {roundWinner}
        </p>
      )}
    </main>
  );
}
