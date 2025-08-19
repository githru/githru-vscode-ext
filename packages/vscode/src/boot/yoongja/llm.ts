let OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
let OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
let OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export function setApiKey(key: string) { OPENAI_API_KEY = key; }
export function setBaseUrl(url: string) { OPENAI_BASE_URL = url; }
export function setModel(model: string) { OPENAI_MODEL = model; }

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string; };

interface OpenAIChatResponse {
    choices?: { message?: { content?: string; }; }[];
}

export async function ask(
    prompt: string,
    opts?: {
        messages?: ChatMessage[];
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }
): Promise<string> {
    const apiKey = OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";
    if (!apiKey) throw new Error("OPENAI_API_KEY가 비어있음");

    const messages: ChatMessage[] =
        opts?.messages ?? [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
        ];

    const body = {
        model: opts?.model ?? OPENAI_MODEL,
        messages,
        temperature: opts?.temperature ?? 0.7,
        max_tokens: opts?.maxTokens ?? 32,
    };

    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`OpenAI API ${res.status}: ${text}`);
    }

    const json = (await res.json()) as OpenAIChatResponse;
    return json.choices?.[0]?.message?.content ?? "";
}