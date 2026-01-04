'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Sparkles, Loader2, Edit } from 'lucide-react';
import { suggestCalculations } from '@/ai/flows/suggest-calculations';
import type { SuggestCalculationsOutput } from '@/ai/flows/suggest-calculations';
import { useToast } from '@/hooks/use-toast';
import { SuggestionsSheet } from '@/app/components/suggestions-sheet';
import { UserInputDialog } from '@/app/components/user-input-dialog';

interface UserData {
  id: number;
  name: string;
  inputs: (number | string)[];
  userSum: number | null;
}

const initialUsers: UserData[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  inputs: Array(6).fill(''),
  userSum: 0,
}));

export default function Home() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  const handleOpenDialog = (user: UserData) => {
    setCurrentUser(user);
    setIsDialogOpen(true);
  };

  const handleSaveInputs = (userId: number, newInputs: (number | string)[]) => {
    setUsers(
      users.map((user) => (user.id === userId ? { ...user, inputs: newInputs } : user))
    );
    setIsDialogOpen(false);
  };

  const handleReset = () => {
    setUsers(
      users.map((user) => ({
        ...user,
        inputs: Array(6).fill(''),
      }))
    );
    setSuggestions([]);
  };

  const handleSuggest = () => {
    setIsSheetOpen(true);
    startSuggestionTransition(async () => {
      try {
        const inputForAI = users.map((user) =>
          user.inputs.map((val) => Number(val) || 0)
        );

        if (inputForAI.length === 0 || inputForAI.some(arr => arr.length !== 6)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Input',
                description: 'Please ensure all users have 6 numbers entered.',
            });
            return;
        }
        
        const result: SuggestCalculationsOutput = await suggestCalculations({ userInputs: inputForAI });
        setSuggestions(result.suggestions);
      } catch (error) {
        console.error('AI suggestion error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch AI suggestions. Please try again.',
        });
        setSuggestions([]);
      }
    });
  };

  useEffect(() => {
    const newUsers = users.map((currentUser) => {
      const userSum = currentUser.inputs.reduce(
        (acc, val) => acc + (Number(val) || 0),
        0
      );
      return { ...currentUser, userSum };
    });
    setUsers(newUsers);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(users.map(u => u.inputs))]);
  
  const memoizedTableBody = useMemo(() => (
    <TableBody>
      {users.map((user) => (
        <TableRow key={user.id}>
          <TableCell className="font-medium text-foreground/80">{user.name}</TableCell>
          <TableCell className="text-center">
            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Enter Data
            </Button>
          </TableCell>
          <TableCell className="font-semibold text-center text-primary transition-all duration-300">
            {user.userSum?.toLocaleString() ?? '0'}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  ), [users]);


  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            FormulaShare
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button
              onClick={handleSuggest}
              disabled={isSuggesting}
              style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
              className="hover:bg-accent/90"
            >
              {isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Suggest Formulas
            </Button>
          </div>
        </header>

        <Card className="shadow-lg border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg text-foreground/90">User Data & Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">User</TableHead>
                    <TableHead className="text-center">Inputs</TableHead>
                    <TableHead className="text-center">User's Sum</TableHead>
                  </TableRow>
                </TableHeader>
                {memoizedTableBody}
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <SuggestionsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        suggestions={suggestions}
        isLoading={isSuggesting}
      />
      {currentUser && (
        <UserInputDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          user={currentUser}
          onSave={handleSaveInputs}
        />
      )}
    </main>
  );
}
