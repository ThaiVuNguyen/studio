'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting YouTube video clips for trivia questions.
 *
 * The flow takes a topic as input and returns a list of suggested YouTube video clips with corresponding trivia questions.
 * - suggestYoutubeTrivia - A function that handles the suggestion of YouTube trivia questions.
 * - SuggestYoutubeTriviaInput - The input type for the suggestYoutubeTrivia function.
 * - SuggestYoutubeTriviaOutput - The return type for the suggestYoutubeTrivia function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestYoutubeTriviaInputSchema = z.object({
  topic: z.string().describe('The topic for which to suggest YouTube trivia questions.'),
});
export type SuggestYoutubeTriviaInput = z.infer<typeof SuggestYoutubeTriviaInputSchema>;

const SuggestYoutubeTriviaOutputSchema = z.array(z.object({
  youtubeClipUrl: z.string().url().describe('The URL of the suggested YouTube video clip.'),
  triviaQuestion: z.string().describe('A trivia question related to the YouTube video clip.'),
  answer: z.string().describe('The answer to the trivia question.'),
}));
export type SuggestYoutubeTriviaOutput = z.infer<typeof SuggestYoutubeTriviaOutputSchema>;

export async function suggestYoutubeTrivia(input: SuggestYoutubeTriviaInput): Promise<SuggestYoutubeTriviaOutput> {
  return suggestYoutubeTriviaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestYoutubeTriviaPrompt',
  input: {schema: SuggestYoutubeTriviaInputSchema},
  output: {schema: SuggestYoutubeTriviaOutputSchema},
  prompt: `You are an AI assistant that suggests YouTube video clips for trivia questions based on a given topic.

  Topic: {{{topic}}}

  Suggest 3 YouTube video clips with corresponding trivia questions and answers. The trivia questions should be engaging and challenging.

  Format your response as a JSON array of objects with the following structure:
  [
    {
      "youtubeClipUrl": "<youtube_video_url>",
      "triviaQuestion": "<trivia_question>",
      "answer": "<answer>"
    }
  ]`, 
});

const suggestYoutubeTriviaFlow = ai.defineFlow({
  name: 'suggestYoutubeTriviaFlow',
  inputSchema: SuggestYoutubeTriviaInputSchema,
  outputSchema: SuggestYoutubeTriviaOutputSchema,
}, async (input) => {
  const {output} = await prompt(input);
  return output!;
});
