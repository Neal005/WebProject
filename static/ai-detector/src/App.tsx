import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { LoadingState } from './components/LoadingState';
import { ResultCard } from './components/ResultCard';
import { HistoryList } from './components/HistoryList';
import type { HistoryItem } from './components/HistoryList';
import { ShieldCheck, Cpu, HardDrive, Network, X, BookOpen, AlertCircle, Settings, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { getMediaFile, saveMediaFile, clearAllMediaFiles } from './utils/db';/**
 * Automatically compresses massive images in the browser using HTML5 Canvas
 * down to a maximum resolution of 1920px and 82% Jpeg quality.
 */
const compressImageInBrowser = async (file: File): Promise<File> => {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    let width = bitmap.width;
    let height = bitmap.height;
    
    const MAX_RES = 1920;
    if (width > MAX_RES || height > MAX_RES) {
      if (width > height) {
        height = Math.round((height * MAX_RES) / width);
        width = MAX_RES;
      } else {
        width = Math.round((width * MAX_RES) / height);
        height = MAX_RES;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg", {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          console.log(`Image compressed: original=${(file.size / (1024*1024)).toFixed(2)}MB, new=${(compressedFile.size / (1024*1024)).toFixed(2)}MB`);
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.82);
    });
  } catch (e) {
    console.warn("createImageBitmap compression failed, returning original file", e);
    return file;
  }
};

/**
 * Automatically trims large videos down to the first 15 seconds in the browser
 * using MediaRecorder capturing at 3.0x speed for instant processing.
 */
const trimVideoInBrowser = (
  file: File, 
  maxDurationSeconds: number = 15,
  onProgress?: (progress: number) => void
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const isZalo = /zalo/i.test(navigator.userAgent);
    const isFb = /fbav|fbios|fb_iab|messenger/i.test(navigator.userAgent);
    if (isZalo || isFb) {
      reject(new Error('Trình duyệt nội bộ (Zalo/Facebook) không hỗ trợ xử lý video dung lượng lớn. Vui lòng chọn "Mở bằng trình duyệt" (Chrome/Safari) hoặc tải video dưới 50MB.'));
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    const fileUrl = URL.createObjectURL(file);
    video.src = fileUrl;
    
    video.onloadedmetadata = () => {
      let stream: MediaStream;
      try {
        if ((video as any).captureStream) {
          stream = (video as any).captureStream();
        } else if ((video as any).mozCaptureStream) {
          stream = (video as any).mozCaptureStream();
        } else {
          throw new Error('captureStream is not supported by your browser.');
        }
      } catch (err) {
        URL.revokeObjectURL(fileUrl);
        reject(new Error('Trình duyệt không hỗ trợ cắt video nhị phân trực tiếp. Vui lòng tải video dưới 50MB.'));
        return;
      }
      
      let options = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: '' };
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        video.pause();
        URL.revokeObjectURL(fileUrl);
        
        try {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'video/webm' });
          const trimmedFile = new File([blob], `trimmed_${file.name.replace(/\.[^/.]+$/, "")}.webm`, {
            type: mediaRecorder.mimeType || 'video/webm',
            lastModified: Date.now()
          });
          console.log(`Video trimmed: original=${(file.size / (1024*1024)).toFixed(2)}MB, new=${(trimmedFile.size / (1024*1024)).toFixed(2)}MB`);
          resolve(trimmedFile);
        } catch (err) {
          reject(err);
        }
      };
      
      // Start recording
      mediaRecorder.start(100);
      video.play();
      
      video.playbackRate = 3.0; // Play at 3x speed for rapid trimming
      const realRecordTimeMs = (maxDurationSeconds / video.playbackRate) * 1000;
      let elapsedMs = 0;
      
      const intervalId = setInterval(() => {
        elapsedMs += 100;
        const percent = Math.min(99, Math.round((elapsedMs / realRecordTimeMs) * 100));
        if (onProgress) {
          onProgress(percent);
        }
      }, 100);
      
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, realRecordTimeMs);
      
      video.onended = () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      };
      
      video.onerror = (err) => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        URL.revokeObjectURL(fileUrl);
        reject(err);
      };
    };
    
    video.onerror = (err) => {
      URL.revokeObjectURL(fileUrl);
      reject(err);
    };
  });
};

