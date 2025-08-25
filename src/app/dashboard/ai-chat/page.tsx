'use client';
import React from 'react';
import { ArrowBigLeft, Plus } from 'lucide-react'; // Import Plus icon from lucide-react
import FarmerQueryCard from '@/components/AIChat/AIChat';
import Link from 'next/link';
import { farmingTopics } from '@/lib/chat'; // Ensure this imports correctly
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const FarmerQueries = () => {
  const router = useRouter();
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex item-center">
      <Button onClick={() => router.back()}><ArrowBigLeft /></Button>
      <h1 className=" flex-1 text-3xl text-center font-bold mb-6">Common Farmers' Queries</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href={'/dashboard/ai-chat/new'} className="border flex items-center gap-4 rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
          <Plus className="w-10 h-10 text-blue-600" />
          <h2 className="text-xl font-semibold">New Chat</h2>
        </Link>
        {farmingTopics.map((query: any) => (
          <FarmerQueryCard
            key={query.id}
            id={query.id}
            title={query.title}
            description={query.description}
            logo={query.logo} // Ensure logo is a valid React component
          />
        ))}
      </div>
    </div>
  );
};

export default FarmerQueries;
