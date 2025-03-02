"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Car, CarFront, Calendar, Settings, MessageSquare, Loader2 } from "lucide-react";

interface Manufacturer {
  id: number;
  name: string;
}

interface VehicleModel {
  id: number;
  name: string;
}

interface TuningOption {
  id: number;
  name: string;
  description: string;
  credit_cost: number;
}

export default function ECUUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [tuningOptions, setTuningOptions] = useState<TuningOption[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Fetch manufacturers
    const fetchManufacturers = async () => {
      try {
        const response = await fetch("/api/manufacturers");
        if (response.ok) {
          const data = await response.json();
          setManufacturers(data);
        }
      } catch (error) {
        console.error("Error fetching manufacturers:", error);
      }
    };

    // Fetch tuning options
    const fetchTuningOptions = async () => {
      try {
        const response = await fetch("/api/tuning-options");
        if (response.ok) {
          const data = await response.json();
          setTuningOptions(data);
        }
      } catch (error) {
        console.error("Error fetching tuning options:", error);
      }
    };

    fetchManufacturers();
    fetchTuningOptions();
  }, []);

  useEffect(() => {
    // Fetch models when manufacturer is selected
    const fetchModels = async () => {
      if (selectedManufacturer) {
        try {
          const response = await fetch(
            `/api/models?manufacturer=${selectedManufacturer}`
          );
          if (response.ok) {
            const data = await response.json();
            setModels(data);
          }
        } catch (error) {
          console.error("Error fetching models:", error);
        }
      } else {
        setModels([]);
      }
    };

    fetchModels();
  }, [selectedManufacturer]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".bin")) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid .bin file");
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !file ||
      !selectedManufacturer ||
      !selectedModel ||
      !selectedOptions.length
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "data",
      JSON.stringify({
        manufacturerId: selectedManufacturer,
        modelId: selectedModel,
        productionYear: selectedYear,
        tuningOptions: selectedOptions,
        message,
      })
    );

    try {
      const response = await fetch("/api/ecu/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Reset form
        setFile(null);
        setSelectedManufacturer(0);
        setSelectedModel(0);
        setSelectedOptions([]);
        setMessage("");
        // Show success message or redirect
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "An error occurred during upload");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("An error occurred during upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            ECU File (.bin)
          </div>
        </label>
        <input
          type="file"
          accept=".bin"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center">
            <Car className="w-4 h-4 mr-2" />
            Manufacturer
          </div>
        </label>
        <select
          value={selectedManufacturer}
          onChange={(e) => setSelectedManufacturer(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value={0}>Select Manufacturer</option>
          {manufacturers.map((manufacturer) => (
            <option key={manufacturer.id} value={manufacturer.id}>
              {manufacturer.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center">
            <CarFront className="w-4 h-4 mr-2" />
            Model
          </div>
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          disabled={!selectedManufacturer}
        >
          <option value={0}>Select Model</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Production Year
          </div>
        </label>
        <input
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          min={1990}
          max={new Date().getFullYear()}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Tuning Options
          </div>
        </label>
        <div className="mt-2 space-y-2">
          {tuningOptions.map((option) => (
            <label key={option.id} className="flex items-center">
              <input
                type="checkbox"
                value={option.id}
                checked={selectedOptions.includes(option.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOptions([...selectedOptions, option.id]);
                  } else {
                    setSelectedOptions(
                      selectedOptions.filter((id) => id !== option.id)
                    );
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {option.name} - {option.description} ({option.credit_cost}{" "}
                credits)
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message (Optional)
          </div>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Add any additional information for the tuning process..."
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          <div className="flex items-center justify-center">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload ECU File
              </>
            )}
          </div>
        </button>
      </div>
    </form>
  );
}
