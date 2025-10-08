export async function geminiGenerate(prompt: string, model: string = "gemini-2.5-flash"): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini API key");

    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// For text generation
export function geminiText(prompt: string) {
    return geminiGenerate(prompt, "gemini-2.5-flash");
}

// For code generation (same endpoint, just adjust prompt)
export function geminiCode(prompt: string, language: string) {
    return geminiGenerate(
        `Write ONLY ${language} code for the following request. Do not include other languages. Request: ${prompt}`,
        "gemini-2.5-flash"
    );
}


