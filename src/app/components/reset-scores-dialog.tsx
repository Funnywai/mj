'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  winnerName: string;
  winnerId: number;
  scores: { [opponentId: number]: number };
}

interface ResetScoresDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scoresToReset: ScoresToReset | null;
  users: UserData[];
}

export function ResetScoresDialog({ isOpen, onClose, scoresToReset, users }: ResetScoresDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
    
  if (!scoresToReset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Winner!</DialogTitle>
          <DialogDescription>
            A new player has won. The previous winner's scores are being reset.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <h4 className="mb-2 font-semibold text-center">Scores from {scoresToReset.winnerName} have been cleared:</h4>
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
                        <TableCell className="font-semibold">{scoresToReset.winnerName}</TableCell>
                        {users.map(user => (
                            <TableCell key={user.id} className="text-center font-semibold text-destructive">
                                {scoresToReset.winnerId === user.id ? '-' : (scoresToReset.scores[user.id] || 0).toLocaleString()}
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
