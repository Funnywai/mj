'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserData {
  id: number;
  name: string;
}

interface WinActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mainUser: UserData;
  users: UserData[];
  onSave: (mainUserId: number, targetUserId: number, value: number) => void;
}

export function WinActionDialog({ isOpen, onClose, mainUser, users, onSave }: WinActionDialogProps) {
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTargetUserId('');
      setValue('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (targetUserId && value) {
      onSave(mainUser.id, parseInt(targetUserId, 10), parseInt(value, 10));
      onClose();
    }
  };

  if (!mainUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>食胡 - {mainUser.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Select User</Label>
            <div className="grid grid-cols-3 gap-2">
                {users.map(user => (
                    <Button
                        key={user.id}
                        variant={targetUserId === user.id.toString() ? 'default' : 'outline'}
                        onClick={() => setTargetUserId(user.id.toString())}
                    >
                        {user.name}
                    </Button>
                ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value-input">Enter Number</Label>
            <Input
              id="value-input"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter a number"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
