import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import { Transaction } from '../types';
import {
  formatRupiah,
  formatDateShort,
  INDO_MONTHS_SHORT,
} from '../utils/formatters';

interface ChartsSectionProps {
  transactions: Transaction[];
}

type ChartPeriod = 'daily' | 'monthly' | 'yearly';

export const ChartsSection: React.FC<ChartsSectionProps> = ({ transactions }) => {
  const [period, setPeriod] = useState<ChartPeriod>('daily');
  const [activeItem, setActiveItem] = useState<{
    label: string;
    income: number;
    expense: number;
    net: number;
  } | null>(null);

  // 1. Daily Data (Last 10-14 active transaction dates for readability on HP)
  const dailyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const dates = Array.from(new Set(sorted.map((t) => t.date))).slice(-10);

    dates.forEach((d) => {
      map.set(d, { income: 0, expense: 0 });
    });

    sorted.forEach((t) => {
      if (map.has(t.date)) {
        const entry = map.get(t.date)!;
        if (t.type === 'income') entry.income += t.amount;
        else entry.expense += t.amount;
      }
    });

    return dates.map((d) => {
      const data = map.get(d) || { income: 0, expense: 0 };
      return {
        label: formatDateShort(d),
        fullDate: d,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      };
    });
  }, [transactions]);

  // 2. Monthly Data (Current Year)
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      label: INDO_MONTHS_SHORT[i],
      income: 0,
      expense: 0,
    }));

    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (tDate.getFullYear() === currentYear) {
        const m = tDate.getMonth();
        if (m >= 0 && m < 12) {
          if (t.type === 'income') months[m].income += t.amount;
          else months[m].expense += t.amount;
        }
      }
    });

    return months.map((m) => ({
      label: m.label,
      fullDate: `${m.label} ${currentYear}`,
      income: m.income,
      expense: m.expense,
      net: m.income - m.expense,
    }));
  }, [transactions]);

  // 3. Yearly Data
  const yearlyData = useMemo(() => {
    const yearsMap = new Map<number, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const y = parseInt(t.date.substring(0, 4), 10) || new Date().getFullYear();
      if (!yearsMap.has(y)) {
        yearsMap.set(y, { income: 0, expense: 0 });
      }
      const entry = yearsMap.get(y)!;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
    });

    const sortedYears = Array.from(yearsMap.keys()).sort((a, b) => a - b);
    return sortedYears.map((y) => {
      const d = yearsMap.get(y)!;
      return {
        label: String(y),
        fullDate: `Tahun ${y}`,
        income: d.income,
        expense: d.expense,
        net: d.income - d.expense,
      };
    });
  }, [transactions]);

  const activeSeries = useMemo(() => {
    if (period === 'monthly') return monthlyData;
    if (period === 'yearly') return yearlyData;
    return dailyData;
  }, [period, dailyData, monthlyData, yearlyData]);

  const maxVal = useMemo(() => {
    let max = 0;
    activeSeries.forEach((item) => {
      if (item.income > max) max = item.income;
      if (item.expense > max) max = item.expense;
    });
    return max > 0 ? max : 100000;
  }, [activeSeries]);

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs">
      {/* Compact Header & Controls */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-cyan-600" />
          <span className="font-bold text-xs sm:text-sm text-slate-800">
            Grafik Pemasukan & Pengeluaran
          </span>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
          {(['daily', 'monthly', 'yearly'] as const).map((p) => {
            const labels: Record<ChartPeriod, string> = {
              daily: 'Harian',
              monthly: 'Bulanan',
              yearly: 'Tahunan',
            };
            return (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setActiveItem(null);
                }}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition ${
                  period === p
                    ? 'bg-white text-cyan-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend & Hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span className="font-medium text-slate-700">Masuk</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            <span className="font-medium text-slate-700">Keluar</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400">Ketuk batang untuk nominal</span>
      </div>

      {/* Compact Chart Container (h-40 to h-48 max to save mobile screen space) */}
      <div className="relative">
        {activeSeries.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Calendar className="w-6 h-6 mb-1 text-slate-300" />
            <span>Belum ada data pada periode ini</span>
          </div>
        ) : (
          <div className="h-36 sm:h-44 flex items-end gap-1.5 sm:gap-3 pt-2 pb-1 px-1 overflow-x-auto">
            {activeSeries.map((item, idx) => {
              const incomeH = Math.max(3, (item.income / maxVal) * 100);
              const expenseH = Math.max(3, (item.expense / maxVal) * 100);
              const isSelected = activeItem?.label === item.fullDate;

              return (
                <div
                  key={idx}
                  className="flex-1 min-w-[24px] max-w-[48px] h-full flex flex-col justify-end items-center cursor-pointer group"
                  onClick={() =>
                    setActiveItem({
                      label: item.fullDate,
                      income: item.income,
                      expense: item.expense,
                      net: item.net,
                    })
                  }
                >
                  {/* Bars */}
                  <div
                    className={`w-full flex items-end justify-center gap-0.5 h-[80%] rounded-sm p-0.5 transition ${
                      isSelected ? 'bg-cyan-50 ring-1 ring-cyan-400' : ''
                    }`}
                  >
                    {/* Income */}
                    <div
                      style={{ height: `${item.income > 0 ? incomeH : 2}%` }}
                      className={`w-1/2 rounded-t-xs transition-all ${
                        item.income > 0
                          ? 'bg-emerald-500 group-hover:bg-emerald-600'
                          : 'bg-slate-100'
                      }`}
                    />
                    {/* Expense */}
                    <div
                      style={{ height: `${item.expense > 0 ? expenseH : 2}%` }}
                      className={`w-1/2 rounded-t-xs transition-all ${
                        item.expense > 0
                          ? 'bg-rose-500 group-hover:bg-rose-600'
                          : 'bg-slate-100'
                      }`}
                    />
                  </div>

                  {/* Date label */}
                  <div className="h-[20%] flex items-center justify-center w-full">
                    <span
                      className={`text-[9px] sm:text-[10px] font-semibold truncate ${
                        isSelected ? 'text-cyan-700 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Data Toast/Banner on Touch */}
      {activeItem && (
        <div className="mt-2 p-2 bg-slate-900 text-white rounded-lg flex items-center justify-between text-[11px] shadow-sm animate-in fade-in">
          <span className="font-bold text-cyan-300 truncate mr-2">
            {activeItem.label}:
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-emerald-300 font-semibold">
              +{formatRupiah(activeItem.income)}
            </span>
            <span className="text-rose-300 font-semibold">
              -{formatRupiah(activeItem.expense)}
            </span>
            <span
              className={`font-bold ${
                activeItem.net >= 0 ? 'text-cyan-200' : 'text-amber-300'
              }`}
            >
              ={formatRupiah(activeItem.net)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
