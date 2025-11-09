import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, ACCEPTED_FILE_EXTENSIONS } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File, preview: string) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      alert('Please upload a valid file type: PNG, PDF, TIFF, JPEG, or JPG');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onFileSelect(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        id="file-input"
        className="hidden"
        accept={ACCEPTED_FILE_EXTENSIONS}
        onChange={handleFileInput}
        disabled={disabled}
      />
      <label htmlFor="file-input" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop your document here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Supported formats: PNG, PDF, TIFF, JPEG, JPG
        </p>
      </label>
    </div>
  );
}

interface DocumentPreviewProps {
  file: File;
  preview: string;
  onRemove: () => void;
}

export function DocumentPreview({ file, preview, onRemove }: DocumentPreviewProps) {
  const isPDF = file.type === 'application/pdf';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Remove
        </button>
      </div>
      <div className="mt-4 border rounded-lg overflow-hidden bg-gray-50">
        {isPDF ? (
          <iframe
            src={preview}
            className="w-full h-96"
            title="PDF Preview"
          />
        ) : (
          <img src={preview} alt="Document preview" className="w-full h-auto" />
        )}
      </div>
    </div>
  );
}
