

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Scoreboard, type Player } from '@/components/game/Scoreboard';
import { CheckCircle, XCircle, Home, Tv } from 'lucide-react';
import { onSnapshot, gameDocRef, initializeGame, updateGameState, type GameState, getInitialState } from '@/lib/firebase';

const POST_ROUND_DELAY = 3000; // ms


export default function HostPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    initializeGame();

    const unsubscribe = onSnapshot(gameDocRef, (doc) => {
      if (doc.exists()) {
        setGameState(doc.data() as GameState);
      }
    });

    return () => unsubscribe();
  }, []);

  const nextRound = useCallback(async () => {
    if (!gameState || !gameState.questions || gameState.questions.length === 0) return;
    
    updateGameState({
        buzzedPlayerId: null,
        roundWinner: null,
        showConfetti: false,
        currentQuestionIndex: (gameState.currentQuestionIndex + 1) % gameState.questions.length,
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
        roundWinner: null, // No winner
        showConfetti: false,
        waitingForHost: false,
        isRoundActive: false, // End the round
     });
     setTimeout(nextRound, POST_ROUND_DELAY);
  };

  if (!gameState) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="p-6 text-center">Loading game state... Make sure the main game screen is open to initialize the game.</div>
        </div>
    );
  }
  
  const { players, currentQuestionIndex, buzzedPlayerId, waitingForHost, questions } = gameState;

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
          <div className="p-6 text-center">Waiting for questions to be added from the admin dashboard.</div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
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
