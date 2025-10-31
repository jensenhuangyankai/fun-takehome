"use client";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface UsdInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function UsdInput({ value, onChange }: UsdInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="usd-amount">USD Amount</Label>
      <Input
        id="usd-amount"
        type="number"
        placeholder="Enter USD amount"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min="0"
        step="0.01"
        className="text-lg"
      />
    </div>
  );
}
