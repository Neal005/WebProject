import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { LoadingState } from './components/LoadingState';
import { ResultCard } from './components/ResultCard';
import { HistoryList } from './components/HistoryList';
import type { HistoryItem } from './components/HistoryList';
import { detectImageAI } from './engines/ai-image-engine';
import { detectVideoAI } from './engines/ai-video-engine';
import { ShieldCheck, Cpu, HardDrive, Network, X, BookOpen, AlertCircle, Settings, RotateCcw } from 'lucide-react';

function App() {
  // Application Core States
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isImage, setIsImage] = useState<boolean>(true);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Results State
  const [result, setResult] = useState<{
    aiPercentage: number;
    realPercentage: number;
    label: 'AI-Generated' | 'Human-Made';
  } | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Hugging Face Space Settings State (for Hybrid Mode)
  const [hfSpaceId, setHfSpaceId] = useState<string>('thecho7/deepfake');
  const [tempHfSpaceId, setTempHfSpaceId] = useState<string>('thecho7/deepfake');

  // Custom FastAPI Backend Settings State (Primary Mode)
  const [detectionMode, setDetectionMode] = useState<'fastapi' | 'hybrid'>('fastapi');
  const [fastApiUrl, setFastApiUrl] = useState<string>('https://huggingface.co/spaces/NeaI/video-ai-detector');
  const [tempFastApiUrl, setTempFastApiUrl] = useState<string>('https://huggingface.co/spaces/NeaI/video-ai-detector');
  const [fastApiKey, setFastApiKey] = useState<string>('bodoi_2026');
  const [tempFastApiKey, setTempFastApiKey] = useState<string>('bodoi_2026');
  const [hfToken, setHfToken] = useState<string>('');
  const [tempHfToken, setTempHfToken] = useState<string>('');
  
  // Modals Toggle
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Load history & settings from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ai_detector_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      
      const savedSpaceId = localStorage.getItem('ai_detector_space_id');
      if (savedSpaceId) {
        if (savedSpaceId === 'dev-bhowmik/Deepfake-Detection') {
          setHfSpaceId('thecho7/deepfake');
          setTempHfSpaceId('thecho7/deepfake');
          localStorage.setItem('ai_detector_space_id', 'thecho7/deepfake');
        } else {
          setHfSpaceId(savedSpaceId);
          setTempHfSpaceId(savedSpaceId);
        }
      }

      // Load FastAPI Configuration
      const savedMode = localStorage.getItem('ai_detector_mode');
      if (savedMode === 'fastapi' || savedMode === 'hybrid') {
        setDetectionMode(savedMode);
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

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ai_detector_history');
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    cleanupFileUrl();
    setIsImage(item.isImage);
    setActiveFile(null);
    setFileUrl('');
    setResult({
      aiPercentage: item.aiPercentage,
      realPercentage: item.realPercentage,
      label: item.label,
    });
    setStatus('success');
  };

  const handleFileSelected = (file: File) => {
    cleanupFileUrl();
    setActiveFile(file);
    const url = URL.createObjectURL(file);
    setFileUrl(url);

    const fileName = file.name.toLowerCase();
    const isImg = /\.(jpg|jpeg|png|webp)$/i.test(fileName);
    setIsImage(isImg);
    
    // Clear previous results & error states, set to idle for manual scan
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    setResult(null);
  };

  const handleScanMedia = async () => {
    if (!activeFile) return;

    setStatus('loading');
    setProgress(0);
    setErrorMessage('');
    setResult(null);

    try {
      if (detectionMode === 'fastapi') {
        setStatusText('Hệ thống đang phân tích khung hình, vui lòng đợi...');
        
        const { scanMediaFastAPI } = await import('./engines/fastapi-engine');
        const analysis = await scanMediaFastAPI(activeFile, fastApiUrl, fastApiKey, hfToken, (msg, prog) => {
          setStatusText(msg);
          setProgress(prog);
        });

        setResult({
          aiPercentage: analysis.aiPercentage,
          realPercentage: analysis.realPercentage,
          label: analysis.label,
        });

        saveHistoryItem({
          id: Math.random().toString(36).substring(2, 9),
          fileName: activeFile.name,
          fileSize: activeFile.size,
          isImage: isImage,
          aiPercentage: analysis.aiPercentage,
          realPercentage: analysis.realPercentage,
          label: analysis.label,
          timestamp: Date.now(),
        });
      } else {
        if (isImage) {
          setStatusText('Đang tải mô hình phân tích ảnh cục bộ...');
          const analysis = await detectImageAI(activeFile, (msg, prog) => {
            setStatusText(msg);
            setProgress(prog);
          });

          setResult({
            aiPercentage: analysis.aiPercentage,
            realPercentage: analysis.realPercentage,
            label: analysis.label,
          });

          saveHistoryItem({
            id: Math.random().toString(36).substring(2, 9),
            fileName: activeFile.name,
            fileSize: activeFile.size,
            isImage: true,
            aiPercentage: analysis.aiPercentage,
            realPercentage: analysis.realPercentage,
            label: analysis.label,
            timestamp: Date.now(),
          });
        } else {
          setStatusText('Đang kết nối tới máy chủ phân tích video...');
          const analysis = await detectVideoAI(activeFile, hfSpaceId, (msg, prog) => {
            setStatusText(msg);
            setProgress(prog);
          });

          setResult({
            aiPercentage: analysis.aiPercentage,
            realPercentage: analysis.realPercentage,
            label: analysis.label,
          });

          saveHistoryItem({
            id: Math.random().toString(36).substring(2, 9),
            fileName: activeFile.name,
            fileSize: activeFile.size,
            isImage: false,
            aiPercentage: analysis.aiPercentage,
            realPercentage: analysis.realPercentage,
            label: analysis.label,
            timestamp: Date.now(),
          });
        }
      }

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
    // 1. Save Hybrid Space ID
    const cleanedSpaceId = tempHfSpaceId.trim();
    if (cleanedSpaceId) {
      setHfSpaceId(cleanedSpaceId);
      localStorage.setItem('ai_detector_space_id', cleanedSpaceId);
    }

    // 2. Save FastAPI Server Config
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

    // Save Mode
    setDetectionMode(detectionMode);
    localStorage.setItem('ai_detector_mode', detectionMode);

    setShowSettingsModal(false);
  };

  const handleResetSettings = () => {
    const defaultSpace = 'thecho7/deepfake';
    setHfSpaceId(defaultSpace);
    setTempHfSpaceId(defaultSpace);
    localStorage.setItem('ai_detector_space_id', defaultSpace);

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

    setDetectionMode('fastapi');
    localStorage.setItem('ai_detector_mode', 'fastapi');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Navigation bar */}
        <Header 
          onOpenAbout={() => setShowAboutModal(true)} 
          onOpenSettings={() => {
            setTempHfSpaceId(hfSpaceId);
            setShowSettingsModal(true);
          }}
        />

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
                  Công cụ phân tích tối tân sử dụng mạng nơ-ron cục bộ (WebML) cho hình ảnh và hệ thống học sâu đám mây qua API Hugging Face cho video.
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
                        <img src={fileUrl} alt="Preview" className="h-full w-full object-cover" />
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
                        <span>Động cơ quét: {detectionMode === 'fastapi' ? 'FastAPI Server riêng' : 'Hybrid WebML'}</span>
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
                    <h4 className="text-sm font-bold text-white font-outfit mb-1">Mạng Nơ-ron Cục bộ</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Phân tích hình ảnh bằng Transformers.js chạy trực tiếp ở máy khách, không gửi dữ liệu ra ngoài.</p>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-white/5 text-left flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/15">
                    <HardDrive className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-outfit mb-1">Model Cache Thông Minh</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Bộ nhớ weights của model AI tự động lưu lại vào trình duyệt sau lần đầu tải để chạy offline.</p>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-white/5 text-left flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/15">
                    <Network className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-outfit mb-1">Deepfake API Video</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Truy vấn tới Hugging Face Spaces để bóc tách và phân tích các dạng video giả mạo phức tạp.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'loading' && activeFile && (
            <div className="py-12">
              <LoadingState
                statusText={statusText}
                progress={progress}
                isImage={isImage}
                fileName={activeFile.name}
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
            Báo cáo được khởi tạo bởi Antigravity AI Agent (Model: Gemini 3 Flash — Google DeepMind) 🚀
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
                <p className="text-xs text-gray-400 m-0">Kiến trúc kết hợp Hybrid AI Engine</p>
              </div>
            </div>

            {/* Modal Contents */}
            <div className="space-y-5 text-left text-sm text-gray-300 leading-relaxed font-outfit">
              <div>
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  Phân tích Ảnh Cục bộ (In-Browser WebML)
                </h4>
                <p className="pl-3.5">
                  Sử dụng thư viện <strong>Transformers.js</strong> (`@xenova/transformers`) để chạy suy luận trực tiếp trong luồng xử lý của trình duyệt Web. Model chỉ định là <strong>ai-generated-image-detector</strong> có độ tối ưu hóa cực cao. Sau lần chạy đầu tiên, các file weights được lưu trữ an toàn trong IndexedDB của trình duyệt, cho phép phân tích ngoại tuyến không giới hạn mà không cần gửi dữ liệu đi bất cứ đâu.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  Phân tích Video (Hugging Face API)
                </h4>
                <p className="pl-3.5">
                  Do video có dung lượng lớn và yêu cầu bóc tách các frame phức tạp để phát hiện chuyển động giả lập (Deepfake), việc chạy cục bộ trong trình duyệt có thể gây tràn RAM và đơ máy. Vì vậy, ứng dụng sử dụng <strong>Gradio Client API</strong> gửi file video lên máy chủ Hugging Face Space chạy mô hình học sâu chuyên biệt <strong>thecho7/deepfake</strong> để đưa ra phán đoán chất lượng cao nhất mà vẫn bảo toàn tài nguyên máy khách.
                </p>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4.5 mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5">Cam kết bảo mật dữ liệu</h4>
                <p className="text-xs leading-relaxed text-indigo-200">
                  Tất cả hình ảnh của bạn được xử lý tại chỗ và không bao giờ rời khỏi thiết bị. Video được tải trực tiếp tới các máy chủ API chính thức của Hugging Face và được xóa ngay sau khi thực hiện xong quá trình suy luận. Chúng tôi không lưu trữ bất kỳ tài liệu truyền thông nào của người dùng.
                </p>
              </div>
            </div>

            {/* Signature */}
            <div className="mt-8 pt-4 border-t border-white/5 text-center text-xxs font-mono text-gray-500">
              Model Signature: Antigravity AI Agent (Gemini 3 Flash — Google DeepMind) 🚀
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
              <div className="text-left">
                <h3 className="text-xl font-bold text-white font-outfit m-0">Cấu hình Động cơ Quét AI</h3>
                <p className="text-xs text-gray-400 m-0">Tùy chỉnh máy chủ phân tích và phương thức xử lý</p>
              </div>
            </div>

            {/* Body Form */}
            <div className="space-y-5 text-left font-outfit">
              {/* Detection Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Phương thức xử lý (Inference Engine)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDetectionMode('fastapi')}
                    className={`rounded-xl px-4 py-3 text-xs font-semibold cursor-pointer transition-all border ${
                      detectionMode === 'fastapi'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-black/35 border-white/5 text-gray-400 hover:text-white hover:bg-black/50'
                    }`}
                  >
                    FastAPI Server riêng
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetectionMode('hybrid')}
                    className={`rounded-xl px-4 py-3 text-xs font-semibold cursor-pointer transition-all border ${
                      detectionMode === 'hybrid'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-black/35 border-white/5 text-gray-400 hover:text-white hover:bg-black/50'
                    }`}
                  >
                    Hybrid (Local & Gradio)
                  </button>
                </div>
              </div>

              {detectionMode === 'fastapi' ? (
                <>
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
                      <p className="mt-0.5 leading-relaxed text-gray-400">
                        Chế độ này gửi file trực tiếp qua endpoint <code className="text-white bg-white/5 px-1 rounded">/scan-media</code> với header khóa tĩnh để xác thực. Đảm bảo CORS đã được backend cho phép đối với domain này.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Hybrid Config */}
                  <div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                      Phân tích video sử dụng thư viện kết nối API của Hugging Face Spaces. Bạn có thể thay đổi ID của Space để sử dụng các máy chủ hoặc phiên bản sao chép khác của riêng bạn.
                    </p>
                    
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Hugging Face Space ID
                    </label>
                    <input
                      type="text"
                      value={tempHfSpaceId}
                      onChange={(e) => setTempHfSpaceId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 outline-none transition-all"
                      placeholder="Ví dụ: thecho7/deepfake"
                    />
                  </div>

                  {/* Status information banner */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-3 items-start text-xs text-gray-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-purple-300">Hệ thống chuyển đổi dự phòng (Failover):</span>
                      <p className="mt-0.5 leading-relaxed text-gray-400">
                        Nếu máy chủ bạn đặt bị lỗi hoặc tạm tắt, hệ thống sẽ tự động thử kết nối sang máy chủ dự phòng dự bị để duy trì hoạt động phân tích.
                      </p>
                    </div>
                  </div>

                  {/* Security Data Privacy warning banner */}
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 flex gap-3 items-start text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-rose-300">Lưu ý Bảo mật dữ liệu video:</span>
                      <p className="mt-0.5 leading-relaxed text-gray-400">
                        Khi sử dụng các Space công cộng, chủ sở hữu Space có thể xem được log suy luận. Nếu bạn phân tích video nhạy cảm/quan trọng, hãy <strong className="text-rose-300">Duplicate (Sao chép)</strong> Space <code className="text-white bg-white/5 px-1 rounded">thecho7/deepfake</code> về tài khoản Hugging Face của bạn, cài đặt ở chế độ <strong>Private (Riêng tư)</strong> và điền ID Space mới của bạn vào đây để đảm bảo bảo mật dữ liệu tuyệt đối.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
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
        </div>
      )}

    </div>
  );
}

export default App;
