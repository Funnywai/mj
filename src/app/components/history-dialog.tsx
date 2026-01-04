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
            {history.slice().reverse().map((state, index) => (
              <div key={index} className="mb-4 p-2 border-b">
                <p className="font-semibold text-sm mb-2">
                  {history.length - index}. {state.action}
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {users.map(user => (
                        <TableHead key={user.id} className="text-center">{user.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
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
                            {isPositive ? `+${change}` : change}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
