import React from 'react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  faction: string;
  score: number;
  wins: number;
  losses: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries }) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="border-b border-slate-800 bg-slate-800/50 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">Commander</th>
            <th className="px-4 py-3 font-medium">Faction</th>
            <th className="px-4 py-3 font-medium text-right">Score</th>
            <th className="px-4 py-3 font-medium text-center">W/L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {entries.map((entry) => (
            <tr key={entry.rank} className="hover:bg-slate-800/30 transition-colors group">
              <td className="px-4 py-3 font-mono text-slate-500 group-hover:text-amber-500">
                #{entry.rank}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-200">{entry.name}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-700">
                  {entry.faction}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-amber-400">{entry.score.toLocaleString()}</td>
              <td className="px-4 py-3 text-center font-mono">
                <span className="text-green-500">{entry.wins}</span>
                <span className="mx-1 text-slate-600">/</span>
                <span className="text-red-500">{entry.losses}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
