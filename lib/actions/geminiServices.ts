import { CertificateMetadata } from "@/lib/types";

const extractCertificateDetailsAPI = async (
    file: File
): Promise<Partial<CertificateMetadata>> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/gemini/extract", {
        method: "POST",
        body: formData,
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
        throw new Error(json.error || "AI Extraction Failed");
    }

    return json.data;
};
export default extractCertificateDetailsAPI;
