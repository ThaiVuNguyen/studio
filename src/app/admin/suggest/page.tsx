"use client";

import { useState } from 'react';
import { suggestYoutubeTrivia, type SuggestYoutubeTriviaOutput } from '@/ai/flows/suggest-youtube-trivia-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function SuggestQuestionsPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestYoutubeTriviaOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await suggestYoutubeTrivia({ topic });
      setSuggestions(result);
    } catch (err) {
      setError('Failed to generate suggestions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold font-headline">AI Question Suggester</h1>
        <p className="text-muted-foreground">Generate trivia questions from YouTube clips based on a topic.</p>
      </header>
      
      <Card>
        <CardHeader>
            <CardTitle>Enter Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="flex-grow space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 80s Rock Anthems"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-destructive">{error}</p>}

      {suggestions && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-headline">Suggestions</h2>
          {suggestions.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Question {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><span className="font-semibold">Trivia Question:</span> {item.triviaQuestion}</p>
                <p><span className="font-semibold">Answer:</span> {item.answer}</p>
              </CardContent>
              <CardFooter>
                 <Link href={item.youtubeClipUrl} target="_blank" rel="noopener noreferrer" passHref>
                    <Button variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View YouTube Clip
                    </Button>
                 </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
