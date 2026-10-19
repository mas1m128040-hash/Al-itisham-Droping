import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'income' | 'expense' | 'balance' | 'deliveries' | 'neutral';
  badge?: string;
  badgeType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  badge,
  badgeType = 'neutral',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'income':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
          accent: 'border-l-4 border-l-emerald-500',
          valueColor: 'text-emerald-700',
        };
      case 'expense':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
          accent: 'border-l-4 border-l-rose-500',
          valueColor: 'text-rose-700',
        };
      case 'balance':
        return {
          iconBg: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
          accent: 'border-l-4 border-l-cyan-500',
          valueColor: 'text-cyan-900',
        };
      case 'deliveries':
        return {
          iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
          accent: 'border-l-4 border-l-blue-500',
          valueColor: 'text-blue-900',
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-600 border border-slate-200',
          accent: 'border-l-4 border-l-slate-400',
          valueColor: 'text-slate-800',
        };
    }
  };

  const getBadgeStyles = () => {
    switch (badgeType) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-800';
      case 'negative':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all ${styles.accent}`}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-xl sm:text-2xl font-bold tracking-tight ${styles.valueColor} truncate`}>
          {value}
        </div>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${getBadgeStyles()}`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
