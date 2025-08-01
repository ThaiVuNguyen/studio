"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Player = {
  id: string;
  name: string;
  score: number;
  isYou?: boolean;
};

interface ScoreboardProps {
  players: Player[];
}

export const Scoreboard: FC<ScoreboardProps> = ({ players }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const topScore = sortedPlayers.length > 0 ? sortedPlayers[0].score : 0;

  return (
    <Card className="h-full shadow-lg">
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
        <Users className="text-primary" />
        <CardTitle className="font-headline">Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {sortedPlayers.map((player) => (
            <li
              key={player.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all",
                player.isYou ? "bg-primary/10 border-l-4 border-primary" : "bg-card",
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${player.name.charAt(0)}`} />
                  <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-lg">{player.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {player.score === topScore && topScore > 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                <span className="font-bold text-xl text-primary">{player.score}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
