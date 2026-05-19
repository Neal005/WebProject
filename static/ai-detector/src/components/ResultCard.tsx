import React, { useEffect, useState } from 'react';
import { CheckCircle, RefreshCw, Share2, ShieldAlert } from 'lucide-react';

interface ResultCardProps {
  fileName: string;
  fileSize: number;
  fileUrl: string;
  isImage: boolean;
  aiPercentage: number;
  realPercentage: number;
  label: 'AI-Generated' | 'Human-Made';
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  fileName,
  fileSize,
  fileUrl,
  isImage,
  aiPercentage,
  realPercentage,
  label,
  onReset,
}) => {
  const [animatedAI, setAnimatedAI] = useState(0);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  // Animate the score percentage bar/chart on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedAI(aiPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [aiPercentage]);

  // Determine verdict theme based on percentage according to criteria
  let verdictText = "";
  let verdictColorClass = "";       // Text color
  let progressColorClass = "";      // Background bar color
  let badgeColorClass = "";         // Badge border, bg, text colors
  let glowColorClass = "";          // Blur glimmer glow background
  let circleStrokeClass = "";       // SVG ring stroke color
  let indicatorLabelColorClass = ""; // Center Counter small label color

  if (aiPercentage < 35) {
    verdictText = isImage ? "Khả năng cao là Ảnh thật" : "Khả năng cao là Video thật";
    verdictColorClass = "text-emerald-400";
    progressColorClass = "bg-emerald-500";
    badgeColorClass = "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    glowColorClass = "bg-emerald-500/15";
    circleStrokeClass = "stroke-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
    indicatorLabelColorClass = "text-emerald-400";
  } else if (aiPercentage >= 35 && aiPercentage < 60) {
    verdictText = "Đáng nghi ngờ / Vùng xám AI";
    verdictColorClass = "text-amber-400";
    progressColorClass = "bg-amber-500";
    badgeColorClass = "border-amber-500/20 bg-amber-500/10 text-amber-400";
    glowColorClass = "bg-amber-500/15";
    circleStrokeClass = "stroke-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]";
    indicatorLabelColorClass = "text-amber-400";
  } else {
    verdictText = "Phát hiện AI tạo ra";
    verdictColorClass = "text-rose-400";
    progressColorClass = "bg-rose-500";
    badgeColorClass = "border-rose-500/20 bg-rose-500/10 text-rose-400";
    glowColorClass = "bg-rose-500/15";
    circleStrokeClass = "stroke-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]";
    indicatorLabelColorClass = "text-rose-400";
  }

  const formattedSize = (fileSize / (1024 * 1024)).toFixed(2) + ' MB';

  // SVG circular properties
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedAI / 100) * circumference;

  const handleShare = () => {
    navigator.clipboard.writeText(
      `[AI Detector] Mình vừa kiểm tra file "${fileName}". Kết quả: ${aiPercentage}% khả năng do AI tạo ra (${verdictText} - ${label}). Hãy tự kiểm tra hình ảnh/video của bạn tại đây!`
    );
    setShowShareSuccess(true);
    setTimeout(() => setShowShareSuccess(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Preview of File */}
        <div className="md:col-span-5 glass-panel rounded-3xl p-5 border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 font-outfit mb-3">Tệp tin kiểm tra</h4>
            <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 aspect-video md:aspect-square flex items-center justify-center">
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="w-full h-full object-cover max-h-[300px] img-zalo-prevent"
                />
              ) : (
                <video
                  src={fileUrl}
                  controls
                  className="w-full h-full object-cover max-h-[300px]"
                />
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-left">
            <p className="text-sm font-bold text-white truncate m-0 font-outfit">{fileName}</p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400 font-mono">{formattedSize}</span>
              <span className="text-xs rounded bg-white/5 border border-white/10 px-2 py-0.5 text-gray-300 uppercase tracking-wider">
                {isImage ? 'Hình ảnh' : 'Video'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Prediction Verdict Card */}
        <div className="md:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden flex flex-col justify-between">
          {/* Verdict Theme Background Glimmer */}
          <div
            className={`absolute -top-32 -right-32 h-64 w-64 rounded-full blur-[80px] pointer-events-none transition-all duration-1000 ${glowColorClass}`}
          />

          {/* Verdict Header Badge */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 font-outfit">Kết quả phân tích</h4>
            
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-wider ${badgeColorClass}`}
            >
              {aiPercentage < 35 ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Human-Made</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>AI-Generated</span>
                </>
              )}
            </div>
          </div>

          {/* Core Analytics Output */}
          <div className="flex flex-col sm:flex-row items-center gap-8 my-4">
            
            {/* SVG Donut Chart */}
            <div className="relative shrink-0 flex items-center justify-center h-40 w-40">
              <svg className="h-36 w-36 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-white/5"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                
                {/* Real Segment Ring (Teal) */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-emerald-500/10"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={0}
                />

                {/* AI Segment Ring (Rose Gradient/Solid) */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className={`transition-all duration-1000 ease-out ${circleStrokeClass}`}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-white tracking-tight font-outfit">
                  {animatedAI}%
                </span>
                <span className={`block text-xxs font-bold uppercase tracking-wider ${indicatorLabelColorClass}`}>
                  AI Score
                </span>
              </div>
            </div>

            {/* Verdict Explanation Panel */}
            <div className="text-left flex-1">
              <h3 className={`text-2xl font-black font-outfit mb-2 leading-tight ${verdictColorClass}`}>
                {verdictText}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {aiPercentage < 35
                  ? `Không phát hiện bất kỳ dấu vết can thiệp sâu nào của AI. Độ tin cậy lên tới ${realPercentage}% đây là sản phẩm gốc hoặc do con người ghi lại thủ công.`
                  : aiPercentage < 60
                    ? `Phát hiện các đặc trưng lai giữa ảnh thực và ảnh AI với tỷ lệ ${aiPercentage}% AI và ${realPercentage}% Real. Nội dung có thể đã qua chỉnh sửa bằng công nghệ AI sinh hoặc nằm trong vùng nghi vấn.`
                    : `Mô hình phát hiện ${aiPercentage}% dấu vết của các thuật toán sinh hình ảnh kỹ thuật số (Diffusion, GANs) được áp dụng trên file này. Có độ tin cậy rất cao đây là sản phẩm do AI tạo lập.`}
              </p>
            </div>

          </div>

          {/* Statistics breakout */}
          <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4 my-6">
            <div className="text-left border-r border-white/5 pr-4">
              <span className={`text-xxs font-bold uppercase tracking-wider ${aiPercentage < 35 ? 'text-emerald-400' : aiPercentage < 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                Xác suất do AI tạo
              </span>
              <p className="text-xl font-bold text-white mt-0.5">{aiPercentage}%</p>
              <div className="w-full bg-white/5 rounded-full h-1 mt-1 overflow-hidden">
                <div className={`h-full ${progressColorClass}`} style={{ width: `${aiPercentage}%` }} />
              </div>
            </div>
            <div className="text-left pl-2">
              <span className="text-xxs font-bold text-emerald-400 uppercase tracking-wider">Xác suất từ Con người</span>
              <p className="text-xl font-bold text-white mt-0.5">{realPercentage}%</p>
              <div className="w-full bg-white/5 rounded-full h-1 mt-1 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${realPercentage}%` }} />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-3.5 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Kiểm tra file khác</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white px-5 py-3.5 transition-all active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4" />
              <span>{showShareSuccess ? 'Đã sao chép!' : 'Chia sẻ kết quả'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
