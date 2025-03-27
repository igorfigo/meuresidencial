
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mapping of state abbreviations to their respective names
const STATE_NAMES: Record<string, string> = {
  'AC': 'Acre',
  'AL': 'Alagoas',
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins'
};

interface BrazilMapProps {
  states: [string, number][];
  onStateClick: (state: string) => void;
}

export const BrazilMap: React.FC<BrazilMapProps> = ({ states, onStateClick }) => {
  // Create a map of state abbreviations to their counts
  const stateCountMap = Object.fromEntries(states);
  
  // Determine the highest count for scaling the intensity
  const maxCount = states.length > 0 ? Math.max(...states.map(([_, count]) => count)) : 0;
  
  // Get intensity for a specific state (normalized between 0 and 1)
  const getStateIntensity = (stateCode: string) => {
    const count = stateCountMap[stateCode] || 0;
    return maxCount > 0 ? count / maxCount : 0;
  };
  
  // Generate color for a state based on intensity (blue with varying opacity)
  const getStateColor = (stateCode: string) => {
    const intensity = getStateIntensity(stateCode);
    if (intensity === 0) return 'fill-gray-200';
    const opacityClass = intensity > 0.7 ? 'fill-blue-600' :
                          intensity > 0.4 ? 'fill-blue-500' :
                          intensity > 0.1 ? 'fill-blue-400' : 'fill-blue-300';
    return opacityClass;
  };
  
  // Generate tooltip text for a state
  const getStateTooltip = (stateCode: string) => {
    const count = stateCountMap[stateCode] || 0;
    const stateName = STATE_NAMES[stateCode] || stateCode;
    if (count === 0) return `${stateName}: Nenhum condomínio`;
    return `${stateName}: ${count} condomínio${count !== 1 ? 's' : ''}`;
  };
  
  return (
    <Card className="card-hover border-t-4 border-t-brand-600 shadow-md h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Distribuição Geográfica</CardTitle>
        <MapPin className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64 md:h-56 lg:h-64">
          <svg
            viewBox="0 0 800 800"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Brazil map paths */}
            {/* Acre (AC) */}
            <path
              d="M170,290 L120,300 L110,280 L160,270 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('AC'))}
              onClick={() => onStateClick('AC')}
              title={getStateTooltip('AC')}
            />
            
            {/* Amazonas (AM) */}
            <path
              d="M170,290 L260,240 L300,270 L280,320 L220,330 L190,310 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('AM'))}
              onClick={() => onStateClick('AM')}
              title={getStateTooltip('AM')}
            />
            
            {/* Roraima (RR) */}
            <path
              d="M260,240 L280,200 L310,220 L300,270 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('RR'))}
              onClick={() => onStateClick('RR')}
              title={getStateTooltip('RR')}
            />
            
            {/* Pará (PA) */}
            <path
              d="M300,270 L360,250 L420,280 L410,350 L350,370 L310,330 L280,320 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('PA'))}
              onClick={() => onStateClick('PA')}
              title={getStateTooltip('PA')}
            />
            
            {/* Amapá (AP) */}
            <path
              d="M360,250 L370,210 L400,220 L420,280 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('AP'))}
              onClick={() => onStateClick('AP')}
              title={getStateTooltip('AP')}
            />
            
            {/* Maranhão (MA) */}
            <path
              d="M420,280 L470,290 L460,350 L410,350 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('MA'))}
              onClick={() => onStateClick('MA')}
              title={getStateTooltip('MA')}
            />
            
            {/* Piauí (PI) */}
            <path
              d="M470,290 L510,310 L480,370 L460,350 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('PI'))}
              onClick={() => onStateClick('PI')}
              title={getStateTooltip('PI')}
            />
            
            {/* Ceará (CE) */}
            <path
              d="M510,310 L540,300 L550,330 L520,350 L480,370 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('CE'))}
              onClick={() => onStateClick('CE')}
              title={getStateTooltip('CE')}
            />
            
            {/* Rio Grande do Norte (RN) */}
            <path
              d="M540,300 L570,310 L560,330 L550,330 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('RN'))}
              onClick={() => onStateClick('RN')}
              title={getStateTooltip('RN')}
            />
            
            {/* Paraíba (PB) */}
            <path
              d="M550,330 L560,330 L570,350 L540,340 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('PB'))}
              onClick={() => onStateClick('PB')}
              title={getStateTooltip('PB')}
            />
            
            {/* Pernambuco (PE) */}
            <path
              d="M520,350 L550,330 L540,340 L570,350 L530,370 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('PE'))}
              onClick={() => onStateClick('PE')}
              title={getStateTooltip('PE')}
            />
            
            {/* Alagoas (AL) */}
            <path
              d="M530,370 L570,350 L580,370 L560,380 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('AL'))}
              onClick={() => onStateClick('AL')}
              title={getStateTooltip('AL')}
            />
            
            {/* Sergipe (SE) */}
            <path
              d="M560,380 L580,370 L590,390 L570,400 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('SE'))}
              onClick={() => onStateClick('SE')}
              title={getStateTooltip('SE')}
            />
            
            {/* Bahia (BA) */}
            <path
              d="M480,370 L520,350 L530,370 L560,380 L570,400 L550,440 L490,460 L450,430 L430,390 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('BA'))}
              onClick={() => onStateClick('BA')}
              title={getStateTooltip('BA')}
            />
            
            {/* Tocantins (TO) */}
            <path
              d="M410,350 L460,350 L430,390 L380,390 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('TO'))}
              onClick={() => onStateClick('TO')}
              title={getStateTooltip('TO')}
            />
            
            {/* Mato Grosso (MT) */}
            <path
              d="M310,330 L350,370 L380,390 L360,440 L300,420 L290,380 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('MT'))}
              onClick={() => onStateClick('MT')}
              title={getStateTooltip('MT')}
            />
            
            {/* Rondônia (RO) */}
            <path
              d="M220,330 L280,320 L290,380 L240,370 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('RO'))}
              onClick={() => onStateClick('RO')}
              title={getStateTooltip('RO')}
            />
            
            {/* Mato Grosso do Sul (MS) */}
            <path
              d="M300,420 L360,440 L340,490 L300,470 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('MS'))}
              onClick={() => onStateClick('MS')}
              title={getStateTooltip('MS')}
            />
            
            {/* Goiás (GO) */}
            <path
              d="M360,440 L380,390 L430,390 L450,430 L400,470 L340,490 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('GO'))}
              onClick={() => onStateClick('GO')}
              title={getStateTooltip('GO')}
            />
            
            {/* Distrito Federal (DF) */}
            <path
              d="M390,430 L410,425 L415,445 L395,450 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('DF'))}
              onClick={() => onStateClick('DF')}
              title={getStateTooltip('DF')}
            />
            
            {/* Minas Gerais (MG) */}
            <path
              d="M400,470 L450,430 L490,460 L480,520 L420,530 L390,510 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('MG'))}
              onClick={() => onStateClick('MG')}
              title={getStateTooltip('MG')}
            />
            
            {/* Espírito Santo (ES) */}
            <path
              d="M490,460 L550,440 L530,490 L480,520 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('ES'))}
              onClick={() => onStateClick('ES')}
              title={getStateTooltip('ES')}
            />
            
            {/* Rio de Janeiro (RJ) */}
            <path
              d="M480,520 L530,490 L510,530 L460,540 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('RJ'))}
              onClick={() => onStateClick('RJ')}
              title={getStateTooltip('RJ')}
            />
            
            {/* São Paulo (SP) */}
            <path
              d="M390,510 L420,530 L460,540 L440,580 L380,550 L350,510 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('SP'))}
              onClick={() => onStateClick('SP')}
              title={getStateTooltip('SP')}
            />
            
            {/* Paraná (PR) */}
            <path
              d="M350,510 L380,550 L350,580 L320,540 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('PR'))}
              onClick={() => onStateClick('PR')}
              title={getStateTooltip('PR')}
            />
            
            {/* Santa Catarina (SC) */}
            <path
              d="M320,540 L350,580 L330,610 L300,580 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('SC'))}
              onClick={() => onStateClick('SC')}
              title={getStateTooltip('SC')}
            />
            
            {/* Rio Grande do Sul (RS) */}
            <path
              d="M300,580 L330,610 L310,660 L260,640 L280,590 Z"
              className={cn("stroke-gray-400 hover:stroke-blue-800 cursor-pointer transition-colors", getStateColor('RS'))}
              onClick={() => onStateClick('RS')}
              title={getStateTooltip('RS')}
            />
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-0 right-0 bg-white bg-opacity-80 p-2 rounded-sm text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-600"></div>
              <span>Muitos</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500"></div>
              <span>Médio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400"></div>
              <span>Poucos</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200"></div>
              <span>Nenhum</span>
            </div>
          </div>
        </div>
        
        {/* Top 3 states list */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Estados com Mais Condomínios:</h4>
          <div className="space-y-1">
            {states.slice(0, 3).map(([state, count]) => (
              <div 
                key={state} 
                className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => onStateClick(state)}
              >
                <span>{STATE_NAMES[state] || state}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
