import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

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
    fetch('/api/manufacturers')
      .then(res => res.json())
      .then(data => setManufacturers(data))
      .catch(error => {
        console.error('Error fetching manufacturers:', error);
        toast.error('Failed to load manufacturers');
      });
  }, []);

  // Fetch models when manufacturer is selected
  useEffect(() => {
    if (selectedManufacturer) {
      fetch(`/api/models?manufacturerId=${selectedManufacturer}`)
        .then(res => res.json())
        .then(data => setModels(data))
        .catch(error => {
          console.error('Error fetching models:', error);
          toast.error('Failed to load models');
        });
    }
  }, [selectedManufacturer]);

  // Fetch tuning options when model is selected
  useEffect(() => {
    if (selectedModel) {
      fetch(`/api/tuning-options?modelId=${selectedModel}`)
        .then(res => res.json())
        .then(data => setTuningOptions(data))
        .catch(error => {
          console.error('Error fetching tuning options:', error);
          toast.error('Failed to load tuning options');
        });
    }
  }, [selectedModel]);

  const handleUpload = async () => {
    if (!file || !selectedManufacturer || !selectedModel || !selectedYear || selectedOptions.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify({
      manufacturerId: selectedManufacturer,
      modelId: selectedModel,
      productionYear: selectedYear,
      tuningOptions: selectedOptions,
      message
    }));

    try {
      const response = await fetch('/api/ecu/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      toast.success('ECU file uploaded successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload ECU file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Upload ECU File</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

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
            <select
              value={selectedManufacturer || ''}
              onChange={(e) => setSelectedManufacturer(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select Manufacturer</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={selectedModel || ''}
              onChange={(e) => setSelectedModel(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
              disabled={!selectedManufacturer}
            >
              <option value="">Select Model</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

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

            <div className="space-y-2">
              <label className="text-white/60">Tuning Options</label>
              {tuningOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-2">
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
                    className="rounded border-white/20"
                  />
                  <span className="text-white">
                    {option.name} ({option.credit_cost} credits)
                  </span>
                </label>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Additional notes (optional)"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
              rows={3}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || !selectedManufacturer || !selectedModel || !selectedYear || selectedOptions.length === 0 || isUploading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              !file || !selectedManufacturer || !selectedModel || !selectedYear || selectedOptions.length === 0 || isUploading
                ? 'bg-white/20 text-white/40 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
} 