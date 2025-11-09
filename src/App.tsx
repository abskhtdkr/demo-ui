import { useState } from 'react';
import { FileUpload, DocumentPreview } from './components/FileUpload';
import { PreprocessingStep } from './components/PreprocessingStep';
import { DocumentAnalysis } from './components/DocumentAnalysis';
import { DataOperations } from './components/DataOperations';
import { ResultsTable } from './components/ResultsTable';
import { AnalysisType, OperationType } from './types';
import { dataURLToBase64 } from './utils/apiHelpers';

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [preprocessedImage, setPreprocessedImage] = useState<string | null>(null);
  const [usePreprocessing, setUsePreprocessing] = useState(false);
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [operationType, setOperationType] = useState<OperationType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<unknown>(null);
  const [finalResult, setFinalResult] = useState<unknown>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File, preview: string) => {
    setUploadedFile(file);
    setUploadedImagePreview(preview);
    setPreprocessedImage(null);
    setAnalysisResult(null);
    setFinalResult(null);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedImagePreview(null);
    setPreprocessedImage(null);
    setUsePreprocessing(false);
    setAnalysisType(null);
    setSelectedDocType(null);
    setOperationType(null);
    setAnalysisResult(null);
    setFinalResult(null);
  };

  const handlePreprocessingToggle = (enabled: boolean) => {
    setUsePreprocessing(enabled);
    if (!enabled) {
      setPreprocessedImage(null);
    }
  };

  const handlePreprocess = async () => {
    if (!uploadedImagePreview) return;

    setIsProcessing(true);
    try {
      const base64Image = dataURLToBase64(uploadedImagePreview);

      const response = await fetch('/api/preprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      const result = await response.json();
      setPreprocessedImage(`data:image/jpeg;base64,${result.enhancedImage}`);
    } catch (error) {
      console.error('Preprocessing failed:', error);
      alert('Preprocessing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisType) return;

    const imageToUse = usePreprocessing && preprocessedImage
      ? dataURLToBase64(preprocessedImage)
      : uploadedImagePreview
        ? dataURLToBase64(uploadedImagePreview)
        : null;

    if (!imageToUse) return;

    setIsProcessing(true);
    try {
      if (analysisType === 'autoindex') {
        const response = await fetch('/api/autoindex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageToUse })
        });
        const result = await response.json();
        setAnalysisResult(result);
      } else if (analysisType === 'classify' && selectedDocType) {
        const response = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageToUse, documentType: selectedDocType })
        });
        const result = await response.json();
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataOperation = async () => {
    if (!operationType || !analysisResult) return;

    const imageToUse = usePreprocessing && preprocessedImage
      ? dataURLToBase64(preprocessedImage)
      : uploadedImagePreview
        ? dataURLToBase64(uploadedImagePreview)
        : null;

    if (!imageToUse) return;

    setIsProcessing(true);
    try {
      const endpoint = operationType === 'extract' ? '/api/extract' : '/api/extract-validate';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageToUse,
          analysisResult,
          documentType: selectedDocType
        })
      });
      const result = await response.json();
      setFinalResult(result);
    } catch (error) {
      console.error('Data operation failed:', error);
      alert('Data operation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const showPreprocessing = uploadedFile !== null;
  const showAnalysis = uploadedFile !== null && (!usePreprocessing || preprocessedImage !== null);
  const showDataOperations = analysisResult !== null;
// THis is a test change
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Processing System</h1>
          <p className="text-gray-600">Upload, analyze, and extract data from documents</p>
        </header>

        <div className="space-y-6">
          {!uploadedFile ? (
            <FileUpload onFileSelect={handleFileSelect} />
          ) : (
            <>
              <DocumentPreview
                file={uploadedFile}
                preview={uploadedImagePreview!}
                onRemove={handleRemoveFile}
              />

              {showPreprocessing && (
                <PreprocessingStep
                  enabled={usePreprocessing}
                  onToggle={handlePreprocessingToggle}
                  onProcess={handlePreprocess}
                  isProcessing={isProcessing}
                  preprocessedImage={preprocessedImage}
                />
              )}

              {showAnalysis && (
                <DocumentAnalysis
                  analysisType={analysisType}
                  onAnalysisTypeChange={setAnalysisType}
                  selectedDocType={selectedDocType}
                  onDocTypeChange={setSelectedDocType}
                  onAnalyze={handleAnalyze}
                  isProcessing={isProcessing}
                  analysisComplete={analysisResult !== null}
                />
              )}

              {showDataOperations && (
                <DataOperations
                  operationType={operationType}
                  onOperationTypeChange={setOperationType}
                  onProcess={handleDataOperation}
                  isProcessing={isProcessing}
                  operationComplete={finalResult !== null}
                />
              )}

              {finalResult && <ResultsTable data={finalResult} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
