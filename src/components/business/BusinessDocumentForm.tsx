import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, X, File } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BusinessDocumentAttachment } from '@/hooks/use-business-documents';
import { UseFormReturn } from 'react-hook-form';

interface BusinessDocumentFormProps {
  form: UseFormReturn<any>;
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

export const BusinessDocumentForm: React.FC<BusinessDocumentFormProps> = ({
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
  isUploading,
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Documento' : 'Novo Documento'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Documento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Contrato, Nota Fiscal, etc" {...field} />
                </FormControl>
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
                  <Input type="date" {...field} />
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
                    placeholder="Detalhes adicionais sobre este documento"
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel>Arquivos</FormLabel>
            <div className="grid gap-2">
              <label 
                htmlFor="file-upload" 
                className="flex items-center justify-center p-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-slate-50"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Paperclip className="h-6 w-6 text-slate-400" />
                  <span className="text-sm text-muted-foreground">
                    Clique para anexar arquivos
                  </span>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
              </label>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Enviando arquivos... {uploadProgress}%
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              {attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  <h4 className="text-sm font-medium">Novos Anexos</h4>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-md bg-slate-50"
                      >
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {existingAttachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  <h4 className="text-sm font-medium">Anexos Existentes</h4>
                  <div className="space-y-2">
                    {existingAttachments.map((attachment) => (
                      <div 
                        key={attachment.id}
                        className="flex items-center justify-between p-2 border rounded-md bg-slate-50"
                      >
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate max-w-[200px]">{attachment.file_name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExistingAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isSubmitting || isUploading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-brand-600 hover:bg-brand-700" 
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading ? 'Salvando...' : 'Salvar'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};
