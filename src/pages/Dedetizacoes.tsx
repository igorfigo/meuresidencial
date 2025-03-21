
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { usePestControl } from '@/hooks/use-pest-control';
import { PestControlForm } from '@/components/pest-control/PestControlForm';
import { PestControlsList } from '@/components/pest-control/PestControlsList';
import { Bug } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Dedetizacoes = () => {
  const {
    form,
    pestControls,
    isLoading,
    onSubmit,
    deletePestControl,
    isSubmitting,
    isDeleting,
    attachments,
    existingAttachments,
    handleFileChange,
    removeFile,
    removeExistingAttachment,
    getFileUrl,
    uploadProgress,
    isUploading,
    resetForm
  } = usePestControl();
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = (pestControl: any) => {
    resetForm(pestControl);
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center">
            <Bug className="h-6 w-6 mr-2 text-brand-600" />
            <h1 className="text-3xl font-bold">Dedetizações</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Gerencie os registros de dedetização no condomínio
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PestControlsList
              pestControls={pestControls || []}
              onEdit={handleEdit}
              onDelete={deletePestControl}
              isDeleting={isDeleting}
              getFileUrl={getFileUrl}
              fetchAttachments={async (id: string) => []}
            />
          </div>
          <div className="lg:col-span-1">
            <Card className="p-6 border-t-4 border-t-brand-600 shadow-md">
              <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Editar Dedetização' : 'Nova Dedetização'}</h2>
              <PestControlForm 
                form={form}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                isEditing={isEditing}
                onCancel={handleCancel}
                attachments={attachments}
                existingAttachments={existingAttachments}
                handleFileChange={handleFileChange}
                removeFile={removeFile}
                removeExistingAttachment={removeExistingAttachment}
                getFileUrl={getFileUrl}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
              />
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dedetizacoes;
