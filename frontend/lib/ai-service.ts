import { getLLMSuggestions } from '@/lib/openai';

const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Suggest a deadline for writing project report.' }
];

async function getSuggestion() {
  return await getLLMSuggestions(messages);
}
// Usage example (uncomment to use):
// getSuggestion().then(suggestion => console.log(suggestion));


export interface ContextEntry {
  id: number;
  content: string;
  user: number;
}

export interface AITaskAnalysis {
  priority: {
    score: number;
    reasoning: string;
    confidence: number;
  };
  deadline: {
    suggested: string | null;
    reasoning: string;
    confidence: number;
  };
  category: {
    suggested: string;
    reasoning: string;
    confidence: number;
  };
  enhancedDescription: {
    description: string;
    reasoning: string;
    confidence: number;
  };
  complexity: {
    score: number;
    reasoning: string;
    confidence: number;
  };
  estimatedDuration: {
    minutes: number;
    reasoning: string;
    confidence: number;
  };
}

export class AITaskService {
  private static analyzeKeywords(text: string): string[] {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'deadline', 'due'];
    const workKeywords = ['meeting', 'project', 'presentation', 'client', 'office', 'report', 'proposal'];
    const personalKeywords = ['doctor', 'family', 'grocery', 'workout', 'vacation', 'birthday', 'personal'];
    const healthKeywords = ['exercise', 'gym', 'medical', 'appointment', 'health', 'fitness', 'doctor'];
    const learningKeywords = ['study', 'course', 'learn', 'research', 'book', 'tutorial', 'training'];
    const financeKeywords = ['budget', 'money', 'bank', 'payment', 'invoice', 'tax', 'financial'];
    const homeKeywords = ['clean', 'repair', 'maintenance', 'garden', 'home', 'house', 'kitchen'];

    const found: string[] = [];
    const lowerText = text.toLowerCase();

    if (urgentKeywords.some(k => lowerText.includes(k))) found.push('urgent');
    if (workKeywords.some(k => lowerText.includes(k))) found.push('work');
    if (personalKeywords.some(k => lowerText.includes(k))) found.push('personal');
    if (healthKeywords.some(k => lowerText.includes(k))) found.push('health');
    if (learningKeywords.some(k => lowerText.includes(k))) found.push('learning');
    if (financeKeywords.some(k => lowerText.includes(k))) found.push('finance');
    if (homeKeywords.some(k => lowerText.includes(k))) found.push('home');

    return found;
  }

  static async analyzeTask(
  title: string,
  description: string = '',
  contextEntries: ContextEntry[] = []
): Promise<AITaskAnalysis> {
  const contextText = contextEntries.map((entry, i) => `Context ${i + 1}: ${entry.content}`).join('\n');

  const systemPrompt = `You are an intelligent task assistant. Given a task title, description, and user context, return a JSON object with AI analysis.`;

  const userPrompt = `
Title: ${title}
Description: ${description}
User Context:
${contextText}

Return the following JSON format:
{
  "priority": { "score": 1-5, "reasoning": "...", "confidence": 0-1 },
  "deadline": { "suggested": "ISO date string", "reasoning": "...", "confidence": 0-1 },
  "category": { "suggested": "...", "reasoning": "...", "confidence": 0-1 },
  "enhancedDescription": { "description": "...", "reasoning": "...", "confidence": 0-1 },
  "complexity": { "score": 1-10, "reasoning": "...", "confidence": 0-1 },
  "estimatedDuration": { "minutes": 0-600, "reasoning": "...", "confidence": 0-1 }
}
`;


let json: AITaskAnalysis;
const raw = await getLLMSuggestions([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
]);

try {
  json = JSON.parse(raw || '{}');
} catch (err) {
  console.error("Invalid AI JSON:", raw);
  throw new Error("AI didn't return valid JSON.");
}

return json;
}


  static async generateTaskSuggestions(contextEntries: ContextEntry[]): Promise<
    Array<{
      title: string;
      description: string;
      priority: number;
      category: string;
      reasoning: string;
    }>
  > {
    await new Promise(res => setTimeout(res, 800));
    const suggestions: Array<{
      title: string;
      description: string;
      priority: number;
      category: string;
      reasoning: string;
    }> = [];

    contextEntries.slice(0, 5).forEach(entry => {
      const keywords = this.analyzeKeywords(entry.content);
      const content = entry.content.toLowerCase();

      if (content.includes('meeting')) {
        suggestions.push({
          title: 'Prepare for upcoming meeting',
          description: `Based on context: "${entry.content.substring(0, 50)}..."`,
          priority: 4,
          category: keywords.includes('work') ? 'Work' : 'Personal',
          reasoning: 'Meeting reference detected in context'
        });
      }

      if (content.includes('appointment')) {
        suggestions.push({
          title: 'Schedule appointment',
          description: `Follow up on: "${entry.content.substring(0, 50)}..."`,
          priority: 3,
          category: keywords.includes('health') ? 'Health' : 'Personal',
          reasoning: 'Appointment mentioned in context'
        });
      }

      if (content.includes('deadline') || content.includes('due')) {
        suggestions.push({
          title: 'Work on deadline item',
          description: `Address: "${entry.content.substring(0, 50)}..."`,
          priority: 5,
          category: 'Work',
          reasoning: 'Deadline detected in context'
        });
      }

      if (content.includes('budget') || content.includes('payment')) {
        suggestions.push({
          title: 'Handle financial task',
          description: `Review: "${entry.content.substring(0, 50)}..."`,
          priority: 4,
          category: 'Finance',
          reasoning: 'Financial task detected in context'
        });
      }

      if (content.includes('learn') || content.includes('study')) {
        suggestions.push({
          title: 'Learning activity',
          description: `Study: "${entry.content.substring(0, 50)}..."`,
          priority: 3,
          category: 'Learning',
          reasoning: 'Learning opportunity detected in context'
        });
      }
    });

    return suggestions.slice(0, 3);
  }
}
