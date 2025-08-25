'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { LucideProps } from 'lucide-react';

interface FarmerQueryCardProps {
  id: string;
  logo: React.FC<LucideProps>; // Ensure this is set to React.ElementType
  title: string;
  description: string;
}

const FarmerQueryCard: React.FC<FarmerQueryCardProps> = ({ id, logo: Logo, title, description }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/ai-chat/${id}`);
  };

  return (
    <div
      className="border rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className='text-blue-500'>
          {Logo as any}
        </div>
        <h2 className="text-xl font-semibold ml-4">{title}</h2>
      </div>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
};

export default FarmerQueryCard;
