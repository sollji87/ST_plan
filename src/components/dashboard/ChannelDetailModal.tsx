"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChannelData } from "./SummaryIncomeStatement";

interface ChannelDetailModalProps {
  period: string;
  channels: ChannelData[];
  onClose: () => void;
  onChannelUpdate?: (period: string, channelName: string, actualSales: number) => void;
  readOnly?: boolean; // 읽기 전용 모드 (과거 실적 조회용)
  viewType?: 'salesTag' | 'actualSales' | 'shipmentPrice'; // 어떤 항목을 클릭했는지
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value / 1000)); // 천원 단위
}

function formatPercent(value: number, base: number): string {
  if (base === 0) return "-";
  return `${((value / base) * 100).toFixed(1)}%`;
}

export function ChannelDetailModal({
  period,
  channels,
  onClose,
  onChannelUpdate,
  readOnly = false,
  viewType = 'actualSales',
}: ChannelDetailModalProps) {
  const [editingChannel, setEditingChannel] = useState<{
    name: string;
    actualSales: number;
  } | null>(null);

  const handleEditClick = (channel: ChannelData) => {
    setEditingChannel({
      name: channel.name,
      actualSales: channel.actualSales || channel.salesTag * 0.9, // 기본값 설정
    });
  };

  const handleSave = () => {
    if (editingChannel && onChannelUpdate) {
      onChannelUpdate(period, editingChannel.name, editingChannel.actualSales);
    }
    setEditingChannel(null);
  };

  const totalSalesTag = channels.reduce((sum, ch) => sum + ch.salesTag, 0);
  const totalActualSales = channels.reduce(
    (sum, ch) => sum + (editingChannel && editingChannel.name === ch.name ? editingChannel.actualSales : ch.actualSales),
    0
  );
  const totalShipmentPrice = channels.reduce(
    (sum, ch) => sum + ch.shipmentPrice,
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-[#eff6ff] border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-[#1a1a1a]">
              채널별 상세 - {period}년 ({viewType === 'salesTag' ? '판매TAG' : viewType === 'actualSales' ? '실판가' : '출고가(V+)'})
            </CardTitle>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-[#f5f5f0]">
                  <th className="text-left p-3 font-bold text-[#1a1a1a]">채널</th>
                  <th className="text-right p-3 font-bold text-[#1a1a1a]">판매TAG</th>
                  <th className="text-right p-3 font-bold text-[#1a1a1a]">실판가</th>
                  <th className="text-right p-3 font-bold text-[#1a1a1a]">출고가(V+)</th>
                  {!readOnly && (
                    <th className="text-center p-3 font-bold text-[#1a1a1a]">작업</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {channels.map((channel, idx) => {
                  const isEditing = editingChannel?.name === channel.name;
                  const displayActualSales =
                    isEditing && editingChannel
                      ? editingChannel.actualSales
                      : (channel.actualSales || channel.salesTag * 0.9);

                  return (
                    <tr
                      key={idx}
                      className={`border-b border-gray-200 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-3 font-medium text-gray-700">{channel.name}</td>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(channel.salesTag)}
                      </td>
                      <td className="text-right p-3">
                        {readOnly ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-gray-700">
                              {formatNumber(displayActualSales)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({formatPercent(displayActualSales, channel.salesTag)})
                            </span>
                          </div>
                        ) : isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={displayActualSales || ""}
                              onChange={(e) =>
                                setEditingChannel({
                                  name: channel.name,
                                  actualSales: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-32 text-right"
                            />
                            <Button
                              size="sm"
                              onClick={handleSave}
                              className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
                            >
                              저장
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingChannel(null)}
                            >
                              취소
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-gray-700">
                              {formatNumber(displayActualSales)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({formatPercent(displayActualSales, channel.salesTag)})
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(channel)}
                              className="ml-2"
                            >
                              수정
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(channel.shipmentPrice)}
                        <span className="text-xs text-gray-500 ml-2">
                          ({formatPercent(channel.shipmentPrice, displayActualSales)})
                        </span>
                      </td>
                      {!readOnly && (
                        <td className="text-center p-3">
                          {!isEditing && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(channel)}
                              className="text-[#1e3a8a] border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
                            >
                              수정
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {/* 합계 행 */}
                <tr className="border-t-2 border-gray-400 bg-[#f0f8ff] font-bold">
                  <td className="p-3 text-[#1a1a1a]">합계</td>
                  <td className="text-right p-3 text-[#1a1a1a]">
                    {formatNumber(totalSalesTag)}
                  </td>
                  <td className="text-right p-3 text-[#1e3a8a]">
                    {formatNumber(totalActualSales)}
                    <span className="text-xs ml-2">
                      ({formatPercent(totalActualSales, totalSalesTag)})
                    </span>
                  </td>
                  <td className="text-right p-3 text-[#1a1a1a]">
                    {formatNumber(totalShipmentPrice)}
                    <span className="text-xs text-gray-500 ml-2">
                      ({formatPercent(totalShipmentPrice, totalActualSales)})
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="text-center p-3">-</td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

