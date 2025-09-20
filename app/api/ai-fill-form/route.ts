import { NextResponse } from 'next/server';

// It's crucial to store your API key in environment variables, not in the code.
const GEMINI_API_KEY = 'AIzaSyBfOoeNLDfSVJ5eV1hkxqkuVWRkBnAI_eE';

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // The prompt is the same, but now it's executed securely on the server
    const prompt = `Based on the following startup name or description, provide a JSON object with the following keys. If a value is not available or not specified, leave the value as an empty string. Ensure the JSON is well-formed. The keys are: "fullName", "emailAddress", "phoneCountryCode", "localPhoneNumber", "country", "city", "startupName", "yearOfEstablishment", "numberOfEmployees", "domain", "language", "startupType", "startupStage", "revenueModel", "fundingStage", "instagramUrl", "linkedinUrl", "websiteUrl", "teamMembers": [{ "name": string, "designation": string, "linkedinUrl": string }], "supportNeeded": string[], "majorChallenges", "oneSentenceDescription", "problemBeingSolved", "futurePlans": { "goal1": string, "goal2": string, "goal3": string}}.
    Input: "${text}"`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      // Pass the API status and message back to the client
      const errorData = await res.text();
      return NextResponse.json({ error: `AI API call failed: ${res.status} - ${errorData}` }, { status: res.status });
    }

    const json = await res.json();
    const jsonText = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) {
      return NextResponse.json({ error: "AI response was invalid or empty." }, { status: 500 });
    }
    
    const parsedData = JSON.parse(jsonText);
    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error("Server-side error in AI API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}