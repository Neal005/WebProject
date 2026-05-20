import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Film, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelected }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Tự động phát hiện trình duyệt tích hợp (WebView) bị giới hạn như Zalo, Facebook
  const isRestrictedWebView = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /Zalo|FBAN|FBAV/i.test(userAgent);
  }, []);

  const MAX_IMAGE_SIZE_MB = 30;
  const MAX_VIDEO_SIZE_MB = 500;

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    const fileName = file.name.toLowerCase();
    const isImage = /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(fileName);
    const isVideo = /\.mp4$/i.test(fileName);

    if (!isImage && !isVideo) {
      setErrorMessage(
        `Định dạng file không khả dụng. Vui lòng tải lên ảnh (.jpg, .png, .webp, .heic) hoặc video (.mp4).`
      );
      return;
    }

    // Size checks
    if (isImage && file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`Dung lượng ảnh vượt quá ${MAX_IMAGE_SIZE_MB}MB. Vui lòng chọn ảnh nhẹ hơn.`);
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`Dung lượng video vượt quá ${MAX_VIDEO_SIZE_MB}MB. Vui lòng chọn file nhẹ hơn.`);
      return;
    }

    // Callback if valid
    onFileSelected(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto" style={{ contain: 'paint' }}>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={isRestrictedWebView ? undefined : onButtonClick}
        className={`glass-panel relative overflow-hidden rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 ${
          isDragActive
            ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)] scale-[0.99]'
            : 'border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.02]'
        } ${isRestrictedWebView ? 'cursor-default' : 'cursor-pointer'}`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />

        {/* General browser input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          style={{ display: 'none', width: 0, height: 0, opacity: 0, position: 'absolute', pointerEvents: 'none' }}
          accept="image/*,video/*"
          onChange={handleFileChange}
        />

        {/* WebView Zalo/Facebook specialized inputs */}
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          style={{ display: 'none', width: 0, height: 0, opacity: 0, position: 'absolute', pointerEvents: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
        <input
          ref={videoInputRef}
          type="file"
          className="hidden"
          style={{ display: 'none', width: 0, height: 0, opacity: 0, position: 'absolute', pointerEvents: 'none' }}
          accept="video/*"
          onChange={handleFileChange}
        />

        {/* Upload Graphics */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl upload-format-badge shadow-inner">
          <UploadCloud className="h-10 w-10 text-indigo-400 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-outfit mb-2">
          Kéo & Thả file vào đây
        </h3>
        
        <p className="mx-auto max-w-md text-sm text-gray-400 mb-6 leading-relaxed">
          Tải lên hình ảnh hoặc video của bạn để xác thực thật giả trong vài giây. Hỗ trợ đầy đủ thiết bị client-side.
        </p>

        {/* Accept Formats Showcase */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-400" style={{ isolation: 'isolate', transform: 'translate3d(0, 0, 0)' }}>
          <div className="flex items-center gap-1.5 rounded-lg upload-format-badge px-3 py-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
            <span>Hình ảnh (.jpg, .png, .webp, .heic) &lt; {MAX_IMAGE_SIZE_MB}MB</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg upload-format-badge px-3 py-1.5">
            <Film className="h-3.5 w-3.5 text-purple-400" />
            <span>Video (.mp4) (&gt; 50MB tự động cắt ngắn)</span>
          </div>
        </div>

        {/* WebView Zalo/Facebook specialized interactive buttons */}
        {isRestrictedWebView && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10" style={{ isolation: 'isolate' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                imageInputRef.current?.click();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300 hover:text-white font-semibold px-6 py-3.5 transition-all duration-300 active:scale-[0.97] cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.05)] hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]"
            >
              <ImageIcon className="h-5 w-5" />
              Tải Ảnh Lên
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                videoInputRef.current?.click();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-white font-semibold px-6 py-3.5 transition-all duration-300 active:scale-[0.97] cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.05)] hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
            >
              <Film className="h-5 w-5" />
              Tải Video Lên
            </button>
          </div>
        )}
      </div>

      {/* Error alert panel */}
      {errorMessage && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-500/5 p-4 text-sm text-red-300 animate-fadeIn">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div className="flex-1">
            <span className="font-semibold">Lỗi tệp tin:</span> {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
};
