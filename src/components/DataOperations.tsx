import { Database } from 'lucide-react';
import { OperationType } from '../types';

interface DataOperationsProps {
  operationType: OperationType | null;
  onOperationTypeChange: (type: OperationType) => void;
  onProcess: () => void;
  isProcessing: boolean;
  operationComplete: boolean;
}

export function DataOperations({
  operationType,
  onOperationTypeChange,
  onProcess,
  isProcessing,
  operationComplete
}: DataOperationsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Operations</h3>
          <p className="text-sm text-gray-600">Extract data from document</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => onOperationTypeChange('extract')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              operationType === 'extract'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={isProcessing || operationComplete}
          >
            Extract
          </button>
          <button
            onClick={() => onOperationTypeChange('extractvalidate')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              operationType === 'extractvalidate'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={isProcessing || operationComplete}
          >
            Extract & Validate
          </button>
        </div>

        {operationComplete ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-medium">✓ Operation Complete</p>
          </div>
        ) : (
          <button
            onClick={onProcess}
            disabled={!operationType || isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Run Operation'}
          </button>
        )}
      </div>
    </div>
  );
}
