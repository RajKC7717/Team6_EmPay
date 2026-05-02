import pdf from 'pdf-parse';

interface ParsedResumeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  designation?: string;
  department?: string;
}

export const parseResume = async (fileBuffer: Buffer): Promise<ParsedResumeData> => {
  try {
    const data: any = await pdf(fileBuffer); // ✅ FIX: explicit type
    const text: string = data.text;

    const parsed: ParsedResumeData = {};

    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      parsed.email = emailMatch[0];
    }

    const phoneRegex = /(?:phone|mobile|contact|tel)[:\s]*(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/i;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      parsed.phone = phoneMatch[0].replace(/[^\d+]/g, '').substring(0, 15);
    } else {
      const simplePhoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
      const simpleMatch = text.match(simplePhoneRegex);
      if (simpleMatch) {
        parsed.phone = simpleMatch[0].replace(/[^\d+]/g, '').substring(0, 15);
      }
    }

    const nameRegex = /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/m;
    const nameMatch = text.match(nameRegex);
    if (nameMatch) {
      const fullName = nameMatch[1].trim();
      const nameParts = fullName.split(/\s+/);
      if (nameParts.length >= 2) {
        parsed.firstName = nameParts[0];
        parsed.lastName = nameParts.slice(1).join(' ');
      }
    }

    const dobRegex = /(?:date of birth|dob|born)[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i;
    const dobMatch = text.match(dobRegex);
    if (dobMatch) {
      parsed.dateOfBirth = dobMatch[1];
    }

    const addressRegex = /(?:address|location|residence)[:\s]*([\s\S]{10,150}?)(?=\n\n|email|phone|experience|education|$)/i;
    const addressMatch = text.match(addressRegex);
    if (addressMatch) {
      parsed.address = addressMatch[1].trim().replace(/\n/g, ', ');
    }

    const designationKeywords = [
      'software engineer', 'developer', 'manager', 'analyst', 'consultant',
      'designer', 'architect', 'lead', 'senior', 'junior', 'associate'
    ];

    for (const keyword of designationKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text)) {
        const match = text.match(
          new RegExp(`((?:senior|junior|lead)?\\s*${keyword}(?:\\s+\\w+)?)`, 'i')
        );
        if (match) {
          parsed.designation = match[1].trim();
          break;
        }
      }
    }

    const departmentKeywords = [
      'engineering', 'development', 'marketing', 'sales', 'hr', 'human resources',
      'finance', 'operations', 'it', 'design', 'product'
    ];

    for (const dept of departmentKeywords) {
      const regex = new RegExp(`\\b${dept}\\b`, 'i');
      if (regex.test(text)) {
        parsed.department = dept.charAt(0).toUpperCase() + dept.slice(1);
        break;
      }
    }

    const skillsSection = text.match(/skills?:?\s*([\s\S]*?)(?=experience|education|projects|$)/i);
    if (skillsSection) {
      const skillsText: string = skillsSection[1];

      parsed.skills = skillsText
        .split(/[,\n•·]/)
        .map((s: string) => s.trim())            // ✅ FIX
        .filter((s: string) => s.length > 0 && s.length < 50) // ✅ FIX
        .slice(0, 20);
    }

    const experienceSection = text.match(/(?:experience|work history|employment):?\s*([\s\S]*?)(?=education|skills|projects|$)/i);
    if (experienceSection) {
      parsed.experience = experienceSection[1].trim().substring(0, 1000);
    }

    const educationSection = text.match(/education:?\s*([\s\S]*?)(?=experience|skills|projects|$)/i);
    if (educationSection) {
      parsed.education = educationSection[1].trim().substring(0, 500);
    }

    return parsed;
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw new Error('Failed to parse resume');
  }
};
