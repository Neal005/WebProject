import { pipeline, env } from '@xenova/transformers';

// Ensure browser caching is enabled for model weights (IndexedDB cache)
env.useBrowserCache = true;

// Define prediction result format
export interface ImagePredictionResult {
  aiPercentage: number;
  realPercentage: number;
  label: 'AI-Generated' | 'Human-Made';
  rawOutput: any[];
}

export type ModelProgressCallback = (status: string, progress: number) => void;

// Singleton pattern to cache the pipeline instance
let imagePipelineInstance: any = null;

/**
 * Initializes and retrieves the image-classification pipeline.
 * Supports a callback to update loading progress on the UI.
 */
export async function getImageDetectorPipeline(
  onProgress?: ModelProgressCallback
): Promise<any> {
  if (imagePipelineInstance) {
    if (onProgress) onProgress('ready', 100);
    return imagePipelineInstance;
  }

  try {
    if (onProgress) onProgress('initializing', 0);

    // Create the pipeline. Transformers.js handles model download or loads it from IndexedDB cache if already saved.
    imagePipelineInstance = await pipeline(
      'image-classification',
      'Xenova/ai-generated-image-detector',
      {
        progress_callback: (data: any) => {
          if (data.status === 'downloading' || data.status === 'progress') {
            const progress = data.progress ? Math.round(data.progress) : 0;
            if (onProgress) {
              onProgress(`Tải mô hình AI (${progress}%)`, progress);
            }
          } else if (data.status === 'done') {
            if (onProgress) onProgress('Đang tải cấu hình...', 95);
          } else if (data.status === 'ready') {
            if (onProgress) onProgress('Sẵn sàng', 100);
          }
        },
      }
    );

    if (onProgress) onProgress('Sẵn sàng', 100);
    return imagePipelineInstance;
  } catch (error) {
    console.error('Error loading Transformers.js pipeline:', error);
    if (onProgress) onProgress('Lỗi tải mô hình!', 0);
    throw new Error('Không thể tải mô hình AI. Vui lòng kiểm tra kết nối mạng của bạn.');
  }
}

/**
 * Runs client-side AI detection on the provided Image file.
 * Returns the classification percentages and the predominant label.
 */
export async function detectImageAI(
  imageFile: File,
  onProgress?: ModelProgressCallback
): Promise<ImagePredictionResult> {
  // 1. Get/Initialize the detector pipeline
  const detector = await getImageDetectorPipeline(onProgress);

  // 2. Generate a local blob URL for the image file (client-side only, no network request)
  const imageUrl = URL.createObjectURL(imageFile);

  try {
    if (onProgress) onProgress('Đang phân tích hình ảnh...', 99);

    // 3. Perform inference
    const output = await detector(imageUrl);
    console.log('Transformers.js Image Output:', output);

    // Clean up the object URL to release browser memory
    URL.revokeObjectURL(imageUrl);

    // 4. Parse the output
    // The model Xenova/ai-generated-image-detector returns an array of label/scores:
    // e.g., [{label: 'artificial', score: 0.9}, {label: 'human', score: 0.1}]
    let artificialScore = 0;
    let humanScore = 0;

    if (Array.isArray(output)) {
      output.forEach((item: any) => {
        const score = item.score || 0;
        if (item.label === 'artificial' || item.label.toLowerCase() === 'fake' || item.label.toLowerCase() === 'ai') {
          artificialScore = score;
        } else if (item.label === 'human' || item.label.toLowerCase() === 'real') {
          humanScore = score;
        }
      });
    }

    // Fallback if formatting differs slightly
    if (artificialScore === 0 && humanScore === 0 && output.length > 0) {
      // If we don't match the labels exactly, assume the first index is the detection result
      const first = output[0];
      if (first.label.toLowerCase().includes('art') || first.label.toLowerCase().includes('fake')) {
        artificialScore = first.score;
        humanScore = 1 - first.score;
      } else {
        humanScore = first.score;
        artificialScore = 1 - first.score;
      }
    }

    const aiPercentage = Math.round(artificialScore * 100);
    const realPercentage = Math.round(humanScore * 100);
    
    // Predominant class
    const label = aiPercentage >= realPercentage ? 'AI-Generated' : 'Human-Made';

    return {
      aiPercentage,
      realPercentage,
      label,
      rawOutput: output,
    };
  } catch (error) {
    URL.revokeObjectURL(imageUrl);
    console.error('Error during image inference:', error);
    throw new Error('Quá trình phân tích ảnh thất bại. Định dạng file có thể không được hỗ trợ.');
  }
}
