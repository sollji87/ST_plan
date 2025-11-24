"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ChannelInputModalProps {
  period: string;
  channelName: string;
  currentRevenue: number;
  currentActualSales?: number;
  onSave: (period: string, channelName: string, actualSales: number) => void;
  onClose: () => void;
}

export function ChannelInputModal({
  period,
  channelName,
  currentRevenue,
  currentActualSales,
  onSave,
  onClose,
}: ChannelInputModalProps) {
  const [actualSales, setActualSales] = useState<number>(currentActualSales || currentRevenue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(period, channelName, actualSales);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border border-gray-200 shadow-xl">
        <CardHeader className="bg-[#eff6ff] border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-[#1a1a1a]">
            실판매액 입력
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600">기간</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-[#1a1a1a] font-medium">
                {period}
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-gray-600">채널</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-[#1a1a1a] font-medium">
                {channelName}
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-600">예상 매출</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-gray-600">
                {new Intl.NumberFormat("ko-KR", {
                  style: "currency",
                  currency: "KRW",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(currentRevenue)}
              </div>
            </div>

            <div>
              <Label htmlFor="actual-sales" className="text-sm font-medium text-[#1a1a1a]">
                실판매액 (원) *
              </Label>
              <Input
                id="actual-sales"
                type="number"
                value={actualSales || ""}
                onChange={(e) => setActualSales(parseFloat(e.target.value) || 0)}
                placeholder="실제 판매액을 입력하세요"
                className="mt-1"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
              >
                저장
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

