import React from 'react';
import { Card, CardContent } from './ui/card';
import { Summary } from '@/types/types';

interface PriceDisplayProps {
  summary: Summary;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ summary }) => {
  const isPositive = summary?.changePercent?.startsWith('+');
  const isNegative = summary?.changePercent?.startsWith('-');

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{summary?.name || 'Commodity'}</h2>
          <p className="text-sm text-gray-600">{summary?.category} • {summary?.unit}</p>
        </div>
        
        <div className="text-center">
          <p className="text-4xl font-bold text-blue-600 mb-2">
            {summary?.price || 'N/A'}
          </p>
          
          {summary?.change && summary?.changePercent && (
            <div className="flex items-center justify-center gap-2">
              <span className={`text-lg font-semibold ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
              }`}>
                {summary.change} ({summary.changePercent})
              </span>
              {isPositive && <span className="text-green-600">↗</span>}
              {isNegative && <span className="text-red-600">↘</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceDisplay;