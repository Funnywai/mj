'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Users, Pencil, History, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RenameDialog } from '@/app/components/rename-dialog';
import { WinActionDialog } from '@/app/components/win-action-dialog';
import { ZimoActionDialog } from '@/app/components/zimo-action-dialog';
import { cn } from '@/lib/utils';

interface UserData {
  id: number;
  name: string;
  winValues: { [opponentId: number]: number };
}

const generateInitialUsers = (): UserData[] => {
  const userCount = 4;
  return Array.from({ length: userCount }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    winValues: {},
  }));
};

const initialUsers = generateInitialUsers();

export default function Home() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [history, setHistory] = useState<UserData[][]>([]);
  const { toast } = useToast();

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isWinActionDialogOpen, setIsWinActionDialogOpen] = useState(false);
  const [isZimoActionDialogOpen, setIsZimoActionDialogOpen] = useState(false);
  
  const [currentUserForWinAction, setCurrentUserForWinAction] = useState<UserData | null>(null);
  const [dealerId, setDealerId] = useState<number>(1);

  const handleSetDealer = (userId: number) => {
    setDealerId(userId);
  };

  const handleOpenWinActionDialog = (user: UserData) => {
    setCurrentUserForWinAction(user);
    setIsWinActionDialogOpen(true);
  };
  
  const handleOpenZimoActionDialog = (user: UserData) => {
    setCurrentUserForWinAction(user);
    setIsZimoActionDialogOpen(true);
  };

  const handleSaveWinAction = (mainUserId: number, targetUserId: number, value: number) => {
    setHistory(prev => [...prev, users]);
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === mainUserId) {
          const newWinValues = { ...user.winValues };
          newWinValues[targetUserId] = (newWinValues[targetUserId] || 0) + value;
          return { ...user, winValues: newWinValues };
        }
        return user;
      });
    });
    setIsWinActionDialogOpen(false);
  };

  const handleSaveZimoAction = (mainUserId: number, value: number) => {
    setHistory(prev => [...prev, users]);
    setUsers(prevUsers => {
      const opponentIds = prevUsers.filter(u => u.id !== mainUserId).map(u => u.id);
      return prevUsers.map(user => {
        if (user.id === mainUserId) {
          const newWinValues = { ...user.winValues };
          opponentIds.forEach(opponentId => {
            newWinValues[opponentId] = (newWinValues[opponentId] || 0) + value;
          });
          return { ...user, winValues: newWinValues };
        }
        return user;
      });
    });
    setIsZimoActionDialogOpen(false);
  };
  
  const handleSaveUserNames = (updatedUsers: { id: number; name: string }[]) => {
    setUsers((prevUsers) => {
      const newUsers = prevUsers.map((user) => {
        const updatedUser = updatedUsers.find((u) => u.id === user.id);
        if (updatedUser) {
          return {
            ...user,
            name: updatedUser.name,
          };
        }
        return user;
      });
      return newUsers;
    });
    setIsRenameDialogOpen(false);
  };

  const handleReset = () => {
    setHistory(prev => [...prev, users]);
    setUsers(prevUsers => 
      prevUsers.map(user => ({
        ...user,
        winValues: {}
      }))
    );
  };

  const handleRestore = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setUsers(lastState);
      setHistory(prev => prev.slice(0, prev.length - 1));
    } else {
      toast({
        description: "No actions to restore.",
      });
    }
  };
  
  const totalScores = useMemo(() => {
    const scores: { [key: number]: number } = {};
    users.forEach(u => scores[u.id] = 0);
  
    users.forEach(user => {
      Object.entries(user.winValues).forEach(([opponentId, winValue]) => {
        const score = winValue || 0;
        scores[user.id] += score;
        scores[Number(opponentId)] -= score;
      });
    });
  
    return scores;
  }, [users]);

  const memoizedTableBody = useMemo(() => (
    <TableBody>
      {users.map((user) => {
        const isDealer = user.id === dealerId;
        return (
          <TableRow key={user.id} className={cn(isDealer && "bg-primary/10")}>
            <TableCell className="font-semibold text-foreground/90 align-top p-2">
              <div className="flex flex-col gap-2 items-start">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSetDealer(user.id)} className="p-1 rounded-md hover:bg-primary/20">
                    <Crown className={cn("h-4 w-4 text-primary", isDealer ? "fill-yellow-400 text-yellow-600" : "text-gray-400")} />
                  </button>
                  <Users className="h-4 w-4 text-primary"/>
                  {user.name}
                </div>
                <div className="flex flex-col items-stretch gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenWinActionDialog(user)}>
                     食胡
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenZimoActionDialog(user)}>
                     自摸
                  </Button>
                </div>
                <div className="font-bold text-lg mt-1">
                    Total: {totalScores[user.id]?.toLocaleString() ?? 0}
                </div>
              </div>
            </TableCell>
            {users.map(opponent => (
                <TableCell key={opponent.id} className="font-semibold text-center text-accent text-base transition-all duration-300 p-2">
                    {(user.winValues[opponent.id] || 0).toLocaleString()}
                </TableCell>
            ))}
          </TableRow>
        );
      })}
    </TableBody>
  ), [users, totalScores, dealerId]);

  const tableOpponentHeaders = useMemo(() => {
    return (
        users.map(user => (
            <TableHead key={user.id} className="text-center w-[120px] p-2">
                {user.name}
            </TableHead>
        ))
    );
  }, [users]);


  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsRenameDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Rename
            </Button>
            <Button variant="outline" size="sm" onClick={handleRestore} disabled={history.length === 0}>
              <History className="mr-2 h-4 w-4" /> Restore
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </header>

        <Card className="shadow-lg border-primary/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] p-2">User</TableHead>
                    <TableHead colSpan={users.length} className="text-center w-[120px] p-2">番數</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="p-2"></TableHead>
                    {tableOpponentHeaders}
                  </TableRow>
                </TableHeader>
                {memoizedTableBody}
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

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
      {currentUserForWinAction && (
        <ZimoActionDialog
          isOpen={isZimoActionDialogOpen}
          onClose={() => setIsZimoActionDialogOpen(false)}
          mainUser={currentUserForWinAction}
          onSave={handleSaveZimoAction}
        />
       )}

    </main>
  );
}
