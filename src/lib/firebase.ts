
'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import type { Player } from '@/components/game/Scoreboard';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "buzzerbeater-trivia",
  appId: "1:754248050802:web:fe5d2d1fe3e8741d4b3aeb",
  storageBucket: "buzzerbeater-trivia.firebasestorage.app",
  apiKey: "AIzaSyAlvhy76BaoYjqtrDzRNPbL5Wl8wYvagIc",
  authDomain: "buzzerbeater-trivia.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "754248050802"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

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

type GameState = {
  players: Player[];
  currentQuestionIndex: number;
  timer: number;
  buzzedPlayerId: string | null;
  isRoundActive: boolean;
  showConfetti: boolean;
  roundWinner: Player | null;
  waitingForHost: boolean;
  questions: typeof MOCK_QUESTIONS;
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
  questions: MOCK_QUESTIONS
});

const GAME_ID = 'main_game';
const gameDocRef = doc(db, 'games', GAME_ID);

async function initializeGame(): Promise<GameState> {
    const docSnap = await getDoc(gameDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as GameState;
    } else {
        const initialState = getInitialState();
        await setDoc(gameDocRef, initialState);
        return initialState;
    }
}

async function updateGameState(newState: Partial<GameState>) {
    await updateDoc(gameDocRef, newState);
}

async function resetGameInFirestore() {
    const freshState = getInitialState();
    await setDoc(gameDocRef, freshState);
}


export { 
    db, 
    onSnapshot, 
    gameDocRef, 
    initializeGame, 
    updateGameState,
    resetGameInFirestore,
    ROUND_TIME,
    getInitialState,
    type GameState
};
