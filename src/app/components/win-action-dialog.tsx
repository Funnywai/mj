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
  onSave: (mainUserId: number, value: number, targetUserId?: number) => void;
}

export function WinActionDialog({ isOpen, onClose, mainUser, users, onSave }: WinActionDialogProps) {
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [isZimo, setIsZimo] = useState(false);
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTargetUserId(null);
      setIsZimo(false);
      setValue('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (value && (targetUserId || isZimo)) {
      onSave(mainUser.id, parseInt(value, 10), isZimo ? undefined : parseInt(targetUserId!, 10));
      onClose();
    }
  };

  const handleUserSelect = (userId: string) => {
    setTargetUserId(userId);
    setIsZimo(false);
  };
  
  const handleZimoSelect = () => {
    setIsZimo(true);
    setTargetUserId(null);
  };

  if (!mainUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>食 - {mainUser.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Select Action</Label>
            <div className="grid grid-cols-4 gap-2">
                {users.map(user => (
                    <Button
                        key={user.id}
                        variant={targetUserId === user.id.toString() ? 'default' : 'outline'}
                        onClick={() => handleUserSelect(user.id.toString())}
                    >
                        {user.name}
                    </Button>
                ))}
                 <Button
                    key="zimo"
                    variant={isZimo ? 'default' : 'outline'}
                    onClick={handleZimoSelect}
                >
                    自摸
                </Button>
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
