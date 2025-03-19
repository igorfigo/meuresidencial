import React from 'react';
import { useForm } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  PestControlFormValues, 
  PestControlAttachment 
} from '@/hooks/use-pest-control';
import { 
  Paperclip, 
  X, 
  File, 
  Upload, 
  Save, 
  Loader2, 
  Download, 
  Trash2 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface PestControlFormProps {
  form: ReturnType<typeof useForm<PestControlFormValues>>;
  onSubmit: (data: PestControlFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
  attachments: File[];
  existingAttachments: PestControlAttachment[];
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  removeExistingAttachment: (id: string) => void;
  getFileUrl: (path: string) => Promise<string>;
  uploadProgress: number;
  isUploading: boolean;
}

const finalidadeOptions = [
  { id: 'insetos', label: 'Insetos' },
  { id: 'ratos', label: 'Ratos' },
  { id: 'cupim', label: 'Cupim' },
];

export const PestControlForm: React.FC<PestControlFormProps> = ({
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

  React.useEffect(() => {
    if (!form.getValues().data) {
      form.setValue('data', format(new Date(), 'yyyy-MM-dd'));
    }
  }, [form]);

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDownload = async (attachment: PestControlAttachment) => {
    try {
      const url = await getFileUrl(attachment.file_path);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="empresa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="finalidade"
          render={() => (
            <FormItem>
              <FormLabel>Finalidade</FormLabel>
              <div className="grid grid-cols-3 gap-4">
                {finalidadeOptions.map(option => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="finalidade"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                const finalidades = [...field.value];
                                if (checked) {
                                  finalidades.push(option.id);
                                } else {
                                  const index = finalidades.indexOf(option.id);
                                  if (index !== -1) {
                                    finalidades.splice(index, 1);
                                  }
                                }
                                field.onChange(finalidades);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (Locais, etc.)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes sobre a dedetização..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <FormLabel>Anexos</FormLabel>
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
            variant="cancel" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
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
                {isEditing ? "Atualizar Dedetização" : "Salvar Dedetização"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
