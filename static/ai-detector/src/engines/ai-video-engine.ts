import { client } from "@gradio/client";

export interface VideoPredictionResult {
  aiPercentage: number;
  realPercentage: number;
  label: 'AI-Generated' | 'Human-Made';
  rawOutput: any;
}

export type VideoProgressCallback = (status: string, progress: number) => void;

/**
 * Uploads a video file to Hugging Face Spaces API for deepfake detection.
 * Integrates defensive multi-server fallbacks and endpoint method resilience.
 */
export async function detectVideoAI(
  videoFile: File,
  spaceId: string = "thecho7/deepfake",
  onProgress?: VideoProgressCallback
): Promise<VideoPredictionResult> {
  // Define failover servers in case the primary one is sleeping, private, or deleted
  const spaceServers = [
    spaceId,
    "Naman712/deepfake-defender"
  ];

  let app: any = null;
  let activeSpace = spaceId;
  let connectionErrorMsg = "";

  // 1. Establish resilient connection
  for (const currentSpace of spaceServers) {
    try {
      activeSpace = currentSpace;
      if (onProgress) {
        onProgress(`Đang kết nối tới máy chủ AI (${currentSpace})...`, 15);
      }
      console.log(`Attempting to connect to Hugging Face Space: ${currentSpace}`);
      
      app = await client(currentSpace);
      console.log(`Successfully connected to Space: ${currentSpace}`);
      break; // Stop loop once connected successfully
    } catch (err: any) {
      console.warn(`Failed to connect to HF Space ${currentSpace}:`, err);
      connectionErrorMsg = err?.message || err || "Không thể tải metadata";
      
      // If we are at the last server, throw the final aggregated error
      if (currentSpace === spaceServers[spaceServers.length - 1]) {
        throw new Error(
          `Không thể kết nối đến bất kỳ máy chủ Hugging Face nào. Chi tiết lỗi: ${connectionErrorMsg}. Bạn có thể tùy chỉnh Space ID đang hoạt động trong phần cài đặt.`
        );
      }
      
      // Progress notification before moving to next server
      if (onProgress) {
        onProgress(`Máy chủ chính (${currentSpace}) đang bận. Đang chuyển sang máy chủ dự phòng...`, 25);
      }
      // Brief sleep before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!app) {
    throw new Error("Không thể khởi tạo Client kết nối Hugging Face.");
  }

  // 2. Perform file upload and prediction with adaptive endpoint failover
  if (onProgress) {
    onProgress("Đã kết nối! Đang tải video lên máy chủ (quá trình này có thể mất ít phút tùy dung lượng)...", 45);
  }
  console.log(`Submitting video file to Space ${activeSpace}:`, videoFile.name, videoFile.size);

  let result: any;
  try {
    // Attempt named prediction first
    result = await app.predict("/predict", [videoFile]);
  } catch (predictErr: any) {
    console.warn("Prediction via named endpoint '/predict' failed. Retrying default index '0'...", predictErr);
    try {
      // Fallback to default index endpoint (Gradio standard fallback)
      result = await app.predict(0, [videoFile]);
    } catch (fallbackErr: any) {
      console.error("All prediction endpoints failed on Space:", activeSpace, fallbackErr);
      throw new Error(
        `Không thể gửi yêu cầu phân tích video tới Space ${activeSpace}. ` +
        `Định dạng API có thể đã thay đổi hoặc máy chủ bị tắt. Chi tiết: ${fallbackErr?.message || fallbackErr}`
      );
    }
  }

  if (onProgress) {
    onProgress("Đang phân tích kết quả dự đoán...", 90);
  }
  console.log("Gradio Space Video Output:", result);

  // 3. Parse prediction output adaptively
  let aiPercentage = 50;
  let realPercentage = 50;
  let label: 'AI-Generated' | 'Human-Made' = 'Human-Made';

  if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const data = result.data[0];

    // Case 1: Gradio Label JSON format: { label: "FAKE", confidences: [{label: "FAKE", confidence: 0.9}, ...] }
    if (typeof data === 'object' && data !== null) {
      let fakeConfidence = 0;
      let realConfidence = 0;

      const mainLabel = (data.label || "").toLowerCase();
      const confidences = data.confidences || [];

      if (Array.isArray(confidences) && confidences.length > 0) {
        confidences.forEach((c: any) => {
          const confLabel = (c.label || "").toLowerCase();
          const val = c.confidence || 0;
          if (confLabel.includes("fake") || confLabel.includes("artificial") || confLabel.includes("ai") || confLabel.includes("deepfake")) {
            fakeConfidence = val;
          } else if (confLabel.includes("real") || confLabel.includes("human") || confLabel.includes("original")) {
            realConfidence = val;
          }
        });
      } else if (mainLabel) {
        if (mainLabel.includes("fake") || mainLabel.includes("deepfake")) {
          fakeConfidence = 1.0;
        } else {
          realConfidence = 1.0;
        }
      }

      if (fakeConfidence > 0 || realConfidence > 0) {
        const total = fakeConfidence + realConfidence;
        aiPercentage = Math.round((fakeConfidence / total) * 100);
        realPercentage = 100 - aiPercentage;
      }
    } 
    // Case 2: String result like "FAKE: 0.95" or just "FAKE"
    else if (typeof data === 'string') {
      const text = data.toLowerCase();
      if (text.includes("fake") || text.includes("deepfake") || text.includes("ai")) {
        label = 'AI-Generated';
        const numberMatch = text.match(/([0-9.]+)/);
        if (numberMatch) {
          const val = parseFloat(numberMatch[1]);
          aiPercentage = val <= 1 ? Math.round(val * 100) : Math.round(val);
          realPercentage = 100 - aiPercentage;
        } else {
          aiPercentage = 90;
          realPercentage = 10;
        }
      } else if (text.includes("real") || text.includes("human")) {
        label = 'Human-Made';
        const numberMatch = text.match(/([0-9.]+)/);
        if (numberMatch) {
          const val = parseFloat(numberMatch[1]);
          realPercentage = val <= 1 ? Math.round(val * 100) : Math.round(val);
          aiPercentage = 100 - realPercentage;
        } else {
          realPercentage = 90;
          aiPercentage = 10;
        }
      }
    }
    // Case 3: Simple float score representing FAKE probability
    else if (typeof data === 'number') {
      aiPercentage = data <= 1 ? Math.round(data * 100) : Math.round(data);
      realPercentage = 100 - aiPercentage;
    }
  } else {
    throw new Error("Không nhận được dữ liệu dự đoán hợp lệ từ máy chủ Hugging Face.");
  }

  // Set predominant label
  label = aiPercentage >= realPercentage ? 'AI-Generated' : 'Human-Made';

  if (onProgress) {
    onProgress("Hoàn thành!", 100);
  }

  return {
    aiPercentage,
    realPercentage,
    label,
    rawOutput: result.data,
  };
}
