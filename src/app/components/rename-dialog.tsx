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

interface UserData {
  id: number;
  name: string;
}

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserData[];
  onSave: (users: { id: number; name: string }[]) => void;
}

export function RenameDialog({ isOpen, onClose, users, onSave }: RenameDialogProps) {
  const [userNames, setUserNames] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setUserNames(users.map(u => ({ id: u.id, name: u.name })));
    }
  }, [isOpen, users]);

  const handleNameChange = (id: number, name: string) => {
    setUserNames(prev => prev.map(u => (u.id === id ? { ...u, name } : u)));
  };

  const handleSave = () => {
    onSave(userNames);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>改名</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {userNames.map(user => (
            <div className="grid grid-cols-4 items-center gap-4" key={user.id}>
              <Label htmlFor={`user-name-${user.id}`} className="text-right">
                User {user.id}
              </Label>
              <Input
                id={`user-name-${user.id}`}
                value={user.name}
                onChange={(e) => handleNameChange(user.id, e.target.value)}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" onClick={handleSave}>
            確定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
