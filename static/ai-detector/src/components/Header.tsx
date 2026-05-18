import React from 'react';
import { ShieldCheck, Cpu, Clapperboard, HelpCircle, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenAbout: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAbout, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030712]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white m-0 flex items-center gap-1.5 font-outfit">
              AI <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Detector</span>
            </h1>
            <p className="hidden text-xxs text-gray-400 sm:block m-0">Unified Dockerized FastAPI Space Engine</p>
          </div>
        </div>

        {/* Integration Badges & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 px-3 py-1 text-xs text-indigo-300 lg:flex">
            <Cpu className="h-3.5 w-3.5" />
            <span>Image: FastAPI Cloud Scan</span>
          </div>
          
          <div className="hidden items-center gap-1.5 rounded-full border border-purple-500/10 bg-purple-500/5 px-3 py-1 text-xs text-purple-300 lg:flex">
            <Clapperboard className="h-3.5 w-3.5" />
            <span>Video: FastAPI Cloud Scan</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Settings className="h-4 w-4 text-purple-400" />
            <span>Cài đặt</span>
          </button>

          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Giới thiệu</span>
          </button>
        </div>

      </div>
    </header>
  );
};
