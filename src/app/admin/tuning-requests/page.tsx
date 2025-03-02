'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TuningRequest {
  id: number;
  user_id: number;
  file_name: string;
  original_filename: string;
  stored_filename: string;
  vehicle_info: string;
  manufacturer_name: string;
  model_name: string;
  production_year: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  admin_message: string | null;
  tuning_options: {
    id: number;
    name: string;
    description: string;
    credit_cost: number;
  }[];
}

export default function TuningRequestsPage() {
  const [requests, setRequests] = useState<TuningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TuningRequest | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [adminMessage, setAdminMessage] = useState<string>('');
  const [processingFile, setProcessingFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTuningRequests();
  }, []);

  const fetchTuningRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tuning-requests', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/auth/login');
          return;
        }
        throw new Error(`Failed to fetch tuning requests: ${response.status}`);
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError('Failed to load tuning requests. Please try again later.');
      console.error('Error fetching tuning requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      window.open(`/api/ecu/download?id=${id}`, '_blank');
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    }
  };

  const handleStatusUpdate = async (id: number) => {
    if (!statusUpdate) return;
    
    try {
      const response = await fetch(`/api/admin/tuning-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: statusUpdate,
          message: adminMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      // Refresh the list
      fetchTuningRequests();
      setSelectedRequest(null);
      setStatusUpdate('');
      setAdminMessage('');
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const handleProcessedFileUpload = async (id: number) => {
    if (!processingFile) return;

    try {
      const formData = new FormData();
      formData.append('file', processingFile);

      const response = await fetch(`/api/admin/tuning-requests/${id}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload processed file: ${response.status}`);
      }

      // Refresh the list and reset state
      fetchTuningRequests();
      setSelectedRequest(null);
      setProcessingFile(null);
      setStatusUpdate('completed');
      // Auto-update status to completed
      handleStatusUpdate(id);
    } catch (err) {
      console.error('Error uploading processed file:', err);
      setError('Failed to upload processed file. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading tuning requests...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tuning Requests</h1>

      {selectedRequest ? (
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Request #{selectedRequest.id}: {selectedRequest.file_name}
            </h2>
            <button
              onClick={() => setSelectedRequest(null)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Back to List
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Vehicle Information</h3>
              <p><strong>Manufacturer:</strong> {selectedRequest.manufacturer_name}</p>
              <p><strong>Model:</strong> {selectedRequest.model_name}</p>
              <p><strong>Year:</strong> {selectedRequest.production_year}</p>
              <p><strong>Status:</strong> <span className={`font-semibold ${selectedRequest.status === 'completed' ? 'text-green-500' : selectedRequest.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>{selectedRequest.status}</span></p>
              <p><strong>Created:</strong> {formatDate(selectedRequest.created_at)}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Tuning Options</h3>
              <ul className="list-disc pl-5">
                {selectedRequest.tuning_options.map(option => (
                  <li key={option.id}>
                    {option.name} - {option.credit_cost} credits
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-4 mb-6">
            <h3 className="text-lg font-medium mb-2">File Management</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleDownload(selectedRequest.id)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
              >
                Download Original File
              </button>

              <div>
                <label className="block mb-2">Upload Processed File:</label>
                <input
                  type="file"
                  accept=".bin"
                  onChange={(e) => setProcessingFile(e.target.files?.[0] || null)}
                  className="mb-2"
                />
                <button
                  onClick={() => handleProcessedFileUpload(selectedRequest.id)}
                  disabled={!processingFile}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 disabled:opacity-50"
                >
                  Upload Processed File
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-lg font-medium mb-2">Update Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Status:</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Admin Message:</label>
                <textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                  rows={3}
                  placeholder="Optional message to the user"
                />
              </div>
            </div>

            <button
              onClick={() => handleStatusUpdate(selectedRequest.id)}
              disabled={!statusUpdate}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 disabled:opacity-50"
            >
              Update Status
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">File Name</th>
                <th className="p-3 text-left">Vehicle</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-3 text-center">
                    No tuning requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">{request.id}</td>
                    <td className="p-3">{request.file_name}</td>
                    <td className="p-3">{request.vehicle_info}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${request.status === 'completed' ? 'bg-green-100 text-green-800' : request.status === 'failed' ? 'bg-red-100 text-red-800' : request.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(request.created_at)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 mr-2"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(request.id)}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}