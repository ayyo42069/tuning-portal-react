import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Download, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

interface RecentFile {
  id: number;
  filename: string;
  status: string;
  created_at: string;
  manufacturer: string;
  model: string;
}

export default function RecentFiles() {
  const [files, setFiles] = useState<RecentFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<RecentFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const fetchRecentFiles = async () => {
    try {
      const response = await fetch('/api/ecu/recent');
      if (!response.ok) throw new Error('Failed to fetch recent files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching recent files:', error);
      toast.error('Failed to load recent files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFile = (file: RecentFile) => {
    setSelectedFile(file);
  };

  const handleDownload = async (fileId: number) => {
    try {
      const response = await fetch(`/api/ecu/download/${fileId}`);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecu_file_${fileId}.bin`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Recent Files</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
        </div>
      ) : files.length === 0 ? (
        <p className="text-white/60 text-center py-8">No recent files</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{file.filename}</h3>
                    <p className="text-sm text-white/60">
                      {file.manufacturer} {file.model}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-white/40">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewFile(file)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(file.id)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  file.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  file.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                  file.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-lg w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">File Details</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60">Filename</label>
                  <p className="text-white">{selectedFile.filename}</p>
                </div>
                <div>
                  <label className="text-sm text-white/60">Vehicle</label>
                  <p className="text-white">{selectedFile.manufacturer} {selectedFile.model}</p>
                </div>
                <div>
                  <label className="text-sm text-white/60">Status</label>
                  <p className="text-white">{selectedFile.status}</p>
                </div>
                <div>
                  <label className="text-sm text-white/60">Upload Date</label>
                  <p className="text-white">{new Date(selectedFile.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => handleDownload(selectedFile.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 