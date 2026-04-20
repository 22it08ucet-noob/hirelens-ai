export interface AnalysisResult {
  score: number;
  suggestions: string[];
  improvementIdea?: string;
  motivationalQuote?: string;
  jdMatchScore?: number;
  interviewQuestions?: string[];
  keywordsFound?: string[];
  keywordsMissing?: string[];
  linkedInTips?: string[];
  languageDetected?: string;
}

export function analyzeResume(text: string): AnalysisResult {
  let score = 0;

  const skills = ["javascript", "python", "react", "node", "java", "typescript", "tailwind", "next.js", "docker", "aws"];
  let skillScore = 0;

  skills.forEach(skill => {
    if (text.toLowerCase().includes(skill)) {
      skillScore += 8;
    }
  });

  // Sections
  let structureScore = 0;
  const sections = ["Education", "Projects", "Skills", "Experience", "Summary", "Contact"];
  sections.forEach(section => {
    if (text.toLowerCase().includes(section.toLowerCase())) {
      structureScore += 5;
    }
  });

  // Length check
  let lengthScore = text.length > 500 ? 15 : 5;

  score = skillScore + structureScore + lengthScore;

  let suggestions: string[] = [];
  if (!text.toLowerCase().includes("projects")) suggestions.push("Add a 'Projects' section to showcase your work.");
  if (!text.toLowerCase().includes("skills")) suggestions.push("Add a 'Skills' section with relevant technologies.");
  if (!text.toLowerCase().includes("experience")) suggestions.push("Include a professional 'Experience' section.");
  if (text.length < 500) suggestions.push("Increase the detail in your resume content for better analysis.");
  if (skillScore < 10) suggestions.push("Include more specific technical skills and keywords.");

  return {
    score: Math.min(score, 100),
    suggestions
  };
}
