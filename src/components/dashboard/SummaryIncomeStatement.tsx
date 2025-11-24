"use client";

import { useState } from "react";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface ChannelData {
  name: string;
  salesTag: number; // 판매TAG
  actualSales: number; // 실판가
  shipmentPrice: number; // 출고가(V+)
}

export interface SummaryIncomeStatementData {
  period: string; // "2023", "2024", "2025" 등
  endingInventory: number; // 기말재고택금액
  purchaseOrder: number; // 발주금액
  totalSalesTag: number; // 판매TAG 합계
  totalActualSales: number; // 실판가 합계
  totalShipmentPrice: number; // 출고가(V+) 소계
  salesLessVAT: number; // 부가세차감(출고)매출
  cogs: number; // 매출원가
  grossProfit: number; // 매출총이익
  directCosts: number; // 직접비 소계
  directProfit: number; // 직접이익
  advertisingExpense: number; // 광고선전비
  personnelExpense: number; // 인건비
  otherOperatingExpense: number; // 기타영업비 소계
  ownLeaseFee: number; // 자가임차료
  commonCostAllocation: number; // 공통비 배부
  totalOperatingExpense: number; // 영업비 합계
  operatingProfit: number; // 영업이익
  channels?: ChannelData[]; // 채널별 상세 데이터
}

interface SummaryIncomeStatementProps {
  data: SummaryIncomeStatementData[];
  title?: string;
  onChannelUpdate?: (period: string, channelName: string, actualSales: number) => void;
  readOnly?: boolean; // 읽기 전용 모드 (과거 실적 조회용)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value / 1000)); // 천원 단위
}

function formatPercent(value: number, base: number): string {
  if (base === 0) return "-";
  return `${((value / base) * 100).toFixed(1)}%`;
}

