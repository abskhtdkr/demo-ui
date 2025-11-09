import { FileSearch } from 'lucide-react';
import { AnalysisType, DOCUMENT_TYPES } from '../types';

interface DocumentAnalysisProps {
  analysisType: AnalysisType | null;
  onAnalysisTypeChange: (type: AnalysisType) => void;
  selectedDocType: string | null;
  onDocTypeChange: (type: string) => void;
  onAnalyze: () => void;
  isProcessing: boolean;
  analysisComplete: boolean;
}

export function DocumentAnalysis({
  analysisType,
  onAnalysisTypeChange,
  selectedDocType,
  onDocTypeChange,
  onAnalyze,
  isProcessing,
  analysisComplete
}: DocumentAnalysisProps) {
  const canAnalyze = analysisType === 'autoindex' || (analysisType === 'classify' && selectedDocType);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileSearch className="h-6 w-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Document Analysis</h3>
          <p className="text-sm text-gray-600">Choose analysis method</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => onAnalysisTypeChange('autoindex')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              analysisType === 'autoindex'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={isProcessing || analysisComplete}
          >
            Auto Indexing
          </button>
          <button
            onClick={() => onAnalysisTypeChange('classify')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              analysisType === 'classify'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={isProcessing || analysisComplete}
          >
            Classify
          </button>
        </div>

        {analysisType === 'classify' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDocType || ''}
              onChange={(e) => onDocTypeChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isProcessing || analysisComplete}
            >
              <option value="">Select document type</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.id}
                </option>
              ))}
            </select>
          </div>
        )}

        {analysisComplete ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-medium">✓ Analysis Complete</p>
          </div>
        ) : (
          <button
            onClick={onAnalyze}
            disabled={!canAnalyze || isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isProcessing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        )}
      </div>
    </div>
  );
}
