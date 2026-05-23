import React, { useState, useEffect, useRef } from "react";
import { EditorOptions, QueueVideo, ResultFile } from "./types";
import LeftSettingsPanel from "./components/LeftSettingsPanel";
import RightAssetsPanel from "./components/RightAssetsPanel";
import QueueTable from "./components/QueueTable";
import OutputResultsTab from "./components/OutputResultsTab";
import { 
  Film, Sparkles, UploadCloud, CheckCircle2, AlertTriangle, 
  RefreshCw, Layers, Sliders, PlaySquare, ChevronRight, Play, Info
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"editor" | "output-result">("editor");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // App States
  const [videos, setVideos] = useState<QueueVideo[]>([]);
  const [outputs, setOutputs] = useState<ResultFile[]>([]);
  const [unprocessedQueue, setUnprocessedQueue] = useState<{ filename: string; originalName: string; size: number }[]>([]);

  // Generate visual queue model by combining live unprocessed client queue with database background processes
  const unprocessedVideos: QueueVideo[] = unprocessedQueue.map((item) => ({
    id: `UNPROCESSED_${item.filename}`,
    name: item.originalName,
    size: item.size,
    duration: "00:15",
    timeEstimate: "Chờ Start Batch",
    progress: 0,
    status: "Queued",
    filename: item.filename,
    eta: "--",
    fps: 0,
    currentFrame: 0,
  }));
  const displayVideos = [...unprocessedVideos, ...videos];
  
  // Shared Editor Configuration state
  const [options, setOptions] = useState<EditorOptions>({
    speed: "1.16",
    volume: "1.30",
    frameRate: "30",
    contrast: "1.00",
    brightness: "0.00",
    saturation: "1.00",
    red: "1.00",
    green: "1.00",
    blue: "1.00",
    resolution: "1080:1920",
    rotate180: false,
    muteAudio: false,
    modeVideo11: false,
    multiThreading: "3",
    topVideoName: null,
    muteTopVideo: true,
    editText: "Biên tập Batch Video trực tuyến hoàn chỉnh",
    downVideoName: null,
    muteDownVideo: true,
    backgroundName: null,
    imageAdded: 5,
    imageAddedName: null,
    folderOut: "/storage/outputs/ket_qua_batch",
  });

  // Socket state reference
  const wsRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  // Load and subscribe WebSockets
  useEffect(() => {
    connectWS();
    refreshData();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const connectWS = () => {
    setWsStatus("connecting");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log("Connecting to WS:", wsUrl);
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsStatus("connected");
      setErrorMessage(null);
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "SYNC_JOBS") {
          // Sync server queue jobs list with local list
          const serverJobs = data.jobs as any[];
          const mappedVideos: QueueVideo[] = serverJobs.map((j) => ({
            id: j.id,
            name: j.originalName,
            size: j.size,
            duration: j.duration,
            timeEstimate: j.eta,
            progress: j.progress,
            status: j.status,
            filename: j.filename,
            eta: j.eta,
            fps: j.fps,
            currentFrame: j.currentFrame,
            errorMessage: j.errorMessage || undefined,
            outputPath: j.outputPath || undefined,
          }));
          setVideos(mappedVideos);

          // If some completions arrived, refresh outputs listing in background
          if (serverJobs.some((j) => j.status === "Completed" || j.status === "Error")) {
            refreshOutputs();
          }
        } else if (data.type === "JOB_PROGRESS") {
          // Dynamic updates
          setVideos((prev) =>
            prev.map((v) => {
              if (v.id === data.jobId) {
                return {
                  ...v,
                  progress: data.progress,
                  eta: data.eta,
                  fps: data.fps,
                  currentFrame: data.currentFrame,
                  status: data.status,
                };
              }
              return v;
            })
          );
        }
      } catch (err) {
        console.error("Error parsing WS updates", err);
      }
    };

    socket.onclose = () => {
      setWsStatus("disconnected");
      // Retry connection after 4 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connectWS();
        }
      }, 4000);
    };

    socket.onerror = (err) => {
      console.error("WebSocket encountered an error:", err);
      setWsStatus("disconnected");
    };
  };

  const refreshData = () => {
    refreshJobs();
    refreshOutputs();
  };

  const refreshJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const serverJobs = await res.json();
        const mapped: QueueVideo[] = serverJobs.map((j: any) => ({
          id: j.id,
          name: j.originalName,
          size: j.size,
          duration: j.duration,
          timeEstimate: j.eta,
          progress: j.progress,
          status: j.status,
          filename: j.filename,
          eta: j.eta,
          fps: j.fps,
          currentFrame: j.currentFrame,
          errorMessage: j.errorMessage || undefined,
          outputPath: j.outputPath || undefined,
        }));
        setVideos(mapped);
      }
    } catch (e) {
      console.error("Error loading jobs list:", e);
    }
  };

  const refreshOutputs = async () => {
    try {
      const res = await fetch("/api/outputs");
      if (res.ok) {
        const files = await res.json();
        setOutputs(files);
      }
    } catch (e) {
      console.error("Error loading output results:", e);
    }
  };

  // Drag & Drop handle
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files);
    }
  };

  const handleFilesUpload = async (fileList: FileList) => {
    const formData = new FormData();
    const filesToUpload: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Only process video files
      if (file.type.startsWith("video/")) {
        formData.append("videos", file);
        filesToUpload.push(file);
      }
    }

    if (filesToUpload.length === 0) {
      alert("Vui lòng kéo thả hoặc tải lên các tệp Video hợp lệ (.mp4, .mov, v.v.)");
      return;
    }

    // Append to local videos immediately with "Uploading" state
    const placeholders: QueueVideo[] = filesToUpload.map((f, i) => ({
      id: `TEMP_${Date.now()}_${i}`,
      name: f.name,
      size: f.size,
      duration: "00:15",
      timeEstimate: "Waiting",
      progress: 0,
      status: "Uploading",
      filename: "",
      eta: "Uploading",
      fps: 0,
      currentFrame: 0,
    }));

    setVideos((prev) => [...prev, ...placeholders]);
    setUploadProgress(10);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Batch upload failed");
      const data = await res.json();

      if (data.status === "success" && data.uploaded) {
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 1000);
        
        // Remove temporary placeholder videos
        setVideos((prev) => prev.filter((v) => !v.id.startsWith("TEMP_")));
        
        // Append newly uploaded files to unprocessedQueue instead of immediate compilation
        const uploadedItems = data.uploaded as { filename: string; originalName: string; size: number }[];
        setUnprocessedQueue((prev) => [...prev, ...uploadedItems]);
      } else {
        throw new Error(data.message || "Failed parsing files on backend server");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Tải tệp video lên máy chủ thất bại: " + err.message);
      // Clean temporary items
      setVideos((prev) => prev.filter((v) => !v.id.startsWith("TEMP_")));
      setUploadProgress(null);
    }
  };

  // Start processing remaining Waitings in queue
  const handleStartProcessing = async () => {
    const listToProcess = unprocessedQueue;

    if (listToProcess.length === 0) {
      alert("Hàng đợi rỗng hoặc các video đã được khởi chạy rồi! Vui lòng tải thêm video.");
      return;
    }

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoFiles: listToProcess,
          options: options,
        }),
      });
      if (res.ok) {
        // Clear the client-side queue as they are now server-side jobs!
        setUnprocessedQueue([]);
        refreshData();
      } else {
        const errorData = await res.json();
        alert("Lỗi bắt đầu biên tập: " + (errorData.message || "Unknown error"));
      }
    } catch (e: any) {
      console.error("Scale error: ", e);
      alert("Lỗi kết nối máy chủ khi xử lý hàng loạt.");
    }
  };

  // Stop / abort operations
  const handleStopProcessing = async () => {
    // Clear jobs which means active queues will terminate
    if (confirm("Bạn có chắc chắn muốn ngắt hàng đợi và khởi động lại luồng biên dịch? Trạng thái hiện tại sẽ được lưu.")) {
      try {
        await fetch("/api/clear-outputs", { method: "DELETE" });
        refreshData();
      } catch (err) {
        console.error("Stop error:", err);
      }
    }
  };

  // Remove video row
  const handleRemoveVideo = async (id: string) => {
    if (id.startsWith("TEMP_")) {
      setVideos((prev) => prev.filter((v) => v.id !== id));
      return;
    }

    if (id.startsWith("UNPROCESSED_")) {
      const filename = id.replace("UNPROCESSED_", "");
      setUnprocessedQueue((prev) => prev.filter((item) => item.filename !== filename));
      return;
    }

    try {
      const res = await fetch(`/api/job/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error("Error removing job:", err);
    }
  };

  // Clear all pending items & active jobs in database
  const handleClearAllQueue = async () => {
    try {
      setUnprocessedQueue([]);
      const res = await fetch("/api/jobs", { method: "DELETE" });
      if (res.ok) {
        setVideos([]);
      } else {
        console.error("Failed to clear background server jobs");
      }
    } catch (e) {
      console.error("Clear all queue error:", e);
    }
  };

  // View raw stdout log of FFmpeg compilation
  const handleShowLogs = async (jobId: string) => {
    try {
      const res = await fetch(`/api/logs/${jobId}`);
      if (res.ok) {
        const text = await res.text();
        alert(`NHẬT KÝ RENDER FFMPEG DÀNH CHO JOB ${jobId}:\n\n${text}`);
      } else {
        alert("Hiện chưa có nhật ký log chi tiết cho tiến trình này.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete output result
  const handleDeleteOutputFile = async (filename: string) => {
    try {
      const res = await fetch(`/api/outputs/${filename}`, { method: "DELETE" });
      if (res.ok) {
        setOutputs((prev) => prev.filter((o) => o.filename !== filename));
      }
    } catch (e) {
      console.error("Delete file failed: ", e);
    }
  };

  const handleClearAllOutputs = async () => {
    try {
      const res = await fetch("/api/clear-outputs", { method: "DELETE" });
      if (res.ok) {
        setOutputs([]);
        refreshData();
      }
    } catch (e) {
      console.error("Clear all outputs failed: ", e);
    }
  };

  const isCurrentlyProcessing = videos.some((v) => v.status === "Processing" || v.status === "Uploading");

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-neutral-200 flex flex-col font-sans select-none antialiased">
      
      {/* 1. Header Navigation Bar */}
      <header className="bg-[#111112] border-b border-neutral-900 sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold shadow-md animate-pulse">
            <Film className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Tool Edit By Đại Một Cú</h1>
            <p className="text-[10px] text-neutral-500 font-mono mt-0.5 flex items-center space-x-1.5">
              <span>Hệ thống dựng video hàng loạt</span>
              <span>•</span>
              <span className={`w-1.5 h-1.5 rounded-full ${wsStatus === "connected" ? "bg-emerald-500 animate-ping" : "bg-red-500"}`} />
              <span className={wsStatus === "connected" ? "text-emerald-400 font-bold" : "text-red-400"}>
                {wsStatus === "connected" ? "WS Kèm luồng" : "Mất kết nối WS"}
              </span>
            </p>
          </div>
        </div>

        {/* Center menu tabs */}
        <nav className="flex items-center bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "editor"
                ? "bg-neutral-800 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Bàn Làm Việc
          </button>
          
          <button
            onClick={() => setActiveTab("output-result")}
            className={`px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition relative flex items-center space-x-1.5 ${
              activeTab === "output-result"
                ? "bg-neutral-800 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>Kết quả đầu ra</span>
            {outputs.length > 0 && (
              <span className="w-4 h-4 bg-sky-500 text-[9px] font-black font-mono text-white rounded-full flex items-center justify-center animate-pulse">
                {outputs.length}
              </span>
            )}
          </button>
        </nav>

        {/* Right utility elements */}
        <div className="hidden lg:flex items-center space-x-3.5">
          <div className="text-right">
            <span className="text-[9px] font-mono text-neutral-500 block uppercase">Server Engine Status</span>
            <span className="text-xs text-emerald-400 font-mono font-bold flex items-center justify-end space-x-1.5">
              <span>Host 3000 Active</span>
            </span>
          </div>
        </div>

      </header>

      {/* 2. Drag and Drop Overlay Container */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-grow flex flex-col items-stretch overflow-hidden relative"
      >
        
        {/* Dynamic Drag Drop Active Mask */}
        {isDragOver && (
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-4 border-dashed border-emerald-500 m-4 rounded-xl transition">
            <UploadCloud className="w-16 h-16 text-emerald-400 animate-bounce mb-3" />
            <h2 className="text-xl font-bold text-white">Thả các file Video vào đây để tự động nạp nguồn!</h2>
            <p className="text-xs text-neutral-300 mt-1">Hỗ trợ các định dạng .MP4, .MOV xử lý song song.</p>
          </div>
        )}

        {/* 3. Error Banner info */}
        {errorMessage && (
          <div className="bg-red-950/30 border-b border-red-900/60 text-red-400 px-6 py-3 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="text-white hover:underline bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800"
            >
              Đã hiểu
            </button>
          </div>
        )}

        {/* 4. Batch Operations Workstation Layout */}
        <div className="p-6 flex-grow flex flex-col space-y-6 overflow-auto">
          
          {activeTab === "output-result" ? (
            
            // Tab Output Result Panel
            <OutputResultsTab
              outputs={outputs}
              onRefresh={refreshOutputs}
              onDeleteFile={handleDeleteOutputFile}
              onClearAll={handleClearAllOutputs}
            />
            
          ) : (
            
            // Workstation Unified 3-Column Layout: Left (2/4), Middle (1/4), Right (1/4)
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Left Column (2/4 ratio = lg:col-span-2) */}
              <div className="lg:col-span-2 flex flex-col space-y-6">
                
                {/* Upload block */}
                <div className="bg-[#121213] border border-neutral-850 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg relative overflow-hidden">
                  <div className="absolute -right-3 -bottom-3 text-neutral-900/20 pointer-events-none">
                    <UploadCloud className="w-44 h-44" />
                  </div>
                  
                  <div className="flex items-center space-x-4 z-10">
                    <div className="w-11 h-11 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <UploadCloud className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Nhập danh sách video nguồn</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">Kéo thả hoặc nhấn nút tải lên nhiều tệp cùng lúc.</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 z-10 w-full md:w-auto">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      id="batch-source-file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <label
                      htmlFor="batch-source-file"
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded text-xs tracking-wider uppercase cursor-pointer transition shadow text-center flex-grow md:flex-grow-0"
                    >
                      Tải Video lên
                    </label>
                  </div>
                </div>

                {/* Upload batch progress block if active */}
                {uploadProgress !== null && (
                  <div className="bg-sky-950/20 border border-sky-900/40 text-sky-400 p-4 rounded-lg flex items-center justify-between text-xs font-semibold animate-pulse">
                    <div className="flex items-center space-x-3.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                      <span>Đang truyền tải video lên máy chủ...</span>
                    </div>
                    <span className="font-mono text-cyan-400 text-sm font-bold">{uploadProgress}%</span>
                  </div>
                )}

                {/* Main videos list table rendering */}
                <QueueTable 
                  videos={displayVideos} 
                  onRemoveVideo={handleRemoveVideo}
                  onShowLogs={handleShowLogs}
                  onClearAllQueue={handleClearAllQueue}
                />

              </div>

              {/* Middle Column (1/4 ratio = lg:col-span-1) */}
              <div className="lg:col-span-1 flex flex-col space-y-6">
                <LeftSettingsPanel 
                  options={options}
                  onChangeOptions={(updates) => setOptions((prev) => ({ ...prev, ...updates }))}
                />
              </div>

              {/* Right Column (1/4 ratio = lg:col-span-1) */}
              <div className="lg:col-span-1 flex flex-col space-y-6">
                <RightAssetsPanel 
                  options={options}
                  onChangeOptions={(updates) => setOptions((prev) => ({ ...prev, ...updates }))}
                  onStartProcessing={handleStartProcessing}
                  onStopProcessing={handleStopProcessing}
                  isProcessing={isCurrentlyProcessing}
                  queueLength={unprocessedQueue.length}
                />
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 5. Fluid Responsive Footer Details */}
      <footer className="bg-[#0e0e0f] border-t border-neutral-900 py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-mono gap-3.5">
        <div>
          <span>Bản quyền © 2026</span>
          <span className="text-neutral-400 font-bold ml-1">Tool Edit By Đại Một Cú</span>
          <span>. Toàn quyền bảo lưu.</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-500 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Nhiều luồng CPU / GPU tăng tốc</span>
          </span>
          <span>•</span>
          <span>FastAPI (Python) fallbacks v4</span>
        </div>
      </footer>

    </div>
  );
}
