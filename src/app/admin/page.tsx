import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {

  async function addQuestion(formData: FormData) {
    "use server";
    // In a real application, you would save this data to your database.
    const question = formData.get("question");
    const answer = formData.get("answer");
    const youtubeUrl = formData.get("youtubeUrl");
    console.log("New question added:", { question, answer, youtubeUrl });
    // Here you would typically revalidate paths or redirect.
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your trivia game content here.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
          <CardDescription>Manually add a new trivia question to the game.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addQuestion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea id="question" name="question" placeholder="e.g., Who wrote 'Bohemian Rhapsody'?" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Input id="answer" name="answer" placeholder="e.g., Queen" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube Clip URL (Optional)</Label>
              <Input id="youtubeUrl" name="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <Button type="submit">Add Question</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
