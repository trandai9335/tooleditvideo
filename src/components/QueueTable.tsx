import React, { useState } from "react";
import { QueueVideo } from "../types";
import { PlayCircle, Clock, CheckCircle2, AlertTriangle, XCircle, Trash2, Loader2, FileText } from "lucide-react";

interface QueueTableProps {
  videos: QueueVideo[];
  onRemoveVideo: (id: string) => void;
  onShowLogs: (jobId: string) => void;
  onClearAllQueue?: () => void;
}

export default function QueueTable({ videos, onRemoveVideo, onShowLogs, onClearAllQueue }: QueueTableProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex-1 min-h-[300px] bg-[#1e1e1f] border border-neutral-800 rounded-lg overflow-hidden flex flex-col shadow-lg">
      <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#151516]">
        <div className="flex items-center space-x-3">
          <PlayCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">Danh sách hàng đợi xử lý Video</h2>
        </div>
        <div className="flex items-center space-x-2.5">
          {videos.length > 0 && onClearAllQueue && (
            <div className="flex items-center">
              {showConfirm ? (
                <div className="flex items-center space-x-1.5 bg-red-950/60 border border-red-900/40 rounded p-0.5 px-2 animate-pulse whitespace-nowrap">
                  <span className="text-[10px] text-red-300 uppercase font-black tracking-wider">Xác nhận xóa hết?</span>
                  <button
                    onClick={() => {
                      onClearAllQueue();
                      setShowConfirm(false);
                    }}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-black uppercase tracking-wide transition"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[9px] font-bold uppercase tracking-wide transition"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-950/60 rounded text-[10px] font-bold uppercase tracking-wide flex items-center space-x-1.5 transition"
                  title="Xóa tất cả video khỏi hàng đợi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa toàn bộ</span>
                </button>
              )}
            </div>
          )}
          <span className="text-xs font-mono text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded-md">
            Tổng số: <strong className="text-white">{videos.length}</strong> video
          </span>
        </div>
      </div>

      <div className="flex-grow overflow-auto p-4 custom-scrollbar">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 text-neutral-600">
              <PlayCircle className="w-8 h-8" />
            </div>
            <p className="text-sm text-neutral-400 max-w-sm">
              Chưa có video nào trong hàng đợi. Hãy sử dụng Drag & Drop hoặc nút chọn nguồn để thêm video.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-xs text-neutral-400 uppercase font-mono tracking-wider">
                <th className="pb-3 pt-1 pl-4 font-medium">Tên Video</th>
                <th className="pb-3 pt-1 font-medium">Thời lượng</th>
                <th className="pb-3 pt-1 font-medium">Kích thước</th>
                <th className="pb-3 pt-1 font-medium">Tiến độ (%)</th>
                <th className="pb-3 pt-1 font-medium text-right pr-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900/40">
              {videos.map((vid) => {
                const isWaiting = vid.status === "Waiting";
                const isUploading = vid.status === "Uploading";
                const isProcessing = vid.status === "Processing";
                const isCompleted = vid.status === "Completed";
                const isError = vid.status === "Error";
                const isQueued = vid.status === "Queued";

                return (
                  <tr key={vid.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 max-w-xs truncate">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-200 truncate" title={vid.name}>
                          {vid.name}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 truncate">
                          ID: {vid.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-xs text-neutral-300">
                      {vid.duration || "--:--"}
                    </td>
                    <td className="py-3 font-mono text-xs text-neutral-400">
                      {(vid.size / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-3 max-w-[160px]">
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-neutral-805 h-2 rounded-full overflow-hidden bg-neutral-800 relative">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted
                                ? "bg-green-500"
                                : isError
                                ? "bg-red-500"
                                : isUploading
                                ? "bg-sky-500 animate-pulse"
                                : isQueued
                                ? "bg-blue-500/80"
                                : "bg-yellow-500"
                            }`}
                            style={{ width: `${vid.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-medium text-neutral-300">
                          {vid.progress}%
                        </span>
                      </div>
                      {isProcessing && (
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-amber-500 mt-1">
                          <span>FPS: {vid.fps || 24}</span>
                          <span>•</span>
                          <span>Frames: {vid.currentFrame}</span>
                          <span>•</span>
                          <span>ETA: {vid.eta || "--s"}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-2.5">
                        {isQueued && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/50 border border-blue-900/60 text-blue-400 uppercase tracking-widest font-mono">
                            Hàng đợi
                          </span>
                        )}
                        {isWaiting && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 border border-neutral-700 text-neutral-400 uppercase tracking-widest font-mono">
                            Chờ xử lý
                          </span>
                        )}
                        {isUploading && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-950/40 border border-sky-800 text-sky-400 uppercase tracking-widest font-mono flex items-center space-x-1 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Tải lên</span>
                          </span>
                        )}
                        {isProcessing && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-950/40 border border-yellow-700 text-yellow-400 uppercase tracking-widest font-mono flex items-center space-x-1 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Đang dựng</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-950/40 border border-green-800 text-green-400 uppercase tracking-widest font-mono flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đồng bộ</span>
                          </span>
                        )}
                        {isError && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-950/40 border border-red-900 text-red-400 uppercase tracking-widest font-mono flex items-center space-x-1 cursor-pointer"
                            title={vid.errorMessage || "FFmpeg command parameters error"}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Lỗi EQ</span>
                          </span>
                        )}

                        <div className="flex items-center space-x-1 ml-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onShowLogs(vid.id)}
                            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-all"
                            title="Xem nhật ký render FFmpeg"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRemoveVideo(vid.id)}
                            className="p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-all"
                            title="Xóa khỏi hàng đợi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
