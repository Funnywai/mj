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

interface OutputData {
  id: number;
  name: string;
  inputs: (number | string)[];
}

interface UserInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mainUserId: number;
  output: OutputData;
  onSave: (mainUserId: number, outputId: number, inputs: (number | string)[]) => void;
}

export function UserInputDialog({ isOpen, onClose, mainUserId, output, onSave }: UserInputDialogProps) {
  const [inputs, setInputs] = useState<(number | string)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setInputs(output.inputs);
    }
  }, [isOpen, output]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSave = () => {
    onSave(mainUserId, output.id, inputs);
  };

  if (!output) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Data for {output.name}</DialogTitle>
          <DialogDescription>
            Enter the 6 numerical values for this output row.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="grid grid-cols-3 items-center gap-2" key={index}>
                  <Label htmlFor={`input-${index}`} className="text-right col-span-1">
                    Input {index + 1}
                  </Label>
                  <Input
                    id={`input-${index}`}
                    type="number"
                    value={inputs[index] ?? ''}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className="col-span-2"
                  />
                </div>
              ))}
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
