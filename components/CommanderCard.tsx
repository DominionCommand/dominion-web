import React from 'react';

interface CommanderProps {
  commander: {
    name: string;
    faction: string;
    role: string;
    specialty: string;
    imageUrl?: string;
  };
}

const CommanderCard: React.FC<CommanderProps> = ({ commander }) => {
  return (
    <div className="max-w-sm rounded-xl overflow-hidden shadow-lg bg-slate-900 border border-slate-700 text-white transition-all hover:border-blue-500 hover:shadow-blue-500/20">
      {commander.imageUrl && (
        <img 
          className="w-full h-48 object-cover" 
          src={commander.imageUrl} 
          alt={commander.name} 
        />
      )}
      <div className="px-6 py-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-blue-400 truncate">{commander.name}</h3>
          <span className="px-2 py-1 text-xs font-semibold bg-slate-800 text-slate-300 rounded border border-slate-600">
            {commander.faction}
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Role:</span>
            <span className="font-medium">{commander.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Specialty:</span>
            <span className="font-medium text-blue-200">{commander.specialty}</span>
          </div>
        </div>
      </div>
      <div className="px-6 pb-4">
        <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded transition-colors">
          View Dossier
        </button>
      </div>
    </div>
  );
};

export default CommanderCard;
