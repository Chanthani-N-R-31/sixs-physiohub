"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { storage, auth } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { VideoCameraIcon, XMarkIcon, PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  url?: string;
  storagePath?: string;
  error?: string;
}

interface VideoAnalysisProps {
  initialData?: any;
  entryId?: string | null;
  onSave?: (data: any) => void;
}

export default function VideoAnalysis({ initialData, entryId, onSave }: VideoAnalysisProps) {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<Array<{ url: string; name: string; storagePath: string }>>([]);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData?.videos) {
      setUploadedVideos(initialData.videos);
    }
    if (initialData?.chatHistory) {
      setChatHistory(initialData.chatHistory.map((item: any) => ({
        ...item,
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
      })));
    }
  }, [initialData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFiles: VideoFile[] = files
      .filter((file) => file.type.startsWith("video/"))
      .map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
      }));

    if (videoFiles.length > 0) {
      setVideos((prev) => [...prev, ...videoFiles]);
      videoFiles.forEach((video) => uploadVideo(video));
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadVideo = async (video: VideoFile) => {
    if (!auth.currentUser || !entryId) {
      alert("Please save the assessment first before uploading videos.");
      return;
    }

    try {
      const storagePath = `biomechanics/${entryId}/videos/${Date.now()}_${video.name}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, video.file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setVideos((prev) =>
            prev.map((v) => (v.id === video.id ? { ...v, progress } : v))
          );
        },
        (error) => {
          console.error("Upload error:", error);
          setVideos((prev) =>
            prev.map((v) =>
              v.id === video.id ? { ...v, error: error.message, progress: 0 } : v
            )
          );
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setVideos((prev) =>
            prev.map((v) =>
              v.id === video.id
                ? { ...v, url: downloadURL, storagePath, progress: 100 }
                : v
            )
          );

          // Move to uploaded videos after a short delay
          setTimeout(() => {
            setUploadedVideos((prev) => [
              ...prev,
              { url: downloadURL, name: video.name, storagePath },
            ]);
            setVideos((prev) => prev.filter((v) => v.id !== video.id));
            saveData();
          }, 500);
        }
      );
    } catch (error: any) {
      console.error("Upload failed:", error);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, error: error.message, progress: 0 } : v
        )
      );
    }
  };

  const deleteVideo = async (storagePath: string, index: number) => {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      setUploadedVideos((prev) => prev.filter((_, i) => i !== index));
      saveData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete video. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    if (uploadedVideos.length === 0) {
      alert("Please upload at least one video before asking questions.");
      return;
    }

    setIsAnalyzing(true);
    const userMessage = question;
    setQuestion("");
    const newChatHistory = [
      ...chatHistory,
      { role: "user" as const, content: userMessage, timestamp: new Date() },
    ];
    setChatHistory(newChatHistory);

    try {
      const response = await fetch("/api/openai/video-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videos: uploadedVideos.map((v) => v.url),
          question: userMessage,
          chatHistory: newChatHistory.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze video");
      }

      const data = await response.json();
      setChatHistory([
        ...newChatHistory,
        {
          role: "assistant" as const,
          content: data.response || "I couldn't process your question. Please try again.",
          timestamp: new Date(),
        },
      ]);
      saveData();
    } catch (error: any) {
      console.error("Analysis error:", error);
      setChatHistory([
        ...newChatHistory,
        {
          role: "assistant" as const,
          content: `Error: ${error.message || "Failed to analyze video. Please check your OpenAI API key."}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveData = () => {
    const dataToSave = {
      videos: uploadedVideos,
      chatHistory: chatHistory.map((item) => ({
        role: item.role,
        content: item.content,
        timestamp: item.timestamp.toISOString(),
      })),
    };
    if (onSave) {
      onSave(dataToSave);
    }
  };

  const removePendingVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-bold text-white text-center">Video Analysis</h3>

      {/* Upload Section */}
      <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
        <h4 className="text-xl font-bold text-white mb-4">Upload Videos</h4>
        <div className="flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg cursor-pointer transition-all border-2 border-dashed border-gray-500 hover:border-gray-400"
          >
            <VideoCameraIcon className="w-6 h-6" />
            <span className="font-bold">Select Multiple Videos</span>
          </label>

          {/* Upload Progress */}
          {videos.length > 0 && (
            <div className="space-y-2">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{video.name}</p>
                      <p className="text-gray-400 text-xs">{formatFileSize(video.size)}</p>
                    </div>
                    <button
                      onClick={() => removePendingVideo(video.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {video.error ? (
                    <p className="text-red-400 text-xs">{video.error}</p>
                  ) : (
                    <div className="w-full bg-gray-900 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all"
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Videos */}
          {uploadedVideos.length > 0 && (
            <div className="mt-4">
              <h5 className="text-white font-bold mb-2">Uploaded Videos ({uploadedVideos.length})</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uploadedVideos.map((video, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg p-3 border border-gray-600 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <VideoCameraIcon className="w-5 h-5 text-teal-400 flex-shrink-0" />
                      <p className="text-white text-sm font-bold truncate">{video.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 text-sm font-bold"
                      >
                        View
                      </a>
                      <button
                        onClick={() => deleteVideo(video.storagePath, index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Section */}
      <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-6 h-6 text-yellow-400" />
          <h4 className="text-xl font-bold text-white">Ask Questions About Your Videos</h4>
        </div>

        {/* Chat History */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto space-y-4">
          {chatHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Ask questions about your uploaded videos. For example:
              <br />
              "What are the key biomechanical observations in these videos?"
              <br />
              "Analyze the running gait patterns."
            </p>
          ) : (
            chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="bg-gray-600 text-white rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Analyzing videos...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Question Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && askQuestion()}
            placeholder="Ask a question about your videos..."
            className="input-glass flex-1"
            disabled={isAnalyzing || uploadedVideos.length === 0}
          />
          <button
            onClick={askQuestion}
            disabled={isAnalyzing || !question.trim() || uploadedVideos.length === 0}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

