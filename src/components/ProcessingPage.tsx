import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileUpload, DocumentPreview } from './FileUpload';
import { PreprocessingStep } from './PreprocessingStep';
import { DocumentAnalysis } from './DocumentAnalysis';
import { DataOperations } from './DataOperations';
import { ResultsTable } from './ResultsTable';
import { AnalysisType, OperationType } from '../types';
import { dataURLToBase64 } from '../utils/apiHelpers';
import { LogOut, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProcessingPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { token, session } = useAuth();

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
    if (!uploadedImagePreview || !token) return;

    setIsProcessing(true);
    const startTime = Date.now();
    try {
      const base64Image = dataURLToBase64(uploadedImagePreview);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/preprocess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image: base64Image })
      });

      const result = await response.json();
      setPreprocessedImage(`data:image/jpeg;base64,${result.enhancedImage}`);

      if (session?.id) {
        await logRequest(
          'preprocess',
          uploadedFile?.name || 'document',
          { image: '***' },
          result,
          Date.now() - startTime
        );
      }
    } catch (error) {
      console.error('Preprocessing failed:', error);
      alert('Preprocessing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisType || !token) return;

    const imageToUse = usePreprocessing && preprocessedImage
      ? dataURLToBase64(preprocessedImage)
      : uploadedImagePreview
        ? dataURLToBase64(uploadedImagePreview)
        : null;

    if (!imageToUse) return;

    setIsProcessing(true);
    const startTime = Date.now();
    try {
      if (analysisType === 'autoindex') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/autoindex`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: imageToUse })
        });
        const result = await response.json();
        setAnalysisResult(result);

        if (session?.id) {
          await logRequest(
            'autoindex',
            uploadedFile?.name || 'document',
            { image: '***' },
            result,
            Date.now() - startTime
          );
        }
      } else if (analysisType === 'classify' && selectedDocType) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/classify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: imageToUse, documentType: selectedDocType })
        });
        const result = await response.json();
        setAnalysisResult(result);

        if (session?.id) {
          await logRequest(
            'classify',
            uploadedFile?.name || 'document',
            { image: '***', documentType: selectedDocType },
            result,
            Date.now() - startTime,
            selectedDocType
          );
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataOperation = async () => {
    if (!operationType || !analysisResult || !token) return;

    const imageToUse = usePreprocessing && preprocessedImage
      ? dataURLToBase64(preprocessedImage)
      : uploadedImagePreview
        ? dataURLToBase64(uploadedImagePreview)
        : null;

    if (!imageToUse) return;

    setIsProcessing(true);
    const startTime = Date.now();
    try {
      const endpoint = operationType === 'extract' ? '/api/extract' : '/api/extract-validate';
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image: imageToUse,
          analysisResult,
          documentType: selectedDocType
        })
      });
      const result = await response.json();
      setFinalResult(result);

      if (session?.id) {
        await logRequest(
          operationType,
          uploadedFile?.name || 'document',
          { image: '***', analysisResult, documentType: selectedDocType },
          result,
          Date.now() - startTime,
          selectedDocType
        );
      }
    } catch (error) {
      console.error('Data operation failed:', error);
      alert('Data operation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const logRequest = async (
    requestType: string,
    documentName: string,
    requestPayload: Record<string, unknown>,
    responseData: unknown,
    duration: number,
    documentType?: string | null
  ) => {
    if (!token || !session?.id) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/history/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_session_id: session.id,
          request_type: requestType,
          document_name: documentName,
          document_type: documentType,
          preprocessing_used: usePreprocessing,
          request_payload: requestPayload,
          response_data: responseData,
          processing_duration_ms: duration
        })
      });
    } catch (error) {
      console.error('Failed to log request:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const showPreprocessing = uploadedFile !== null;
  const showAnalysis = uploadedFile !== null && (!usePreprocessing || preprocessedImage !== null);
  const showDataOperations = analysisResult !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Document Processing</h1>
            <p className="text-gray-600">Upload, analyze, and extract data from documents</p>
            {user && <p className="text-sm text-gray-500 mt-1">Logged in as: {user.username}</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/history')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              History
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

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
