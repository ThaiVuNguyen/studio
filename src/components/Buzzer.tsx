'use client';

import { Button } from '@/components/ui/button';

interface BuzzerProps {
  playerName: string;
  onBuzz: (playerName: string) => void;
  disabled: boolean;
  isWinner: boolean;
}

export function Buzzer({ playerName, onBuzz, disabled, isWinner }: BuzzerProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={() => onBuzz(playerName)}
        disabled={disabled}
        className={`w-48 h-48 rounded-full text-2xl font-bold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-2xl ${
          isWinner
            ? 'bg-accent text-accent-foreground animate-pulse'
            : 'bg-primary text-primary-foreground'
        } disabled:bg-secondary disabled:scale-100 disabled:cursor-not-allowed`}
        aria-label={`Buzzer for ${playerName}`}
      >
        BUZZ
      </Button>
      <p className={`text-lg font-semibold ${isWinner ? 'text-accent' : 'text-foreground'}`}>
        {playerName}
      </p>
    </div>
  );
}
