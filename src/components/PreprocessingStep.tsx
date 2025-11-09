import { Zap } from 'lucide-react';

interface PreprocessingStepProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onProcess: () => void;
  isProcessing: boolean;
  preprocessedImage: string | null;
}

export function PreprocessingStep({
  enabled,
  onToggle,
  onProcess,
  isProcessing,
  preprocessedImage
}: PreprocessingStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-yellow-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Preprocessing (Optional)</h3>
            <p className="text-sm text-gray-600">Enhance image quality before analysis</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
            disabled={isProcessing}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {enabled && !preprocessedImage && (
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Run Preprocessing'}
        </button>
      )}

      {preprocessedImage && (
        <div className="mt-4">
          <p className="text-sm text-green-600 font-medium mb-2">✓ Image Enhanced</p>
          <div className="border rounded-lg overflow-hidden">
            <img src={preprocessedImage} alt="Preprocessed" className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
