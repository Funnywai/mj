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
import { RefreshCw, Sparkles, Loader2, Edit, Users, ChevronsRight } from 'lucide-react';
import { suggestCalculations } from '@/ai/flows/suggest-calculations';
import type { SuggestCalculationsOutput } from '@/ai/flows/suggest-calculations';
import { useToast } from '@/hooks/use-toast';
import { SuggestionsSheet } from '@/app/components/suggestions-sheet';
import { UserInputDialog } from '@/app/components/user-input-dialog';

interface SubUserData {
  id: number;
  name: string;
  inputs: (number | string)[];
}

interface OutputData {
  id: number;
  name: string;
  subUsers: SubUserData[];
  outputSum: number | null;
}

interface UserData {
  id: number;
  name: string;
  outputs: OutputData[];
}

const initialUsers: UserData[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  outputs: Array.from({ length: 3 }, (__, j) => ({
    id: j + 1,
    name: `Output ${j + 1}`,
    subUsers: Array.from({ length: 4 })
      .filter((_, k) => k + 1 !== i + 1)
      .map((_, k) => {
        const otherUserIds = Array.from({ length: 4 }).map((_,l) => l + 1).filter(id => id !== i + 1);
        return {
          id: otherUserIds[k],
          name: `User ${otherUserIds[k]}`,
          inputs: Array(6).fill(''),
        };
      }),
    outputSum: 0,
  })),
}));

export default function Home() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSubUser, setCurrentSubUser] = useState<{
    mainUserId: number;
    outputId: number;
    subUser: SubUserData;
  } | null>(null);

  const handleOpenDialog = (mainUserId: number, outputId: number, subUser: SubUserData) => {
    setCurrentSubUser({ mainUserId, outputId, subUser });
    setIsDialogOpen(true);
  };

  const handleSaveInputs = (
    mainUserId: number,
    outputId: number,
    subUserId: number,
    newInputs: (number | string)[]
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === mainUserId
          ? {
              ...user,
              outputs: user.outputs.map((output) =>
                output.id === outputId
                  ? {
                      ...output,
                      subUsers: output.subUsers.map((subUser) =>
                        subUser.id === subUserId ? { ...subUser, inputs: newInputs } : subUser
                      ),
                    }
                  : output
              ),
            }
          : user
      )
    );
    setIsDialogOpen(false);
  };

  const handleReset = () => {
    setUsers(
      users.map((user) => ({
        ...user,
        outputs: user.outputs.map(output => ({
          ...output,
          subUsers: output.subUsers.map(subUser => ({
            ...subUser,
            inputs: Array(6).fill('')
          }))
        }))
      }))
    );
    setSuggestions([]);
  };

  const handleSuggest = () => {
    setIsSheetOpen(true);
    startSuggestionTransition(async () => {
      try {
        const inputForAI = users.flatMap(user => 
            user.outputs.map(output => 
                output.subUsers.flatMap(subUser => 
                    subUser.inputs.map(val => Number(val) || 0)
                )
            )
        );

        if (inputForAI.some(arr => arr.length !== 18)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Input',
                description: 'Please ensure all inputs are filled (18 per output row).',
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
    const newUsers = users.map((user) => ({
      ...user,
      outputs: user.outputs.map((output) => {
        const outputSum = output.subUsers.reduce((total, subUser) => {
          const subUserSum = subUser.inputs.reduce((acc, val) => acc + (Number(val) || 0), 0);
          return total + subUserSum;
        }, 0);
        return { ...output, outputSum };
      }),
    }));
    setUsers(newUsers);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(users.map(u => u.outputs.map(o => o.subUsers.map(su => su.inputs))))]);
  
  const memoizedTableBody = useMemo(() => (
    <TableBody>
      {users.map((user) =>
        user.outputs.map((output, outputIndex) => (
          <TableRow key={`${user.id}-${output.id}`}>
            {outputIndex === 0 && (
              <TableCell className="font-semibold text-foreground/90 align-top" rowSpan={3}>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary"/>
                  {user.name}
                </div>
              </TableCell>
            )}
            <TableCell className="font-medium text-foreground/80">{output.name}</TableCell>
            <TableCell>
              <div className="flex flex-col gap-2">
                {output.subUsers.map((subUser) => (
                  <Button
                    variant="outline"
                    size="sm"
                    key={subUser.id}
                    onClick={() => handleOpenDialog(user.id, output.id, subUser)}
                    className="w-full justify-start"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Data for {subUser.name}
                  </Button>
                ))}
              </div>
            </TableCell>
            <TableCell className="font-semibold text-center text-primary text-lg transition-all duration-300">
              {output.outputSum?.toLocaleString() ?? '0'}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  ), [users]);


  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-5xl">
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
                    <TableHead className="w-[120px]">Output</TableHead>
                    <TableHead className="w-[400px]">Inputs (6 per User)</TableHead>
                    <TableHead className="text-center w-[150px]">Output Sum</TableHead>
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
      {currentSubUser && (
        <UserInputDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          mainUserId={currentSubUser.mainUserId}
          outputId={currentSubUser.outputId}
          subUser={currentSubUser.subUser}
          onSave={handleSaveInputs}
        />
      )}
    </main>
  );
}
