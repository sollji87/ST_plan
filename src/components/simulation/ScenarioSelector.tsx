"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ScenarioSelectorProps {
  label: string;
  value: "conservative" | "neutral" | "aggressive";
  onChange: (value: "conservative" | "neutral" | "aggressive") => void;
}

export function ScenarioSelector({
  label,
  value,
  onChange,
}: ScenarioSelectorProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value as "conservative" | "neutral" | "aggressive"
          )
        }
      >
        <option value="conservative">보수적 (90%)</option>
        <option value="neutral">중립 (100%)</option>
        <option value="aggressive">공격적 (110%)</option>
      </Select>
      <p className="text-xs text-gray-500 mt-1">
        시나리오에 따라 기준값이 조정됩니다.
      </p>
    </div>
  );
}

