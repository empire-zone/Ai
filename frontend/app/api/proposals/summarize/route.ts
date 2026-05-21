import { NextRequest, NextResponse } from 'next/server';

interface SummaryResponse {
  summary: string;
  pros: string[];
  cons: string[];
  financial_impact: string;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check which AI service is configured
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let summary: SummaryResponse;

    if (openaiKey) {
      summary = await summarizeWithOpenAI(text, openaiKey);
    } else if (geminiKey) {
      summary = await summarizeWithGemini(text, geminiKey);
    } else {
      // Mock response for demonstration when no API key is configured
      summary = getMockSummary(text);
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in summarize route:', error);
    return NextResponse.json(
      { error: 'Failed to summarize proposal' },
      { status: 500 }
    );
  }
}

async function summarizeWithOpenAI(text: string, apiKey: string): Promise<SummaryResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert DAO governance analyst. Analyze the given proposal and provide a structured JSON response with:
- summary: A concise 2-3 sentence summary of the proposal
- pros: An array of 3-5 key benefits or positive aspects
- cons: An array of 3-5 potential drawbacks or concerns
- financial_impact: A brief description of the financial implications

Respond ONLY with valid JSON, no additional text.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

async function summarizeWithGemini(text: string, apiKey: string): Promise<SummaryResponse> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Analyze this DAO proposal and provide a structured JSON response with:
- summary: A concise 2-3 sentence summary
- pros: An array of 3-5 key benefits
- cons: An array of 3-5 potential drawbacks
- financial_impact: Brief financial implications

Respond ONLY with valid JSON, no additional text.

Proposal: ${text}`
        }]
      }]
    }),
  });

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

function getMockSummary(text: string): SummaryResponse {
  // Mock response for demonstration purposes
  return {
    summary: "This proposal aims to implement a new governance mechanism that will enhance community participation and decision-making processes within the DAO.",
    pros: [
      "Increased transparency in governance decisions",
      "More inclusive voting mechanisms",
      "Better alignment with community interests",
      "Reduced centralization risks",
      "Improved proposal tracking system"
    ],
    cons: [
      "Potential for increased complexity in voting process",
      "Initial implementation costs",
      "Learning curve for community members",
      "Possible delays in decision-making",
      "Requires additional infrastructure maintenance"
    ],
    financial_impact: "Estimated implementation cost of 50,000 tokens with potential long-term savings through reduced governance overhead and improved efficiency."
  };
}
