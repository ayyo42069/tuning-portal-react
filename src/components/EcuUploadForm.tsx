import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface EcuUploadFormProps {
  onClose: () => void;
}

interface Manufacturer {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  manufacturer_id: number;
}

interface TuningOption {
  id: number;
  name: string;
  credit_cost: number;
  description?: string;
}

export default function EcuUploadForm({ onClose }: EcuUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [tuningOptions, setTuningOptions] = useState<TuningOption[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [totalCredits, setTotalCredits] = useState(0);
  const [isLoadingManufacturers, setIsLoadingManufacturers] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingTuningOptions, setIsLoadingTuningOptions] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/octet-stream': ['.bin'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      setFile(acceptedFiles[0]);
    },
  });

  // Fetch manufacturers on component mount
  useEffect(() => {
    setIsLoadingManufacturers(true);
    fetch('/api/manufacturers')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Manufacturers data:', data); // Debug log
        if (Array.isArray(data)) {
          setManufacturers(data);
        } else {
          console.error('Invalid manufacturers data:', data);
          toast.error('Failed to load manufacturers');
        }
      })
      .catch(error => {
        console.error('Error fetching manufacturers:', error);
        toast.error('Failed to load manufacturers');
      })
      .finally(() => {
        setIsLoadingManufacturers(false);
      });
  }, []);

  // Fetch models when manufacturer is selected
  useEffect(() => {
    if (selectedManufacturer) {
      setIsLoadingModels(true);
      fetch(`/api/models?manufacturerId=${selectedManufacturer}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setModels(data);
          } else {
            console.error('Invalid models data:', data);
            toast.error('Failed to load models');
          }
        })
        .catch(error => {
          console.error('Error fetching models:', error);
          toast.error('Failed to load models');
        })
        .finally(() => {
          setIsLoadingModels(false);
        });
    } else {
      setModels([]);
    }
  }, [selectedManufacturer]);

  // Fetch tuning options when model is selected
  useEffect(() => {
    if (selectedModel) {
      setIsLoadingTuningOptions(true);
      fetch(`/api/tuning-options?modelId=${selectedModel}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTuningOptions(data);
          } else {
            console.error('Invalid tuning options data:', data);
            toast.error('Failed to load tuning options');
          }
        })
        .catch(error => {
          console.error('Error fetching tuning options:', error);
          toast.error('Failed to load tuning options');
        })
        .finally(() => {
          setIsLoadingTuningOptions(false);
        });
    } else {
      setTuningOptions([]);
    }
  }, [selectedModel]);

  // Calculate total credits when options are selected
  useEffect(() => {
    const total = selectedOptions.reduce((sum, optionId) => {
      const option = tuningOptions.find(opt => opt.id === optionId);
      return sum + (option?.credit_cost || 0);
    }, 0);
    setTotalCredits(total);
  }, [selectedOptions, tuningOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedManufacturer || !selectedModel || !selectedYear || selectedOptions.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', JSON.stringify({
        manufacturerId: selectedManufacturer,
        modelId: selectedModel,
        productionYear: selectedYear,
        tuningOptions: selectedOptions,
        message
      }));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/ecu/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Show success animation
      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFile(null);
        setSelectedManufacturer(null);
        setSelectedModel(null);
        setSelectedYear(null);
        setSelectedOptions([]);
        setShowSuccess(false);
        setIsUploading(false);
        setUploadProgress(0);
        
        // Close the form and show success message
        onClose();
        toast.success('File uploaded successfully!');
      }, 2000);

    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-400/10'
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="text-white">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-white/60">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        ) : (
          <div className="text-white/60">
            <p>Drag & drop your ECU file here</p>
            <p className="text-sm mt-2">or click to select</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <select
            value={selectedManufacturer || ''}
            onChange={(e) => {
              setSelectedManufacturer(Number(e.target.value));
              setSelectedModel(null);
              setSelectedOptions([]);
            }}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
            disabled={isLoadingManufacturers}
          >
            <option value="">Select Manufacturer</option>
            {manufacturers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {isLoadingManufacturers && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
            </div>
          )}
        </div>

        <div className="relative">
          <select
            value={selectedModel || ''}
            onChange={(e) => {
              setSelectedModel(Number(e.target.value));
              setSelectedOptions([]);
            }}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
            disabled={!selectedManufacturer || isLoadingModels}
          >
            <option value="">Select Model</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {isLoadingModels && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
            </div>
          )}
        </div>

        <select
          value={selectedYear || ''}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
        >
          <option value="">Select Year</option>
          {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {isLoadingTuningOptions ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
          </div>
        ) : tuningOptions.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white/60">Tuning Options</label>
              <span className="text-sm text-white/60">Total: {totalCredits} credits</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tuningOptions.map((option) => (
                <label key={option.id} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOptions([...selectedOptions, option.id]);
                      } else {
                        setSelectedOptions(selectedOptions.filter(id => id !== option.id));
                      }
                    }}
                    className="mt-1 rounded border-white/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{option.name}</span>
                      <span className="text-sm text-white/60">{option.credit_cost} credits</span>
                    </div>
                    {option.description && (
                      <p className="text-sm text-white/60 mt-1">{option.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : selectedModel ? (
          <p className="text-sm text-white/60 text-center py-4">No tuning options available for this model</p>
        ) : null}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Additional notes (optional)"
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
          rows={3}
        />
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white p-8 rounded-lg shadow-xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Upload Successful!</h3>
              <p className="text-gray-600">Your ECU file has been uploaded and is being processed.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-blue-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!file || !selectedManufacturer || !selectedModel || !selectedYear || selectedOptions.length === 0 || isUploading}
        onClick={handleSubmit}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
          !file || !selectedManufacturer || !selectedModel || !selectedYear || selectedOptions.length === 0 || isUploading
            ? 'bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload ECU File'}
      </motion.button>
    </div>
  );
} 