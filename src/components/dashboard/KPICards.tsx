"use client";

import { Card, CardContent } from "@/components/ui/card";

interface KPICardsProps {
  revenue: number;
  cost: number;
  profit: number;
  profitability: number;
  period?: string;
}

export function KPICards({
  revenue,
  cost,
  profit,
  profitability,
  period,
}: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const cards = [
    {
      label: "매출",
      value: formatCurrency(revenue),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-[#1e3a8a]",
      textColor: "text-[#1e3a8a]",
      bgLight: "bg-[#eff6ff]",
    },
    {
      label: "비용",
      value: formatCurrency(cost),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: "bg-[#1a1a1a]",
      textColor: "text-[#1a1a1a]",
      bgLight: "bg-[#f5f5f5]",
    },
    {
      label: "이익",
      value: formatCurrency(profit),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      bgColor: profit >= 0 ? "bg-[#1e3a8a]" : "bg-[#dc2626]",
      textColor: profit >= 0 ? "text-[#1e3a8a]" : "text-[#dc2626]",
      bgLight: profit >= 0 ? "bg-[#eff6ff]" : "bg-[#fef2f2]",
    },
    {
      label: "수익성",
      value: formatPercent(profitability),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: profitability >= 0 ? "bg-[#1e3a8a]" : "bg-[#dc2626]",
      textColor: profitability >= 0 ? "text-[#1e3a8a]" : "text-[#dc2626]",
      bgLight: profitability >= 0 ? "bg-[#eff6ff]" : "bg-[#fef2f2]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 bg-white"
        >
          <div className={`${card.bgLight} p-6 border-b border-gray-200`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${card.bgColor} text-white`}>
                {card.icon}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-2">{card.label}</div>
            <div className={`text-3xl font-bold ${card.textColor} mb-2`}>
              {card.value}
            </div>
            {period && (
              <div className="text-xs text-gray-500 font-medium">{period}</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

