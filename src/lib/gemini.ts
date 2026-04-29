import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("GROQ_API_KEY is not set. AI detection will not work.");
}

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.groq.com/openai/v1',
});

export interface DetectionResult {
  label: "REAL" | "FAKE";
  confidence: number;
  reasoning: string;
  keyIndicators: string[];
}

export async function detectFakeNews(text: string): Promise<DetectionResult> {
  if (!apiKey) {
    throw new Error("Groq API key is missing. Please configure it in the Secrets panel.");
  }

  const prompt = `
    Analyze the following news text and determine if it is likely REAL or FAKE.
    You must respond with a label of only REAL or FAKE. Do not output UNCERTAIN.
    If you are unsure, choose FAKE with a lower confidence.
    Provide your response in JSON format with the following structure:
    {
      "label": "REAL" | "FAKE",
      "confidence": number (0 to 1),
      "reasoning": "A brief explanation of why you reached this conclusion",
      "keyIndicators": ["list", "of", "red", "flags", "or", "credibility", "markers"]
    }

    News Text:
    "${text}"
  `;

  try {
    const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
    });

    const result = completion.choices?.[0]?.message?.content;
    if (!result) throw new Error("No response from Groq");

    if (typeof result === 'string') {
      return JSON.parse(result) as DetectionResult;
    }

    return result as DetectionResult;
  } catch (error) {
    console.error("Error detecting fake news:", error);
    throw error;
  }
}