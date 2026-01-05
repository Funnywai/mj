'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserData {
    id: number;
    name: string;
}

interface ScoresToReset {
  previousWinnerName: string;
  previousWinnerId: number;
  currentWinnerName: string;
  scores: { [opponentId: number]: number };
}

interface ResetScoresDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scoresToReset: ScoresToReset | null;
  users: UserData[];
}

export function ResetScoresDialog({ isOpen, onClose, scoresToReset, users }: ResetScoresDialogProps) {
  if (!scoresToReset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{scoresToReset.previousWinnerName} 收 {scoresToReset.currentWinnerName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Winner</TableHead>
                        {users.map(user => (
                            <TableHead key={user.id} className="text-center">{user.name}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-semibold">{scoresToReset.previousWinnerName}</TableCell>
                        {users.map(user => (
                            <TableCell key={user.id} className="text-center font-semibold text-destructive">
                                {scoresToReset.previousWinnerId === user.id ? '-' : (scoresToReset.scores[user.id] || 0).toLocaleString()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
