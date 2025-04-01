
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
import { UserPlus, Mail, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useApp } from '@/contexts/AppContext';

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
  const { logout } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    newName: '',
    newEmail: '',
    newPhone: '',
    newAddress: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone field to limit to 11 digits
    if (name === 'newPhone') {
      // Remove non-numeric characters and limit to 11 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validateForm = () => {
    if (!formData.newName || !formData.newEmail || !formData.newPhone || !formData.newAddress) {
      toast.error('Por favor, preencha todos os campos');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.newEmail)) {
      toast.error('Por favor, insira um email válido');
      return false;
    }

    // Validate phone number
    if (formData.newPhone.length < 10) {
      toast.error('O número de telefone deve ter pelo menos 10 dígitos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // If not showing confirmation yet, show it
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a new password for the new manager
      const newPassword = generateRandomPassword();
      
      // Update the condominium record with new manager details
      const { error } = await supabase
        .from('condominiums')
        .update({
          nomelegal: formData.newName,
          emaillegal: formData.newEmail,
          telefonelegal: formData.newPhone,
          enderecolegal: formData.newAddress,
          senha: newPassword
        })
        .eq('matricula', matricula);

      if (error) {
        throw new Error(error.message);
      }

      // Send email to new manager with login credentials
      const { error: emailError } = await supabase.functions.invoke('send-manager-change-email', {
        body: {
          matricula,
          currentName,
          currentEmail,
          newName: formData.newName,
          newEmail: formData.newEmail,
          newPhone: formData.newPhone,
          newAddress: formData.newAddress,
          newPassword
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Continue with success message even if email fails
      }

      toast.success('Gestor alterado com sucesso! Você será desconectado em 5 segundos.');
      
      // Reset form data
      setFormData({
        newName: '',
        newEmail: '',
        newPhone: '',
        newAddress: ''
      });
      
      // Close dialog and reset confirmation state
      onOpenChange(false);
      setShowConfirmation(false);
      
      // Log out the user after 5 seconds
      setTimeout(() => {
        logout();
      }, 5000);
      
    } catch (error) {
      console.error('Erro ao alterar gestor:', error);
      toast.error('Erro ao alterar gestor. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else {
      onOpenChange(false);
    }
    // Reset form data when canceling
    setFormData({
      newName: '',
      newEmail: '',
      newPhone: '',
      newAddress: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-600" />
            {showConfirmation ? 'Confirmar Alteração de Gestor' : 'Alterar Gestor'}
          </DialogTitle>
          <DialogDescription>
            {showConfirmation 
              ? 'Esta ação não pode ser desfeita. O gestor atual será substituído e você será desconectado do sistema.'
              : 'Preencha os dados do novo gestor. Esta ação substituirá imediatamente o gestor atual.'}
          </DialogDescription>
        </DialogHeader>

        {showConfirmation && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              Esta ação é irreversível. Ao confirmar, o gestor atual será substituído pelo novo gestor 
              e você será desconectado do sistema. Uma nova senha será gerada e enviada para o email do novo gestor.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!showConfirmation && (
            <>
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
                  maxLength={11}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Digite apenas números (máximo 11 dígitos)
                </p>
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
            </>
          )}

          {showConfirmation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 bg-gray-50 p-4 rounded-md">
                <div>
                  <span className="font-semibold">Nome:</span> {formData.newName}
                </div>
                <div>
                  <span className="font-semibold">E-mail:</span> {formData.newEmail}
                </div>
                <div>
                  <span className="font-semibold">Telefone:</span> {formData.newPhone}
                </div>
                <div>
                  <span className="font-semibold">Endereço:</span> {formData.newAddress}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {showConfirmation ? 'Voltar' : 'Cancelar'}
            </Button>
            <Button 
              type="submit" 
              variant={showConfirmation ? "destructive" : "default"}
              className={showConfirmation ? "" : "bg-brand-600 hover:bg-brand-700"}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Processando...' 
                : showConfirmation 
                  ? 'Confirmar Alteração' 
                  : 'Continuar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
