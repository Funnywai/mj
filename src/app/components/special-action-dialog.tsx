'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
}

interface Payouts {
  [opponentId: number]: number;
}

interface SpecialActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mainUser: UserData;
  users: UserData[];
  onSave: (mainUserId: number, action: 'collect' | 'pay', amount: number) => void;
  onSaveZhaHu: (mainUserId: number, payouts: Payouts) => void;
}

export function SpecialActionDialog({ isOpen, onClose, mainUser, users, onSave, onSaveZhaHu }: SpecialActionDialogProps) {
  const [amount, setAmount] = useState('5');
  const [isZhaHuMode, setIsZhaHuMode] = useState(false);
  const [payouts, setPayouts] = useState<Payouts>({});

  useEffect(() => {
    if (isOpen) {
      setIsZhaHuMode(false);
      setAmount('5');
      setPayouts({});
    }
  }, [isOpen]);

  if (!mainUser) return null;

  const opponents = users.filter(u => u.id !== mainUser.id);

  const handleSave = (action: 'collect' | 'pay') => {
    const parsedAmount = parseInt(amount, 10);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      onSave(mainUser.id, action, parsedAmount);
      onClose();
    }
  };

  const handleZhaHuSave = () => {
    const allPayoutsValid = opponents.every(opp => {
      const value = payouts[opp.id];
      return value !== undefined && value >= 0;
    });

    if (allPayoutsValid) {
      onSaveZhaHu(mainUser.id, payouts);
      onClose();
    } else {
      // Maybe show a toast or error message
      console.error("Please enter a valid payout for every user.");
    }
  };


  const handleNumpadClick = (num: string) => {
    setAmount(prev => prev + num);
  };

  const handleClear = () => {
    setAmount('');
  };

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handlePayoutChange = (opponentId: number, value: string) => {
    const parsedValue = parseInt(value, 10);
    setPayouts(prev => ({
        ...prev,
        [opponentId]: isNaN(parsedValue) ? 0 : parsedValue,
    }));
  };

  const numpadButtons = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>特別賞罰</DialogTitle>
        </DialogHeader>

        {isZhaHuMode ? (
            <div className="space-y-4">
                <DialogDescription>
                    Enter the amount {mainUser.name} has to pay each player for the false win.
                </DialogDescription>
                <div className="space-y-3">
                    {opponents.map(opponent => (
                        <div key={opponent.id} className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor={`payout-${opponent.id}`} className="text-right">
                                {opponent.name}
                            </Label>
                            <Input
                                id={`payout-${opponent.id}`}
                                type="number"
                                inputMode="numeric"
                                value={payouts[opponent.id] ?? ''}
                                onChange={(e) => handlePayoutChange(opponent.id, e.target.value)}
                                placeholder="Payout amount"
                                className="col-span-2"
                            />
                        </div>
                    ))}
                </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsZhaHuMode(false)}>
                        Back
                    </Button>
                    <Button type="submit" onClick={handleZhaHuSave}>
                        Confirm Payout
                    </Button>
                </DialogFooter>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="amount-input">番數:</Label>
                    <Input
                    id="amount-input"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter a number"
                    className="text-center text-lg h-12"
                    />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                    {numpadButtons.map(num => (
                        <Button key={num} variant="outline" size="lg" onClick={() => handleNumpadClick(num)}>
                        {num}
                        </Button>
                    ))}
                    <Button variant="outline" size="lg" onClick={handleClear}>
                        Clear
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => handleNumpadClick('0')}>
                        0
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleBackspace}>
                        <X className="h-5 w-5" />
                    </Button>
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <Button size="lg" onClick={() => handleSave('collect')}>
                        收
                    </Button>
                    <Button size="lg" variant="destructive" onClick={() => handleSave('pay')}>
                        賠
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => setIsZhaHuMode(true)}>
                        炸胡
                    </Button>
                </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
