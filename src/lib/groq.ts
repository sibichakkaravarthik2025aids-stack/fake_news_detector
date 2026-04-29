import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

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

export async function verifyFakeNews(text: string, searchContext: string[] = []): Promise<DetectionResult> {
  if (!apiKey) {
    throw new Error("Groq API key is missing. Please configure it in the Secrets panel.");
  }

  const contextText = searchContext.length
    ? `Use the following search results to verify the news content:\n${searchContext.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n\n`
    : '';

  const prompt = `
    Analyze the following news text and determine if it is likely REAL or FAKE.
    Use any real-time search context provided to verify factual claims.
    You must respond with a label of only REAL or FAKE. Do not output UNCERTAIN.
    If you are unsure, choose FAKE with a lower confidence.
    Provide your response in JSON format with the following structure:
    {
      "label": "REAL" | "FAKE",
      "confidence": number (0 to 1),
      "reasoning": "A brief explanation of why you reached this conclusion",
      "keyIndicators": ["list", "of", "red", "flags", "or", "credibility", "markers"]
    }

    ${contextText}
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

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("No response from Groq");

    return JSON.parse(resultText) as DetectionResult;
  } catch (error) {
    console.error("Error detecting fake news:", error);
    throw error;
  }
}

export const detectFakeNews = verifyFakeNews;
