
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameState, onGameStateChange, updateGameState } from '@/lib/firebase';
import { Confetti } from '@/components/Confetti';
import Link from 'next/link';
import { useLocalStorage } from 'react-use';


export default function PlayerPage({ params }: { params: { name: string } }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [localPlayer, setLocalPlayer] = useLocalStorage('trivia-player', { name: '' });

  const playerName = decodeURIComponent(params.name);

  useEffect(() => {
    if (playerName) {
        setLocalPlayer({ name: playerName });
    }
  }, [playerName, setLocalPlayer]);


  useEffect(() => {
    const unsubscribe = onGameStateChange((state) => {
      // Check if the current player just won the round
      if (state.roundWinner === playerName && gameState?.roundWinner !== playerName) {
        setShowConfetti(true);
        // Hide confetti after some time
        setTimeout(() => setShowConfetti(false), 5000); 
      }
      setGameState(state);
    });
    return () => unsubscribe();
  }, [playerName, gameState]);

  if (!gameState) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <p className="text-2xl font-headline">Loading player view...</p>
      </main>
    );
  }

  const { buzzers, roundWinner, players } = gameState;
  const isRoundOver = !!roundWinner;

  // A player has buzzed if their name is in the buzzers array for this round.
  const hasBuzzed = (name: string) => buzzers.some(b => b.playerName === name);

  const handleBuzz = () => {
    if (!isRoundOver && !hasBuzzed(playerName)) {
      const newBuzz = { playerName, timestamp: Date.now() };
      const newBuzzers = [...buzzers, newBuzz];
      updateGameState({ buzzers: newBuzzers });
    }
  };
  
  const isWinner = playerName === roundWinner;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 space-y-8">
        {showConfetti && <Confetti />}
       <div className="absolute top-4 right-4">
        <Link href="/" passHref>
          <Button variant="outline">Main Game View</Button>
        </Link>
      </div>
      <h1 className="text-4xl font-headline">Welcome, {playerName}!</h1>
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={handleBuzz}
          disabled={isRoundOver || hasBuzzed(playerName)}
          className={`w-64 h-64 rounded-full text-4xl font-bold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-2xl ${
            isWinner
              ? 'bg-accent text-accent-foreground animate-pulse'
              : 'bg-primary text-primary-foreground'
          } disabled:bg-secondary disabled:scale-100 disabled:cursor-not-allowed`}
          aria-label={`Buzzer for ${playerName}`}
        >
          BUZZ
        </Button>
        <p className={`text-2xl font-semibold ${isWinner ? 'text-accent' : 'text-foreground'}`}>
          Your Score: {players.find(p => p.name === playerName)?.score ?? 0}
        </p>
         {isRoundOver && !isWinner && (
             <p className="text-xl font-bold animate-in fade-in text-center mt-4">
                Round Over! <br/> Winner: {roundWinner}
             </p>
         )}
          {hasBuzzed(playerName) && !isRoundOver && (
                <p className="text-xl text-muted-foreground animate-in fade-in">You've buzzed in! Waiting for host...</p>
          )}
      </div>
    </main>
  );
}

