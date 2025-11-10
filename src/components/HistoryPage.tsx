import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RequestHistoryItem } from '../types';
import { ExternalLink, Download, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HistoryPage() {
  const { token, session } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [session?.id]);

  const fetchHistory = async () => {
    if (!session?.id || !token) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/history/${session.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBlob = async (blobUrl: string, fileName: string) => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/process')}
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Processing
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request History</h1>
            <p className="text-gray-600">View all your document processing requests</p>
          </div>
        </div>
        <button
          onClick={fetchHistory}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <Loader className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-gray-600">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No requests yet. Start by uploading a document.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.document_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.document_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.request_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.processing_duration_ms ? `${item.processing_duration_ms}ms` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Details
                      </button>
                      {item.blob_url && (
                        <button
                          onClick={() => downloadBlob(item.blob_url!, `${item.id}.json`)}
                          className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {expandedRow && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {history.find(h => h.id === expandedRow) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Request Payload</p>
                  <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(history.find(h => h.id === expandedRow)?.request_payload, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Response Data</p>
                  <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(history.find(h => h.id === expandedRow)?.response_data, null, 2)}
                  </pre>
                </div>
              </div>
              {history.find(h => h.id === expandedRow)?.blob_url && (
                <a
                  href={history.find(h => h.id === expandedRow)?.blob_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Blob Storage
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
