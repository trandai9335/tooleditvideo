export interface EditorOptions {
  speed: string; // Speed value e.g. "1.16"
  volume: string; // Volume value e.g. "1.30"
  frameRate: string; // e.g. "30"
  contrast: string; // e.g. "1.00"
  brightness: string; // e.g. "0.00"
  saturation: string; // e.g. "1.00"
  red: string; // RGB red e.g. "1.00"
  green: string; // RGB green e.g. "1.00"
  blue: string; // RGB blue e.g. "1.00"
  resolution: string; // Options like "1080:1920", "1920:1080", "1080:1080", "1280:720"
  rotate180: boolean; // Rotate 180 degrees
  muteAudio: boolean; // Mute
  modeVideo11: boolean; // Video mode 1:1
  multiThreading: string; // Thread runner size e.g. "3"
  topVideoName: string | null; // Top file override
  muteTopVideo: boolean; // Mute top video overlay
  downVideoName: string | null; // Down file override
  muteDownVideo: boolean; // Mute down video overlay
  editText: string; // Text overlay label
  backgroundName: string | null; // Solid / background file
  imageAdded: number; // Index or watermark counter
  imageAddedName: string | null; // watermark image name overlay
  folderOut: string; // Output folder display text
}

export interface QueueVideo {
  id: string;
  name: string;
  size: number;
  duration: string;
  timeEstimate: string;
  progress: number;
  status: "Waiting" | "Uploading" | "Processing" | "Completed" | "Error" | "Queued";
  filename: string;
  eta: string;
  fps: number;
  currentFrame: number;
  errorMessage?: string;
  outputPath?: string;
}

export interface ResultFile {
  filename: string;
  originalName: string;
  size: number;
  path: string;
  createdAt: string;
  jobId: string;
}
