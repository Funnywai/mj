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

interface SubUserData {
  id: number;
  name: string;
  inputs: (number | string)[];
}

interface UserInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mainUserId: number;
  outputId: number;
  subUser: SubUserData;
  onSave: (mainUserId: number, outputId: number, subUserId: number, inputs: (number | string)[]) => void;
}

export function UserInputDialog({ isOpen, onClose, mainUserId, outputId, subUser, onSave }: UserInputDialogProps) {
  const [inputs, setInputs] = useState<(number | string)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setInputs([...subUser.inputs]);
    }
  }, [isOpen, subUser.inputs]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSave = () => {
    onSave(mainUserId, outputId, subUser.id, inputs);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Data for {subUser.name}</DialogTitle>
          <DialogDescription>
            Enter the six numerical values for this user.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {inputs.map((value, index) => (
            <div className="grid grid-cols-3 items-center gap-2" key={index}>
              <Label htmlFor={`input-${index}`} className="text-right col-span-1">
                Input {index + 1}
              </Label>
              <Input
                id={`input-${index}`}
                type="number"
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="col-span-2"
              />
            </div>
          ))}
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
