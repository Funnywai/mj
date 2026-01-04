'use client';

import { useState, useMemo } from 'react';
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
import { RefreshCw, Edit, Users, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserInputDialog } from '@/app/components/user-input-dialog';
import { RenameDialog } from '@/app/components/rename-dialog';
import { WinActionDialog } from '@/app/components/win-action-dialog';

interface OutputData {
  id: number;
  name: string;
  inputs: (number | string)[];
  outputSum: number | null;
  displayUserId: number;
  winValue: number | null;
}

interface UserData {
  id: number;
  name: string;
  outputs: OutputData[];
}

const generateInitialUsers = (): UserData[] => {
  const userCount = 4;
  const outputCount = 3;
  const users = Array.from({ length: userCount }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    outputs: [] as OutputData[],
  }));

  users.forEach((user, userIndex) => {
    const otherUsers = users.filter(u => u.id !== user.id);
    user.outputs = Array.from({ length: outputCount }, (_, j) => {
      const displayUser = otherUsers[j % otherUsers.length];
      return {
        id: j + 1,
        name: user.name,
        inputs: Array(6).fill(''),
        outputSum: 0,
        displayUserId: displayUser.id,
        winValue: null,
      };
    });
  });

  return users;
};


const initialUsers = generateInitialUsers();


export default function Home() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const { toast } = useToast();

  const [isInputDialogOpen, setIsInputDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isWinActionDialogOpen, setIsWinActionDialogOpen] = useState(false);
  const [currentOutput, setCurrentOutput] = useState<{
    mainUserId: number;
    output: OutputData;
  } | null>(null);
  const [currentUserForWinAction, setCurrentUserForWinAction] = useState<UserData | null>(null);

  const handleOpenDialog = (mainUserId: number, output: OutputData) => {
    setCurrentOutput({ mainUserId, output });
    setIsInputDialogOpen(true);
  };
  
  const handleOpenWinActionDialog = (user: UserData) => {
    setCurrentUserForWinAction(user);
    setIsWinActionDialogOpen(true);
  };

  const handleSaveInputs = (
    mainUserId: number,
    outputId: number,
    inputs: (number | string)[]
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
                      inputs: inputs,
                      outputSum: inputs.reduce((acc, val) => acc + (Number(val) || 0), 0),
                    }
                  : output
              ),
            }
          : user
      )
    );
    setIsInputDialogOpen(false);
  };

  const handleSaveWinAction = (mainUserId: number, targetUserId: number, value: number) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === mainUserId) {
          return {
            ...user,
            outputs: user.outputs.map(output => {
              if (output.displayUserId === targetUserId) {
                return {
                  ...output,
                  winValue: (output.winValue || 0) + value,
                };
              }
              return output;
            })
          };
        }
        return user;
      });
    });
    setIsWinActionDialogOpen(false);
  };

  const handleSaveUserNames = (updatedUsers: { id: number; name: string }[]) => {
    setUsers((prevUsers) => {
      const newUsers = prevUsers.map((user) => {
        const updatedUser = updatedUsers.find((u) => u.id === user.id);
        if (updatedUser) {
          return {
            ...user,
            name: updatedUser.name,
            outputs: user.outputs.map((output) => ({
              ...output,
              name: updatedUser.name, // Only update the row's owner name
            })),
          };
        }
        return user;
      });
      return newUsers;
    });
    setIsRenameDialogOpen(false);
  };

  const handleReset = () => {
    setUsers(generateInitialUsers());
  };
  
  const totalScores = useMemo(() => {
    const scores: { [key: number]: number } = {};
    users.forEach(u => scores[u.id] = 0);

    users.forEach(user => {
        user.outputs.forEach(output => {
            const score = (output.outputSum || 0) + (output.winValue || 0);
            scores[user.id] += score;
            scores[output.displayUserId] -= score;
        });
    });

    return scores;
  }, [users]);

  const memoizedTableBody = useMemo(() => (
    <TableBody>
      {users.map((user) =>
        user.outputs.map((output, outputIndex) => {
          const displayUser = users.find(u => u.id === output.displayUserId);

          return (
            <TableRow key={`${user.id}-${output.id}`}>
              {outputIndex === 0 && (
                <TableCell className="font-semibold text-foreground/90 align-top" rowSpan={user.outputs.length}>
                  <div className="flex flex-col gap-2 items-start">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary"/>
                      {user.name}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenWinActionDialog(user)}>
                       食胡
                    </Button>
                    <div className="font-bold text-xl mt-2">
                        Total: {totalScores[user.id].toLocaleString()}
                    </div>
                  </div>
                </TableCell>
              )}
              <TableCell className="font-medium text-foreground/80">
                {displayUser ? displayUser.name : ''}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(user.id, output)}
                  className="w-full justify-start"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Enter Data
                </Button>
              </TableCell>
              <TableCell className="font-semibold text-center text-primary text-lg transition-all duration-300">
                {output.outputSum?.toLocaleString() ?? '0'}
              </TableCell>
              <TableCell className="font-semibold text-center text-accent text-lg transition-all duration-300">
                {output.winValue?.toLocaleString() ?? '0'}
              </TableCell>
            </TableRow>
          );
        })
      )}
    </TableBody>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [users, totalScores]);


  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-5xl">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            FormulaShare
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Rename
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
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
                    <TableHead className="w-[150px]">出統</TableHead>
                    <TableHead className="w-[200px]">食</TableHead>
                    <TableHead className="text-center w-[150px]">番數</TableHead>
                    <TableHead className="text-center w-[150px]">自摸/出銃</TableHead>
                  </TableRow>
                </TableHeader>
                {memoizedTableBody}
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {currentOutput && (
        <UserInputDialog
          isOpen={isInputDialogOpen}
          onClose={() => setIsInputDialogOpen(false)}
          mainUserId={currentOutput.mainUserId}
          output={currentOutput.output}
          onSave={handleSaveInputs}
        />
      )}
      <RenameDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        users={users}
        onSave={handleSaveUserNames}
       />
      {currentUserForWinAction && (
        <WinActionDialog
          isOpen={isWinActionDialogOpen}
          onClose={() => setIsWinActionDialogOpen(false)}
          mainUser={currentUserForWinAction}
          users={users.filter(u => u.id !== currentUserForWinAction.id)}
          onSave={handleSaveWinAction}
        />
       )}

    </main>
  );
}
