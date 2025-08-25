// Make sure to include these imports:
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GetFarmerPromppt(prompt:string){

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
}