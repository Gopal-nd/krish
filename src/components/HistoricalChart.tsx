import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GraphPoint } from '@/types/types';
import { Card, CardContent } from './ui/card';

interface HistoricalChartProps {
  graph: GraphPoint[];
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ graph }) => {
  console.log(graph);
  
  if (!graph || graph.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-600">No historical data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = graph.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString(),
  }));

  // Calculate price range for better Y-axis formatting
  const prices = data.map(d => d.price).filter(p => p > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#4b5563"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#4b5563"
              tick={{ fontSize: 12 }}
              domain={[minPrice * 0.95, maxPrice * 1.05]}
              tickFormatter={(value) => {
                const currency = data[0]?.currency || 'USD';
                const symbol = currency === 'INR' ? '₹' : '$';
                return `${symbol}${value.toFixed(2)}`;
              }}
            />
            <Tooltip 
              formatter={(value: number) => {
                const currency = data[0]?.currency || 'USD';
                const symbol = currency === 'INR' ? '₹' : '$';
                return [`${symbol}${value.toFixed(2)}`, 'Price'];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              activeDot={{ r: 6, fill: '#3b82f6' }}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default HistoricalChart;