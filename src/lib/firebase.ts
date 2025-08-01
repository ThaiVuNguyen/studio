
'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, getDoc, updateDoc, collection, getDocs, addDoc, writeBatch, deleteDoc } from 'firebase/firestore';
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

const MOCK_QUESTIONS_DATA = [
  {
    question: 'This 2017 hit by Luis Fonsi and Daddy Yankee became the most-viewed YouTube video of all time.',
    answer: 'Despacito',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
  },
  {
    question: 'What artist is known for the "Moonwalk" and the album "Thriller"?',
    answer: 'Michael Jackson',
    youtubeUrl: 'https://www.youtube.com/watch?v=sOnqjkJTMaA'
  },
  {
    question: 'The song "Bohemian Rhapsody" is a signature hit for which British rock band?',
    answer: 'Queen',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
  },
  {
    question: 'Which female artist holds the record for the most Grammy wins?',
    answer: 'Beyoncé',
    youtubeUrl: ''
  },
];

export const ROUND_TIME = 30; // seconds

export type Question = {
  id: string;
  question: string;
  answer: string;
  youtubeUrl?: string;
}

export type GameState = {
  players: Player[];
  currentQuestionIndex: number;
  timer: number;
  buzzedPlayerId: string | null;
  isRoundActive: boolean;
  showConfetti: boolean;
  roundWinner: Player | null;
  waitingForHost: boolean;
  questions: Question[];
};

const initialPlayers: Player[] = [
  { id: '1', name: 'Player 1', score: 0 },
  { id: '2', name: 'Player 2', score: 0 },
  { id: '3', name: 'You', score: 0, isYou: true },
  { id: '4', name: 'Player 4', score: 0 },
];

export const getInitialState = (): GameState => ({
  players: initialPlayers,
  currentQuestionIndex: 0,
  timer: ROUND_TIME,
  buzzedPlayerId: null,
  isRoundActive: true,
  showConfetti: false,
  roundWinner: null,
  waitingForHost: false,
  questions: []
});

const GAME_ID = 'main_game';
export const gameDocRef = doc(db, 'games', GAME_ID);
export const questionsCollectionRef = collection(db, 'questions');


async function seedInitialQuestions() {
    const questionsSnapshot = await getDocs(questionsCollectionRef);
    if (questionsSnapshot.empty) {
        const batch = writeBatch(db);
        MOCK_QUESTIONS_DATA.forEach((question) => {
            const newDocRef = doc(questionsCollectionRef);
            batch.set(newDocRef, question);
        });
        await batch.commit();
        console.log("Seeded initial questions.");
    }
}

export async function fetchQuestions(): Promise<Question[]> {
    const snapshot = await getDocs(questionsCollectionRef);
    if (snapshot.empty) {
        await seedInitialQuestions();
        const seededSnapshot = await getDocs(questionsCollectionRef);
        return seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
}

export async function addQuestion(questionData: Omit<Question, 'id'>) {
    const docRef = await addDoc(questionsCollectionRef, questionData);
    return docRef.id;
}

export async function updateQuestion(id: string, questionData: Partial<Omit<Question, 'id'>>) {
    const questionDoc = doc(db, 'questions', id);
    await updateDoc(questionDoc, questionData);
}

export async function deleteQuestion(id: string) {
    const questionDoc = doc(db, 'questions', id);
    await deleteDoc(questionDoc);
}


export async function initializeGame() {
    const docSnap = await getDoc(gameDocRef);
    if (!docSnap.exists()) {
        const initialState = getInitialState();
        await setDoc(gameDocRef, initialState);
    }
}

export async function updateGameState(newState: Partial<GameState>) {
    await updateDoc(gameDocRef, newState);
}

export async function resetGameInFirestore() {
    const questions = await fetchQuestions();
    const freshState = getInitialState();
    freshState.questions = questions;
    await setDoc(gameDocRef, freshState);
}


export { 
    db, 
    onSnapshot, 
};
