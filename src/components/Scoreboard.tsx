
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Player {
  name: string;
  score: number;
}

interface ScoreboardProps {
  players: Player[];
  buzzedInPlayer: string | null; // This can now represent the confirmed winner of the round
}

export function Scoreboard({ players, buzzedInPlayer }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-center font-headline text-2xl">Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {sortedPlayers.map((player) => (
            <li
              key={player.name}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                player.name === buzzedInPlayer
                  ? 'bg-accent/20 ring-2 ring-accent'
                  : 'bg-background'
              }`}
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className={`font-medium text-lg ${
                  player.name === buzzedInPlayer ? 'text-accent font-bold' : 'text-foreground'
                }`}>
                  {player.name}
                </span>
              </div>
              <span className="text-xl font-bold text-primary">{player.score}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
