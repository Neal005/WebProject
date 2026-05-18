export interface FastAPIPredictionResult {
  aiPercentage: number;
  realPercentage: number;
  label: 'AI-Generated' | 'Human-Made';
  filename: string;
}

export type FastAPIProgressCallback = (status: string, progress: number) => void;

/**
 * Sends a file (image or video) to a custom Hugging Face FastAPI Space.
 * Provides elegant exception catching for CORS blocks and authentication issues.
 */
export async function scanMediaFastAPI(
  file: File,
  spaceUrl: string,
  apiKey: string = "bodoi_2026",
  hfToken?: string,
  onProgress?: FastAPIProgressCallback
): Promise<FastAPIPredictionResult> {
  try {
    if (onProgress) {
      onProgress("Đang kết nối tới máy chủ FastAPI...", 20);
    }

    // Clean and validate URL
    let targetUrl = spaceUrl.trim();
    
    // Auto-resolve Hugging Face space website URL to direct REST hostname
    // e.g. https://huggingface.co/spaces/NeaI/video-ai-detector -> https://neai-video-ai-detector.hf.space
    const spaceUrlMatch = targetUrl.match(/huggingface\.co\/spaces\/([^/]+)\/([^/]+)/i);
    if (spaceUrlMatch) {
      const owner = spaceUrlMatch[1].toLowerCase().replace(/_/g, "-");
      const name = spaceUrlMatch[2].toLowerCase().replace(/_/g, "-");
      targetUrl = `https://${owner}-${name}.hf.space`;
    }

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    // Remove trailing slash if present, then append endpoint path
    targetUrl = targetUrl.replace(/\/+$/, "") + "/scan-media";

    console.log(`Sending upload to custom FastAPI server: ${targetUrl}`);

    const formData = new FormData();
    formData.append("file", file);

    if (onProgress) {
      onProgress("Hệ thống đang phân tích khung hình, vui lòng đợi...", 50);
    }

    // Dynamic headers construction
    const headers: Record<string, string> = {
      "x-api-key": apiKey
    };

    if (hfToken && hfToken.trim()) {
      headers["Authorization"] = `Bearer ${hfToken.trim()}`;
    }

    // Perform network request with CORS diagnostic handling
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: formData
    });

    if (onProgress) {
      onProgress("Đang xử lý kết quả phân tích...", 85);
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Lỗi xác thực: Sai API Key (x-api-key). Vui lòng kiểm tra lại cấu hình khóa bảo mật.");
      }
      if (response.status === 404) {
        throw new Error("Không tìm thấy cổng API. Đường dẫn '/scan-media' không tồn tại trên máy chủ này.");
      }
      throw new Error(`Máy chủ phản hồi mã lỗi: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("FastAPI Scan Response Data:", data);

    // Validate expected JSON structure
    if (typeof data.ai_probability !== "number" || !data.conclusion) {
      throw new Error("Dữ liệu phản hồi từ máy chủ không đúng định dạng chuẩn (thiếu ai_probability hoặc conclusion).");
    }

    let aiProb = data.ai_probability;
    let realProb = 1 - aiProb;

    // Resiliently parse details block if present to extract high-fidelity probability breakdown
    if (Array.isArray(data.details) && data.details.length > 0) {
      let artificialScore = -1;
      let humanScore = -1;

      data.details.forEach((item: any) => {
        const score = typeof item.score === "number" ? item.score : 0;
        const labelLower = (item.label || "").toLowerCase();
        if (
          labelLower === "artificial" ||
          labelLower === "fake" ||
          labelLower === "ai" ||
          labelLower.startsWith("art")
        ) {
          artificialScore = score;
        } else if (
          labelLower === "human" ||
          labelLower === "real" ||
          labelLower.startsWith("hum")
        ) {
          humanScore = score;
        }
      });

      if (artificialScore !== -1) {
        aiProb = artificialScore;
        realProb = 1 - aiProb;
      } else if (humanScore !== -1) {
        realProb = humanScore;
        aiProb = 1 - realProb;
      }
    }

    const aiPercentage = Math.round(aiProb * 100);
    const realPercentage = Math.round(realProb * 100);
    
    // Map conclusion resiliently: both dima806 model ('Fake') and umm-maybe model ('artificial')
    const conclusionLower = data.conclusion.toLowerCase();
    const label = (
      conclusionLower.includes("fake") || 
      conclusionLower.includes("artificial") || 
      conclusionLower.includes("ai") || 
      conclusionLower.startsWith("art")
    ) ? 'AI-Generated' : 'Human-Made';

    if (onProgress) {
      onProgress("Hoàn thành!", 100);
    }

    return {
      aiPercentage,
      realPercentage,
      label,
      filename: data.filename || file.name
    };

  } catch (error: any) {
    console.error("FastAPI backend error:", error);
    
    // Explicit CORS / network breakdown check
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error(
        "LỖI KẾT NỐI / CHẶN CORS:\n" +
        "Trình duyệt đã chặn yêu cầu (CORS Block) hoặc máy chủ backend chưa được khởi động.\n\n" +
        "Cách khắc phục:\n" +
        "1. Đảm bảo tên miền của bạn đã được thêm vào Whitelist CORS của backend FastAPI.\n" +
        "2. Đảm bảo Space của bạn đang ở trạng thái 'Running'.\n" +
        "3. Sử dụng extension vô hiệu hóa CORS trên trình duyệt để kiểm thử."
      );
    }

    throw new Error(error.message || "Không thể phân tích dữ liệu do lỗi mạng không xác định.");
  }
}
