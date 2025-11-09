export interface DocumentType {
  id: string;
  name: string;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  { id: "Aadhar Card", name: "AADHAAR" },
  { id: "PAN Card", name: "PAN" },
  { id: "Voter ID", name: "VOTERID" },
  { id: "Driving License", name: "DRIVINGLICENSE" },
  { id: "RC Book", name: "RCBOOK" },
  { id: "Passport", name: "PASSPORT" },
  { id: "Bank Statement", name: "BANKSTATEMENT" },
  { id: "Salary Slip", name: "SALARYSLIP" },
  { id: "Shop Image", name: "SHOPIMAGE" },
  { id: "Invoice", name: "INVOICE" }
];

export const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/tiff',
  'application/pdf'
];

export const ACCEPTED_FILE_EXTENSIONS = '.png,.pdf,.tiff,.jpeg,.jpg';

export type AnalysisType = 'autoindex' | 'classify';
export type OperationType = 'extract' | 'extractvalidate';

export interface ProcessingState {
  uploadedFile: File | null;
  uploadedImagePreview: string | null;
  preprocessedImage: string | null;
  usePreprocessing: boolean;
  analysisType: AnalysisType | null;
  selectedDocType: string | null;
  operationType: OperationType | null;
  analysisResult: unknown;
  finalResult: unknown;
  isProcessing: boolean;
  currentStep: number;
}
