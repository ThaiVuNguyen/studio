// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "buzzerbeater-trivia",
  "appId": "1:754248050802:web:fe5d2d1fe3e8741d4b3aeb",
  "storageBucket": "buzzerbeater-trivia.firebasestorage.app",
  "apiKey": "AIzaSyAlvhy76BaoYjqtrDzRNPbL5Wl8wYvagIc",
  "authDomain": "buzzerbeater-trivia.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "754248050802"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const GAME_ID = 'main_game';

export interface Player {
    name: string;
    score: number;
}

export interface Question {
    id: string;
    text: string;
    answer: string;
    options: string[];
}

export interface GameState {
    players: Player[];
    questionIndex: number;
    buzzedInPlayer: string | null;
    questions: Question[];
}

const mockQuestions: Question[] = [
    { id: 'q1', text: 'What is the capital of France?', answer: 'Paris', options: ['London', 'Berlin', 'Madrid', 'Paris'] },
    { id: 'q2', text: 'Which planet is known as the Red Planet?', answer: 'Mars', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'] },
    { id: 'q3', text: 'Who wrote "To Kill a Mockingbird"?', answer: 'Harper Lee', options: ['Mark Twain', 'Harper Lee', 'F. Scott Fitzgerald', 'Ernest Hemingway'] },
];

export const getGameRef = () => doc(db, 'games', GAME_ID);

export const initializeGame = async () => {
    const gameRef = getGameRef();
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
        const initialState: GameState = {
            players: [
                { name: 'Player 1', score: 0 },
                { name: 'Player 2', score: 0 },
                { name: 'Player 3', score: 0 },
            ],
            questionIndex: 0,
            buzzedInPlayer: null,
            questions: mockQuestions,
        };
        await setDoc(gameRef, initialState);
    }
};

export const updateGameState = async (newState: Partial<GameState>) => {
    const gameRef = getGameRef();
    await setDoc(gameRef, newState, { merge: true });
};

export const onGameStateChange = (callback: (state: GameState) => void) => {
    const gameRef = getGameRef();
    return onSnapshot(gameRef, (snap) => {
        if (snap.exists()) {
            callback(snap.data() as GameState);
        }
    });
};