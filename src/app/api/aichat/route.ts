// /app/api/generate-response/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { title, description, inputValue } = await req.json();
console.log(title, description, inputValue)
  if (!title || !description ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `${title}:${description} ${inputValue ? ` and ${inputValue}.` : ''} in simple language.`;
    console.log(prompt);
    const result = await model.generateContentStream(prompt);

    const responseChunks: string[] = [];
    for await (const chunk of result.stream) {
      const chunkText = await chunk.text();
      console.log(chunkText);
      responseChunks.push(chunkText);
    }

    // Join all chunks to form the complete response
    const fullResponse = responseChunks.join('');
    return NextResponse.json({ response: fullResponse });
  } catch (err) {
    console.error('Error generating response:', err);
    return NextResponse.json({ error: 'An error occurred while generating the response.' }, { status: 500 });
  }
}
