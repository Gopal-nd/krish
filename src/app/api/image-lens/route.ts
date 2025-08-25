// // app/api/image-lens/route.js
// import { NextResponse } from 'next/server';
// import { writeFile, mkdir } from 'fs/promises';
// import { join } from 'path';

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('image');
//     const text = formData.get('text');

//     if (!file) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }

//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Ensure the public directory exists
//     const publicDir = join(process.cwd(), 'public');
//     try {
//       await mkdir(publicDir, { recursive: true });
//     } catch (err) {
//       if (err.code !== 'EEXIST') {
//         console.error('Error creating public directory:', err);
//         return NextResponse.json({ error: 'Error creating upload directory' }, { status: 500 });
//       }
//     }

//     // Save the file to the public directory
//     const path = join(publicDir, file.name);
//     await writeFile(path, buffer);

//     console.log('Received text:', text);
//     console.log('Received image file:', file.name);
//     console.log('File saved at:', path);

//     return NextResponse.json({ message: 'File uploaded successfully' }, { status: 200 });
//   } catch (error) {
//     console.error('Error handling upload:', error);
//     return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
//   }
// }



// app/api/image-lens/route.js

import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function fileToGenerativePart(buffer:any, mimeType:any) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function POST(request:any) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const text = formData.get('text') || "Describe this image in detail.";

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log("file is type", file.type);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);


    // Process with Gemini AI
    const imagePart = fileToGenerativePart(buffer, file.type);
    const result = await model.generateContent([text, imagePart]);
    const aiResponse = result.response.text();

    console.log('AI Response:', aiResponse);



    if (!aiResponse) {
      console.log('Error processing file: no aiResponse');
      return NextResponse.json({ error: 'Error processing file' }, { status: 300 });
    }
    return NextResponse.json({ 
      message: 'File uploaded and processed successfully',
      aiResponse: aiResponse
    }, { status: 200 });

  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
}