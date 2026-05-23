import React, { useState } from "react";
import { ResultFile } from "../types";
import { 
  Folder, Play, Download, Trash2, ShieldAlert, FileVideo, 
  CheckCircle, RefreshCw, X, Loader2, Info
} from "lucide-react";
import JSZip from "jszip";

interface OutputResultsTabProps {
  outputs: ResultFile[];
  onRefresh: () => void;
  onDeleteFile: (filename: string) => void;
  onClearAll: () => void;
}

export default function OutputResultsTab({
  outputs,
  onRefresh,
  onDeleteFile,
  onClearAll,
}: OutputResultsTabProps) {
  const [previewFile, setPreviewFile] = useState<ResultFile | null>(null);
  const [zippingState, setZippingState] = useState<{ active: boolean; progress: number }>({
    active: false,
    progress: 0,
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDownloadAllZip = async () => {
    if (outputs.length === 0) return;
    setZippingState({ active: true, progress: 5 });
    
    try {
      const zip = new JSZip();
      const folder = zip.folder("ket_qua_batch");

      for (let i = 0; i < outputs.length; i++) {
        const file = outputs[i];
        setZippingState({
          active: true,
          progress: Math.round(5 + (i / outputs.length) * 85),
        });

        // Fetch file blob from backend static storage
        const response = await fetch(file.path);
        if (!response.ok) throw new Error(`Could not fetch ${file.filename}`);
        const blob = await response.blob();
        folder?.file(file.filename, blob);
      }

      setZippingState({ active: true, progress: 95 });
      const content = await zip.generateAsync({ type: "blob" });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `ket_qua_batch_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setZippingState({ active: false, progress: 100 });
    } catch (err) {
      console.error("Zipping error:", err);
      alert("Đã xảy ra lỗi khi nén tệp ZIP. Vui lòng tải từng tệp.");
      setZippingState({ active: false, progress: 0 });
    }
  };

  return (
    <div className="bg-[#121213] border border-neutral-800 rounded-lg p-6 shadow-xl flex flex-col space-y-6">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-950/40 text-sky-400 border border-sky-900/60 rounded">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100">Bảng kết quả thành phẩm (Output Results)</h2>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">storage/outputs/ket_qua_batch/</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-800 transition"
            title="Làm mới danh sách"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDownloadAllZip}
            disabled={outputs.length === 0 || zippingState.active}
            className={`px-4 py-2 text-xs font-semibold rounded flex items-center space-x-2 transition ${
              outputs.length === 0 || zippingState.active
                ? "bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow"
            }`}
          >
            {zippingState.active ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Tải Tất Cả dạng ZIP ({outputs.length})</span>
          </button>

          {showConfirm ? (
            <div className="flex items-center space-x-1.5 bg-red-950/65 border border-red-900/50 rounded-md p-1 px-2.5 animate-pulse">
              <span className="text-[10px] text-red-350 uppercase font-black tracking-wider">Chắc chắn xóa sạch?</span>
              <button
                onClick={() => {
                  onClearAll();
                  setShowConfirm(false);
                }}
                className="px-2.5 py-1 bg-red-650 hover:bg-red-750 text-white rounded text-[10px] font-black uppercase tracking-wide transition"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-bold uppercase tracking-wide transition"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={outputs.length === 0}
              className={`px-4 py-2 text-xs font-semibold rounded transition ${
                outputs.length === 0
                  ? "bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed"
                  : "bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40"
              }`}
            >
              Xóa Toàn Bộ
            </button>
          )}
        </div>
      </div>

      {/* Zip Compression Progress Indicator */}
      {zippingState.active && (
        <div className="bg-sky-950/10 border border-sky-900/40 rounded p-4 flex flex-col space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs text-sky-400 font-medium">
            <span>Đang thu thập và nén tệp video thành ZIP hàng loạt...</span>
            <span className="font-mono">{zippingState.progress}%</span>
          </div>
          <div className="h-2 bg-neutral-800 rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded transition-all duration-300"
              style={{ width: `${zippingState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Outputs Grid/List */}
      {outputs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-900/60 border border-neutral-800 flex items-center justify-center mb-4 text-neutral-600">
            <FileVideo className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-300">Thư mục đầu ra hiện đang trống</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Sau khi quá trình biên dịch FFmpeg hoàn thành, các thành phẩm video của bạn sẽ xuất hiện tại đây để xem trước và tải về.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4 shadow-sm">
          {outputs.map((file) => (
            <div 
              key={file.filename}
              className="bg-[#181819] border border-neutral-850 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-neutral-700 transition shadow-inner"
            >
              
              <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
                {/* Embed direct HTML5 video player layout for immediate inline previews */}
                <div className="w-full md:w-56 aspect-video bg-black rounded overflow-hidden relative shadow border border-neutral-800 flex-shrink-0">
                  <video 
                    src={file.path} 
                    preload="metadata"
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info parameters */}
                <div className="flex flex-col space-y-2 text-center md:text-left truncate w-full max-w-md">
                  <h4 
                    className="text-sm font-semibold text-neutral-200 truncate pr-2" 
                    title={file.originalName}
                  >
                    {file.originalName}
                  </h4>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1.5 text-[11px] text-neutral-500 font-mono">
                    <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide">
                      Success
                    </span>
                    <span>•</span>
                    <span className="text-neutral-300">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>Job ID: {file.jobId}</span>
                    <span>•</span>
                    <span>{new Date(file.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons pinned on the far right of the bar */}
              <div className="flex items-center space-x-2 w-full md:w-auto justify-end flex-shrink-0 border-t md:border-t-0 border-neutral-800/40 pt-3 md:pt-0">
                <a
                  href={file.path}
                  download={file.filename}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-black font-extrabold text-xs rounded transition-all flex items-center space-x-1.5 shadow"
                >
                  <Download className="w-4 h-4 stroke-[2.5px]" />
                  <span>Tải video</span>
                </a>

                <button
                  onClick={() => onDeleteFile(file.filename)}
                  className="p-2.5 bg-neutral-900 hover:bg-red-950/30 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-900/30 rounded transition"
                  title="Xóa tệp khỏi kho chứa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Video Preview Modal overlay */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121213] border border-neutral-800 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between">
              <div className="truncate pr-4">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">Thành phẩm hoàn tất</span>
                <h4 className="text-xs font-semibold text-white truncate" title={previewFile.originalName}>
                  {previewFile.originalName}
                </h4>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Video element */}
            <div className="bg-black aspect-video flex items-center justify-center relative border-b border-neutral-800">
              <video 
                src={previewFile.path} 
                controls 
                autoPlay
                className="w-full h-full max-h-[380px] object-contain"
              >
                Trình duyệt của bạn không hỗ trợ định dạng video này.
              </video>
            </div>

            {/* Footer / Stats */}
            <div className="px-5 py-4 bg-[#141415] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-4 text-xs font-mono text-neutral-400">
                <span>Dung lượng: <strong className="text-white">{(previewFile.size / (1024 * 1024)).toFixed(2)} MB</strong></span>
                <span>•</span>
                <span>Trực tuyến: <strong className="text-sky-400 font-sans">Sẵn sàng</strong></span>
              </div>
              <a
                href={previewFile.path}
                download={previewFile.filename}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded text-xs flex items-center justify-center space-x-2 transition"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5px]" />
                <span>Tải thành phẩm .MP4</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
