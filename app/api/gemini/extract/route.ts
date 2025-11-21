import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        const prompt = `
        Analyze this academic certificate or achievement document carefully. 
        Extract the following information with high precision:

        1. **name**: The full name of the recipient/student. Ignore titles like "Mr.", "Ms." unless part of the name.
        2. **institution**: The name of the organization, university, or school issuing the certificate.
        3. **eventName**: The main title of the certificate (e.g., "Bachelor of Computer Science", "Web Development Bootcamp", "National Math Olympiad"). NOT "Certificate of Appreciation".
        4. **eventDate**: The date of issue or event date. Format strictly as YYYY-MM-DD. If only month/year is available, use YYYY-MM-01.
        5. **predicate**: The specific achievement level, grade, or rank (e.g., "Cum Laude", "First Place", "Distinction", "GPA 3.80"). If it's just a participation certificate, use "Participant".
        6. **description**: A brief summary of what the certificate is about, including skills learned or competition details. Keep it under 200 characters.

        If a field is not clearly visible, return an empty string "". Do not guess.
        `;

        const model = "gemini-2.5-pro";

        const response = await ai.models.generateContent({
            model,
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: file.type,
                                data: base64Data,
                            },
                        },
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        eventName: { type: Type.STRING },
                        institution: { type: Type.STRING },
                        eventDate: { type: Type.STRING },
                        description: { type: Type.STRING },
                        predicate: { type: Type.STRING },
                    },
                    required: ["name", "institution", "eventName", "predicate"],
                },
            },
        });

        const resultText = response.text;
        const data = resultText ? JSON.parse(resultText) : {};

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
