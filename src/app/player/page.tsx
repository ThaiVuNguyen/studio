
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BuzzerButton } from '@/components/game/BuzzerButton';
import { Home } from 'lucide-react';

// This is a simplified player view, it could be expanded with more game info
export default function PlayerPage() {
    const [gameState, setGameState] = useState<any>(null);
    const yourPlayerId = '3'; // Hardcoded for 'You' player

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'buzzerbeater_gamestate') {
                try {
                    if (event.newValue) {
                        setGameState(JSON.parse(event.newValue));
                    }
                } catch (e) {
                    console.error("Failed to parse game state from localStorage", e);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Initial load
        const storedState = localStorage.getItem('buzzerbeater_gamestate');
        if (storedState) {
            try {
                setGameState(JSON.parse(storedState));
            } catch (e) {
                console.error("Failed to parse game state from localStorage", e);
            }
        }

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const updateGameState = (newState: Partial<any>) => {
        if (!gameState) return;
        const updatedState = { ...gameState, ...newState };
        setGameState(updatedState);
        localStorage.setItem('buzzerbeater_gamestate', JSON.stringify(updatedState));
    };

    const handleBuzz = (playerId: string) => {
        if (gameState && gameState.isRoundActive && !gameState.buzzedPlayerId) {
            updateGameState({
                isRoundActive: false, // Stop timer
                buzzedPlayerId: playerId,
                waitingForHost: true,
            });
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                handleBuzz(yourPlayerId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameState]);


    const canBuzz = gameState?.isRoundActive && !gameState?.buzzedPlayerId;

    return (
        <div className="flex flex-col h-screen bg-background items-center justify-center p-4">
             <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
                <h1 className="text-xl font-headline font-bold text-primary">Player View</h1>
                <Link href="/" passHref>
                <Button variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    Main Screen
                </Button>
                </Link>
            </header>
            <div className="flex flex-col items-center justify-center gap-8">
                 <h2 className="text-3xl font-bold text-center">
                    { canBuzz ? "Get Ready to BUZZ!" : (gameState?.waitingForHost ? "Waiting for host..." : "Round over!")}
                </h2>

                <BuzzerButton
                    onBuzz={() => handleBuzz(yourPlayerId)}
                    disabled={!canBuzz}
                />
                <p className="text-muted-foreground">You can also press the Spacebar to buzz in!</p>
            </div>
        </div>
    );
}