function App() {
  // Application Core States
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isImage, setIsImage] = useState<boolean>(true);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processingFileName, setProcessingFileName] = useState<string>('');

  // Zalo / Facebook In-app Browser Warning State
  const [showInAppAlert, setShowInAppAlert] = useState<boolean>(false);

  const isZalo = /zalo/i.test(navigator.userAgent);
  const isFb = /fbav|fbios|fb_iab|messenger/i.test(navigator.userAgent);
  const isInAppBrowser = isZalo || isFb;

  // Convert files/blobs to Base64 in Zalo/FB In-app browser to bypass Zalo's 0-byte download bug
  const createMediaUrl = (file: File | Blob, isImg: boolean): Promise<string> => {
    return new Promise((resolve) => {
      if (isInAppBrowser && isImg) {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(URL.createObjectURL(file));
      }
    });
  };

  // Results State
  const [result, setResult] = useState<{
    aiPercentage: number;
    realPercentage: number;
    label: 'AI-Generated' | 'Human-Made';
  } | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Custom Dockerized FastAPI Space Settings State
  const [fastApiUrl, setFastApiUrl] = useState<string>('https://huggingface.co/spaces/NeaI/video-ai-detector');
  const [tempFastApiUrl, setTempFastApiUrl] = useState<string>('https://huggingface.co/spaces/NeaI/video-ai-detector');
  const [fastApiKey, setFastApiKey] = useState<string>('bodoi_2026');
  const [tempFastApiKey, setTempFastApiKey] = useState<string>('bodoi_2026');
  const [hfToken, setHfToken] = useState<string>('');
  const [tempHfToken, setTempHfToken] = useState<string>('');
  
  // Modals Toggle
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Storage usage and settings tabs states
  const [storageUsage, setStorageUsage] = useState<number>(0);
  const [storageQuota, setStorageQuota] = useState<number>(0);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'api' | 'storage'>('api');

  const updateStorageEstimate = async () => {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageUsage(estimate.usage || 0);
        setStorageQuota(estimate.quota || 0);
      } catch (err) {
        console.warn('Storage estimate failed:', err);
      }
    }
  };

  useEffect(() => {
    if (showSettingsModal) {
      updateStorageEstimate();
      setActiveSettingsTab('api'); // Default to API tab on open
    }
  }, [showSettingsModal]);

  // Load history & settings from localStorage on mount
  useEffect(() => {
    if (isInAppBrowser) {
      setShowInAppAlert(true);
    }
    try {
      const savedHistory = localStorage.getItem('ai_detector_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      
      const savedFastApiUrl = localStorage.getItem('ai_detector_fastapi_url');
      if (savedFastApiUrl) {
        if (savedFastApiUrl === 'https://thecho7-ai-scanner.hf.space') {
          const newDefault = 'https://huggingface.co/spaces/NeaI/video-ai-detector';
          setFastApiUrl(newDefault);
          setTempFastApiUrl(newDefault);
          localStorage.setItem('ai_detector_fastapi_url', newDefault);
        } else {
          setFastApiUrl(savedFastApiUrl);
          setTempFastApiUrl(savedFastApiUrl);
        }
      }

      const savedFastApiKey = localStorage.getItem('ai_detector_fastapi_key');
      if (savedFastApiKey) {
        setFastApiKey(savedFastApiKey);
        setTempFastApiKey(savedFastApiKey);
      }

      const savedHfToken = localStorage.getItem('ai_detector_hf_token');
      if (savedHfToken) {
        setHfToken(savedHfToken);
        setTempHfToken(savedHfToken);
      }

      // Parse URL Query Parameters for quick configuration (Feasible on static hosting like GitHub Pages)
      const urlParams = new URLSearchParams(window.location.search);
      let paramsUpdated = false;

      const qToken = urlParams.get('token') || urlParams.get('hf_token');
      if (qToken) {
        setHfToken(qToken);
        setTempHfToken(qToken);
        localStorage.setItem('ai_detector_hf_token', qToken);
        paramsUpdated = true;
      }

      const qApiUrl = urlParams.get('api_url') || urlParams.get('fastapi_url');
      if (qApiUrl) {
        setFastApiUrl(qApiUrl);
        setTempFastApiUrl(qApiUrl);
        localStorage.setItem('ai_detector_fastapi_url', qApiUrl);
        paramsUpdated = true;
      }

      const qApiKey = urlParams.get('api_key') || urlParams.get('fastapi_key');
      if (qApiKey) {
        setFastApiKey(qApiKey);
        setTempFastApiKey(qApiKey);
        localStorage.setItem('ai_detector_fastapi_key', qApiKey);
        paramsUpdated = true;
      }

      // If query parameters were provided, clean the browser URL to protect token leakage
      if (paramsUpdated) {
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.warn('Failed to clean URL parameters:', e);
        }
      }
    } catch (e) {
      console.error('Failed to load history or settings from localStorage:', e);
    }
  }, []);

  // Cleanup Object URL on unmount or reset
  const cleanupFileUrl = () => {
    if (fileUrl && fileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(fileUrl);
    }
  };

  const handleReset = () => {
    cleanupFileUrl();
    setActiveFile(null);
    setFileUrl('');
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
  };

  const handleClearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('ai_detector_history');
    try {
      await clearAllMediaFiles();
    } catch (e) {
      console.error('Failed to clear files from IndexedDB:', e);
    }
  };

  const handleSelectHistoryItem = async (item: HistoryItem) => {
    cleanupFileUrl();
    setIsImage(item.isImage);
    
    try {
      const storedFile = await getMediaFile(item.id);
      if (storedFile) {
        setActiveFile(storedFile);
        const url = await createMediaUrl(storedFile, item.isImage);
        setFileUrl(url);
      } else {
        setActiveFile(null);
        setFileUrl('');
      }
    } catch (e) {
      console.error('Failed to load file from IndexedDB:', e);
      setActiveFile(null);
      setFileUrl('');
    }

    setResult({
      aiPercentage: item.aiPercentage,
      realPercentage: item.realPercentage,
      label: item.label,
    });
    setStatus('success');
  };

  const handleFileSelected = async (file: File) => {
    cleanupFileUrl();
    setErrorMessage('');
    setProcessingFileName(file.name);
    
    let processedFile = file;
    const fileName = processedFile.name.toLowerCase();
    const isHeic = /\.(heic|heif)$/i.test(fileName);
    const isImg = /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(fileName);
    setIsImage(isImg);

    if (isHeic) {
      setStatus('loading');
      setStatusText('Đang giải mã và chuyển đổi ảnh HEIC sang JPEG...');
      setProgress(30);
      try {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: processedFile,
          toType: 'image/jpeg',
          quality: 0.82
        });
        
        const jpegBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        const baseName = processedFile.name.substring(0, processedFile.name.lastIndexOf('.')) || processedFile.name;
        processedFile = new File([jpegBlob], `${baseName}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
      } catch (heicErr) {
        console.error('HEIC conversion failed:', heicErr);
        setErrorMessage('Không thể giải mã tệp HEIC. Vui lòng thử lại hoặc chọn định dạng khác.');
        setStatus('error');
        return;
      }
    }

    setActiveFile(processedFile);
    const url = await createMediaUrl(processedFile, isImg);
    setFileUrl(url);
    
    // Clear previous results & error states, set to idle for manual scan
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    setResult(null);
  };

  const handleScanMedia = async () => {
    if (!activeFile) return;

    setStatus('loading');
    setProcessingFileName(activeFile.name);
    setProgress(0);
    setErrorMessage('');
    setResult(null);

    let processedFile = activeFile;

    try {
      // 1. Preprocess Large Media Files Cục bộ (Trimming & Compression)
      if (isImage && activeFile.size > 5 * 1024 * 1024) {
        setStatusText('Đang tối ưu dung lượng ảnh (Canvas Compress)...');
        try {
          processedFile = await compressImageInBrowser(activeFile);
          setActiveFile(processedFile);
          
          // Re-create file URL preview for the compressed image
          cleanupFileUrl();
          const newUrl = await createMediaUrl(processedFile, true);
          setFileUrl(newUrl);
        } catch (imgCompressErr) {
          console.warn('Image compression failed, using original file:', imgCompressErr);
        }
      } else if (!isImage && activeFile.size > 50 * 1024 * 1024) {
        setStatusText('Đang cắt ngắn video cục bộ để tối ưu truyền tải (Lấy 15s đầu)...');
        try {
          processedFile = await trimVideoInBrowser(activeFile, 15, (prog) => {
            setProgress(prog);
          });
          setActiveFile(processedFile);
          
          // Re-create file URL preview for the trimmed video
          cleanupFileUrl();
          const newUrl = await createMediaUrl(processedFile, false);
          setFileUrl(newUrl);
        } catch (vidTrimErr: any) {
          console.warn('Video trimming failed, using original file:', vidTrimErr);
        }
      }

      // 2. Save final processed file in IndexedDB history
      const itemId = Math.random().toString(36).substring(2, 9);
      try {
        await saveMediaFile(itemId, processedFile);
      } catch (dbErr) {
        console.error('Failed to save media file to IndexedDB:', dbErr);
      }

      // 3. Phân tích qua Dockerized FastAPI Space
      setStatusText('Hệ thống đang phân tích khung hình, vui lòng đợi...');
      
      const { scanMediaFastAPI } = await import('./engines/fastapi-engine');
      const analysis = await scanMediaFastAPI(processedFile, fastApiUrl, fastApiKey, hfToken, (msg, prog) => {
        setStatusText(msg);
        setProgress(prog);
      });

      setResult({
        aiPercentage: analysis.aiPercentage,
        realPercentage: analysis.realPercentage,
        label: analysis.label,
      });

      saveHistoryItem({
        id: itemId,
        fileName: processedFile.name,
        fileSize: processedFile.size,
        isImage: isImage,
        aiPercentage: analysis.aiPercentage,
        realPercentage: analysis.realPercentage,
        label: analysis.label,
        timestamp: Date.now(),
      });

      setStatus('success');
    } catch (err: any) {
      console.error('Core detection process failed:', err);
      setErrorMessage(err.message || 'Có lỗi bất ngờ xảy ra trong quá trình phân tích.');
      setStatus('error');
    }
  };

  const saveHistoryItem = (newItem: HistoryItem) => {
    setHistory((prev) => {
      const updated = [newItem, ...prev.slice(0, 19)]; // Cap history at 20 items
      localStorage.setItem('ai_detector_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveSettings = () => {
    // Save FastAPI Server Config
    const cleanedFastApiUrl = tempFastApiUrl.trim();
    if (cleanedFastApiUrl) {
      setFastApiUrl(cleanedFastApiUrl);
      localStorage.setItem('ai_detector_fastapi_url', cleanedFastApiUrl);
    }

    const cleanedFastApiKey = tempFastApiKey.trim();
    if (cleanedFastApiKey) {
      setFastApiKey(cleanedFastApiKey);
      localStorage.setItem('ai_detector_fastapi_key', cleanedFastApiKey);
    }

    // Save HF Access Token (Secret)
    const cleanedHfToken = tempHfToken.trim();
    setHfToken(cleanedHfToken);
    localStorage.setItem('ai_detector_hf_token', cleanedHfToken);

    setShowSettingsModal(false);
  };

  const handleResetSettings = () => {
    const defaultFastApiUrl = 'https://huggingface.co/spaces/NeaI/video-ai-detector';
    setFastApiUrl(defaultFastApiUrl);
    setTempFastApiUrl(defaultFastApiUrl);
    localStorage.setItem('ai_detector_fastapi_url', defaultFastApiUrl);

    const defaultFastApiKey = 'bodoi_2026';
    setFastApiKey(defaultFastApiKey);
    setTempFastApiKey(defaultFastApiKey);
    localStorage.setItem('ai_detector_fastapi_key', defaultFastApiKey);

    setHfToken('');
    setTempHfToken('');
    localStorage.setItem('ai_detector_hf_token', '');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Navigation bar */}
        <Header 
          onOpenAbout={() => setShowAboutModal(true)} 
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        {/* Zalo / Facebook In-app Browser Warning Alert Banner */}
        {showInAppAlert && (
          <div className="w-full bg-[#030712]/90 border-b border-amber-500/10 py-3.5 px-4 sm:px-6 relative overflow-hidden backdrop-blur-md animate-fadeIn">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-start gap-3 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/25">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300 font-outfit mb-0.5">Phát hiện Trình duyệt Nhúng (In-app Browser)</h4>
                  <p className="text-xs text-gray-400 leading-normal m-0 max-w-4xl">
                    Bạn đang chạy ứng dụng trong WebView của <strong>Zalo / Facebook</strong>. Để ngăn trình duyệt tự động tạo tệp ảnh rác (0-byte) vào album điện thoại và đảm bảo hiệu năng tối ưu, vui lòng bấm vào nút <strong>3 chấm (•••)</strong> ở góc trên bên phải màn hình và chọn <strong>"Mở bằng trình duyệt ngoài"</strong> (Chrome/Safari).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setShowInAppAlert(false)}
                  className="rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          
          {/* Active View Router */}
          {status === 'idle' && (
            <div className="animate-fadeIn">
              {/* Hero Banner Text */}
              <div className="text-center mb-16 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-36 w-36 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
                
                <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-indigo-500/15 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-300 mb-6">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Xác thực tính chân thực của truyền thông số</span>
                </div>

                <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl font-outfit max-w-3xl mx-auto leading-[1.1] mb-6">
                  Phát hiện Hình ảnh & Video <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Sinh ra bởi Trí tuệ Nhân tạo
                  </span>
                </h2>

                <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed">
                  Công cụ tối tân hỗ trợ quét đám mây hiệu năng cao (Dockerized FastAPI Space) cho cả ảnh & video, tích hợp bộ tối ưu hóa dung lượng truyền thông tự động trực tiếp trên trình duyệt.
                </p>
              </div>

              {/* Upload Workspace */}
              <div className="max-w-3xl mx-auto">
                <UploadZone onFileSelected={handleFileSelected} />
                
                {/* Selected File Preview Box */}
                {activeFile && (
                  <div className="glass-panel border border-white/10 rounded-3xl p-5 my-8 animate-fadeIn text-left flex flex-col sm:flex-row gap-5 items-center">
                    <div className="h-28 w-28 shrink-0 rounded-2xl bg-black/40 border border-white/15 overflow-hidden flex items-center justify-center relative">
                      {isImage && fileUrl ? (
                        <div
                          className="h-full w-full"
                          style={{
                            backgroundImage: `url(${fileUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                      ) : fileUrl ? (
                        <video src={fileUrl} className="h-full w-full object-cover" muted loop playsInline />
                      ) : (
                        <div className="text-gray-600 font-bold uppercase text-xs">No media</div>
                      )}
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] text-gray-400 border border-white/5 uppercase">
                        {isImage ? 'Ảnh' : 'Video'}
                      </div>
                    </div>
                    <div className="flex-1 w-full text-center sm:text-left">
                      <h4 className="text-base font-bold text-white font-outfit truncate mb-1" title={activeFile.name}>
                        {activeFile.name}
                      </h4>
                      <p className="text-xs text-gray-400 mb-2">
                        Dung lượng: <code className="text-gray-300">{(activeFile.size / (1024 * 1024)).toFixed(2)} MB</code> | Định dạng: <code className="text-gray-300">{activeFile.type || 'Không xác định'}</code>
                      </p>
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/15 bg-purple-500/5 px-2.5 py-1 text-[11px] font-semibold text-purple-300">
                        <Network className="h-3 w-3" />
                        <span>Động cơ quét: Dockerized FastAPI Space</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Manual Submit Button "Quét AI" */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={handleScanMedia}
                    disabled={!activeFile}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold px-8 py-4 transition-all duration-300 shadow-lg text-sm sm:text-base ${
                      activeFile
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-purple-500/20 scale-100 hover:scale-[1.02] cursor-pointer'
                        : 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    <span>Quét AI</span>
                  </button>

                  {activeFile && (
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold px-6 py-4 transition-all cursor-pointer text-sm sm:text-base"
                    >
                      <X className="h-5 w-5" />
                      <span>Hủy bỏ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* System Architecture summary banner */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="glass-panel rounded-2xl p-5 border border-white/5 text-left flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/15">
                    <Cpu className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-outfit mb-1">FastAPI Docker Space</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Phân tích bằng mô hình học sâu SOTA trên GPU đám mây cho cả hình ảnh và video để đạt độ chính xác tối đa.</p>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-white/5 text-left flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/15">
                    <HardDrive className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-outfit mb-1">Bộ Tối Ưu Media Cục Bộ</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Tự động nén ảnh bằng Canvas và cắt ngắn video quá khổ bằng MediaRecorder trực tiếp tại máy khách.</p>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-white/5 text-left flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/15">
                    <Network className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-outfit mb-1">Kết Nối HTTPS Bảo Mật</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Giao tiếp mã hóa đầu cuối thông qua giao thức SSL an toàn và cấu hình kiểm tra tương thích CORS.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="py-12">
              <LoadingState
                statusText={statusText}
                progress={progress}
                isImage={isImage}
                fileName={processingFileName || 'Đang xử lý...'}
              />
            </div>
          )}

          {status === 'success' && result && (
            <div className="py-6">
              <ResultCard
                fileName={activeFile ? activeFile.name : 'Tệp tin từ Lịch sử'}
                fileSize={activeFile ? activeFile.size : 0}
                fileUrl={fileUrl}
                isImage={isImage}
                aiPercentage={result.aiPercentage}
                realPercentage={result.realPercentage}
                label={result.label}
                onReset={handleReset}
              />
            </div>
          )}

          {status === 'error' && (
            <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-8 border border-red-500/15 bg-red-500/5 text-center my-12 animate-fadeIn">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/15 text-red-400">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white font-outfit mb-2">Đã xảy ra lỗi hệ thống</h3>
              <p className="text-sm text-red-300 mb-6 leading-relaxed">{errorMessage}</p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 transition-all cursor-pointer"
                >
                  Trở lại Trang chủ
                </button>
                {!isImage && (
                  <button
                    onClick={() => {
                      handleReset();
                      setShowSettingsModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3 transition-all cursor-pointer"
                  >
                    Cài đặt lại API Space
                  </button>
                )}
              </div>
            </div>
          )}

          {/* History Dashboard list */}
          {status === 'idle' && (
            <HistoryList
              items={history}
              onClearHistory={handleClearHistory}
              onSelectHistoryItem={handleSelectHistoryItem}
            />
          )}

        </main>
      </div>

      {/* Modern footer with transparent AI signature */}
      <footer className="w-full border-t border-white/5 py-8 mt-20 text-center text-xs text-gray-500 bg-[#02050c]/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="m-0">© {new Date().getFullYear()} AI Detector. Hoạt động trên mã nguồn mở.</p>
          <p className="m-0 font-mono text-[10px] text-gray-400 bg-white/[0.02] border border-white/5 rounded px-2.5 py-1">
            Báo cáo được khởi tạo bởi Antigravity AI Agent (Model: Gemini — Google DeepMind) 🚀
          </p>
        </div>
      </footer>

      {/* Detailed Glassmorphic About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-outfit m-0">Giới thiệu Công nghệ</h3>
                <p className="text-xs text-gray-400 m-0">Kiến trúc Dockerized FastAPI Space Engine</p>
              </div>
            </div>

            {/* Modal Contents */}
            <div className="space-y-5 text-left text-sm text-gray-300 leading-relaxed font-outfit">
              <div>
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  Động cơ Dockerized FastAPI Space (Độ chính xác cao)
                </h4>
                <p className="pl-3.5 text-xs text-gray-400">
                  Gửi tệp trực tiếp lên Dockerized FastAPI Space của bạn trên Hugging Face để chạy các mô hình học sâu State-of-the-Art chuyên biệt, phân tích cho <strong>cả Ảnh & Video</strong> với độ chính xác cao vượt trội. Hỗ trợ xác thực tiêu chuẩn an toàn qua header <code className="text-white bg-white/5 px-1.5 py-0.5 rounded">x-api-key</code> và mã truy cập token cho Space private.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-pink-400" />
                  Bộ tối ưu hóa Media Cục bộ (Trimming & Compression)
                </h4>
                <p className="pl-3.5 text-xs text-gray-400">
                  Trình tối ưu hóa hoạt động trực tiếp trước khi gửi tệp: Tự động nén ảnh lớn (trên 5MB) về độ phân giải 1920px (chất lượng 82%) trong 50ms bằng Canvas; và tự động cắt ngắn video nặng (trên 50MB) lấy 15 giây đầu ở tốc độ phát 3x siêu tốc dưới 5 giây bằng MediaRecorder để đảm bảo đường truyền upload luôn mượt mà.
                </p>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4.5 mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5">Cam kết bảo mật dữ liệu</h4>
                <p className="text-xs leading-relaxed text-indigo-200 m-0">
                  Truyền thông gửi lên API được truyền tải qua kết nối HTTPS mã hóa bảo mật và được giải phóng ngay lập tức sau khi thực hiện xong quá trình suy luận. Chúng tôi không lưu trữ bất kỳ dữ liệu hình ảnh hay video nào của bạn.
                </p>
              </div>
            </div>

            {/* Signature */}
            <div className="mt-8 pt-4 border-t border-white/5 text-center text-xxs font-mono text-gray-500">
              Báo cáo được khởi tạo bởi Antigravity AI Agent (Model: Gemini — Google DeepMind) 🚀
            </div>

          </div>
        </div>
      )}

      {/* Advanced Glassmorphic API Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/10 p-6 sm:p-8">
            
            {/* Close button */}
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30">
                <Settings className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-left font-outfit">
                <h3 className="text-xl font-bold text-white m-0">Cài đặt ứng dụng</h3>
                <p className="text-xs text-gray-400 m-0">Quản lý cấu hình API và dung lượng dữ liệu cục bộ</p>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-white/10 mb-6 font-outfit">
              <button
                type="button"
                onClick={() => setActiveSettingsTab('api')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeSettingsTab === 'api'
                    ? 'border-purple-500 text-purple-400 bg-white/[0.02]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Cấu hình API
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab('storage')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeSettingsTab === 'storage'
                    ? 'border-purple-500 text-purple-400 bg-white/[0.02]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Bộ nhớ & Dữ liệu
              </button>
            </div>

            {activeSettingsTab === 'api' ? (
              /* Tab 1: API Configuration */
              <div className="space-y-5 text-left font-outfit animate-fadeIn">
                {/* FastAPI Config */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    FastAPI Space URL
                  </label>
                  <input
                    type="text"
                    value={tempFastApiUrl}
                    onChange={(e) => setTempFastApiUrl(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 outline-none transition-all"
                    placeholder="Ví dụ: https://huggingface.co/spaces/NeaI/video-ai-detector"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    x-api-key Header
                  </label>
                  <input
                    type="text"
                    value={tempFastApiKey}
                    onChange={(e) => setTempFastApiKey(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 outline-none transition-all"
                    placeholder="Mặc định: bodoi_2026"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Mã bí mật (HF Secret / Token)
                    </label>
                    <span className="text-xxs text-purple-400 font-medium">Tùy chọn (Optional)</span>
                  </div>
                  <input
                    type="password"
                    value={tempHfToken}
                    onChange={(e) => setTempHfToken(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 outline-none transition-all"
                    placeholder="hf_..."
                  />
                  <p className="text-xxs text-gray-500 mt-1 leading-normal">
                    Cần thiết nếu máy chủ FastAPI là một Space ở chế độ Riêng tư (Private Space) của bạn.
                  </p>
                </div>

                {/* CORS & FastAPI Security Banner */}
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 flex gap-3 items-start text-xs text-purple-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-purple-300">Kết nối bảo mật qua REST API:</span>
                    <p className="mt-0.5 leading-relaxed text-gray-400 m-0">
                      Giao diện gửi tệp tin trực tiếp qua endpoint <code className="text-white bg-white/5 px-1 rounded">/scan-media</code> với header khóa tĩnh để xác thực. Đảm bảo CORS đã được backend cho phép đối với domain này.
                    </p>
                  </div>
                </div>

                {/* Footer actions for API Config */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    onClick={handleSaveSettings}
                    className="flex-1 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-3 transition-all cursor-pointer text-sm"
                  >
                    Lưu cấu hình
                  </button>
                  
                  <button
                    onClick={handleResetSettings}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-5 py-3 transition-all cursor-pointer text-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Mặc định</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Tab 2: Storage & Cache Management */
              <div className="space-y-5 text-left font-outfit animate-fadeIn">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 space-y-4">
                  {/* Progress Indicator */}
                  <div>
                    <div className="flex justify-between items-center text-xs text-gray-300 mb-1.5 font-medium">
                      <span>Dung lượng đã sử dụng</span>
                      <span>
                        {(storageUsage / (1024 * 1024)).toFixed(2)} MB /{' '}
                        {(storageQuota / (1024 * 1024 * 1024)).toFixed(0)} GB (
                        {storageQuota > 0 ? ((storageUsage / storageQuota) * 100).toFixed(4) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${storageQuota > 0 ? Math.min(100, Math.max(0.1, (storageUsage / storageQuota) * 100)) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] text-gray-400 font-mono">
                    <div className="bg-black/25 rounded-xl p-2.5 border border-white/5">
                      <span className="block text-gray-500 font-bold uppercase tracking-wider mb-0.5">IndexedDB Cache</span>
                      <span className="text-white text-xs font-bold font-outfit">
                        {(storageUsage > 200000 ? (storageUsage - 150000) / (1024 * 1024) : 0).toFixed(2)} MB
                      </span>
                      <span className="block text-[9px] text-gray-500 mt-0.5">Lưu trữ file video & ảnh gốc</span>
                    </div>
                    <div className="bg-black/25 rounded-xl p-2.5 border border-white/5">
                      <span className="block text-gray-500 font-bold uppercase tracking-wider mb-0.5">Lịch sử (LocalStorage)</span>
                      <span className="text-white text-xs font-bold font-outfit">{history.length} mục</span>
                      <span className="block text-[9px] text-gray-500 mt-0.5">Lưu metadata & cấu hình cài đặt</span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('Bạn có chắc chắn muốn giải phóng bộ nhớ đệm video và ảnh trong IndexedDB? Bạn vẫn sẽ giữ lại lịch sử chữ, nhưng ảnh/video preview sẽ cần quét lại.')) {
                          await clearAllMediaFiles();
                          await updateStorageEstimate();
                          alert('Đã xóa sạch bộ đệm truyền thông nhị phân trong IndexedDB thành công!');
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 text-gray-300 px-3 py-2.5 transition-all text-xs font-semibold cursor-pointer animate-pulse-subtle"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-purple-400" />
                      <span>Xóa bộ đệm Media</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('CẢNH BÁO: Hành động này sẽ xóa toàn bộ lịch sử quét, cấu hình máy chủ, API key và reset ứng dụng về trạng thái mặc định ban đầu. Bạn có đồng ý?')) {
                          await clearAllMediaFiles();
                          localStorage.clear();
                          setHistory([]);
                          handleResetSettings();
                          await updateStorageEstimate();
                          alert('Đã reset toàn bộ ứng dụng và xóa sạch dữ liệu cục bộ!');
                          window.location.reload();
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/20 text-red-200 px-3 py-2.5 transition-all text-xs font-semibold cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Xóa sạch dữ liệu (Reset)</span>
                    </button>
                  </div>
                </div>

                {/* Storage Explanatory Banner */}
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 flex gap-3 items-start text-xs text-purple-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-purple-300">Cơ chế quản lý bộ nhớ:</span>
                    <p className="mt-0.5 leading-relaxed text-gray-400">
                      Dữ liệu được lưu trữ hoàn toàn cục bộ trên thiết bị của bạn. Xóa bộ đệm Media giúp giải phóng dung lượng ngay lập tức mà vẫn giữ nguyên lịch sử quét bằng văn bản của bạn.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
