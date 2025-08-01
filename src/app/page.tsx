
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Scoreboard, type Player } from '@/components/game/Scoreboard';
import { QuestionDisplay } from '@/components/game/QuestionDisplay';
import { BuzzerButton } from '@/components/game/BuzzerButton';
import Confetti from '@/components/game/Confetti';
import { Shield, Crown, User, Tv } from 'lucide-react';

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

const ROUND_TIME = 30; // seconds
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

const initialPlayers: Player[] = [
  { id: '1', name: 'Player 1', score: 0 },
  { id: '2', name: 'Player 2', score: 0 },
  { id: '3', name: 'You', score: 0, isYou: true },
  { id: '4', name: 'Player 4', score: 0 },
];

const getInitialState = (): GameState => ({
  players: initialPlayers,
  currentQuestionIndex: 0,
  timer: ROUND_TIME,
  buzzedPlayerId: null,
  isRoundActive: true,
  showConfetti: false,
  roundWinner: null,
  waitingForHost: false,
});


export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>(getInitialState());

  const {
    players,
    currentQuestionIndex,
    timer,
    buzzedPlayerId,
    isRoundActive,
    showConfetti,
    roundWinner,
    waitingForHost
  } = gameState;

  // This hook will sync state across tabs using localStorage
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

    // Load initial state from storage if it exists
    const storedState = localStorage.getItem('buzzerbeater_gamestate');
    if (storedState) {
        try {
            setGameState(JSON.parse(storedState));
        } catch(e) {
            console.error("Failed to parse game state from localStorage", e);
            localStorage.setItem('buzzerbeater_gamestate', JSON.stringify(getInitialState()));
        }
    } else {
        localStorage.setItem('buzzerbeater_gamestate', JSON.stringify(getInitialState()));
    }


    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateGameState = (newState: Partial<GameState>) => {
    const updatedState = { ...gameState, ...newState };
    setGameState(updatedState);
    localStorage.setItem('buzzerbeater_gamestate', JSON.stringify(updatedState));
  };


  const nextRound = useCallback(() => {
    updateGameState({
        buzzedPlayerId: null,
        roundWinner: null,
        showConfetti: false,
        currentQuestionIndex: (currentQuestionIndex + 1) % MOCK_QUESTIONS.length,
        timer: ROUND_TIME,
        isRoundActive: true,
        waitingForHost: false,
    });
  }, [currentQuestionIndex]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRoundActive && timer > 0) {
      interval = setInterval(() => {
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
  }, [isRoundActive, timer, nextRound]);
  
  const buzzedPlayer = players.find(p => p.id === buzzedPlayerId);
  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];

  const resetGame = () => {
      const freshState = getInitialState();
      setGameState(freshState);
      localStorage.setItem('buzzerbeater_gamestate', JSON.stringify(freshState));
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
             <Link href="/player" passHref>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Player View
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
            <Button onClick={resetGame}>Reset Game</Button>
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
