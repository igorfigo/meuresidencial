
import { UseFormReturn } from 'react-hook-form';
import { PestControl, PestControlAttachment, PestControlFormValues } from '@/hooks/use-pest-control';

export interface UsePestControlReturn {
  form: UseFormReturn<PestControlFormValues>;
  pestControls: PestControl[];
  isLoading: boolean;
  onSubmit: (values: PestControlFormValues) => void;
  deletePestControl: (id: string) => void;
  isSubmitting: boolean;
  isDeleting: boolean;
  attachments: File[];
  existingAttachments: PestControlAttachment[];
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  removeExistingAttachment: (id: string) => void;
  getFileUrl: (path: string) => Promise<string>;
  uploadProgress: number;
  isUploading: boolean;
  resetForm: (pestControl?: PestControl) => void;
  refetch: () => Promise<any>;
}
