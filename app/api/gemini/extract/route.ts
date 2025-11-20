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
                            text: "Analyze this certificate. Extract: name, institution (event organizer), event date (YYYY-MM-DD), achievement (predicate) and description (description of the event). Return JSON.",
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
                        achievment: { type: Type.STRING },
                        institution: { type: Type.STRING },
                        eventDate: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ["name", "institution", "achievment"],
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
