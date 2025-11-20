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

  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  });

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
            text: "Analisis gambar sertifikat atau ijazah ini. Ekstrak data berikut: Nama Penerima (recipientName), Nama Institusi/Penyelenggara (issuerName), Judul Sertifikat/Gelar (certificateTitle), Tanggal Terbit (issueDate), Nomor Identitas/NIM/NIK (recipientId), dan Info Tambahan seperti Nilai/Predikat (additionalInfo). Jika tidak terlihat, kosongkan.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipientName: { type: Type.STRING },
            issuerName: { type: Type.STRING },
            certificateTitle: { type: Type.STRING },
            issueDate: { type: Type.STRING },
            recipientId: { type: Type.STRING },
            additionalInfo: { type: Type.STRING },
          },
          required: ["recipientName", "issuerName"],
        },
      },
    });

    const text = response.text;
    if (!text) return {};

    return JSON.parse(text) as Partial<CertificateMetadata>;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Gagal mengekstrak data dari gambar sertifikat.");
  }
};
