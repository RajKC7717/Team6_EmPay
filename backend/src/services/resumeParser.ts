import pdf from 'pdf-parse';

interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string;
  education?: string;
}

export const parseResume = async (fileBuffer: Buffer): Promise<ParsedResumeData> => {
  try {
    const data = await pdf(fileBuffer);
    const text = data.text;
    
    const parsed: ParsedResumeData = {};
    
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      parsed.email = emailMatch[0];
    }
    
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      parsed.phone = phoneMatch[0].replace(/\D/g, '');
    }
    
    const nameRegex = /^([A-Z][a-z]+\s[A-Z][a-z]+)/m;
    const nameMatch = text.match(nameRegex);
    if (nameMatch) {
      parsed.name = nameMatch[1];
    }
    
    const skillsSection = text.match(/skills?:?\s*([\s\S]*?)(?=experience|education|$)/i);
    if (skillsSection) {
      const skillsText = skillsSection[1];
      parsed.skills = skillsText
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 50);
    }
    
    const experienceSection = text.match(/experience:?\s*([\s\S]*?)(?=education|skills|$)/i);
    if (experienceSection) {
      parsed.experience = experienceSection[1].trim().substring(0, 500);
    }
    
    const educationSection = text.match(/education:?\s*([\s\S]*?)(?=experience|skills|$)/i);
    if (educationSection) {
      parsed.education = educationSection[1].trim().substring(0, 500);
    }
    
    return parsed;
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw new Error('Failed to parse resume');
  }
};
