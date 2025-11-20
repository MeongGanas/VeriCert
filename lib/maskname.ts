export const maskName = (fullName: string) => {
    if (!fullName) return "Anonymous";
    const parts = fullName.split(" ");
    const maskedParts = parts.map((part) => {
        if (part.length <= 1) return part;
        return part[0] + "*".repeat(part.length - 1);
    });
    return maskedParts.join(" ");
};
