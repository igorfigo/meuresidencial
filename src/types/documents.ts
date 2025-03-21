
import { UseFormReturn } from 'react-hook-form';
import { Document, DocumentAttachment, DocumentFormValues } from '@/hooks/use-documents';

export interface UseDocumentsReturn {
  form: UseFormReturn<DocumentFormValues>;
  documents: Document[];
  isLoading: boolean;
  onSubmit: (values: DocumentFormValues) => void;
  deleteDocument: (id: string) => Promise<void>;
  isSubmitting: boolean;
  isDeleting: boolean;
  attachments: File[];
  existingAttachments: DocumentAttachment[];
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  removeExistingAttachment: (id: string) => Promise<void>;
  getFileUrl: (path: string) => Promise<string>;
  uploadProgress: number;
  isUploading: boolean;
  resetForm: (document?: Document) => void;
  fetchDocuments: () => Promise<void>;
  fetchAttachments: (documentId: string) => Promise<DocumentAttachment[]>;
}
