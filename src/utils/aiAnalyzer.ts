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
let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    // Try to get key from multiple possible sources (Vite prefix or direct)
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || 
                   (import.meta as any).env?.GEMINI_API_KEY ||
                   (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "");
    
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment.");
    }
    genAIInstance = new GoogleGenAI(apiKey);
  }
  return genAIInstance;
}

export async function analyzeResumeWithAI(source: string | File, jobDescription?: string): Promise<AnalysisResult> {
  const isFile = source instanceof File;
  const isLinkedIn = !isFile && (source.includes("linkedin.com") || (source.toLowerCase().includes("about") && source.length < 1500 && !source.includes("\n")));
  
  const prompt = `
    Analyze the following ${isFile ? "Resume/File" : "LinkedIn Bio/Profile"}.
    
    ${isFile ? "I have attached the file. Please extract all the text and then perform the analysis." : `Content: """${source}"""`}

    ${jobDescription ? `Compare it against this Job Description:
    """
    ${jobDescription}
    """` : ""}
    
    Provide:
    1. score (number 0-100)
    2. suggestions (string[]) - 10-12 actionable tips
    3. improvementIdea (string) - one major pro insight
    4. motivationalQuote (string)
    5. interviewQuestions (string[]) - 5-8 predicted questions
    6. keywordsFound (string[])
    7. keywordsMissing (string[])
    8. linkedInTips (string[]) - 6-8 specific LinkedIn hacks
    9. languageDetected (string)
    ${jobDescription ? "10. jdMatchScore (number 0-100)" : ""}

    IMPORTANT: Detect the language (English, Tamil, Hindi etc) and return it in languageDetected field.
  `;

  try {
    const ai = getGenAI();
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

    let contentParts: any[];
    if (isFile) {
      const filePart = await fileToGenerativePart(source as File);
      contentParts = [
        { text: prompt },
        filePart
      ];
    } else {
      contentParts = [{ text: prompt }];
    }

    const response = await (ai as any).getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent({
      contents: [{ role: "user", parts: contentParts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: props,
          required: ["score", "suggestions", "improvementIdea", "motivationalQuote", "interviewQuestions", "keywordsFound", "keywordsMissing", "linkedInTips", "languageDetected"]
        }
      }
    });

    const resultText = response.response.text();
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
      suggestions: ["AI Scan is currently unavailable. Please check your network."],
      improvementIdea: "Try refreshing the tool or checking your file format.",
      motivationalQuote: "Keep moving forward.",
      interviewQuestions: [],
      keywordsFound: [],
      keywordsMissing: [],
      jdMatchScore: 0,
      linkedInTips: [],
      languageDetected: "N/A"
    };
  }
}
