
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BuzzerButton } from '@/components/game/BuzzerButton';
import { Home, User } from 'lucide-react';
import { onSnapshot, gameDocRef, initializeGame, updateGameState, type GameState, type Player } from '@/lib/firebase';

const PLAYER_ID_KEY = 'buzzerbeater_player_id';

export default function PlayerPage() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const router = useRouter();

    useEffect(() => {
        const playerId = localStorage.getItem(PLAYER_ID_KEY);
        if (!playerId) {
            router.replace('/join');
            return;
        }

        initializeGame();

        const unsubscribe = onSnapshot(gameDocRef, (doc) => {
            if (doc.exists()) {
                const state = doc.data() as GameState;
                setGameState(state);
                const player = state.players.find(p => p.id === playerId);
                if (player) {
                    setCurrentPlayer(player);
                } else {
                    // This player is not in the game state, maybe game was reset
                    localStorage.removeItem(PLAYER_ID_KEY);
                    router.replace('/join');
                }
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleBuzz = () => {
        if (gameState && gameState.isRoundActive && !gameState.buzzedPlayerId && currentPlayer) {
            updateGameState({
                isRoundActive: false, // Stop timer
                buzzedPlayerId: currentPlayer.id,
                waitingForHost: true,
            });
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                handleBuzz();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameState, currentPlayer]);


    const canBuzz = gameState?.isRoundActive && !gameState?.buzzedPlayerId;

    return (
        <div className="flex flex-col h-screen bg-background items-center justify-center p-4">
             <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
                <h1 className="text-xl font-headline font-bold text-primary flex items-center gap-2"><User /> {currentPlayer?.name ?? 'Player'}</h1>
                <Link href="/" passHref>
                <Button variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    Main Screen
                </Button>
                </Link>
            </header>
            <div className="flex flex-col items-center justify-center gap-8">
                 <h2 className="text-3xl font-bold text-center">
                    { !gameState ? "Connecting to game..." : (canBuzz ? "Get Ready to BUZZ!" : (gameState?.waitingForHost ? "Waiting for host..." : "Round over!"))}
                </h2>

                <BuzzerButton
                    onBuzz={handleBuzz}
                    disabled={!canBuzz}
                />
                <p className="text-muted-foreground">You can also press the Spacebar to buzz in!</p>
            </div>
        </div>
    );
}
