'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ScoreChange } from '@/app/page';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface UserData {
  id: number;
  name: string;
}

interface GameState {
  action: string;
  scoreChanges: ScoreChange[];
}

interface HistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameState[];
  users: UserData[];
}

export function HistoryDialog({ isOpen, onClose, history, users }: HistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Game History</DialogTitle>
          <DialogDescription>
            A log of all scoring events in the current game.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border">
          <div className="p-4">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left w-[200px]">Action</TableHead>
                    {users.map(user => (
                      <TableHead key={user.id} className="text-center">{user.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.slice().reverse().map((state, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-semibold">{state.action}</TableCell>
                      {users.map(user => {
                        const change = state.scoreChanges.find(sc => sc.userId === user.id)?.change ?? 0;
                        const isPositive = change > 0;
                        const isNegative = change < 0;
                        return (
                          <TableCell
                            key={user.id}
                            className={cn(
                              "text-center font-semibold",
                              isPositive && "text-green-600",
                              isNegative && "text-red-600"
                            )}
                          >
                            {isPositive ? `+${change}` : (change !== 0 ? change : '-')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
