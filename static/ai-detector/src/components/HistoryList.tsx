import React, { useEffect, useState } from 'react';
import { History, Trash2, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { getMediaFile } from '../utils/db';

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

const HistoryItemCard: React.FC<{
  item: HistoryItem;
  onSelect: (item: HistoryItem) => void;
}> = ({ item, onSelect }) => {
  const [mediaUrl, setMediaUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    let url = '';

    getMediaFile(item.id).then((file) => {
      if (file && active) {
        url = URL.createObjectURL(file);
        setMediaUrl(url);
      }
    });

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [item.id]);

  const sizeMB = (item.fileSize / (1024 * 1024)).toFixed(2) + 'MB';

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  const aiPercent = item.aiPercentage;
  let statusText = "Human Made";
  let statusColorClass = "text-emerald-400";
  let progressColorClass = "bg-emerald-500";
  
  if (aiPercent < 35) {
    statusText = "Human Made";
    statusColorClass = "text-emerald-400";
    progressColorClass = "bg-emerald-500";
  } else if (aiPercent >= 35 && aiPercent < 60) {
    statusText = "Vùng xám AI";
    statusColorClass = "text-amber-400";
    progressColorClass = "bg-amber-500";
  } else {
    statusText = "AI Created";
    statusColorClass = "text-rose-400";
    progressColorClass = "bg-rose-500";
  }

  return (
    <div
      onClick={() => onSelect(item)}
      className="glass-panel glass-panel-hover cursor-pointer rounded-2xl p-3 text-left border border-white/5 relative overflow-hidden flex gap-3 items-stretch h-36 transition-all duration-300 hover:scale-[1.02] hover:border-white/10"
    >
      {/* Left side: Thumbnail preview */}
      <div className="w-24 shrink-0 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center relative">
        {mediaUrl ? (
          item.isImage ? (
            <img src={mediaUrl} alt="Thumb" className="w-full h-full object-cover" />
          ) : (
            <video src={mediaUrl} className="w-full h-full object-cover" muted playsInline />
          )
        ) : (
          <div className="text-[10px] text-gray-500 font-bold uppercase select-none">No media</div>
        )}
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[8px] text-gray-400 border border-white/5 uppercase tracking-wider scale-90">
          {item.isImage ? 'Ảnh' : 'Video'}
        </div>
      </div>

      {/* Right side: Information column */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Title Row */}
          <h4 className="text-xs font-bold text-white truncate font-outfit m-0" title={item.fileName}>
            {item.fileName}
          </h4>

          {/* Size and Time */}
          <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-1 font-mono">
            <span className="truncate">{sizeMB}</span>
            <span>•</span>
            <div className="flex items-center gap-0.5 min-w-0">
              <Clock className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{formatDate(item.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Progress and Score display */}
        <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {aiPercent < 35 ? (
                <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="h-3 w-3 text-rose-400 shrink-0" />
              )}
              <span className={`text-[10px] font-bold font-outfit uppercase tracking-wider ${statusColorClass} truncate`}>
                {statusText}
              </span>
            </div>
            <span className={`text-[11px] font-black font-mono ${statusColorClass} shrink-0`}>
              {aiPercent}%
            </span>
          </div>
          {/* Micro Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <div className={`h-full ${progressColorClass}`} style={{ width: `${aiPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  onClearHistory,
  onSelectHistoryItem,
}) => {
  if (items.length === 0) return null;

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
        {items.map((item) => (
          <HistoryItemCard
            key={item.id}
            item={item}
            onSelect={onSelectHistoryItem}
          />
        ))}
      </div>
    </div>
  );
};

