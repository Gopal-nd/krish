import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Commodity {
  name: string;
  ticker: string;
  category: 'hard' | 'soft';
}

const commodities: Commodity[] = [
  // Precious Metals
  { name: 'Gold', ticker: 'GC=F', category: 'hard' },
  { name: 'Silver', ticker: 'SI=F', category: 'hard' },
  { name: 'Platinum', ticker: 'PL=F', category: 'hard' },
  { name: 'Palladium', ticker: 'PA=F', category: 'hard' },
  
  // Energy
  { name: 'Crude Oil (WTI)', ticker: 'CL=F', category: 'hard' },
  { name: 'Brent Crude Oil', ticker: 'BZ=F', category: 'hard' },
  { name: 'Natural Gas', ticker: 'NG=F', category: 'hard' },
  
  // Grains
  { name: 'Corn', ticker: 'ZC=F', category: 'soft' },
  { name: 'Soybeans', ticker: 'ZS=F', category: 'soft' },
  { name: 'Wheat', ticker: 'ZW=F', category: 'soft' },
  
  // Softs
  { name: 'Coffee', ticker: 'KC=F', category: 'soft' },
  { name: 'Cotton', ticker: 'CT=F', category: 'soft' },
  { name: 'Cocoa', ticker: 'CC=F', category: 'soft' },
  { name: 'Sugar', ticker: 'SB=F', category: 'soft' },
  { name: 'Orange Juice', ticker: 'OJ=F', category: 'soft' },
  
  // Livestock
  { name: 'Lean Hogs', ticker: 'HE=F', category: 'soft' },
  { name: 'Live Cattle', ticker: 'LE=F', category: 'soft' },
  { name: 'Feeder Cattle', ticker: 'GF=F', category: 'soft' },
  
  // Industrial Metals
  { name: 'Copper', ticker: 'HG=F', category: 'hard' },
  { name: 'Aluminum', ticker: 'ALI=F', category: 'hard' },
  { name: 'Nickel', ticker: 'NID=F', category: 'hard' },
  { name: 'Zinc', ticker: 'ZNC=F', category: 'hard' },
  { name: 'Steel', ticker: 'HRC=F', category: 'hard' },
];

interface CommoditySelectorProps {
  onSelect: (ticker: string) => void;
}

const CommoditySelector: React.FC<CommoditySelectorProps> = ({ onSelect }) => {
  return (
    <Select onValueChange={onSelect}>
  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500">
    <SelectValue placeholder="Select a commodity" />
  </SelectTrigger>
  <SelectContent>
    <div className="px-2 py-1 text-gray-500 text-sm font-semibold">Precious Metals</div>
    {commodities.filter(c => ['GC=F', 'SI=F', 'PL=F', 'PA=F'].includes(c.ticker)).map((comm) => (
      <SelectItem key={comm.ticker} value={comm.ticker}>
        {comm.name}
      </SelectItem>
    ))}

    <div className="px-2 py-1 text-gray-500 text-sm font-semibold">Energy</div>
    {commodities.filter(c => ['CL=F', 'BZ=F', 'NG=F'].includes(c.ticker)).map((comm) => (
      <SelectItem key={comm.ticker} value={comm.ticker}>
        {comm.name}
      </SelectItem>
    ))}

    <div className="px-2 py-1 text-gray-500 text-sm font-semibold">Grains</div>
    {commodities.filter(c => ['ZC=F', 'ZS=F', 'ZW=F'].includes(c.ticker)).map((comm) => (
      <SelectItem key={comm.ticker} value={comm.ticker}>
        {comm.name}
      </SelectItem>
    ))}

    <div className="px-2 py-1 text-gray-500 text-sm font-semibold">Softs</div>
    {commodities.filter(c => ['KC=F', 'CT=F', 'CC=F', 'SB=F', 'OJ=F'].includes(c.ticker)).map((comm) => (
      <SelectItem key={comm.ticker} value={comm.ticker}>
        {comm.name}
      </SelectItem>
    ))}

    <div className="px-2 py-1 text-gray-500 text-sm font-semibold">Livestock</div>
    {commodities.filter(c => ['HE=F', 'LE=F', 'GF=F'].includes(c.ticker)).map((comm) => (
      <SelectItem key={comm.ticker} value={comm.ticker}>
        {comm.name}
      </SelectItem>
    ))}

    <div className="px-2 py-1 text-gray-500 text-sm font-semibold">Industrial Metals</div>
    {commodities.filter(c => ['HG=F', 'ALI=F', 'NID=F', 'ZNC=F', 'HRC=F'].includes(c.ticker)).map((comm) => (
      <SelectItem key={comm.ticker} value={comm.ticker}>
        {comm.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
  );
};

export default CommoditySelector;