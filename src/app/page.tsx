"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Scoreboard, type Player } from '@/components/game/Scoreboard';
import { QuestionDisplay } from '@/components/game/QuestionDisplay';
import { BuzzerButton } from '@/components/game/BuzzerButton';
import Confetti from '@/components/game/Confetti';
import { Shield, Crown } from 'lucide-react';

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

const ROUND_TIME = 20; // seconds
const POST_ROUND_DELAY = 3000; // ms

export default function GamePage() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player 1', score: 0 },
    { id: '2', name: 'Player 2', score: 0 },
    { id: '3', name: 'You', score: 0, isYou: true },
    { id: '4', name: 'Player 4', score: 0 },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(ROUND_TIME);
  const [buzzedPlayerId, setBuzzedPlayerId] = useState<string | null>(null);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [roundWinner, setRoundWinner] = useState<Player | null>(null);
  const yourPlayer = players.find(p => p.isYou) || players[2];

  const handleBuzz = useCallback((playerId: string) => {
    if (isRoundActive && !buzzedPlayerId) {
      setIsRoundActive(false);
      setBuzzedPlayerId(playerId);

      // Simulate correct answer and award point
      const winner = players.find(p => p.id === playerId);
      if (winner) {
        setRoundWinner(winner);
        setPlayers(prevPlayers => prevPlayers.map(p =>
            p.id === playerId ? { ...p, score: p.score + 10 } : p
        ));
        setShowConfetti(true);
      }
      
      setTimeout(nextRound, POST_ROUND_DELAY);
    }
  }, [isRoundActive, buzzedPlayerId, players]);

  const nextRound = useCallback(() => {
    setBuzzedPlayerId(null);
    setRoundWinner(null);
    setShowConfetti(false);
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % MOCK_QUESTIONS.length);
    setTimer(ROUND_TIME);
    setIsRoundActive(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRoundActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (isRoundActive && timer === 0) {
      setIsRoundActive(false);
      // Simulate no one answering
      setTimeout(nextRound, POST_ROUND_DELAY);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRoundActive, timer, nextRound]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleBuzz(yourPlayer.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleBuzz, yourPlayer.id]);


  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];

  return (
    <div className="flex flex-col h-full bg-background font-body text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Crown className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">
            BuzzerBeater Trivia
          </h1>
        </div>
        <Link href="/admin" passHref>
          <Button variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Button>
        </Link>
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
          />
          <BuzzerButton
            onBuzz={() => handleBuzz(yourPlayer.id)}
            disabled={!isRoundActive || !!buzzedPlayerId}
          />
        </div>
      </main>
    </div>
  );
}