export function SummaryIncomeStatement({
  data,
  title = "요약 손익계산서",
  onChannelUpdate,
  readOnly = false,
}: SummaryIncomeStatementProps) {
  // 드릴다운 상태 관리: { "year-rowType": true/false }
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (year: string, rowType: string) => {
    const key = `${year}-${rowType}`;
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 모든 행 접기/펼치기
  const collapseAll = () => {
    setExpandedRows({});
  };

  const expandAll = () => {
    const allKeys: Record<string, boolean> = {};
    const rowTypes: Array<'salesTag' | 'actualSales' | 'shipmentPrice' | 'cogs' | 'directCosts' | 'otherOperatingExpense'> = 
      ['salesTag', 'actualSales', 'shipmentPrice', 'cogs', 'directCosts', 'otherOperatingExpense'];
    
    years.forEach((year) => {
      rowTypes.forEach((rowType) => {
        const key = `${year}-${rowType}`;
        // 채널 데이터가 있는 경우에만 확장 가능
        if (rowType === 'salesTag' || rowType === 'actualSales' || rowType === 'shipmentPrice') {
          if (yearlyTotals[year].channels && yearlyTotals[year].channels!.length > 0) {
            allKeys[key] = true;
          }
        } else {
          // 매출원가, 직접비, 기타영업비는 항상 확장 가능
          allKeys[key] = true;
        }
      });
    });
    
    setExpandedRows(allKeys);
  };

  // 연도별 합계 계산 및 채널 데이터 합산
  console.log("SummaryIncomeStatement data:", data);
  const yearlyTotals = data.reduce((acc, item) => {
    const year = item.period.split("-")[0];
    if (!acc[year]) {
      acc[year] = {
        period: year,
        endingInventory: 0,
        purchaseOrder: 0,
        totalSalesTag: 0,
        totalActualSales: 0,
        totalShipmentPrice: 0,
        salesLessVAT: 0,
        cogs: 0,
        grossProfit: 0,
        directCosts: 0,
        directProfit: 0,
        advertisingExpense: 0,
        personnelExpense: 0,
        otherOperatingExpense: 0,
        ownLeaseFee: 0,
        commonCostAllocation: 0,
        totalOperatingExpense: 0,
        operatingProfit: 0,
        channels: [] as ChannelData[],
      };
    }
    acc[year].endingInventory += item.endingInventory;
    acc[year].purchaseOrder += item.purchaseOrder;
    acc[year].totalSalesTag += item.totalSalesTag;
    acc[year].totalActualSales += item.totalActualSales;
    acc[year].totalShipmentPrice += item.totalShipmentPrice;
    acc[year].salesLessVAT += item.salesLessVAT;
    acc[year].cogs += item.cogs;
    acc[year].grossProfit += item.grossProfit;
    acc[year].directCosts += item.directCosts;
    acc[year].directProfit += item.directProfit;
    acc[year].advertisingExpense += item.advertisingExpense;
    acc[year].personnelExpense += item.personnelExpense;
    acc[year].otherOperatingExpense += item.otherOperatingExpense;
    acc[year].ownLeaseFee += item.ownLeaseFee;
    acc[year].commonCostAllocation += item.commonCostAllocation;
    acc[year].totalOperatingExpense += item.totalOperatingExpense;
    acc[year].operatingProfit += item.operatingProfit;
    
    // 채널 데이터 합산
    if (item.channels && item.channels.length > 0) {
      if (!acc[year].channels) {
        acc[year].channels = [];
      }
      item.channels.forEach((channel) => {
        const existingChannel = acc[year].channels!.find((ch) => ch.name === channel.name);
        if (existingChannel) {
          existingChannel.salesTag += channel.salesTag;
          existingChannel.actualSales = (existingChannel.actualSales || 0) + (channel.actualSales || channel.salesTag * 0.9);
          existingChannel.shipmentPrice += channel.shipmentPrice;
        } else {
          acc[year].channels!.push({
            name: channel.name,
            salesTag: channel.salesTag,
            actualSales: channel.actualSales || channel.salesTag * 0.9,
            shipmentPrice: channel.shipmentPrice,
          });
        }
      });
    }
    return acc;
  }, {} as Record<string, SummaryIncomeStatementData & { channels?: ChannelData[] }>);

  const years = Object.keys(yearlyTotals).sort();

  // 드릴다운 행 렌더링 헬퍼 함수 (각 행 타입별로 한 번만 호출)
  const renderDrilldownRow = (
    rowType: 'salesTag' | 'actualSales' | 'shipmentPrice' | 'cogs' | 'directCosts' | 'otherOperatingExpense',
    label: string,
    isBold: boolean = false
  ) => {
    // 모든 연도 중 하나라도 확장되어 있는지 확인
    const anyExpanded = years.some((y) => expandedRows[`${y}-${rowType}`]);
    
    return (
      <>
        <tr className={`border-b ${isBold ? 'border-b-2 border-gray-400 bg-gray-50' : 'border-gray-200'} hover:bg-gray-50`}>
          <td className={`p-3 ${isBold ? 'font-bold' : 'font-medium'} text-[#1a1a1a]`}>
            {label}
          </td>
          {years.map((y) => {
            const cellKey = `${y}-${rowType}`;
            const cellExpanded = expandedRows[cellKey] || false;
            const cellHasData = rowType === 'salesTag' || rowType === 'actualSales' || rowType === 'shipmentPrice'
              ? (yearlyTotals[y].channels && yearlyTotals[y].channels!.length > 0)
              : true;
            
            let displayValue = 0;
            const totals = yearlyTotals[y];
            switch (rowType) {
              case 'salesTag':
                displayValue = totals.totalSalesTag;
                break;
              case 'actualSales':
                displayValue = totals.totalActualSales;
                break;
              case 'shipmentPrice':
                displayValue = totals.totalShipmentPrice;
                break;
              case 'cogs':
                displayValue = totals.cogs;
                break;
              case 'directCosts':
                displayValue = totals.directCosts;
                break;
              case 'otherOperatingExpense':
                displayValue = totals.otherOperatingExpense;
                break;
            }

            const yearIndex = years.indexOf(y);
            const prevYear = yearIndex > 0 ? years[yearIndex - 1] : null;
            let yoyPercent: number | null = null;
            
            if (prevYear) {
              let prevValue = 0;
              switch (rowType) {
                case 'salesTag':
                  prevValue = yearlyTotals[prevYear].totalSalesTag;
                  break;
                case 'actualSales':
                  prevValue = yearlyTotals[prevYear].totalActualSales;
                  break;
                case 'shipmentPrice':
                  prevValue = yearlyTotals[prevYear].totalShipmentPrice;
                  break;
                case 'cogs':
                  prevValue = yearlyTotals[prevYear].cogs;
                  break;
                case 'directCosts':
                  prevValue = yearlyTotals[prevYear].directCosts;
                  break;
                case 'otherOperatingExpense':
                  prevValue = yearlyTotals[prevYear].otherOperatingExpense;
                  break;
              }
              if (prevValue > 0) {
                yoyPercent = ((displayValue - prevValue) / prevValue) * 100;
              }
            }

            return (
              <React.Fragment key={y}>
                <td className={`text-right p-3 ${isBold ? 'font-bold' : ''}`}>
                  {cellHasData ? (
                    <span
                      className={`cursor-pointer hover:text-[#1e3a8a] hover:underline hover:font-bold transition-colors ${
                        cellExpanded ? 'text-[#1e3a8a] font-bold' : ''
                      }`}
                      onClick={() => {
                        toggleRow(y, rowType);
                      }}
                      title="클릭하여 상세 보기"
                    >
                      {formatNumber(displayValue)}
                    </span>
                  ) : (
                    <span>{formatNumber(displayValue)}</span>
                  )}
                </td>
                <td className="text-right p-3 text-gray-500 text-xs">
                  {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                </td>
              </React.Fragment>
            );
          })}
        </tr>
        {/* 드릴다운 상세 행 */}
        {(() => {
          // 하나라도 확장되어 있는지 확인
          const anyExpanded = years.some((y) => {
            const cellKey = `${y}-${rowType}`;
            return expandedRows[cellKey] || false;
          });

          if (!anyExpanded) return null;

          if (rowType === 'salesTag' || rowType === 'actualSales' || rowType === 'shipmentPrice') {
            // 모든 연도에서 고유한 채널 이름 수집
            const allChannelNames = new Set<string>();
            years.forEach((y) => {
              const yTotals = yearlyTotals[y];
              yTotals.channels?.forEach((ch) => {
                allChannelNames.add(ch.name);
              });
            });

            const uniqueChannelNames = Array.from(allChannelNames);

            return (
              <>
                {uniqueChannelNames.map((channelName) => (
                  <tr key={`${rowType}-${channelName}`} className="bg-blue-50 border-b border-gray-200">
                    <td className="p-3 pl-8 text-sm text-gray-600">{channelName}</td>
                    {years.map((year) => {
                      const yearTotals = yearlyTotals[year];
                      const yearChannel = yearTotals.channels?.find((ch) => ch.name === channelName);
                      const cellKey = `${year}-${rowType}`;
                      const cellExpanded = expandedRows[cellKey] || false;
                      
                      let channelValue = 0;
                      if (cellExpanded && yearChannel) {
                        switch (rowType) {
                          case 'salesTag':
                            channelValue = yearChannel.salesTag;
                            break;
                          case 'actualSales':
                            channelValue = yearChannel.actualSales;
                            break;
                          case 'shipmentPrice':
                            channelValue = yearChannel.shipmentPrice;
                            break;
                        }
                      }
                      return (
                        <React.Fragment key={year}>
                          <td className="text-right p-3 text-sm text-gray-600">
                            {cellExpanded ? formatNumber(channelValue) : '-'}
                          </td>
                          <td className="text-right p-3 text-sm text-gray-400">-</td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </>
            );
          } else if (rowType === 'cogs') {
            // 하나라도 확장되어 있으면 하위 항목 표시
            return (
              <>
                <tr className="bg-blue-50 border-b border-gray-200">
                  <td className="p-3 pl-8 text-sm text-gray-600">상품원가</td>
                  {years.map((year) => {
                    const cellKey = `${year}-${rowType}`;
                    const cellExpanded = expandedRows[cellKey] || false;
                    return (
                      <React.Fragment key={year}>
                        <td className="text-right p-3 text-sm text-gray-600">
                          {cellExpanded ? formatNumber(yearlyTotals[year].cogs * 0.8) : '-'}
                        </td>
                        <td className="text-right p-3 text-sm text-gray-400">-</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr className="bg-blue-50 border-b border-gray-200">
                  <td className="p-3 pl-8 text-sm text-gray-600">기타원가</td>
                  {years.map((year) => {
                    const cellKey = `${year}-${rowType}`;
                    const cellExpanded = expandedRows[cellKey] || false;
                    return (
                      <React.Fragment key={year}>
                        <td className="text-right p-3 text-sm text-gray-600">
                          {cellExpanded ? formatNumber(yearlyTotals[year].cogs * 0.2) : '-'}
                        </td>
                        <td className="text-right p-3 text-sm text-gray-400">-</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </>
            );
          } else if (rowType === 'directCosts') {
            return (
              <>
                <tr className="bg-blue-50 border-b border-gray-200">
                  <td className="p-3 pl-8 text-sm text-gray-600">임대료</td>
                  {years.map((year) => {
                    const cellKey = `${year}-${rowType}`;
                    const cellExpanded = expandedRows[cellKey] || false;
                    return (
                      <React.Fragment key={year}>
                        <td className="text-right p-3 text-sm text-gray-600">
                          {cellExpanded ? formatNumber(yearlyTotals[year].directCosts * 0.5) : '-'}
                        </td>
                        <td className="text-right p-3 text-sm text-gray-400">-</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr className="bg-blue-50 border-b border-gray-200">
                  <td className="p-3 pl-8 text-sm text-gray-600">인건비(직접)</td>
                  {years.map((year) => {
                    const cellKey = `${year}-${rowType}`;
                    const cellExpanded = expandedRows[cellKey] || false;
                    return (
                      <React.Fragment key={year}>
                        <td className="text-right p-3 text-sm text-gray-600">
                          {cellExpanded ? formatNumber(yearlyTotals[year].directCosts * 0.5) : '-'}
                        </td>
                        <td className="text-right p-3 text-sm text-gray-400">-</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </>
            );
          } else if (rowType === 'otherOperatingExpense') {
            return (
              <>
                <tr className="bg-blue-50 border-b border-gray-200">
                  <td className="p-3 pl-8 text-sm text-gray-600">자가임차료</td>
                  {years.map((year) => {
                    const cellKey = `${year}-${rowType}`;
                    const cellExpanded = expandedRows[cellKey] || false;
                    return (
                      <React.Fragment key={year}>
                        <td className="text-right p-3 text-sm text-gray-600">
                          {cellExpanded ? formatNumber(yearlyTotals[year].ownLeaseFee) : '-'}
                        </td>
                        <td className="text-right p-3 text-sm text-gray-400">-</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr className="bg-blue-50 border-b border-gray-200">
                  <td className="p-3 pl-8 text-sm text-gray-600">공통비 배부</td>
                  {years.map((year) => {
                    const cellKey = `${year}-${rowType}`;
                    const cellExpanded = expandedRows[cellKey] || false;
                    return (
                      <React.Fragment key={year}>
                        <td className="text-right p-3 text-sm text-gray-600">
                          {cellExpanded ? formatNumber(yearlyTotals[year].commonCostAllocation) : '-'}
                        </td>
                        <td className="text-right p-3 text-sm text-gray-400">-</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </>
            );
          }
          return null;
        })()}
      </>
    );
  };

  const hasAnyExpanded = Object.keys(expandedRows).some((key) => expandedRows[key]);

  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-[#eff6ff] border-b border-gray-200 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-[#1a1a1a]">{title}</CardTitle>
          <div className="flex gap-2">
            {hasAnyExpanded ? (
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-sm font-medium text-[#1e3a8a] bg-white border border-[#1e3a8a] rounded hover:bg-[#1e3a8a] hover:text-white transition-colors"
              >
                모두 접기
              </button>
            ) : (
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-sm font-medium text-[#1e3a8a] bg-white border border-[#1e3a8a] rounded hover:bg-[#1e3a8a] hover:text-white transition-colors"
              >
                모두 펼치기
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-[#f5f5f0]">
                <th className="text-left p-3 font-bold text-[#1a1a1a]" rowSpan={2}>
                  항목
                  <br />
                  <span className="text-xs font-normal text-gray-600">(천원)</span>
                </th>
                {years.map((year) => (
                  <th key={year} colSpan={2} className="text-center p-3 font-bold text-[#1a1a1a]">
                    {year}년
                  </th>
                ))}
              </tr>
              <tr className="border-b-2 border-gray-300 bg-[#f5f5f0]">
                {years.map((year) => (
                  <React.Fragment key={year}>
                    <th className="text-center p-2 text-xs font-medium text-gray-600">금액</th>
                    <th className="text-center p-2 text-xs font-medium text-gray-600">(%)</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 기말재고택금액 */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700">기말재고택금액</td>
                {years.map((year, idx) => {
                  const prevYear = idx > 0 ? years[idx - 1] : null;
                  const yoyPercent = prevYear && yearlyTotals[prevYear].endingInventory > 0
                    ? ((yearlyTotals[year].endingInventory - yearlyTotals[prevYear].endingInventory) / yearlyTotals[prevYear].endingInventory * 100)
                    : null;
                  return (
                    <React.Fragment key={year}>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(yearlyTotals[year].endingInventory)}
                      </td>
                      <td className="text-right p-3 text-gray-500 text-xs">
                        {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* 발주금액 */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700">발주금액</td>
                {years.map((year, idx) => {
                  const prevYear = idx > 0 ? years[idx - 1] : null;
                  const yoyPercent = prevYear && yearlyTotals[prevYear].purchaseOrder > 0
                    ? ((yearlyTotals[year].purchaseOrder - yearlyTotals[prevYear].purchaseOrder) / yearlyTotals[prevYear].purchaseOrder * 100)
                    : null;
                  return (
                    <React.Fragment key={year}>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(yearlyTotals[year].purchaseOrder)}
                      </td>
                      <td className="text-right p-3 text-gray-500 text-xs">
                        {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* 판매TAG - 드릴다운 가능 */}
              {renderDrilldownRow('salesTag', '판매TAG', false)}

              {/* 실판가 - 드릴다운 가능 */}
              {renderDrilldownRow('actualSales', '실판가', true)}

              {/* 출고가(V+) 소계 - 드릴다운 가능 */}
              {renderDrilldownRow('shipmentPrice', '출고가(V+) 소계', false)}

              {/* 부가세차감(출고)매출 */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700">부가세차감(출고)매출</td>
                {years.map((year, idx) => {
                  const prevYear = idx > 0 ? years[idx - 1] : null;
                  const yoyPercent = prevYear && yearlyTotals[prevYear].salesLessVAT > 0
                    ? ((yearlyTotals[year].salesLessVAT - yearlyTotals[prevYear].salesLessVAT) / yearlyTotals[prevYear].salesLessVAT * 100)
                    : null;
                  return (
                    <React.Fragment key={year}>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(yearlyTotals[year].salesLessVAT)}
                      </td>
                      <td className="text-right p-3 text-gray-500 text-xs">
                        {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* 매출원가 - 드릴다운 가능 */}
              {renderDrilldownRow('cogs', '매출원가(실적)', false)}

              {/* 매출총이익 */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700">매출총이익</td>
                {years.map((year, idx) => {
                  const prevYear = idx > 0 ? years[idx - 1] : null;
                  const yoyPercent = prevYear && yearlyTotals[prevYear].grossProfit !== 0
                    ? ((yearlyTotals[year].grossProfit - yearlyTotals[prevYear].grossProfit) / Math.abs(yearlyTotals[prevYear].grossProfit) * 100)
                    : null;
                  return (
                    <React.Fragment key={year}>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(yearlyTotals[year].grossProfit)}
                      </td>
                      <td className="text-right p-3 text-gray-500 text-xs">
                        {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* 직접비 소계 - 드릴다운 가능 */}
              {renderDrilldownRow('directCosts', '직접비 소계', false)}

              {/* 직접이익 */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700">직접이익</td>
                {years.map((year, idx) => {
                  const prevYear = idx > 0 ? years[idx - 1] : null;
                  const yoyPercent = prevYear && yearlyTotals[prevYear].directProfit !== 0
                    ? ((yearlyTotals[year].directProfit - yearlyTotals[prevYear].directProfit) / Math.abs(yearlyTotals[prevYear].directProfit) * 100)
                    : null;
                  return (
                    <React.Fragment key={year}>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(yearlyTotals[year].directProfit)}
                      </td>
                      <td className="text-right p-3 text-gray-500 text-xs">
                        {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* 광고선전비 */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700">광고선전비</td>
                {years.map((year, idx) => {
                  const prevYear = idx > 0 ? years[idx - 1] : null;
                  const yoyPercent = prevYear && yearlyTotals[prevYear].advertisingExpense > 0
                    ? ((yearlyTotals[year].advertisingExpense - yearlyTotals[prevYear].advertisingExpense) / yearlyTotals[prevYear].advertisingExpense * 100)
                    : null;
                  return (
                    <React.Fragment key={year}>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(yearlyTotals[year].advertisingExpense)}
                      </td>
                      <td className="text-right p-3 text-gray-500 text-xs">
                        {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* 인건비 */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700">인건비</td>
                {years.map((year, idx) => {
                  const prevYear = idx > 0 ? years[idx - 1] : null;
                  const yoyPercent = prevYear && yearlyTotals[prevYear].personnelExpense > 0
                    ? ((yearlyTotals[year].personnelExpense - yearlyTotals[prevYear].personnelExpense) / yearlyTotals[prevYear].personnelExpense * 100)
                    : null;
                  return (
                    <React.Fragment key={year}>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(yearlyTotals[year].personnelExpense)}
                      </td>
                      <td className="text-right p-3 text-gray-500 text-xs">
                        {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* 기타영업비 소계 - 드릴다운 가능 */}
              {renderDrilldownRow('otherOperatingExpense', '기타영업비 소계', false)}

              {/* 영업비 합계 */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700">영업비 합계</td>
                {years.map((year, idx) => {
                  const prevYear = idx > 0 ? years[idx - 1] : null;
                  const yoyPercent = prevYear && yearlyTotals[prevYear].totalOperatingExpense > 0
                    ? ((yearlyTotals[year].totalOperatingExpense - yearlyTotals[prevYear].totalOperatingExpense) / yearlyTotals[prevYear].totalOperatingExpense * 100)
                    : null;
                  return (
                    <React.Fragment key={year}>
                      <td className="text-right p-3 text-gray-700">
                        {formatNumber(yearlyTotals[year].totalOperatingExpense)}
                      </td>
                      <td className="text-right p-3 text-gray-500 text-xs">
                        {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* 영업이익 */}
              <tr className="border-b-2 border-gray-300 bg-[#f0f8ff]">
                <td className="p-3 font-bold text-[#1a1a1a]">영업이익</td>
                {years.map((year, idx) => {
                  const prevYear = idx > 0 ? years[idx - 1] : null;
                  const yoyPercent = prevYear && yearlyTotals[prevYear].operatingProfit !== 0
                    ? ((yearlyTotals[year].operatingProfit - yearlyTotals[prevYear].operatingProfit) / Math.abs(yearlyTotals[prevYear].operatingProfit) * 100)
                    : null;
                  return (
                    <React.Fragment key={year}>
                      <td
                        className={`text-right p-3 font-bold ${
                          yearlyTotals[year].operatingProfit >= 0 ? "text-[#1e3a8a]" : "text-[#dc2626]"
                        }`}
                      >
                        {formatNumber(yearlyTotals[year].operatingProfit)}
                      </td>
                      <td className={`text-right p-3 text-xs font-medium ${
                        yoyPercent !== null && yoyPercent >= 0 ? "text-[#1e3a8a]" : yoyPercent !== null ? "text-[#dc2626]" : "text-gray-500"
                      }`}>
                        {yoyPercent !== null ? `${yoyPercent >= 0 ? '+' : ''}${yoyPercent.toFixed(1)}%` : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
