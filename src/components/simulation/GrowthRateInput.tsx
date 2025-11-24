"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GrowthRateInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function GrowthRateInput({
  label,
  value,
  onChange,
}: GrowthRateInputProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        step="0.1"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder="예: 10 (10% 성장)"
      />
      <p className="text-xs text-gray-500 mt-1">
        연간 성장률을 입력하세요. 음수도 가능합니다.
      </p>
    </div>
  );
}

