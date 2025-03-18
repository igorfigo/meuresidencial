
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Form validation schema
export const pestControlSchema = z.object({
  id: z.string().optional(),
  matricula: z.string(),
  empresa: z.string().min(1, "Nome da empresa é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  finalidade: z.array(z.string()).min(1, "Selecione pelo menos uma finalidade"),
  observacoes: z.string().optional(),
});

export type PestControlFormValues = z.infer<typeof pestControlSchema>;

// Interface for pest control data
export interface PestControl {
  id?: string;
  matricula: string;
  empresa: string;
  data: string;
  finalidade: string[];
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for attachment data
export interface PestControlAttachment {
  id: string;
  pest_control_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at?: string;
}

export const usePestControl = () => {
  const { user } = useApp();
  const matricula = user?.matricula || '';
  const queryClient = useQueryClient();
  
  // File handling state
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<PestControlAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with default values
  const form = useForm<PestControlFormValues>({
    resolver: zodResolver(pestControlSchema),
    defaultValues: {
      matricula: matricula,
      empresa: '',
      data: '',
      finalidade: [],
      observacoes: '',
    }
  });

  // Reset form to default values or to values of pest control being edited
  const resetForm = (pestControl?: PestControl) => {
    if (pestControl) {
      form.reset({
        id: pestControl.id,
        matricula: matricula,
        empresa: pestControl.empresa,
        data: pestControl.data,
        finalidade: pestControl.finalidade,
        observacoes: pestControl.observacoes || '',
      });
      
      // If editing, fetch attachments for this pest control
      if (pestControl.id) {
        fetchAttachmentsForEdit(pestControl.id);
      } else {
        setExistingAttachments([]);
      }
    } else {
      form.reset({
        matricula: matricula,
        empresa: '',
        data: '',
        finalidade: [],
        observacoes: '',
      });
      setAttachments([]);
      setExistingAttachments([]);
    }
  };

  // Fetch attachments for a pest control record being edited
  const fetchAttachmentsForEdit = async (pestControlId: string) => {
    try {
      const { data, error } = await supabase
        .from('pest_control_attachments')
        .select('*')
        .eq('pest_control_id', pestControlId);
      
      if (error) {
        console.error("Error fetching attachments:", error);
        return;
      }
      
      setExistingAttachments(data as PestControlAttachment[]);
    } catch (error) {
      console.error("Error in fetchAttachmentsForEdit:", error);
    }
  };

  // Query to fetch all pest controls for the current condominium
  const { data: pestControls, isLoading, error, refetch } = useQuery({
    queryKey: ['pest-controls', matricula],
    queryFn: async () => {
      if (!matricula) return [];
      
      const { data, error } = await supabase
        .from('pest_controls')
        .select('*')
        .eq('matricula', matricula)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching pest controls:", error);
        toast.error("Erro ao carregar dedetizações");
        throw error;
      }
      
      return data as PestControl[];
    },
    enabled: !!matricula
  });

  // File handling functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = async (attachmentId: string) => {
    try {
      // First find the attachment to get the file path
      const attachment = existingAttachments.find(a => a.id === attachmentId);
      if (!attachment) return;

      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('pest-control-attachments')
        .remove([attachment.file_path.split('/').pop() || '']);
      
      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        toast.error("Erro ao excluir arquivo");
        return;
      }
      
      // Delete the record from the database
      const { error: dbError } = await supabase
        .from('pest_control_attachments')
        .delete()
        .eq('id', attachmentId);
      
      if (dbError) {
        console.error("Error deleting attachment record:", dbError);
        toast.error("Erro ao excluir registro do anexo");
        return;
      }
      
      // Update state
      setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
      toast.success("Anexo removido com sucesso");
    } catch (error) {
      console.error("Error in removeExistingAttachment:", error);
      toast.error("Erro ao remover anexo");
    }
  };

  // Function to upload files and return their paths
  const uploadFiles = async (pestControlId: string): Promise<boolean> => {
    if (attachments.length === 0) return true;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const totalFiles = attachments.length;
      let uploadedFiles = 0;
      
      for (const file of attachments) {
        // Upload file to storage
        const fileName = `${Date.now()}_${file.name}`;
        const { data: fileData, error: uploadError } = await supabase.storage
          .from('pest-control-attachments')
          .upload(fileName, file);
        
        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          toast.error(`Erro ao enviar arquivo: ${file.name}`);
          continue;
        }
        
        // Create attachment record in database
        const attachmentData = {
          pest_control_id: pestControlId,
          file_name: file.name,
          file_type: file.type,
          file_path: fileData.path
        };
        
        const { error: recordError } = await supabase
          .from('pest_control_attachments')
          .insert(attachmentData);
        
        if (recordError) {
          console.error("Error saving attachment record:", recordError);
          toast.error(`Erro ao salvar registro do anexo: ${file.name}`);
          continue;
        }
        
        uploadedFiles++;
        setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100));
      }
      
      setAttachments([]);
      return true;
    } catch (error) {
      console.error("Error in uploadFiles:", error);
      toast.error("Erro ao enviar anexos");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Function to get URL for a stored file
  const getFileUrl = async (path: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('pest-control-attachments')
      .getPublicUrl(path.split('/').pop() || '');
    
    return data.publicUrl;
  };

  // Mutation to create a new pest control
  const createMutation = useMutation({
    mutationFn: async (values: PestControlFormValues) => {
      const pestControl: PestControl = {
        matricula: values.matricula,
        empresa: values.empresa,
        data: values.data,
        finalidade: values.finalidade,
        observacoes: values.observacoes
      };
      
      const { data, error } = await supabase
        .from('pest_controls')
        .insert(pestControl)
        .select();
      
      if (error) {
        console.error("Error creating pest control:", error);
        throw error;
      }
      
      return data?.[0] as PestControl;
    },
    onSuccess: async (data) => {
      if (data?.id) {
        const uploadSuccess = await uploadFiles(data.id);
        if (uploadSuccess) {
          toast.success("Dedetização cadastrada com sucesso!");
          resetForm();
          queryClient.invalidateQueries({ queryKey: ['pest-controls', matricula] });
        }
      }
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar dedetização");
      console.error(error);
    }
  });

  // Mutation to update an existing pest control
  const updateMutation = useMutation({
    mutationFn: async (values: PestControlFormValues) => {
      if (!values.id) throw new Error("ID da dedetização não encontrado");
      
      const { id, ...updateData } = values;
      
      const pestControl: Omit<PestControl, 'id'> = {
        matricula: updateData.matricula,
        empresa: updateData.empresa,
        data: updateData.data,
        finalidade: updateData.finalidade,
        observacoes: updateData.observacoes
      };
      
      const { data, error } = await supabase
        .from('pest_controls')
        .update(pestControl)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error updating pest control:", error);
        throw error;
      }
      
      return data?.[0] as PestControl;
    },
    onSuccess: async (data) => {
      if (data?.id) {
        const uploadSuccess = await uploadFiles(data.id);
        if (uploadSuccess) {
          toast.success("Dedetização atualizada com sucesso!");
          resetForm();
          queryClient.invalidateQueries({ queryKey: ['pest-controls', matricula] });
        }
      }
    },
    onError: (error) => {
      toast.error("Erro ao atualizar dedetização");
      console.error(error);
    }
  });

  // Mutation to delete a pest control
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First get all attachments to delete them from storage
      const { data: attachments } = await supabase
        .from('pest_control_attachments')
        .select('*')
        .eq('pest_control_id', id);
      
      if (attachments && attachments.length > 0) {
        // Delete files from storage
        for (const attachment of attachments as PestControlAttachment[]) {
          await supabase.storage
            .from('pest-control-attachments')
            .remove([attachment.file_path.split('/').pop() || '']);
        }
      }
      
      // Then delete the pest control record (cascade will delete attachments)
      const { error } = await supabase
        .from('pest_controls')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting pest control:", error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast.success("Dedetização excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['pest-controls', matricula] });
    },
    onError: () => {
      toast.error("Erro ao excluir dedetização");
    }
  });

  // Handle form submission
  const onSubmit = (values: PestControlFormValues) => {
    if (values.id) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return {
    form,
    pestControls,
    isLoading,
    error,
    resetForm,
    onSubmit,
    deletePestControl: deleteMutation.mutate,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    attachments,
    existingAttachments,
    handleFileChange,
    removeFile,
    removeExistingAttachment,
    getFileUrl,
    uploadProgress,
    isUploading,
    refetch
  };
};
