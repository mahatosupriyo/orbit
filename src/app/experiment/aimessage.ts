"use server";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateAImessage(query: string): Promise<string> {
    if (!query.trim()) return "Let's start searching!";

    const prompt = `Generate a friendly and helpful message to show a user before displaying search results for their query: "${query}"`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // or any model you prefer
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 50,
        });

        const message = completion.choices[0]?.message?.content?.trim();
        return message || "Here are your results!";
    } catch (error) {
        console.error("AI message generation error:", error);
        return "Here are your results!";
    }
}
