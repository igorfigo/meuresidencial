
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Paperclip, X } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { BusinessDocumentFormData } from '@/hooks/use-business-documents';

interface BusinessDocumentFormProps {
  onSubmit: (data: BusinessDocumentFormData) => void;
  isLoading: boolean;
}

export function BusinessDocumentForm({ onSubmit, isLoading }: BusinessDocumentFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const form = useForm<BusinessDocumentFormData>({
    defaultValues: {
      tipo: '',
      data_cadastro: format(new Date(), 'yyyy-MM-dd'),
      observacoes: '',
      files: []
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: BusinessDocumentFormData) => {
    const formData = {
      ...data,
      files: selectedFiles
    };
    onSubmit(formData);
    form.reset();
    setSelectedFiles([]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Documento</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título do documento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_cadastro"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'dd/MM/yyyy')
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                  placeholder="Digite as observações (opcional)" 
                  className="resize-none" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel htmlFor="files">Anexos</FormLabel>
          <div className="mt-2">
            <label 
              htmlFor="file-upload" 
              className="flex items-center gap-2 cursor-pointer bg-gray-100 dark:bg-gray-800 p-3 rounded-md border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
            >
              <Paperclip className="h-4 w-4" />
              <span>Clique para adicionar arquivos</span>
              <input 
                id="file-upload" 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <ul className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                  <div className="flex items-center">
                    <Paperclip className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="truncate max-w-xs">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Documento'}
        </Button>
      </form>
    </Form>
  );
}
