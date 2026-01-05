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
import { RefreshCw, Users, Pencil, History as HistoryIcon, List, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RenameDialog } from '@/app/components/rename-dialog';
import { WinActionDialog } from '@/app/components/win-action-dialog';
import { ZimoActionDialog } from '@/app/components/zimo-action-dialog';
import { HistoryDialog } from '@/app/components/history-dialog';
import { SeatChangeDialog } from '@/app/components/seat-change-dialog';
import { ResetScoresDialog } from '@/app/components/reset-scores-dialog';
import { cn } from '@/lib/utils';

interface UserData {
  id: number;
  name: string;
  winValues: { [opponentId: number]: number };
}

interface LaCounts {
  [winnerId: number]: {
    [loserId: number]: number;
  };
}

export interface ScoreChange {
  userId: number;
  change: number;
}

interface GameState {
  users: UserData[];
  laCounts: LaCounts;
  lastWinnerId: number | null;
  dealerId: number;
  consecutiveWins: number;
  action: string;
  scoreChanges: ScoreChange[];
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [users, setUsers] = useState<UserData[]>(() => {
    if (typeof window !== 'undefined') {
      const savedUsers = localStorage.getItem('mahjong-users');
      return savedUsers ? JSON.parse(savedUsers) : initialUsers;
    }
    return initialUsers;
  });
  const [history, setHistory] = useState<GameState[]>(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('mahjong-history');
      return savedHistory ? JSON.parse(savedHistory) : [];
    }
    return [];
  });
  const { toast } = useToast();

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isWinActionDialogOpen, setIsWinActionDialogOpen] = useState(false);
  const [isZimoActionDialogOpen, setIsZimoActionDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isSeatChangeDialogOpen, setIsSeatChangeDialogOpen] = useState(false);
  const [isResetScoresDialogOpen, setIsResetScoresDialogOpen] = useState(false);

  
  const [currentUserForWinAction, setCurrentUserForWinAction] = useState<UserData | null>(null);

  const [dealerId, setDealerId] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedDealerId = localStorage.getItem('mahjong-dealerId');
      return savedDealerId ? JSON.parse(savedDealerId) : 1;
    }
    return 1;
  });
  const [consecutiveWins, setConsecutiveWins] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedConsecutiveWins = localStorage.getItem('mahjong-consecutiveWins');
      return savedConsecutiveWins ? JSON.parse(savedConsecutiveWins) : 1;
    }
    return 1;
  });

  const [lastWinnerId, setLastWinnerId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const savedLastWinnerId = localStorage.getItem('mahjong-lastWinnerId');
      return savedLastWinnerId ? JSON.parse(savedLastWinnerId) : null;
    }
    return null;
  });
  const [laCounts, setLaCounts] = useState<LaCounts>(() => {
    if (typeof window !== 'undefined') {
      const savedLaCounts = localStorage.getItem('mahjong-laCounts');
      return savedLaCounts ? JSON.parse(savedLaCounts) : {};
    }
    return {};
  });

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('mahjong-users', JSON.stringify(users));
      localStorage.setItem('mahjong-history', JSON.stringify(history));
      localStorage.setItem('mahjong-dealerId', JSON.stringify(dealerId));
      localStorage.setItem('mahjong-consecutiveWins', JSON.stringify(consecutiveWins));
      localStorage.setItem('mahjong-lastWinnerId', JSON.stringify(lastWinnerId));
      localStorage.setItem('mahjong-laCounts', JSON.stringify(laCounts));
    }
  }, [users, history, dealerId, consecutiveWins, lastWinnerId, laCounts, isClient]);
  
  const saveStateToHistory = (action: string, scoreChanges: ScoreChange[]) => {
    const currentState: GameState = {
      users: JSON.parse(JSON.stringify(users)),
      laCounts: JSON.parse(JSON.stringify(laCounts)),
      lastWinnerId,
      dealerId,
      consecutiveWins,
      action,
      scoreChanges,
    };
    setHistory(prev => [...prev, currentState]);
  };

  const handleSetDealer = (userId: number) => {
    setDealerId(userId);
    setConsecutiveWins(1);
  };

  const handleOpenWinActionDialog = (user: UserData) => {
    setCurrentUserForWinAction(user);
    setIsWinActionDialogOpen(true);
  };
  
  const handleOpenZimoActionDialog = (user: UserData) => {
    setCurrentUserForWinAction(user);
    setIsZimoActionDialogOpen(true);
  };

  const handleWin = (winnerId: number) => {
    if (winnerId === dealerId) {
      setConsecutiveWins(prev => prev + 1);
    } else {
      const currentDealerIndex = users.findIndex(u => u.id === dealerId);
      const nextDealerIndex = (currentDealerIndex + 1) % users.length;
      setDealerId(users[nextDealerIndex].id);
      setConsecutiveWins(1);
    }
  };

  const updateLaCounts = (winnerId: number, loserIds: number[]) => {
    const newLaCounts: LaCounts = winnerId === lastWinnerId ? { ...laCounts } : {};
    
    if (!newLaCounts[winnerId]) {
      newLaCounts[winnerId] = {};
    }

    loserIds.forEach(loserId => {
      newLaCounts[winnerId][loserId] = (newLaCounts[winnerId]?.[loserId] || 0) + 1;
    });

    setLaCounts(newLaCounts);
    setLastWinnerId(winnerId);
  };

  const executeWinAction = (
    mainUserId: number,
    value: number,
    targetUserId?: number
  ) => {
    const isNewWinner = mainUserId !== lastWinnerId && lastWinnerId !== null;
    if (isNewWinner) {
        setIsResetScoresDialogOpen(true);
    }

    if (targetUserId) {
        // "食胡" case
        const winner = users.find(u => u.id === mainUserId);
        const loser = users.find(u => u.id === targetUserId);
        const actionDescription = `${winner?.name} 食胡 ${loser?.name} ${value}番`;
        
        let currentScore = value;
        const dealerBonus = 2 * consecutiveWins - 1;

        if (mainUserId === dealerId) {
        currentScore += dealerBonus;
        } else if (targetUserId === dealerId) {
        currentScore += dealerBonus;
        }

        let finalValue = currentScore;
        const previousWinner = users.find(u => u.id === lastWinnerId);
        if (previousWinner && previousWinner.id === mainUserId) {
            const previousScore = winner?.winValues[targetUserId] || 0;
            if (previousScore > 0) {
                const bonus = Math.round(previousScore * 0.5);
                finalValue = previousScore + bonus + currentScore;
            }
        }
        
        const scoreChanges: ScoreChange[] = [
        { userId: mainUserId, change: finalValue - (users.find(u=>u.id===mainUserId)?.winValues[targetUserId] || 0) },
        { userId: targetUserId, change: -(finalValue - (users.find(u=>u.id===mainUserId)?.winValues[targetUserId] || 0)) },
        ];
        saveStateToHistory(actionDescription, scoreChanges);
        
        updateLaCounts(mainUserId, [targetUserId]);

        setUsers(prevUsers => {
          let updatedUsers = prevUsers.map(user => {
              if (isNewWinner && user.id !== mainUserId) {
                  return { ...user, winValues: {} };
              }
              return user;
          });

          updatedUsers = updatedUsers.map(user => {
            if (user.id === mainUserId) {
              const newWinValues = isNewWinner ? {} : { ...user.winValues };
              newWinValues[targetUserId] = finalValue;

              if (isNewWinner) {
                  Object.keys(newWinValues).forEach(key => {
                      if (parseInt(key) !== targetUserId) {
                          newWinValues[parseInt(key)] = 0;
                      }
                  });
              }
              
              return { ...user, winValues: newWinValues };
            }
            if (user.id !== mainUserId) {
              const newWinValues = { ...user.winValues };
              if (newWinValues[mainUserId]) {
                newWinValues[mainUserId] = 0;
              }
              return { ...user, winValues: newWinValues };
            }
            return user;
          });
          return updatedUsers;
        });
    } else {
        // "自摸" case
        const winner = users.find(u => u.id === mainUserId);
        const actionDescription = `${winner?.name} 自摸 ${value}番`;
        const opponentIds = users.filter(u => u.id !== mainUserId).map(u => u.id);
        
        const isDealerWinning = mainUserId === dealerId;
        const dealerBonus = 2 * consecutiveWins - 1;
        
        const scoresToAdd: { [opponentId: number]: number } = {};
        let winnerTotalChange = 0;
        const scoreChanges: ScoreChange[] = [];

        opponentIds.forEach(opponentId => {
            let currentScore = value;
            if (isDealerWinning) {
                currentScore += dealerBonus;
            } else if (opponentId === dealerId) {
                currentScore += dealerBonus;
            }
            
            let finalValue = currentScore;
            const previousWinner = users.find(u => u.id === lastWinnerId);
            if (previousWinner && previousWinner.id === mainUserId) {
                const previousScore = winner?.winValues[opponentId] || 0;
                if (previousScore > 0) {
                    const bonus = Math.round(previousScore * 0.5);
                    finalValue = previousScore + bonus + currentScore;
                }
            }

            const change = finalValue - (winner?.winValues[opponentId] || 0);
            scoresToAdd[opponentId] = finalValue;
            winnerTotalChange += change;
            scoreChanges.push({ userId: opponentId, change: -change });
        });
        scoreChanges.push({ userId: mainUserId, change: winnerTotalChange });

        saveStateToHistory(actionDescription, scoreChanges);
        updateLaCounts(mainUserId, opponentIds);

        setUsers(prevUsers => {
            let updatedUsers = prevUsers.map(user => {
              if (isNewWinner && user.id !== mainUserId) {
                  return { ...user, winValues: {} };
              }
              return user;
            });

            updatedUsers = updatedUsers.map(user => {
                if (user.id === mainUserId) {
                    const newWinValues = isNewWinner ? {} : { ...user.winValues };
                    Object.entries(scoresToAdd).forEach(([opponentId, score]) => {
                        newWinValues[parseInt(opponentId)] = score;
                    });
                    return { ...user, winValues: newWinValues };
                }
                if (user.id !== mainUserId) {
                    const newWinValues = { ...user.winValues };
                    if (newWinValues[mainUserId]) {
                        newWinValues[mainUserId] = 0;
                    }
                    return { ...user, winValues: newWinValues };
                }
                return user;
            });

            return updatedUsers;
        });
    }

    handleWin(mainUserId);
    setIsWinActionDialogOpen(false);
    setIsZimoActionDialogOpen(false);
  };

  const handleSaveWinAction = (mainUserId: number, targetUserId: number, value: number) => {
    executeWinAction(mainUserId, value, targetUserId);
  };
  
  const handleSaveZimoAction = (mainUserId: number, value: number) => {
    executeWinAction(mainUserId, value);
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

  const handleSaveSeatChange = (newUsers: UserData[]) => {
    setUsers(newUsers);
    setIsSeatChangeDialogOpen(false);
  };

  const handleReset = () => {
    saveStateToHistory('Reset Game', []);
    setUsers(prevUsers => 
      prevUsers.map(user => ({
        ...user,
        winValues: {}
      }))
    );
    setLaCounts({});
    setLastWinnerId(null);
    setHistory([]);
    setDealerId(users[0]?.id || 1);
    setConsecutiveWins(1);
  };

  const handleRestore = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setUsers(lastState.users);
      setLaCounts(lastState.laCounts);
      setLastWinnerId(lastState.lastWinnerId);
      setDealerId(lastState.dealerId);
      setConsecutiveWins(lastState.consecutiveWins);
      setHistory(prev => prev.slice(0, prev.length - 1));
       toast({
        description: "Last action restored.",
      });
    } else {
      toast({
        description: "No actions to restore.",
      });
    }
  };
  
  const totalScores = useMemo(() => {
    const scores: { [key: number]: number } = {};
    users.forEach(u => scores[u.id] = 0);
  
    history.forEach(state => {
      state.scoreChanges.forEach(change => {
        if (scores[change.userId] !== undefined) {
          scores[change.userId] += change.change;
        }
      });
    });
  
    return scores;
  }, [history, users]);

  const scoresToReset = useMemo(() => {
    if (!lastWinnerId) return null;
    const lastWinner = users.find(u => u.id === lastWinnerId);
    if (!lastWinner) return null;
    
    const scores = Object.keys(lastWinner.winValues).reduce((acc, opponentId) => {
      const score = lastWinner.winValues[parseInt(opponentId)];
      if (score > 0) {
        acc[parseInt(opponentId)] = score;
      }
      return acc;
    }, {} as { [opponentId: number]: number });
  
    if (Object.keys(scores).length === 0) return null;

    return {
      winnerName: lastWinner.name,
      winnerId: lastWinner.id,
      scores,
    };
  }, [lastWinnerId, users]);

  const memoizedTableBody = useMemo(() => (
    <TableBody>
      {users.map((user) => {
        const isDealer = user.id === dealerId;
        return (
          <TableRow key={user.id} className={cn(isDealer && "bg-primary/10")}>
            <TableCell className="font-semibold text-foreground/90 align-top p-2">
              <div className="flex flex-col gap-2 items-start">
                <div className="flex flex-col items-start gap-1">
                  <button onClick={() => handleSetDealer(user.id)} className={cn("flex items-center justify-center font-bold text-sm w-auto px-1 h-6 rounded-md hover:bg-primary/20", isDealer ? "bg-yellow-400 text-yellow-800" : "bg-gray-200 text-gray-500")}>
                    {isDealer && consecutiveWins > 1 ? `連${consecutiveWins}` : ''}莊
                  </button>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary"/>
                    {user.name}
                  </div>
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
  ), [users, totalScores, dealerId, consecutiveWins, lastWinnerId, laCounts]);

  const tableOpponentHeaders = useMemo(() => {
    return (
        users.map(user => {
            const laCount = lastWinnerId != null && laCounts[lastWinnerId]?.[user.id];
            return (
              <TableHead key={user.id} className="text-center w-[120px] p-2">
                  <div>{user.name}</div>
                  {laCount > 0 && (
                      <div className="text-red-500 font-bold">拉{laCount}</div>
                  )}
              </TableHead>
            )
        })
    );
  }, [users, laCounts, lastWinnerId]);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsRenameDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Rename
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsSeatChangeDialogOpen(true)}>
              <Shuffle className="mr-2 h-4 w-4" /> 換位
            </Button>
            <Button variant="outline" size="sm" onClick={handleRestore} disabled={history.length === 0}>
              <HistoryIcon className="mr-2 h-4 w-4" /> Restore
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
             <Button variant="outline" size="sm" onClick={() => setIsHistoryDialogOpen(true)} disabled={history.length === 0}>
              <List className="mr-2 h-4 w-4" /> History
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
      <SeatChangeDialog
        isOpen={isSeatChangeDialogOpen}
        onClose={() => setIsSeatChangeDialogOpen(false)}
        users={users}
        onSave={handleSaveSeatChange}
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
       <HistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        history={history}
        users={users}
      />
      {scoresToReset && (
        <ResetScoresDialog
            isOpen={isResetScoresDialogOpen}
            onClose={() => setIsResetScoresDialogOpen(false)}
            scoresToReset={scoresToReset}
            users={users}
        />
      )}

    </main>
  );
}
