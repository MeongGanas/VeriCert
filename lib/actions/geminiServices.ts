import { GoogleGenAI, Type } from "@google/genai";
import { CertificateMetadata } from "../types";

export const extractCertificateDetails = async (
    imageFile: File
): Promise<Partial<CertificateMetadata>> => {
    const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Content = result.split(",")[1];
            resolve(base64Content);
        };
        reader.onerror = (error) => reject(error);
    });

    const ai = new GoogleGenAI({});

    const model = "gemini-2.5-flash";

    try {
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: imageFile.type,
                            data: base64Data,
                        },
                    },
                    {
                        text: "Analyze this certificate image. Extract the student name, institution/university name, degree or course title, and date of graduation/issue. If a field is not clearly visible, exclude it.",
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        studentName: { type: Type.STRING },
                        institution: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        graduationDate: { type: Type.STRING },
                    },
                    required: ["studentName", "institution"],
                },
            },
        });

        const text = response.text;
        if (!text) return {};

        return JSON.parse(text) as Partial<CertificateMetadata>;
    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        throw new Error("Failed to extract data from certificate image.");
    }
};
