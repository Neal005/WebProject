import React from 'react';
import { Loader2, Sparkles, Server, HardDriveDownload } from 'lucide-react';

interface LoadingStateProps {
  statusText: string;
  progress: number;
  isImage: boolean;
  fileName: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  statusText,
  progress,
  isImage,
  fileName,
}) => {
  // Generate helpful waiting tips based on media type
  const waitingTips = isImage
    ? [
        "Mô hình AI chỉ được tải xuống trong lần đầu tiên sử dụng. Các lần sau mô hình sẽ chạy ngoại tuyến (offline) ngay lập tức.",
        "Hình ảnh được xử lý 100% trong trình duyệt của bạn (WebML) bảo đảm tính bảo mật tối đa cho dữ liệu.",
        "Mô hình đang phân tích các chi tiết pixel, tần số ảnh và các vết giả lập do thuật toán AI sinh ra.",
      ]
    : [
        "Video được gửi an toàn tới cổng Hugging Face Space để xử lý nhằm tránh quá tải bộ nhớ RAM trên máy của bạn.",
        "Quá trình phân tích deepfake video bao gồm việc quét hàng chục frame hình và phân tích cử động khuôn mặt.",
        "Nếu máy chủ Hugging Face bận, tiến trình có thể kéo dài lâu hơn bình thường một chút. Cảm ơn bạn đã kiên nhẫn.",
      ];

  // Pick a tip based on current time/hash
  const tipIndex = Math.abs(fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % waitingTips.length;
  const activeTip = waitingTips[tipIndex];

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-8 sm:p-12 border border-white/5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-indigo-500/20 blur-[60px] pointer-events-none" />

      <div className="flex flex-col items-center text-center">
        {/* Core Animated Spinner */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/5 bg-white/[0.02]">
            <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
          </div>
          {isImage ? (
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 border border-indigo-400 text-white">
              <HardDriveDownload className="h-3.5 w-3.5" />
            </div>
          ) : (
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-purple-600 border border-purple-400 text-white">
              <Server className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Status Text & File Name */}
        <h3 className="text-xl font-bold text-white font-outfit mb-1">{statusText}</h3>
        <p className="text-xs text-gray-400 font-mono mb-6 max-w-md truncate">Đang xử lý: {fileName}</p>

        {/* Progress Bar */}
        <div className="w-full max-w-md bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5 p-[1px] mb-8">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Helpful Tip Card */}
        <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 text-left flex gap-3.5 items-start">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/15">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">Kiến thức hữu ích</h4>
            <p className="text-xs text-gray-300 leading-relaxed">{activeTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
