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
import { RefreshCw, Users, Pencil, History as HistoryIcon, List, Shuffle, Redo2, DollarSign, Zap, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { RenameDialog } from '@/app/components/rename-dialog';
import { WinActionDialog } from '@/app/components/win-action-dialog';
import { HistoryDialog } from '@/app/components/history-dialog';
import { SeatChangeDialog } from '@/app/components/seat-change-dialog';
import { ResetScoresDialog } from '@/app/components/reset-scores-dialog';
import { PayoutDialog } from '@/app/components/payout-dialog';
import { SpecialActionDialog } from '@/app/components/special-action-dialog';
import { cn } from '@/lib/utils';

interface UserData {
  id: number;
  name: string;
  winValues: { [opponentId: number]: number };
}

export interface LaCounts {
  [winnerId: number]: {
    [loserId: number]: number;
  };
}

export interface ScoreChange {
  userId: number;
  change: number;
}

interface Payouts {
  [opponentId: number]: number;
}

interface GameState {
  users: UserData[];
  laCounts: LaCounts;
  currentWinnerId: number | null;
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

interface ScoresToReset {
  previousWinnerName: string;
  previousWinnerId: number;
  currentWinnerName: string;
  currentWinnerId: number;
  scores: { [opponentId: number]: number };
}

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

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isWinActionDialogOpen, setIsWinActionDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isSeatChangeDialogOpen, setIsSeatChangeDialogOpen] = useState(false);
  const [isResetScoresDialogOpen, setIsResetScoresDialogOpen] = useState(false);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [isSpecialActionDialogOpen, setIsSpecialActionDialogOpen] = useState(false);


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

  const [currentWinnerId, setCurrentWinnerId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const savedWinnerId = localStorage.getItem('mahjong-currentWinnerId');
      return savedWinnerId ? JSON.parse(savedWinnerId) : null;
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
  const [scoresToReset, setScoresToReset] = useState<ScoresToReset | null>(null);

  const [popOnNewWinner, setPopOnNewWinner] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedPopOnNewWinner = localStorage.getItem('mahjong-popOnNewWinner');
      return savedPopOnNewWinner ? JSON.parse(savedPopOnNewWinner) : true;
    }
    return true;
  });


  useEffect(() => {
    if(isClient) {
      localStorage.setItem('mahjong-popOnNewWinner', JSON.stringify(popOnNewWinner));
    }
  }, [isClient, popOnNewWinner]);

  const saveGameData = (data: {
    users?: UserData[];
    history?: GameState[];
    dealerId?: number;
    consecutiveWins?: number;
    currentWinnerId?: number | null;
    laCounts?: LaCounts;
  }) => {
    if (isClient) {
      if (data.users !== undefined) localStorage.setItem('mahjong-users', JSON.stringify(data.users));
      if (data.history !== undefined) localStorage.setItem('mahjong-history', JSON.stringify(data.history));
      if (data.dealerId !== undefined) localStorage.setItem('mahjong-dealerId', JSON.stringify(data.dealerId));
      if (data.consecutiveWins !== undefined) localStorage.setItem('mahjong-consecutiveWins', JSON.stringify(data.consecutiveWins));
      if (data.laCounts !== undefined) localStorage.setItem('mahjong-laCounts', JSON.stringify(data.laCounts));
      if (data.currentWinnerId !== undefined) localStorage.setItem('mahjong-currentWinnerId', JSON.stringify(data.currentWinnerId));
    }
  };


  const saveStateToHistory = (action: string, scoreChanges: ScoreChange[], currentState: Omit<GameState, 'action' | 'scoreChanges'>) => {
    const newHistoryEntry: GameState = {
      ...currentState,
      action,
      scoreChanges,
    };
    const newHistory = [...history, newHistoryEntry];
    setHistory(newHistory);
    return newHistory;
  };

  const handleSetDealer = (userId: number) => {
    const newConsecutiveWins = 1;
    setDealerId(userId);
    setConsecutiveWins(newConsecutiveWins);
    saveGameData({
        dealerId: userId,
        consecutiveWins: newConsecutiveWins,
    });
  };

  const handleManualConsecutiveWin = () => {
    const newConsecutiveWins = consecutiveWins + 1;
    setConsecutiveWins(newConsecutiveWins);
    saveGameData({
        consecutiveWins: newConsecutiveWins,
    });
  };

  const handleOpenWinActionDialog = (user: UserData) => {
    setCurrentUserForWinAction(user);
    setIsWinActionDialogOpen(true);
  };
  
  const handleOpenSpecialActionDialog = (user: UserData) => {
    setCurrentUserForWinAction(user);
    setIsSpecialActionDialogOpen(true);
  };

  const handleExecuteZhaHuAction = (mainUserId: number, payouts: Payouts) => {
    const currentStateForHistory: Omit<GameState, 'action' | 'scoreChanges'> = {
      users: JSON.parse(JSON.stringify(users)),
      laCounts: JSON.parse(JSON.stringify(laCounts)),
      currentWinnerId,
      dealerId,
      consecutiveWins,
    };
  
    const mainUser = users.find(u => u.id === mainUserId);
    if (!mainUser) return;
  
    let totalPayout = 0;
    const scoreChanges: ScoreChange[] = [];
  
    Object.entries(payouts).forEach(([opponentId, amount]) => {
      const opponentIdNum = parseInt(opponentId, 10);
      if (amount > 0) {
        totalPayout += amount;
        scoreChanges.push({ userId: opponentIdNum, change: amount });
      }
    });
  
    scoreChanges.push({ userId: mainUserId, change: -totalPayout });
  
    const payoutDescriptions = Object.entries(payouts)
        .map(([id, amt]) => `${users.find(u=>u.id === parseInt(id))?.name}: ${amt}`)
        .join(', ');
    const actionDescription = `${mainUser.name} 炸胡, pays out: ${payoutDescriptions}`;

    const newHistory = saveStateToHistory(actionDescription, scoreChanges, currentStateForHistory);
  
    saveGameData({
      history: newHistory,
    });
  
    setIsSpecialActionDialogOpen(false);
  };


  const handleExecuteSpecialAction = (mainUserId: number, actionType: 'collect' | 'pay', amount: number) => {
    const currentStateForHistory: Omit<GameState, 'action' | 'scoreChanges'> = {
      users: JSON.parse(JSON.stringify(users)),
      laCounts: JSON.parse(JSON.stringify(laCounts)),
      currentWinnerId,
      dealerId,
      consecutiveWins,
    };
  
    const mainUser = users.find(u => u.id === mainUserId);
    if (!mainUser) return;
  
    const scoreChanges: ScoreChange[] = [];
    const opponentIds = users.filter(u => u.id !== mainUserId).map(u => u.id);
  
    let mainUserChange = 0;
    let actionDescription = '';
  
    if (actionType === 'collect') {
      mainUserChange = amount * opponentIds.length;
      opponentIds.forEach(id => scoreChanges.push({ userId: id, change: -amount }));
      actionDescription = `${mainUser.name} 收 ${amount} 番`;
    } else { // pay
      mainUserChange = -amount * opponentIds.length;
      opponentIds.forEach(id => scoreChanges.push({ userId: id, change: amount }));
      actionDescription = `${mainUser.name} 賠 ${amount} 番`;
    }
  
    scoreChanges.push({ userId: mainUserId, change: mainUserChange });
  
    const newHistory = saveStateToHistory(actionDescription, scoreChanges, currentStateForHistory);
  
    saveGameData({
      history: newHistory,
    });
  
    setIsSpecialActionDialogOpen(false);
  };

  const handleWin = (winnerId: number, currentDealerId: number, currentConsecutiveWins: number) => {
    if (winnerId === currentDealerId) {
      return { newDealerId: currentDealerId, newConsecutiveWins: currentConsecutiveWins + 1 };
    } else {
      const currentDealerIndex = users.findIndex(u => u.id === currentDealerId);
      const nextDealerIndex = (currentDealerIndex + 1) % users.length;
      return { newDealerId: users[nextDealerIndex].id, newConsecutiveWins: 1 };
    }
  };


  const updateLaCounts = (winnerId: number, loserIds: number[], currentLaCounts: LaCounts, currentWinnerId: number | null) => {
    const newLaCounts: LaCounts = winnerId === currentWinnerId ? { ...currentLaCounts } : {};

    if (!newLaCounts[winnerId]) {
      newLaCounts[winnerId] = {};
    }

    loserIds.forEach(loserId => {
      newLaCounts[winnerId][loserId] = (newLaCounts[winnerId]?.[loserId] || 0) + 1;
    });

    return newLaCounts;
  };


  const executeWinAction = (
    mainUserId: number,
    value: number,
    targetUserId?: number
  ) => {
    // Capture the state BEFORE any changes for the history log.
    const currentStateForHistory: Omit<GameState, 'action' | 'scoreChanges'> = {
        users: JSON.parse(JSON.stringify(users)),
        laCounts: JSON.parse(JSON.stringify(laCounts)),
        currentWinnerId,
        dealerId,
        consecutiveWins,
    };

    const isNewWinner = mainUserId !== currentWinnerId && currentWinnerId !== null;
    const currentWinner = users.find(u => u.id === mainUserId);
    if (isNewWinner && popOnNewWinner) {
        const previousWinner = users.find(u => u.id === currentWinnerId);
        if (previousWinner) {
            const hasScores = Object.values(previousWinner.winValues).some(score => score > 0);

            if (hasScores) {
                setScoresToReset({
                    previousWinnerName: previousWinner.name,
                    previousWinnerId: previousWinner.id,
                    currentWinnerName: currentWinner?.name || '',
                    currentWinnerId: mainUserId,
                    scores: previousWinner.winValues,
                });
                setIsResetScoresDialogOpen(true);
            }
        }
    }
    
    let finalUsers: UserData[];
    let actionDescription: string;
    let scoreChanges: ScoreChange[];
    let newLaCounts: LaCounts;

    if (targetUserId) {
        // "食胡" case
        const winner = users.find(u => u.id === mainUserId);
        const loser = users.find(u => u.id === targetUserId);
        actionDescription = `${winner?.name} 食胡 ${loser?.name} ${value}番`;

        let currentScore = value;
        const dealerBonus = 2 * consecutiveWins - 1;

        if (mainUserId === dealerId) {
            currentScore += dealerBonus;
        } else if (targetUserId === dealerId) {
            currentScore += dealerBonus;
        }

        let finalValue = currentScore;
        const previousWinner = users.find(u => u.id === currentWinnerId);

        if (previousWinner && previousWinner.id === mainUserId) {
            const previousScore = winner?.winValues[targetUserId] || 0;
            if (previousScore > 0) {
                const bonus = Math.round(previousScore * 0.5);
                finalValue = previousScore + bonus + currentScore;
            }
        }

        if (isNewWinner && previousWinner && targetUserId === previousWinner.id) {
            const previousScoreOnWinner = previousWinner.winValues[mainUserId] || 0;
            if (previousScoreOnWinner > 0) {
                finalValue = Math.floor(previousScoreOnWinner / 2) + currentScore;
            }
        }

        const changeAmount = finalValue - (users.find(u => u.id === mainUserId)?.winValues[targetUserId] || 0);
        scoreChanges = [
            { userId: mainUserId, change: changeAmount },
            { userId: targetUserId, change: -changeAmount },
        ];
        
        newLaCounts = updateLaCounts(mainUserId, [targetUserId], laCounts, currentWinnerId);

        finalUsers = users.map(user => {
            if (isNewWinner && user.id !== mainUserId) {
                return { ...user, winValues: {} };
            }
            return user;
        }).map(user => {
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

    } else {
        // "自摸" case
        const winner = users.find(u => u.id === mainUserId);
        actionDescription = `${winner?.name} 自摸 ${value}番`;
        const opponentIds = users.filter(u => u.id !== mainUserId).map(u => u.id);

        const isDealerWinning = mainUserId === dealerId;
        const dealerBonus = 2 * consecutiveWins - 1;

        const scoresToAdd: { [opponentId: number]: number } = {};
        let winnerTotalChange = 0;
        const currentScoreChanges: ScoreChange[] = [];
        const previousWinner = users.find(u => u.id === currentWinnerId);

        opponentIds.forEach(opponentId => {
            let currentScore = value;
            if (isDealerWinning) {
                currentScore += dealerBonus;
            } else if (opponentId === dealerId) {
                currentScore += dealerBonus;
            }

            let finalValue = currentScore;

            if (previousWinner && previousWinner.id === mainUserId) {
                const previousScore = winner?.winValues[opponentId] || 0;
                if (previousScore > 0) {
                    const bonus = Math.round(previousScore * 0.5);
                    finalValue = previousScore + bonus + currentScore;
                }
            } else if (isNewWinner && previousWinner && opponentId === previousWinner.id) {
                const previousScoreOnWinner = previousWinner.winValues[mainUserId] || 0;
                if (previousScoreOnWinner > 0) {
                    finalValue = Math.floor(previousScoreOnWinner / 2) + currentScore;
                }
            }
            
            const change = finalValue - (winner?.winValues[opponentId] || 0);
            scoresToAdd[opponentId] = finalValue;
            winnerTotalChange += change;
            currentScoreChanges.push({ userId: opponentId, change: -change });
        });
        currentScoreChanges.push({ userId: mainUserId, change: winnerTotalChange });
        scoreChanges = currentScoreChanges;

        newLaCounts = updateLaCounts(mainUserId, opponentIds, laCounts, currentWinnerId);
        
        finalUsers = users.map(user => {
            if (isNewWinner && user.id !== mainUserId) {
                return { ...user, winValues: {} };
            }
            return user;
        }).map(user => {
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
    }

    const { newDealerId, newConsecutiveWins } = handleWin(mainUserId, dealerId, consecutiveWins);
    
    setUsers(finalUsers);
    setLaCounts(newLaCounts);
    setCurrentWinnerId(mainUserId);
    setDealerId(newDealerId);
    setConsecutiveWins(newConsecutiveWins);
    
    const newHistory = saveStateToHistory(actionDescription, scoreChanges, currentStateForHistory);
    
    saveGameData({
      users: finalUsers,
      history: newHistory,
      dealerId: newDealerId,
      consecutiveWins: newConsecutiveWins,
      currentWinnerId: mainUserId,
      laCounts: newLaCounts,
    });


    setIsWinActionDialogOpen(false);
  };

  const handleSaveWinAction = (mainUserId: number, value: number, targetUserId?: number) => {
    executeWinAction(mainUserId, value, targetUserId);
  };

  const handleSaveUserNames = (updatedUsers: { id: number; name: string }[]) => {
    const newUsers = users.map((user) => {
      const updatedUser = updatedUsers.find((u) => u.id === user.id);
      return updatedUser ? { ...user, name: updatedUser.name } : user;
    });
    setUsers(newUsers);
    setIsRenameDialogOpen(false);
    saveGameData({ users: newUsers });
  };

  const handleSaveSeatChange = (newUsers: UserData[]) => {
    setUsers(newUsers);
    setIsSeatChangeDialogOpen(false);
    saveGameData({ users: newUsers });
  };

  const handleReset = () => {
    const newUsers = users.map(user => ({...user, winValues: {}}));
    const newHistory: GameState[] = [];
    const newDealerId = users[0]?.id || 1;
    const newConsecutiveWins = 1;
    const newCurrentWinnerId = null;
    const newLaCounts = {};

    setUsers(newUsers);
    setLaCounts(newLaCounts);
    setCurrentWinnerId(newCurrentWinnerId);
    setHistory(newHistory);
    setDealerId(newDealerId);
    setConsecutiveWins(newConsecutiveWins);

    saveGameData({
        users: newUsers,
        history: newHistory,
        dealerId: newDealerId,
        consecutiveWins: newConsecutiveWins,
        currentWinnerId: newCurrentWinnerId,
        laCounts: newLaCounts,
    });
  };

  const handleRestore = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      
      setUsers(lastState.users);
      setLaCounts(lastState.laCounts);
      setCurrentWinnerId(lastState.currentWinnerId);
      setDealerId(lastState.dealerId);
      setConsecutiveWins(lastState.consecutiveWins);
      setHistory(newHistory);

      saveGameData({
          users: lastState.users,
          history: newHistory,
          dealerId: lastState.dealerId,
          consecutiveWins: lastState.consecutiveWins,
          currentWinnerId: lastState.currentWinnerId,
          laCounts: lastState.laCounts,
      });

    }
  };


  const handleSurrender = (loserId: number) => {
    if (!currentWinnerId) return;
  
    const winner = users.find(u => u.id === currentWinnerId);
    const loser = users.find(u => u.id === loserId);
  
    if (!winner || !loser) return;
  
    const scoreToReset = winner.winValues[loserId] || 0;
    if (scoreToReset === 0) return;
  
    // Capture the state BEFORE any changes for the history log.
    const currentStateForHistory: Omit<GameState, 'action' | 'scoreChanges'> = {
      users: JSON.parse(JSON.stringify(users)),
      laCounts: JSON.parse(JSON.stringify(laCounts)),
      currentWinnerId,
      dealerId,
      consecutiveWins,
    };
  
    const newLaCounts = { ...laCounts };
    if (newLaCounts[currentWinnerId]) {
      newLaCounts[currentWinnerId][loserId] = 0;
    }
    setLaCounts(newLaCounts);
  
    const newUsers = users.map(user => {
      if (user.id === currentWinnerId) {
        const newWinValues = { ...user.winValues };
        newWinValues[loserId] = 0;
        return { ...user, winValues: newWinValues };
      }
      return user;
    });
    setUsers(newUsers);
  
    const actionDescription = `${loser.name} 投降 to ${winner.name}`;
    const newHistory = saveStateToHistory(actionDescription, [], currentStateForHistory);
  
    saveGameData({
      users: newUsers,
      history: newHistory,
      laCounts: newLaCounts,
    });
  
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

  const memoizedTableBody = useMemo(() => (
    <TableBody>
      {users.map((user) => {
        const isDealer = user.id === dealerId;
        return (
          <TableRow key={user.id} className={cn(isDealer && "bg-primary/10")}>
            <TableCell className="font-semibold text-foreground/90 align-top p-2">
              <div className="flex flex-col gap-2 items-start">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleSetDealer(user.id)} className={cn("flex items-center justify-center font-bold text-sm w-auto px-1 h-6 rounded-md hover:bg-primary/20 whitespace-nowrap", isDealer ? "bg-yellow-400 text-yellow-800" : "bg-gray-200 text-gray-500")}>
                      {isDealer && consecutiveWins > 1 ? `連${consecutiveWins-1}` : ''}莊
                    </button>
                    {isDealer && (
                      <button onClick={handleManualConsecutiveWin} className="flex items-center justify-center font-bold text-sm w-auto px-2 h-6 rounded-md bg-blue-200 text-blue-800 hover:bg-blue-300 whitespace-nowrap">
                        連莊
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary"/>
                    {user.name}
                  </div>
                </div>
                <div className="flex items-stretch gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenWinActionDialog(user)}>
                     食
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenSpecialActionDialog(user)}>
                     特別賞罰
                  </Button>
                </div>
                <div className="font-bold text-lg mt-1">
                    Total: {totalScores[user.id]?.toLocaleString() ?? 0}
                </div>
              </div>
            </TableCell>
            {users.map(opponent => (
                <TableCell key={opponent.id} className="font-semibold text-center text-green-600 text-base transition-all duration-300 p-2">
                    {(user.winValues[opponent.id] || 0).toLocaleString()}
                </TableCell>
            ))}
          </TableRow>
        );
      })}
    </TableBody>
  ), [users, totalScores, dealerId, consecutiveWins, currentWinnerId, laCounts]);

  const tableOpponentHeaders = useMemo(() => {
    return (
        users.map(user => {
            const laCount = currentWinnerId != null && laCounts[currentWinnerId]?.[user.id];
            const canSurrender = laCount >= 3;
            return (
              <TableHead key={user.id} className="text-center w-[120px] p-2">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div>{user.name}</div>
                    {laCount > 0 && (
                        <div className="text-red-500 font-bold">拉{laCount}</div>
                    )}
                    {canSurrender && (
                      <Button variant="destructive" size="sm" className="h-6 px-2" onClick={() => handleSurrender(user.id)}>
                        投降
                      </Button>
                    )}
                  </div>
              </TableHead>
            )
        })
    );
  }, [users, laCounts, currentWinnerId]);

  if (!isClient) {
    return null;
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-4 flex flex-col items-center gap-2">
            <Collapsible className="w-full">
                <div className="flex gap-2 flex-wrap justify-center">
                    <Button variant="outline" size="sm" onClick={() => setIsRenameDialogOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> 改名
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsSeatChangeDialogOpen(true)}>
                        <Shuffle className="mr-2 h-4 w-4" /> 換位
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRestore} disabled={history.length === 0}>
                        <HistoryIcon className="mr-2 h-4 w-4" /> 還原
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <RefreshCw className="mr-2 h-4 w-4" /> 重置
                    </Button>
                </div>
                <CollapsibleContent className="w-full">
                    <div className="flex gap-2 flex-wrap justify-center mt-2">
                        <Button variant="outline" size="sm" onClick={() => setIsHistoryDialogOpen(true)} disabled={history.length === 0} >
                            <List className="mr-2 h-4 w-4" /> 歷史記錄
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsPayoutDialogOpen(true)} disabled={history.length === 0}>
                            <DollarSign className="mr-2 h-4 w-4" /> 找數
                        </Button>
                        <Button variant={popOnNewWinner ? "default" : "outline"} size="sm" onClick={() => setPopOnNewWinner(p => !p)}>
                            <Zap className="mr-2 h-4 w-4" /> 模式：籌碼
                        </Button>
                    </div>
                </CollapsibleContent>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full">
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Toggle more actions</span>
                    </Button>
                </CollapsibleTrigger>
            </Collapsible>
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
          users={users}
          currentWinnerId={currentWinnerId}
          dealerId={dealerId}
          consecutiveWins={consecutiveWins}
          onSave={handleSaveWinAction}
        />
       )}
      {currentUserForWinAction && (
        <SpecialActionDialog
          isOpen={isSpecialActionDialogOpen}
          onClose={() => setIsSpecialActionDialogOpen(false)}
          mainUser={currentUserForWinAction}
          users={users}
          onSave={handleExecuteSpecialAction}
          onSaveZhaHu={handleExecuteZhaHuAction}
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
       <PayoutDialog
          isOpen={isPayoutDialogOpen}
          onClose={() => setIsPayoutDialogOpen(false)}
          users={users}
          totalScores={totalScores}
       />
    </main>
  );
}
