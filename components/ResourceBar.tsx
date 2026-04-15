import React from 'react';

interface Resource {
  name: string;
  amount: number;
  max?: number;
  icon: string;
  color: string;
}

interface ResourceBarProps {
  resources: Resource[];
}

const ResourceBar: React.FC<ResourceBarProps> = ({ resources }) => {
  return (
    <div className="flex items-center justify-between w-full p-4 bg-slate-900 border-b border-slate-700 text-slate-200 font-mono text-sm">
      <div className="flex gap-6">
        {resources.map((res) => (
          <div key={res.name} className="flex items-center gap-2">
            <span className={`text-lg ${res.color}`}>{res.icon}</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{res.name}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-bold">{res.amount.toLocaleString()}</span>
                {res.max && (
                  <span className="text-slate-500 text-xs">/ {res.max.toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-right">
        <span className="text-slate-500 text-xs uppercase font-bold tracking-tighter">System Status</span>
        <span className="ml-2 text-green-400 text-xs animate-pulse">● Nominal</span>
      </div>
    </div>
  );
};

export default ResourceBar;
