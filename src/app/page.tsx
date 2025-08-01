

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scoreboard } from '@/components/game/Scoreboard';
import { QuestionDisplay } from '@/components/game/QuestionDisplay';
import Confetti from '@/components/game/Confetti';
import { Shield, Crown, User, Tv } from 'lucide-react';
import { onSnapshot, gameDocRef, initializeGame, updateGameState, resetGameInFirestore, ROUND_TIME, type GameState, getInitialState, fetchQuestions } from '@/lib/firebase';

const POST_ROUND_DELAY = 3000; // ms

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    // This is the main screen, it drives the game initialization and state.
    const setupGame = async () => {
      await initializeGame(); // Ensures the game document exists.

      const unsubscribe = onSnapshot(gameDocRef, async (doc) => {
        if (doc.exists()) {
            const data = doc.data() as GameState;
            // If the game state in Firestore has no questions, fetch them and update the state.
            // This is a critical step to ensure the game can start.
            if (!data.questions || data.questions.length === 0) {
                console.log("No questions in game state, fetching...");
                const questions = await fetchQuestions();
                if (questions.length > 0) {
                    await updateGameState({ questions: questions, currentQuestionIndex: 0, isRoundActive: true });
                    // The listener will pick up this change and set the full game state.
                } else {
                     setGameState(data); // Set state even if no questions to avoid being stuck
                }
            } else {
                setGameState(data);
            }
        } else {
            // Document doesn't exist, might be an issue with initialization
            console.log("Game document does not exist.");
        }
      });
      return unsubscribe;
    };

    const unsubPromise = setupGame();

    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, []);

  const {
    players,
    currentQuestionIndex,
    timer,
    buzzedPlayerId,
    isRoundActive,
    showConfetti,
    roundWinner,
    waitingForHost,
    questions,
  } = gameState || getInitialState();

  const nextRound = useCallback(() => {
    if (!questions || questions.length === 0) return;
    updateGameState({
        buzzedPlayerId: null,
        roundWinner: null,
        showConfetti: false,
        currentQuestionIndex: (currentQuestionIndex + 1) % questions.length,
        timer: ROUND_TIME,
        isRoundActive: true,
        waitingForHost: false,
    });
  }, [currentQuestionIndex, questions]);


  useEffect(() => {
    if (!gameState) return; // Don't run timer effect if game isn't loaded
    let interval: NodeJS.Timeout | null = null;
    if (isRoundActive && timer > 0) {
      interval = setInterval(() => {
        // The host or a single client should be responsible for the timer to avoid conflicts.
        // For this simple setup, we'll let the main screen drive the timer.
        updateGameState({ timer: timer - 1 });
      }, 1000);
    } else if (isRoundActive && timer === 0) {
      updateGameState({ isRoundActive: false });
      // Simulate no one answering
      setTimeout(nextRound, POST_ROUND_DELAY);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRoundActive, timer, nextRound, gameState]);
  
  if (!gameState || !gameState.questions || gameState.questions.length === 0) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="p-6 text-center">Loading game...</div>
        </div>
    );
  }

  const buzzedPlayer = players.find(p => p.id === buzzedPlayerId);
  const currentQuestion = questions?.[currentQuestionIndex];
  if (!currentQuestion) {
    return <div className="flex items-center justify-center h-screen"><div>Waiting for questions to be added in the admin dashboard...</div></div>
  }


  return (
    <div className="flex flex-col h-full bg-background font-body text-foreground">
      <header className="flex items-center justify-between p-4 border-b flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Crown className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">
            BuzzerBeater Trivia
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
             <Link href="/join" passHref>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Join as Player
              </Button>
            </Link>
             <Link href="/host" passHref>
              <Button variant="outline">
                <Tv className="mr-2 h-4 w-4" />
                Host View
              </Button>
            </Link>
            <Link href="/admin" passHref>
              <Button variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
            <Button onClick={resetGameInFirestore}>Reset Game</Button>
        </div>
      </header>
      <main className="flex-1 grid md:grid-cols-3 gap-6 p-6 overflow-y-auto">
        <div className="md:col-span-1">
          <Scoreboard players={players} />
        </div>
        <div className="md:col-span-2 flex flex-col items-center justify-center gap-6 relative">
          <Confetti isActive={showConfetti} />
          <QuestionDisplay
            question={currentQuestion.question}
            timer={timer}
            totalTime={ROUND_TIME}
            isRoundActive={isRoundActive}
            roundWinner={roundWinner}
            correctAnswer={currentQuestion.answer}
            buzzedPlayer={buzzedPlayer}
            waitingForHost={waitingForHost}
          />
        </div>
      </main>
    </div>
  );
}
