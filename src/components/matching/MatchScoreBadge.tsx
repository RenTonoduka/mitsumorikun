/**
 * Match Score Badge Component
 *
 * Displays a matching score with visual indicators (color, tier label)
 */

'use client';

import { getMatchTier } from '@/lib/matching/algorithm';

interface MatchScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchScoreBadge({
  score,
  showLabel = true,
  size = 'md',
}: MatchScoreBadgeProps) {
  const { tier, label, color } = getMatchTier(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center font-semibold border rounded-full ${sizeClasses[size]} ${colorClasses[color] || colorClasses.gray}`}
      >
        {score}%
      </span>
      {showLabel && (
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      )}
    </div>
  );
}
