
"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { addPlayer } from '@/lib/firebase';
import { Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PLAYER_ID_KEY = 'buzzerbeater_player_id';

export default function JoinPage() {
    const [name, setName] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) {
             toast({
                title: "Error",
                description: "Please enter your name.",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const newPlayer = {
                id: playerId,
                name: name.trim(),
                score: 0
            };

            try {
                await addPlayer(newPlayer);
                localStorage.setItem(PLAYER_ID_KEY, playerId);
                toast({
                    title: "Success",
                    description: `Welcome, ${newPlayer.name}! You've joined the game.`,
                });
                router.push('/player');
            } catch (error) {
                console.error("Failed to join game:", error);
                 toast({
                    title: "Error",
                    description: "Could not join the game. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <div className="flex flex-col h-screen bg-background items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                 <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User /> Join Game</CardTitle>
                        <CardDescription>Enter your name to join the trivia game.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Alex"
                                required
                                disabled={isPending}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isPending}>
                             {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Join Game
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
