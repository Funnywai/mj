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

interface ZimoActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mainUser: UserData;
  onSave: (mainUserId: number, value: number) => void;
}

export function ZimoActionDialog({ isOpen, onClose, mainUser, onSave }: ZimoActionDialogProps) {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (value) {
      onSave(mainUser.id, parseInt(value, 10));
      onClose();
    }
  };

  if (!mainUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>自摸 - {mainUser.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
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
