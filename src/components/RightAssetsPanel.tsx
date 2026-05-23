import React, { useRef, useState } from "react";
import { EditorOptions } from "../types";
import { 
  Film, Type, Image as ImageIcon, Sparkles, FolderOpen, 
  Play, Square, UploadCloud, Check, X, Loader2, FileText
} from "lucide-react";

interface RightAssetsPanelProps {
  options: EditorOptions;
  onChangeOptions: (updates: Partial<EditorOptions>) => void;
  onStartProcessing: () => void;
  onStopProcessing: () => void;
  isProcessing: boolean;
  queueLength: number;
}

export default function RightAssetsPanel({
  options,
  onChangeOptions,
  onStartProcessing,
  onStopProcessing,
  isProcessing,
  queueLength,
}: RightAssetsPanelProps) {
  const topVideoInputRef = useRef<HTMLInputElement>(null);
  const downVideoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: "idle" | "uploading" | "success" | "error" }>({
    topVideo: "idle",
    downVideo: "idle",
    background: "idle",
    watermark: "idle",
  });

  const uploadFile = async (file: File, key: "topVideo" | "background" | "imageAddedName" | "downVideo") => {
    const statusKey = key === "imageAddedName" ? "watermark" : key;
    setUploadStatus((prev) => ({ ...prev, [statusKey]: "uploading" }));
    
    const formData = new FormData();
    formData.append(key === "imageAddedName" ? "imageAdded" : key, file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      if (data.status === "success" && data.optionFiles) {
        setUploadStatus((prev) => ({ ...prev, [statusKey]: "success" }));
        
        if (key === "topVideo") {
          onChangeOptions({ topVideoName: data.optionFiles.topVideo });
        } else if (key === "downVideo") {
          onChangeOptions({ downVideoName: data.optionFiles.downVideo });
        } else if (key === "background") {
          onChangeOptions({ backgroundName: data.optionFiles.background });
        } else if (key === "imageAddedName") {
          onChangeOptions({ imageAddedName: data.optionFiles.imageAdded });
        }
      } else {
        throw new Error(data.message || "File parsing failed");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus((prev) => ({ ...prev, [statusKey]: "error" }));
    }
  };

  const handleTopVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0], "topVideo");
    }
  };

  const handleDownVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0], "downVideo");
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0], "background");
    }
  };

  const handleWatermarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0], "imageAddedName");
    }
  };

  return (
    <div className="bg-[#121213] border border-neutral-800 rounded-lg p-5 flex flex-col space-y-6 shadow-xl">
      <div className="flex items-center space-x-2 pb-3 border-b border-neutral-800">
        <Film className="w-4 h-4 text-sky-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Layout Overlay & Asset Đầu vào</h3>
      </div>

      <div className="space-y-4">
        {/* TOP VIDEO (10%) */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-300 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Top Video (10% chiều cao)</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">mp4, mov, jpg, png</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              placeholder="Chọn Top overlay video hoặc ảnh..."
              value={options.topVideoName || ""}
              className="flex-grow bg-[#1a1a1b] border border-neutral-800 rounded text-xs text-neutral-400 px-3 py-2 truncate focus:outline-none"
            />
            <button
              onClick={() => topVideoInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 hover:text-white text-neutral-300 border border-neutral-700/60 rounded text-xs font-medium transition"
            >
              Chọn file
            </button>
            <input
              ref={topVideoInputRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={handleTopVideoChange}
            />
          </div>
          {uploadStatus.topVideo === "uploading" && (
            <span className="text-[10px] text-sky-400 font-mono animate-pulse flex items-center space-x-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Đang tải tệp lên máy chủ...</span>
            </span>
          )}
          {uploadStatus.topVideo === "success" && (
            <span className="text-[10px] text-green-400 font-mono flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Đã đồng bộ thành công!</span>
            </span>
          )}
        </div>

        {/* DOWN VIDEO (10%) */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-300 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>Down Video (10% chiều cao)</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">mp4, mov, jpg, png</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              placeholder="Chọn Down overlay video hoặc ảnh..."
              value={options.downVideoName || ""}
              className="flex-grow bg-[#1a1a1b] border border-neutral-800 rounded text-xs text-neutral-400 px-3 py-2 truncate focus:outline-none"
            />
            <button
              onClick={() => downVideoInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 hover:text-white text-neutral-300 border border-neutral-700/60 rounded text-xs font-medium transition"
            >
              Chọn file
            </button>
            <input
              ref={downVideoInputRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={handleDownVideoChange}
            />
          </div>
          {uploadStatus.downVideo === "uploading" && (
            <span className="text-[10px] text-purple-400 font-mono animate-pulse flex items-center space-x-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Đang tải tệp lên máy chủ...</span>
            </span>
          )}
          {uploadStatus.downVideo === "success" && (
            <span className="text-[10px] text-green-400 font-mono flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Đã đồng bộ thành công!</span>
            </span>
          )}
        </div>

        {/* BACKGROUND */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-300 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Background (Tùy chọn nền)</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">mp4, png, jpg</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              placeholder="Sử dụng màu đen mặc định hoặc tải tệp..."
              value={options.backgroundName || ""}
              className="flex-grow bg-[#1a1a1b] border border-neutral-800 rounded text-xs text-neutral-400 px-3 py-2 truncate focus:outline-none"
            />
            <button
              onClick={() => backgroundInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 hover:text-white text-neutral-300 border border-neutral-700/60 rounded text-xs font-medium transition"
            >
              Chọn file
            </button>
            <input
              ref={backgroundInputRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={handleBackgroundChange}
            />
          </div>
          {uploadStatus.background === "uploading" && (
            <span className="text-[10px] text-amber-500 font-mono animate-pulse flex items-center space-x-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Đang tải lên...</span>
            </span>
          )}
        </div>

        {/* IMAGE ADDED (WATERMARK) */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-300 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span>Logo góc / Hình đóng dấu (Watermark)</span>
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="number"
              value={options.imageAdded}
              onChange={(e) => onChangeOptions({ imageAdded: parseInt(e.target.value, 10) || 5 })}
              className="col-span-1 bg-[#1a1a1b] border border-neutral-800 rounded text-xs text-white text-center py-2 focus:outline-none"
              title="Kích thước logo so với chiều rộng"
            />
            <div className="col-span-3 flex items-center space-x-2">
              <input
                type="text"
                readOnly
                placeholder="Tải Logo watermark..."
                value={options.imageAddedName || ""}
                className="flex-grow bg-[#1a1a1b] border border-neutral-800 rounded text-xs text-neutral-400 px-3 py-2 truncate focus:outline-none"
              />
              <button
                onClick={() => watermarkInputRef.current?.click()}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 hover:text-white text-neutral-300 border border-neutral-700/60 rounded text-xs font-medium transition"
              >
                Chọn
              </button>
              <input
                ref={watermarkInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleWatermarkChange}
              />
            </div>
          </div>
        </div>

        {/* OUTPUT FOLER DIRECTORY */}
        <div className="flex flex-col space-y-1.5">
          <span className="text-xs font-medium text-neutral-400">Thư mục xuất thành phẩm</span>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={options.folderOut || "/storage/outputs/ket_qua_batch"}
              className="flex-grow bg-[#151516] border border-neutral-900 rounded text-xs text-neutral-500 px-3 py-2 font-mono"
            />
            <button className="p-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-500 hover:text-white transition">
              <FolderOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CORE CONTROLLERS GRID */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
        <button
          onClick={onStartProcessing}
          disabled={isProcessing || queueLength === 0}
          className={`flex flex-col items-center justify-center py-4 rounded-lg border transition-all ${
            isProcessing || queueLength === 0
              ? "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed"
              : "bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border-emerald-900/60 shadow-lg active:scale-95"
          }`}
        >
          <Play className="w-8 h-8 fill-emerald-500 text-emerald-500 mb-1 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Start Batch</span>
        </button>

        <button
          onClick={onStopProcessing}
          disabled={!isProcessing}
          className={`flex flex-col items-center justify-center py-4 rounded-lg border transition-all ${
            !isProcessing
              ? "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed"
              : "bg-red-950/30 hover:bg-red-950/50 text-red-400 border-red-900/60 active:scale-95"
          }`}
        >
          <Square className="w-8 h-8 fill-red-500 text-red-500 mb-1" />
          <span className="text-xs font-bold uppercase tracking-wider">Stop Queue</span>
        </button>
      </div>
    </div>
  );
}
