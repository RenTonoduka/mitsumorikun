/**
 * Match Score Details Component
 *
 * Shows detailed breakdown of matching score with visual indicators
 */

'use client';

import { MatchScore } from '@/types/matching';

interface MatchScoreDetailsProps {
  matchScore: MatchScore;
  className?: string;
}

export function MatchScoreDetails({ matchScore, className = '' }: MatchScoreDetailsProps) {
  const scoreItems = [
    {
      label: 'Tech Stack Match',
      score: matchScore.techStackScore,
      maxScore: 40,
      color: 'blue',
      details: matchScore.matchedTechStacks.length > 0
        ? `Matched: ${matchScore.matchedTechStacks.join(', ')}`
        : 'No tech stack requirements',
    },
    {
      label: 'Specialty Alignment',
      score: matchScore.specialtyScore,
      maxScore: 30,
      color: 'purple',
      details: matchScore.matchedSpecialties.length > 0
        ? `Matched: ${matchScore.matchedSpecialties.join(', ')}`
        : 'General match',
    },
    {
      label: 'Budget Compatibility',
      score: matchScore.budgetScore,
      maxScore: 20,
      color: 'green',
      details: `Status: ${matchScore.budgetCompatibility}`,
    },
    {
      label: 'Company Rating',
      score: matchScore.ratingScore,
      maxScore: 10,
      color: 'yellow',
      details: 'Based on reviews and ratings',
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Match Score Breakdown</h3>
        <span className="text-2xl font-bold text-gray-900">{matchScore.total}%</span>
      </div>

      <div className="space-y-3">
        {scoreItems.map((item) => {
          const percentage = (item.score / item.maxScore) * 100;

          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-600">
                  {item.score} / {item.maxScore}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${colorClasses[item.color]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {item.details && (
                <p className="text-xs text-gray-500 italic">{item.details}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
