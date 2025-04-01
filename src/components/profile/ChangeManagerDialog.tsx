
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserPlus, Mail, User, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChangeManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matricula: string;
  currentName?: string;
  currentEmail?: string;
  currentPhone?: string;
  currentAddress?: string;
}

export const ChangeManagerDialog = ({
  open,
  onOpenChange,
  matricula,
  currentName,
  currentEmail,
  currentPhone,
  currentAddress
}: ChangeManagerDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    newName: '',
    newEmail: '',
    newPhone: '',
    newAddress: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newName || !formData.newEmail || !formData.newPhone || !formData.newAddress) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-manager-change-email', {
        body: {
          matricula,
          currentName,
          currentEmail,
          currentPhone,
          currentAddress,
          newName: formData.newName,
          newEmail: formData.newEmail,
          newPhone: formData.newPhone,
          newAddress: formData.newAddress
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Solicitação enviada com sucesso! Você receberá uma resposta em até 24 horas úteis.');
      onOpenChange(false);
      setFormData({
        newName: '',
        newEmail: '',
        newPhone: '',
        newAddress: ''
      });
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-600" />
            Solicitar Alteração de Gestor
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do novo representante legal. 
            Você receberá uma resposta em até 24 horas úteis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="newName" className="flex items-center gap-2" required>
              <User className="h-4 w-4" />
              Nome Completo
            </Label>
            <Input
              id="newName"
              name="newName"
              placeholder="Nome completo do novo gestor"
              value={formData.newName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail" className="flex items-center gap-2" required>
              <Mail className="h-4 w-4" />
              E-mail
            </Label>
            <Input
              id="newEmail"
              name="newEmail"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.newEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPhone" className="flex items-center gap-2" required>
              <Phone className="h-4 w-4" />
              Número de Telefone
            </Label>
            <Input
              id="newPhone"
              name="newPhone"
              placeholder="(00) 00000-0000"
              value={formData.newPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newAddress" className="flex items-center gap-2" required>
              <MapPin className="h-4 w-4" />
              Endereço Residencial
            </Label>
            <Input
              id="newAddress"
              name="newAddress"
              placeholder="Endereço completo"
              value={formData.newAddress}
              onChange={handleChange}
              required
            />
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-600 hover:bg-brand-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
