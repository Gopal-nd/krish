// QueryDetailPage.tsx

'use client'

import React, { useState, useEffect } from 'react';

import { ArrowBigLeft, Droplet, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { farmingTopics } from '@/lib/chat';
import { useRouter } from 'next/navigation';

interface QueryDetailPageProps {
  id: string;
  title: string;
  description: string;
  logo: React.ReactNode;
}

const QueryDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { id } = params;
  const [queryDetail, setQueryDetail] = useState<QueryDetailPageProps>({
    id: '3',
    title: 'Soil Health Management',
    description: 'What strategies should be implemented for maintaining healthy soil to optimize crop yield?',
    logo: <Droplet />,
  });
  const [inputValue, setInputValue] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = farmingTopics.find((topic) => topic.id === id);
    if (query) {
      setQueryDetail(query);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const res = await fetch('/api/aichat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: queryDetail.title,
          description: queryDetail.description,
          inputValue,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'An error occurred');
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      console.error('Error generating response:', err);
      setError('An error occurred while generating the response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const { title, description, logo: Logo } = queryDetail;
const router = useRouter();
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Button className='mb-4' onClick={() => router.back()}><ArrowBigLeft /></Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="text-primary">{Logo}</div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your question..."
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Submit Query'
              )}
            </Button>
          </form>
        </CardContent>
        {(response || error) && (
          <CardFooter>
            <ScrollArea className="h-[70vh] w-full rounded-md border p-4">
              {error ? (
                <p className="text-destructive">{error}</p>
              ) : (
                <div className="whitespace-pre-wrap">
                  <div dangerouslySetInnerHTML={{ __html: response }} />
                </div>
              )}
            </ScrollArea>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default QueryDetailPage;

