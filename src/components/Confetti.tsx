
'use client';

import ReactConfetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

export function Confetti() {
  const { width, height } = useWindowSize();
  return (
    <ReactConfetti
      width={width}
      height={height}
      numberOfPieces={300}
      recycle={false}
      gravity={0.1}
    />
  );
}
