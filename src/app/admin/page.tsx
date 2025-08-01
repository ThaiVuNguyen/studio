
"use client";

import { useState, useEffect, useTransition } from 'react';
import { fetchQuestions, addQuestion, updateQuestion, deleteQuestion, type Question } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function QuestionForm({ question, onSave, onCancel }: { question?: Question | null, onSave: (data: Omit<Question, 'id'>) => Promise<void>, onCancel: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
      youtubeUrl: formData.get("youtubeUrl") as string,
    };

    if (!data.question || !data.answer) {
      toast({
        title: "Error",
        description: "Question and Answer fields are required.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      await onSave(data);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Textarea id="question" name="question" placeholder="e.g., Who wrote 'Bohemian Rhapsody'?" required defaultValue={question?.question} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="answer">Answer</Label>
        <Input id="answer" name="answer" placeholder="e.g., Queen" required defaultValue={question?.answer} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="youtubeUrl">YouTube Clip URL (Optional)</Label>
        <Input id="youtubeUrl" name="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." defaultValue={question?.youtubeUrl} />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Question
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminDashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const fetchedQuestions = await fetchQuestions();
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      toast({
        title: "Error",
        description: "Could not load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleAddQuestion = async (data: Omit<Question, 'id'>) => {
    await addQuestion(data);
    toast({ title: "Success", description: "New question added." });
    await loadQuestions();
    setAddDialogOpen(false);
  };
  
  const handleUpdateQuestion = async (data: Omit<Question, 'id'>) => {
    if (!editingQuestion) return;
    await updateQuestion(editingQuestion.id, data);
    toast({ title: "Success", description: "Question updated." });
    await loadQuestions();
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    startTransition(async () => {
      await deleteQuestion(id);
      toast({ title: "Success", description: "Question deleted." });
      await loadQuestions();
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your trivia game content here.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>Add New Question</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>Manually add a new trivia question to the game.</DialogDescription>
                </DialogHeader>
                <QuestionForm onSave={handleAddQuestion} onCancel={() => setAddDialogOpen(false)} />
            </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Question List</CardTitle>
          <CardDescription>All the questions currently in your game. Edit or delete them from here.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.question}</TableCell>
                    <TableCell>{q.answer}</TableCell>
                    <TableCell className="text-right">
                       <Dialog open={editingQuestion?.id === q.id} onOpenChange={(isOpen) => !isOpen && setEditingQuestion(null)}>
                          <DialogTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(q)}>
                               <Edit className="h-4 w-4" />
                               <span className="sr-only">Edit</span>
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle>Edit Question</DialogTitle>
                             </DialogHeader>
                              <QuestionForm question={editingQuestion} onSave={handleUpdateQuestion} onCancel={() => setEditingQuestion(null)} />
                           </DialogContent>
                       </Dialog>
                       
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the question.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteQuestion(q.id)} disabled={isPending}>
                              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
