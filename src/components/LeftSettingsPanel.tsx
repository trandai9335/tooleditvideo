import React from "react";
import { EditorOptions } from "../types";
import { Sliders, RotateCw, Video, Settings2, Sparkles, Volume2, Shield } from "lucide-react";

interface LeftSettingsPanelProps {
  options: EditorOptions;
  onChangeOptions: (updates: Partial<EditorOptions>) => void;
}

export default function LeftSettingsPanel({ options, onChangeOptions }: LeftSettingsPanelProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      onChangeOptions({ [name]: checked });
    } else {
      onChangeOptions({ [name]: value });
    }
  };

  const handleCheckboxToggle = (field: keyof EditorOptions) => {
    onChangeOptions({ [field]: !options[field] });
  };

  return (
    <div className="bg-[#121213] border border-neutral-800 rounded-lg p-5 flex flex-col space-y-5 shadow-xl select-none">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Bộ Tham Số Cấu Hình (EQ & Render)</h3>
        </div>
        <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-900/30">
          Vọc FFmpeg
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Row 1: Speed, Contrast, Red, Resolution Selection */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Tốc độ Video</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="speed"
              value={options.speed}
              onChange={handleInputChange}
              step="0.01"
              min="0.1"
              max="10"
              className="flex-grow bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Độ tương phản (Contrast)</label>
          <input
            type="number"
            name="contrast"
            value={options.contrast}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            max="3"
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">RGB Đỏ (Red Gain)</label>
          <input
            type="number"
            name="red"
            value={options.red}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            max="5"
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Độ phân giải đầu ra</label>
          <select
            name="resolution"
            value={options.resolution}
            onChange={handleInputChange}
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="1080:1920">1080x1920 (TikTok 9:16)</option>
            <option value="1920:1080">1920x1080 (HD 16:9)</option>
            <option value="1080:1080">1080x1080 (Square 1:1)</option>
            <option value="1280:720">1280x720 (Standard HD)</option>
            <option value="720:1280">720x1280 (Portrait)</option>
          </select>
        </div>

        {/* Row 2: Volume, Brightness, Green, Rotate checkbox */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Âm lượng Audio</label>
          <input
            type="number"
            name="volume"
            value={options.volume}
            onChange={handleInputChange}
            step="0.05"
            min="0"
            max="10"
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Độ sáng (Brightness)</label>
          <input
            type="number"
            name="brightness"
            value={options.brightness}
            onChange={handleInputChange}
            step="0.01"
            min="-1"
            max="1"
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">RGB Xanh lá (Green Gain)</label>
          <input
            type="number"
            name="green"
            value={options.green}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            max="5"
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-col justify-end pb-1.5">
          <label className="flex items-center space-x-3 cursor-pointer py-1 text-white select-none">
            <input
              type="checkbox"
              name="rotate180"
              checked={options.rotate180}
              onChange={handleInputChange}
              className="w-4 h-4 rounded Accent-emerald bg-neutral-950 border-neutral-800 focus:ring-0 checked:bg-emerald-500"
            />
            <span className="text-xs text-neutral-300 font-medium">Lật mặt 180 (Rotate 180)</span>
          </label>
        </div>

        {/* Row 3: Frame Rate, Saturation, Blue, Mute Audio checkbox */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Tốc độ khung hình (FPS)</label>
          <input
            type="number"
            name="frameRate"
            value={options.frameRate}
            onChange={handleInputChange}
            min="10"
            max="120"
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Độ bão hòa (Saturation)</label>
          <input
            type="number"
            name="saturation"
            value={options.saturation}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            max="3"
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">RGB Xanh lam (Blue Gain)</label>
          <input
            type="number"
            name="blue"
            value={options.blue}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            max="5"
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-col justify-end pb-1.5">
          <label className="flex items-center space-x-3 cursor-pointer py-1 text-white select-none">
            <input
              type="checkbox"
              name="muteAudio"
              checked={options.muteAudio}
              onChange={handleInputChange}
              className="w-4 h-4 rounded accent-emerald bg-neutral-950 border-neutral-800 focus:ring-0"
            />
            <span className="text-xs text-neutral-300 font-medium">Tắt tiếng Main Video (Mute)</span>
          </label>
        </div>

        <div className="flex flex-col justify-end pb-1.5">
          <label className="flex items-center space-x-3 cursor-pointer py-1 text-white select-none">
            <input
              type="checkbox"
              name="muteTopVideo"
              checked={!!options.muteTopVideo}
              onChange={handleInputChange}
              className="w-4 h-4 rounded accent-emerald bg-neutral-950 border-neutral-800 focus:ring-0"
            />
            <span className="text-xs text-neutral-300 font-medium">Tắt tiếng Top Video</span>
          </label>
        </div>

        <div className="flex flex-col justify-end pb-1.5">
          <label className="flex items-center space-x-3 cursor-pointer py-1 text-white select-none">
            <input
              type="checkbox"
              name="muteDownVideo"
              checked={!!options.muteDownVideo}
              onChange={handleInputChange}
              className="w-4 h-4 rounded accent-emerald bg-neutral-950 border-neutral-800 focus:ring-0"
            />
            <span className="text-xs text-neutral-300 font-medium">Tắt tiếng Down Video</span>
          </label>
        </div>

        {/* Row 4: MultiThreading, Mode Video 1:1, timeline slider */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">Luồng xử lý (MultiThreading)</label>
          <input
            type="number"
            name="multiThreading"
            value={options.multiThreading}
            onChange={handleInputChange}
            min="1"
            max="12"
            className="bg-[#1a1a1b] border border-neutral-800 rounded text-sm text-white px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-col justify-end pb-1.5">
          <label className="flex items-center space-x-3 cursor-pointer py-1 text-white select-none">
            <input
              type="checkbox"
              name="modeVideo11"
              checked={options.modeVideo11}
              onChange={handleInputChange}
              className="w-4 h-4 rounded Accent-emerald bg-neutral-950 border-neutral-800 focus:ring-0 animate-pulse"
            />
            <span className="text-xs text-neutral-300 font-medium font-mono text-emerald-400">Chế độ Video 1:1 (Aspect Ratio)</span>
          </label>
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-900/60 flex flex-col space-y-1.5">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Khung thời gian xem thử (Timeline Seek)</span>
          <span className="text-white font-mono">00:00:00 / 00:00:15</span>
        </div>
        <div className="relative h-2 bg-neutral-800 rounded overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1/4 bg-emerald-500" />
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="25"
            className="absolute top-0 bottom-0 left-0 right-0 w-full opacity-0 cursor-ew-resize"
          />
        </div>
      </div>
    </div>
  );
}
