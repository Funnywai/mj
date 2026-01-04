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
import { Separator } from '@/components/ui/separator';

interface SubUserData {
  id: number;
  name: string;
  inputs: (number | string)[];
}

interface OutputData {
  id: number;
  name: string;
  subUsers: SubUserData[];
}

interface UserInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mainUserId: number;
  output: OutputData;
  onSave: (mainUserId: number, outputId: number, inputs: (number | string)[]) => void;
}

export function UserInputDialog({ isOpen, onClose, mainUserId, output, onSave }: UserInputDialogProps) {
  const [allInputs, setAllInputs] = useState<(number | string)[]>([]);

  useEffect(() => {
    if (isOpen) {
      const flattenedInputs = output.subUsers.flatMap(su => su.inputs);
      setAllInputs(flattenedInputs);
    }
  }, [isOpen, output]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...allInputs];
    newInputs[index] = value;
    setAllInputs(newInputs);
  };

  const handleSave = () => {
    onSave(mainUserId, output.id, allInputs);
  };

  if (!output) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enter Data for {output.name}</DialogTitle>
          <DialogDescription>
            Enter the 18 numerical values for this output row.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {output.subUsers.map((subUser, subUserIndex) => (
            <div key={subUser.id}>
              <h4 className="font-semibold text-lg mb-3 text-primary">{subUser.name}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, inputIndex) => {
                  const overallIndex = subUserIndex * 6 + inputIndex;
                  return (
                    <div className="grid grid-cols-3 items-center gap-2" key={overallIndex}>
                      <Label htmlFor={`input-${overallIndex}`} className="text-right col-span-1">
                        Input {inputIndex + 1}
                      </Label>
                      <Input
                        id={`input-${overallIndex}`}
                        type="number"
                        value={allInputs[overallIndex] ?? ''}
                        onChange={(e) => handleInputChange(overallIndex, e.target.value)}
                        className="col-span-2"
                      />
                    </div>
                  );
                })}
              </div>
              {subUserIndex < output.subUsers.length - 1 && <Separator className="mt-6" />}
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
