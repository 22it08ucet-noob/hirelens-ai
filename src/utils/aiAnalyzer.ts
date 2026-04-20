import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./analyzer";

// Helper to convert Blob/File to generative part
async function fileToGenerativePart(file: File): Promise<{
  inlineData: { data: string; mimeType: string };
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(",")[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type || "application/pdf",
        },
      });
    };
    reader.readAsDataURL(file);
  });
}

// Lazy initialization of Gemini API to avoid crashes if key is missing on load
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    // Try to get key from multiple possible sources
    // 1. process.env (Standard in AI Studio Build)
    // 2. import.meta.env.VITE_... (Standard in Vite/Render)
    let apiKey = "";
    
    try {
      if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
        apiKey = process.env.GEMINI_API_KEY;
      }
    } catch (e) {}

    if (!apiKey) {
      apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
    }
    
    if (!apiKey) {
      console.warn("Gemini API key is not configured. Falling back to empty string.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function analyzeResumeWithAI(source: string | File, jobDescription?: string): Promise<AnalysisResult> {
  const isFile = source instanceof File;
  const isLinkedIn = !isFile && (source.includes("linkedin.com") || (source.toLowerCase().includes("about") && source.length < 1500 && !source.includes("\n")));
  
  const prompt = `
    Analyze the following ${isFile ? "Resume/File" : "LinkedIn Bio/Profile"}.
    
    ${isFile ? "Analyze the attached file content. Please extract all the text and then perform the assessment." : `Content: """${source}"""`}

    ${jobDescription ? `Compare it against this Job Description:
    """
    ${jobDescription}
    """` : ""}
    
    Return a JSON object with:
    1. score (number 0-100)
    2. suggestions (string[]) - exactly 10 actionable improvement tips
    3. improvementIdea (string) - one deep professional insight
    4. motivationalQuote (string)
    5. interviewQuestions (string[]) - 6 predicted questions
    6. keywordsFound (string[])
    7. keywordsMissing (string[])
    8. linkedInTips (string[]) - 6 specific profile hacks
    9. languageDetected (string)
    ${jobDescription ? "10. jdMatchScore (number 0-100)" : ""}

    IMPORTANT: Detect the language (Tamil, Hindi, etc) and respond appropriately. Use English for keys.
  `;

  try {
    const ai = getAI();
    
    const props: any = {
      score: { type: Type.NUMBER },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      improvementIdea: { type: Type.STRING },
      motivationalQuote: { type: Type.STRING },
      interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      keywordsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
      keywordsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
      linkedInTips: { type: Type.ARRAY, items: { type: Type.STRING } },
      languageDetected: { type: Type.STRING }
    };

    if (jobDescription) {
      props.jdMatchScore = { type: Type.NUMBER };
    }

    let contents: any;
    if (isFile) {
      const filePart = await fileToGenerativePart(source as File);
      contents = { parts: [{ text: prompt }, filePart] };
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: props,
          required: ["score", "suggestions", "improvementIdea", "motivationalQuote", "interviewQuestions", "keywordsFound", "keywordsMissing", "linkedInTips", "languageDetected"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    const result = JSON.parse(resultText);
    return {
      score: Math.min(Math.max(result.score || 0, 0), 100),
      suggestions: result.suggestions || [],
      improvementIdea: result.improvementIdea,
      motivationalQuote: result.motivationalQuote,
      interviewQuestions: result.interviewQuestions,
      keywordsFound: result.keywordsFound,
      keywordsMissing: result.keywordsMissing,
      jdMatchScore: result.jdMatchScore,
      linkedInTips: result.linkedInTips,
      languageDetected: result.languageDetected
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      score: 0,
      suggestions: [`Technical Error: ${error instanceof Error ? error.message : "Service Unavailable"}`],
      improvementIdea: "Please ensure your Gemini API key is correctly set as VITE_GEMINI_API_KEY in Render settings.",
      motivationalQuote: "The greatest failure is fearing to try again.",
      interviewQuestions: [],
      keywordsFound: [],
      keywordsMissing: [],
      jdMatchScore: 0,
      linkedInTips: [],
      languageDetected: "N/A"
    };
  }
}
