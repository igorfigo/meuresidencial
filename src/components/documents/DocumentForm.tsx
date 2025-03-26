
import React from 'react';
import { useForm } from 'react-hook-form';
import { UseFormReturn } from 'react-hook-form';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Paperclip, 
  X, 
  File, 
  Save, 
  ArrowLeft, 
  Loader2, 
  Download, 
  Trash2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { BusinessDocumentAttachment } from "@/pages/BusinessDocuments";

interface DocumentFormProps {
  form: UseFormReturn<{
    id?: string;
    tipo: string;
    data_cadastro: Date;
    observacoes?: string;
  }, any, undefined>;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
  attachments: File[];
  existingAttachments: BusinessDocumentAttachment[];
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  removeExistingAttachment: (id: string) => void;
  getFileUrl: (path: string) => Promise<string>;
  uploadProgress: number;
  isUploading: boolean;
}

const documentTypes = [
  { id: 'contrato', label: 'Contrato' },
  { id: 'ata', label: 'Ata de Reunião' },
  { id: 'registro', label: 'Registro Comercial' },
  { id: 'nota_fiscal', label: 'Nota Fiscal' },
  { id: 'certidao', label: 'Certidão' },
  { id: 'alvara', label: 'Alvará' },
  { id: 'outro', label: 'Outro' },
];

export const DocumentForm: React.FC<DocumentFormProps> = ({
  form,
  onSubmit,
  isSubmitting,
  isEditing,
  onCancel,
  attachments,
  existingAttachments,
  handleFileChange,
  removeFile,
  removeExistingAttachment,
  getFileUrl,
  uploadProgress,
  isUploading
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDownload = async (attachment: BusinessDocumentAttachment) => {
    try {
      const url = await getFileUrl(attachment.file_path);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo do Documento</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de documento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_cadastro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  value={formatDate(field.value)}
                  onChange={(e) => {
                    field.onChange(e.target.value ? new Date(e.target.value) : null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes sobre o documento..."
                  className="min-h-[120px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <div className="flex items-center">
              <FormLabel>Anexos</FormLabel>
              <span className="text-sm text-red-500 ml-1">*</span>
              <span className="text-sm text-muted-foreground ml-2">(Obrigatório)</span>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openFileSelector}
                  disabled={isUploading}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Selecionar arquivos
                </Button>
                <span className="text-sm text-muted-foreground">
                  {attachments.length > 0
                    ? `${attachments.length} arquivo(s) selecionado(s)`
                    : "Nenhum arquivo selecionado"}
                </span>
              </div>

              {isUploading && (
                <div className="w-full space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-muted-foreground">
                    Enviando... {uploadProgress}%
                  </p>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  <h4 className="text-sm font-medium">Arquivos a enviar:</h4>
                  <ul className="space-y-2">
                    {attachments.map((file, index) => (
                      <li 
                        key={index} 
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-blue-500" />
                          <span className="text-sm truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {existingAttachments.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Anexos já enviados:</h4>
                  <ul className="space-y-2">
                    {existingAttachments.map((attachment) => (
                      <li 
                        key={attachment.id} 
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-blue-500" />
                          <span className="text-sm truncate max-w-[200px]">
                            {attachment.file_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDownload(attachment)}
                            title="Baixar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeExistingAttachment(attachment.id)}
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading} 
            className="bg-brand-600 hover:bg-brand-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Atualizando..." : "Salvando..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Atualizar Documento" : "Salvar Documento"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
