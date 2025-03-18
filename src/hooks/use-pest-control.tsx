
import { useState } from 'react';
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
  empresa: z.string().min(1, "Empresa é obrigatória"),
  data: z.string().min(1, "Data é obrigatória"),
  finalidade: z.array(z.enum(['insetos', 'ratos', 'cupim'])).min(1, "Selecione pelo menos uma finalidade"),
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

// Interface for attachments
export interface PestControlAttachment {
  id: string;
  pest_control_id: string;
  file_name: string;
  file_type: string;
  file_path: string;
  created_at?: string;
}

export const usePestControl = () => {
  const { user } = useApp();
  const matricula = user?.matricula || '';
  const [editingPestControl, setEditingPestControl] = useState<PestControl | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<PestControlAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Initialize form with default values
  const form = useForm<PestControlFormValues>({
    resolver: zodResolver(pestControlSchema),
    defaultValues: {
      matricula: matricula,
      empresa: '',
      data: new Date().toISOString().split('T')[0],
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
        finalidade: pestControl.finalidade as any,
        observacoes: pestControl.observacoes || '',
      });
      setEditingPestControl(pestControl);
      
      // Fetch attachments for this pest control entry
      fetchAttachments(pestControl.id!);
    } else {
      form.reset({
        matricula: matricula,
        empresa: '',
        data: new Date().toISOString().split('T')[0],
        finalidade: [],
        observacoes: '',
      });
      setEditingPestControl(null);
      setAttachments([]);
      setExistingAttachments([]);
    }
  };

  // Fetch attachments for a pest control entry
  const fetchAttachments = async (pestControlId: string) => {
    const { data, error } = await supabase
      .from('pest_control_attachments')
      .select('*')
      .eq('pest_control_id', pestControlId);
    
    if (error) {
      console.error("Error fetching attachments:", error);
      toast.error("Erro ao carregar anexos");
      return;
    }
    
    setExistingAttachments(data as PestControlAttachment[]);
  };

  // Query to fetch all pest control entries for the current condominium
  const { data: pestControls, isLoading, error, refetch } = useQuery({
    queryKey: ['pest-controls', matricula],
    queryFn: async () => {
      if (!matricula) return [];
      
      const { data, error } = await supabase
        .from('pest_controls')
        .select('*')
        .eq('matricula', matricula)
        .order('data', { ascending: false });
      
      if (error) {
        console.error("Error fetching pest controls:", error);
        toast.error("Erro ao carregar dedetizações");
        throw error;
      }
      
      return data as PestControl[];
    },
    enabled: !!matricula
  });

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  // Remove file from attachments
  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing attachment
  const removeExistingAttachment = async (attachmentId: string) => {
    try {
      // Delete the file from storage
      const attachment = existingAttachments.find(a => a.id === attachmentId);
      if (attachment) {
        await supabase.storage.from('pest-control-attachments').remove([attachment.file_path]);
      }
      
      // Delete the database record
      const { error } = await supabase
        .from('pest_control_attachments')
        .delete()
        .eq('id', attachmentId);
      
      if (error) throw error;
      
      // Update state
      setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
      toast.success("Anexo removido com sucesso");
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast.error("Erro ao remover anexo");
    }
  };

  // Upload files to storage
  const uploadFiles = async (pestControlId: string) => {
    if (attachments.length === 0) return [];
    
    setIsUploading(true);
    const uploadedAttachments: PestControlAttachment[] = [];
    
    try {
      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${pestControlId}/${fileName}`;
        
        // Upload file
        const { error: uploadError } = await supabase.storage
          .from('pest-control-attachments')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Create attachment record
        const { data, error: insertError } = await supabase
          .from('pest_control_attachments')
          .insert({
            pest_control_id: pestControlId,
            file_name: file.name,
            file_type: file.type,
            file_path: filePath
          })
          .select();
        
        if (insertError) throw insertError;
        
        uploadedAttachments.push(data[0]);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / attachments.length) * 100));
      }
      
      toast.success("Anexos enviados com sucesso");
      return uploadedAttachments;
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Erro ao enviar anexos");
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setAttachments([]);
    }
  };

  // Mutation to create a new pest control entry
  const createMutation = useMutation({
    mutationFn: async (values: PestControlFormValues) => {
      // Prepare pest control entry data
      const pestControl = {
        matricula: values.matricula,
        empresa: values.empresa,
        data: values.data,
        finalidade: values.finalidade,
        observacoes: values.observacoes || ''
      };
      
      // Insert pest control entry
      const { data, error } = await supabase
        .from('pest_controls')
        .insert(pestControl)
        .select();
      
      if (error) {
        console.error("Error creating pest control:", error);
        throw error;
      }
      
      // Upload attachments
      await uploadFiles(data[0].id);
      
      return data[0] as PestControl;
    },
    onSuccess: () => {
      toast.success("Dedetização cadastrada com sucesso!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['pest-controls', matricula] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao cadastrar dedetização");
    }
  });

  // Mutation to update an existing pest control entry
  const updateMutation = useMutation({
    mutationFn: async (values: PestControlFormValues) => {
      if (!values.id) throw new Error("ID da dedetização não encontrado");
      
      const { id, ...updateData } = values;
      
      // Update pest control entry
      const { data, error } = await supabase
        .from('pest_controls')
        .update({
          empresa: updateData.empresa,
          data: updateData.data,
          finalidade: updateData.finalidade,
          observacoes: updateData.observacoes || ''
        })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error updating pest control:", error);
        throw error;
      }
      
      // Upload new attachments
      await uploadFiles(id);
      
      return data[0] as PestControl;
    },
    onSuccess: () => {
      toast.success("Dedetização atualizada com sucesso!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['pest-controls', matricula] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar dedetização");
    }
  });

  // Mutation to delete a pest control entry
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, delete all attachments
      const { data: attachments } = await supabase
        .from('pest_control_attachments')
        .select('*')
        .eq('pest_control_id', id);
      
      if (attachments && attachments.length > 0) {
        // Delete files from storage
        const filePaths = attachments.map((a: any) => a.file_path);
        await supabase.storage.from('pest-control-attachments').remove(filePaths);
        
        // Delete attachment records
        await supabase
          .from('pest_control_attachments')
          .delete()
          .eq('pest_control_id', id);
      }
      
      // Delete pest control entry
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
    if (editingPestControl) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  // Get file URL for existing attachment
  const getFileUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('pest-control-attachments')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  return {
    form,
    pestControls,
    isLoading,
    error,
    editingPestControl,
    attachments,
    existingAttachments,
    uploadProgress,
    isUploading,
    resetForm,
    onSubmit,
    handleFileChange,
    removeFile,
    removeExistingAttachment,
    getFileUrl,
    deletePestControl: deleteMutation.mutate,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch
  };
};
