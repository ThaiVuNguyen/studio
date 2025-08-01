
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Scoreboard, type Player } from '@/components/game/Scoreboard';
import { CheckCircle, XCircle, Home, Tv } from 'lucide-react';

const MOCK_QUESTIONS = [
  {
    id: '1',
    question: 'This 2017 hit by Luis Fonsi and Daddy Yankee became the most-viewed YouTube video of all time.',
    answer: 'Despacito',
  },
  {
    id: '2',
    question: 'What artist is known for the "Moonwalk" and the album "Thriller"?',
    answer: 'Michael Jackson',
  },
  {
    id: '3',
    question: 'The song "Bohemian Rhapsody" is a signature hit for which British rock band?',
    answer: 'Queen',
  },
  {
    id: '4',
    question: 'Which female artist holds the record for the most Grammy wins?',
    answer: 'Beyoncé',
  },
];

const POST_ROUND_DELAY = 3000; // ms

type GameState = {
  players: Player[];
  currentQuestionIndex: number;
  timer: number;
  buzzedPlayerId: string | null;
  isRoundActive: boolean;
  showConfetti: boolean;
  roundWinner: Player | null;
  waitingForHost: boolean;
};


export default function HostPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'buzzerbeater_gamestate') {
         try {
          if (event.newValue) {
            setGameState(JSON.parse(event.newValue));
          }
        } catch (e) {
            console.error("Failed to parse game state from localStorage", e)
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Initial load
    const storedState = localStorage.getItem('buzzerbeater_gamestate');
    if (storedState) {
        try {
            setGameState(JSON.parse(storedState));
        } catch(e) {
            console.error("Failed to parse game state from localStorage", e)
        }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateGameState = (newState: Partial<GameState>) => {
    if (!gameState) return;
    const updatedState = { ...gameState, ...newState };
    setGameState(updatedState);
    localStorage.setItem('buzzerbeater_gamestate', JSON.stringify(updatedState));
  };

  const nextRound = useCallback(() => {
    if (!gameState) return;
    updateGameState({
        buzzedPlayerId: null,
        roundWinner: null,
        showConfetti: false,
        currentQuestionIndex: (gameState.currentQuestionIndex + 1) % MOCK_QUESTIONS.length,
        timer: 30, // Reset timer
        isRoundActive: true,
        waitingForHost: false,
    });
  }, [gameState]);

  const handleCorrectAnswer = () => {
    if (!gameState || !gameState.buzzedPlayerId) return;

    const winner = gameState.players.find(p => p.id === gameState.buzzedPlayerId);
    if (winner) {
        const updatedPlayers = gameState.players.map(p => 
            p.id === gameState.buzzedPlayerId ? { ...p, score: p.score + 10 } : p
        );

        updateGameState({
            roundWinner: winner,
            players: updatedPlayers,
            showConfetti: true,
            waitingForHost: false,
            isRoundActive: false,
        });

        setTimeout(nextRound, POST_ROUND_DELAY);
    }
  };

  const handleIncorrectAnswer = () => {
     if (!gameState || !gameState.buzzedPlayerId) return;
     updateGameState({
        waitingForHost: false,
        isRoundActive: false, // End the round
     });
     // Show "Incorrect!" message on main screen (implicitly by ending round with no winner)
     setTimeout(nextRound, POST_ROUND_DELAY);
  };

  if (!gameState) {
    return <div className="p-6">Loading game state... Make sure the main game screen is open.</div>;
  }
  
  const { players, currentQuestionIndex, buzzedPlayerId, waitingForHost } = gameState;
  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const buzzedPlayer = players.find(p => p.id === buzzedPlayerId);

  return (
    <div className="flex flex-col h-screen bg-secondary">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <h1 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Tv /> Host Control
        </h1>
        <Link href="/" passHref>
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Main Screen
          </Button>
        </Link>
      </header>
      <div className="flex-1 grid md:grid-cols-2 gap-6 p-6 overflow-y-auto">
        <div>
          <Scoreboard players={players} />
        </div>
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Current Question</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">{currentQuestion.question}</p>
                    <p className="font-bold mt-2">Answer: <span className="font-normal text-primary">{currentQuestion.answer}</span></p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Host Actions</CardTitle>
                    <CardDescription>
                        {waitingForHost && buzzedPlayer ? `${buzzedPlayer.name} has buzzed in. Verify their answer.` : 'Waiting for a player to buzz...'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center gap-4">
                    <Button 
                        size="lg" 
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!waitingForHost}
                        onClick={handleCorrectAnswer}
                    >
                        <CheckCircle className="mr-2" /> Correct
                    </Button>
                    <Button 
                        size="lg" 
                        variant="destructive" 
                        disabled={!waitingForHost}
                        onClick={handleIncorrectAnswer}
                    >
                        <XCircle className="mr-2" /> Incorrect
                    </Button>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
