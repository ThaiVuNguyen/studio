"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface BuzzerButtonProps {
  onBuzz: () => void;
  disabled: boolean;
}

export const BuzzerButton: FC<BuzzerButtonProps> = ({ onBuzz, disabled }) => {
  return (
    <Button
      onClick={onBuzz}
      disabled={disabled}
      className="
        w-48 h-48 rounded-full 
        bg-accent hover:bg-accent/90 
        text-accent-foreground
        shadow-lg
        transform transition-transform active:scale-95
        disabled:bg-muted disabled:scale-100 disabled:shadow-none
        flex flex-col gap-2
      "
    >
      <Zap className="w-16 h-16" />
      <span className="text-2xl font-headline font-bold">BUZZ!</span>
    </Button>
  );
};
