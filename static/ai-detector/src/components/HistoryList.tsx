import React from 'react';
import { History, Trash2, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export interface HistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  isImage: boolean;
  aiPercentage: number;
  realPercentage: number;
  label: 'AI-Generated' | 'Human-Made';
  timestamp: number;
}

interface HistoryListProps {
  items: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  onClearHistory,
  onSelectHistoryItem,
}) => {
  if (items.length === 0) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 animate-fadeIn">
      {/* Header section with delete action */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/15">
            <History className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-white font-outfit">Lịch sử kiểm tra ({items.length})</h3>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/15 hover:bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Xóa lịch sử</span>
        </button>
      </div>

      {/* Grid of history cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const aiPercent = item.aiPercentage;
          const sizeMB = (item.fileSize / (1024 * 1024)).toFixed(2) + 'MB';

          // Determine three-tier styles dynamically from aiPercentage
          let statusText = "Human Made";
          let statusColorClass = "text-emerald-400";
          
          if (aiPercent < 35) {
            statusText = "Human Made";
            statusColorClass = "text-emerald-400";
          } else if (aiPercent >= 35 && aiPercent < 60) {
            statusText = "Vùng xám AI";
            statusColorClass = "text-amber-400";
          } else {
            statusText = "AI Created";
            statusColorClass = "text-rose-400";
          }

          return (
            <div
              key={item.id}
              onClick={() => onSelectHistoryItem(item)}
              className="glass-panel glass-panel-hover cursor-pointer rounded-2xl p-4.5 text-left border border-white/5 relative overflow-hidden flex flex-col justify-between h-36"
            >
              <div>
                {/* Title & Badge Row */}
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-bold text-white truncate font-outfit flex-1 m-0">
                    {item.fileName}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wide shrink-0">
                    {item.isImage ? 'Ảnh' : 'Video'}
                  </span>
                </div>

                {/* Size and Time */}
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 font-mono">
                  <span className="truncate max-w-[80px]">{sizeMB}</span>
                  <span>•</span>
                  <div className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Progress and Score display */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {aiPercent < 35 ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : aiPercent < 60 ? (
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                  )}
                  <span
                    className={`text-xs font-bold font-outfit uppercase tracking-wider ${statusColorClass}`}
                  >
                    {statusText}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-gray-400 font-mono">AI Score: </span>
                  <span
                    className={`text-sm font-black font-mono ${statusColorClass}`}
                  >
                    {aiPercent}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
