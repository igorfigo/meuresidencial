
export interface PreventiveAlert {
  id: string;
  matricula: string;
  category: PreventiveAlertCategory;
  alertDate: Date;
  observations: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PreventiveAlertCategory = 
  | 'eletricos' 
  | 'hidraulicos' 
  | 'elevadores' 
  | 'telhados' 
  | 'seguranca' 
  | 'incendio';

export const alertCategoryLabels: Record<PreventiveAlertCategory, string> = {
  eletricos: 'Sistemas Elétricos',
  hidraulicos: 'Sistemas Hidráulicos',
  elevadores: 'Elevadores',
  telhados: 'Telhados e Fachadas',
  seguranca: 'Sistema de Segurança',
  incendio: 'Equipamentos de Incêndio'
};
