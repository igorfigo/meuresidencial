
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  FileText, 
  Paperclip, 
  Download, 
  Trash, 
  Eye, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BusinessDocument,
  BusinessDocumentAttachment,
  useBusinessDocuments 
} from '@/hooks/use-business-documents';

interface BusinessDocumentsListProps {
  documents: BusinessDocument[];
  onDelete: (id: string) => void;
}

export function BusinessDocumentsList({ documents, onDelete }: BusinessDocumentsListProps) {
  const { getDocumentAttachments } = useBusinessDocuments();
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);
  const [documentAttachments, setDocumentAttachments] = useState<BusinessDocumentAttachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<BusinessDocumentAttachment | null>(null);

  const toggleExpandDocument = async (documentId: string) => {
    if (expandedDocument === documentId) {
      setExpandedDocument(null);
    } else {
      setExpandedDocument(documentId);
      const attachments = await getDocumentAttachments(documentId);
      setDocumentAttachments(attachments);
    }
  };

  const handleOpenPreview = (attachment: BusinessDocumentAttachment) => {
    setPreviewAttachment(attachment);
  };

  const handleClosePreview = () => {
    setPreviewAttachment(null);
  };

  const fileCanBePreviewedInBrowser = (attachment: BusinessDocumentAttachment) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const pdfType = 'application/pdf';
    return imageTypes.includes(attachment.file_type) || attachment.file_type === pdfType;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-md">
        <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Nenhum documento encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {documents.map((document) => (
          <div key={document.id} className="border rounded-md overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => toggleExpandDocument(document.id)}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium">{document.tipo}</h3>
                  <p className="text-sm text-gray-500">
                    {format(parseISO(document.data_cadastro), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(document.id);
                  }}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
                {expandedDocument === document.id ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
            {expandedDocument === document.id && (
              <div className="p-4 border-t">
                {document.observacoes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Observações:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{document.observacoes}</p>
                  </div>
                )}
                <h4 className="text-sm font-medium mb-2">Anexos:</h4>
                {documentAttachments.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum anexo encontrado.</p>
                ) : (
                  <ul className="space-y-2">
                    {documentAttachments.map((attachment) => (
                      <li 
                        key={attachment.id} 
                        className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md"
                      >
                        <div className="flex items-center overflow-hidden">
                          <Paperclip className="h-4 w-4 text-blue-500 flex-shrink-0 mr-2" />
                          <span className="text-sm truncate">{attachment.file_name}</span>
                        </div>
                        <div className="flex gap-2">
                          {fileCanBePreviewedInBrowser(attachment) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => handleOpenPreview(attachment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            asChild
                          >
                            <a href={attachment.file_path} download target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!previewAttachment} onOpenChange={() => handleClosePreview()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {previewAttachment?.file_name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center max-h-[70vh] overflow-auto">
            {previewAttachment?.file_type.startsWith('image/') ? (
              <img 
                src={previewAttachment.file_path} 
                alt={previewAttachment.file_name} 
                className="max-w-full h-auto" 
              />
            ) : previewAttachment?.file_type === 'application/pdf' ? (
              <iframe
                src={`${previewAttachment.file_path}#view=FitH`}
                width="100%"
                height="500px"
                title={previewAttachment.file_name}
                className="border-0"
              />
            ) : (
              <div className="text-center p-10">
                <p>Este tipo de arquivo não pode ser visualizado. Por favor, faça o download.</p>
                <Button className="mt-4" asChild>
                  <a href={previewAttachment?.file_path} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
