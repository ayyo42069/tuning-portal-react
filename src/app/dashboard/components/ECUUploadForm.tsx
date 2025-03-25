"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Car,
  CarFront,
  Calendar,
  Settings,
  MessageSquare,
  Loader2,
  HelpCircle,
} from "lucide-react";
import {
  useFloating,
  useInteractions,
  useHover,
  offset,
  flip,
  shift,
  arrow,
  FloatingArrow,
  FloatingPortal,
} from "@floating-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useManufacturers,
  useModelsByManufacturer,
  useTuningOptions,
} from "@/lib/hooks/useDataFetching";
import { queryKeys } from "@/lib/hooks/useDataFetching";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

function CustomTooltip({ content, children }: TooltipProps) {
  const arrowRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(8), flip(), shift(), arrow({ element: arrowRef })],
  });

  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md z-50"
            {...getFloatingProps()}
          >
            {content}
            <FloatingArrow
              ref={arrowRef}
              context={context}
              className="fill-gray-900"
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Use React Query hooks for data fetching
  const { data: manufacturersData, isLoading: manufacturersLoading } =
    useManufacturers();
  const { data: tuningOptionsData, isLoading: tuningOptionsLoading } =
    useTuningOptions();
  const { data: modelsData, isLoading: modelsLoading } =
    useModelsByManufacturer(selectedManufacturer || null);

  // Update state when data is fetched
  useEffect(() => {
    if (manufacturersData) {
      setManufacturers(manufacturersData);
    }
  }, [manufacturersData]);

  useEffect(() => {
    if (tuningOptionsData) {
      setTuningOptions(tuningOptionsData);
    }
  }, [tuningOptionsData]);

  useEffect(() => {
    if (modelsData) {
      setModels(modelsData);
    }
  }, [modelsData]);

  // When manufacturer changes, reset selected model
  useEffect(() => {
    if (!selectedManufacturer) {
      setModels([]);
      setSelectedModel(0);
    }
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

  // Use React Query for form submission
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/ecu/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred during upload");
      }

      return response.json();
    },
    onSuccess: () => {
      // Reset form
      setFile(null);
      setSelectedManufacturer(0);
      setSelectedModel(0);
      setSelectedOptions([]);
      setMessage("");

      // Show success message
      setShowSuccessModal(true);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [queryKeys.tuningFiles] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
    },
    onError: (error: Error) => {
      setError(error.message || "An error occurred during upload");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

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

    uploadMutation.mutate(formData);
  };

  // Function to close the success modal
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 sm:p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto my-4 mx-auto backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2">
                Upload Successful!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Your ECU file has been uploaded successfully. You can view it in
                your tuning history.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={closeSuccessModal}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <label className="block text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
          <div className="flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            ECU File Upload
            <CustomTooltip content="Upload your ECU binary file (.bin format)">
              <HelpCircle className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
            </CustomTooltip>
          </div>
        </label>
        <div className="mt-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <input
            type="file"
            accept=".bin"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-3 sm:file:py-3 sm:file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-200
              hover:file:bg-blue-100 dark:hover:file:bg-blue-800
              transition-colors duration-200"
          />
          {file && (
            <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              File selected: {file.name}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <label className="block text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
            <div className="flex items-center">
              <Car className="w-5 h-5 mr-2 text-indigo-600" />
              Manufacturer
            </div>
          </label>
          <select
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5"
          >
            <option value={0}>Select Manufacturer</option>
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <label className="block text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
            <div className="flex items-center">
              <CarFront className="w-5 h-5 mr-2 text-indigo-600" />
              Model
            </div>
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5"
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

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <label className="block text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              Production Year
            </div>
          </label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            min={1990}
            max={new Date().getFullYear()}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <label className="block text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-indigo-600" />
            Tuning Options
            <CustomTooltip content="Select the tuning options you want to apply to your ECU file">
              <HelpCircle className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
            </CustomTooltip>
          </div>
        </label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-md">
          {tuningOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-start p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors duration-200"
            >
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
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-800 dark:text-white">
                  {option.name}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
                <div className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  {option.credit_cost} credits
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <label className="block text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
            Additional Notes
            <CustomTooltip content="Add any specific instructions or notes for the tuning process">
              <HelpCircle className="w-4 h-4 ml-2 text-blue-500 cursor-help" />
            </CustomTooltip>
          </div>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5"
          placeholder="Enter any specific requirements or details about your tuning request..."
        />
      </div>

      <div className="flex justify-center sm:justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>Submit ECU File</>
          )}
        </button>
      </div>
    </form>
  );
}
