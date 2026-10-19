/**
 * Gemini AI Judge Service
 * 
 * Automatically evaluates student analytical responses on a 0-6 score scale
 * using Google's Gemini models via the Generative Language REST API.
 */

const LOCAL_STORAGE_KEY = 'gemini_api_key';

/**
 * Retrieve the active Gemini API key from environment variables or localStorage
 */
export function getGeminiApiKey() {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 5) {
    return envKey.trim();
  }
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('VITE_GEMINI_API_KEY');
  return stored ? stored.trim() : '';
}

/**
 * Persist the Gemini API key into localStorage
 */
export function saveGeminiApiKey(key) {
  if (key && typeof key === 'string') {
    localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

/**
 * Check whether a valid Gemini API key is configured
 */
export function hasGeminiApiKey() {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 10);
}

/**
 * Candidate Gemini models to query in preference order
 */
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Evaluate student answer against an analytical question and rubric
 * 
 * @param {Object} params
 * @param {number} params.expNumber - Experiment index (1-15)
 * @param {string} params.question - The analytical question prompt
 * @param {string} params.context - Context / theoretical background
 * @param {string} params.rubric - Evaluation criteria (0-6 marks)
 * @param {string} params.studentAnswer - The text response submitted by the student
 * @param {string} [params.customApiKey] - Optional override API key
 * @returns {Promise<{success: boolean, score: number, feedback: string, strengths: string[], improvements: string[], error?: string}>}
 */
export async function evaluateAnalyticalAnswer({
  expNumber,
  question,
  context = '',
  rubric = '',
  studentAnswer,
  customApiKey = null
}) {
  const apiKey = (customApiKey || getGeminiApiKey())?.trim();

  if (!apiKey) {
    return {
      success: false,
      score: 0,
      feedback: 'Gemini API key is not configured. Please supply your Gemini API key in .env (VITE_GEMINI_API_KEY) or enter it in the prompt.',
      strengths: [],
      improvements: ['Configure Gemini API Key to enable automated academic grading.'],
      error: 'NO_API_KEY'
    };
  }

  const cleanAnswer = (studentAnswer || '').trim();
  if (cleanAnswer.length < 15) {
    return {
      success: true,
      score: 0,
      feedback: 'The submitted response is too brief to demonstrate conceptual understanding. Please provide a detailed analytical explanation with technical justification.',
      strengths: [],
      improvements: [
        'Formulate complete technical arguments addressing the question prompt.',
        'Include theoretical principles, algorithms, and evaluation metrics relevant to the experiment.'
      ]
    };
  }

  const evaluationPrompt = `
You are a senior university professor and accredited evaluator for an advanced course in "Information Retrieval and Knowledge Graphs" (KIRA Virtual Laboratory).

TASK:
Evaluate the following student's analytical response for Experiment ${expNumber}.
You must assign an integer score strictly from 0 to 6 points (0 = completely incorrect or irrelevant, 6 = exemplary, rigorous, publication-grade academic analysis).

QUESTION PROMPT:
${question}

THEORETICAL CONTEXT & GUIDELINES:
${context}

SCORING CRITERIA / RUBRIC (MAX 6 POINTS):
${rubric}

STUDENT SUBMITTED ANSWER:
"""
${cleanAnswer}
"""

EVALUATION INSTRUCTIONS:
1. Score strictly on a scale from 0 to 6 points (integer only: 0, 1, 2, 3, 4, 5, or 6).
2. Write constructive, academic feedback (2-4 sentences) addressing the accuracy, completeness, and rigor of their response.
3. List 1-3 specific strengths in their answer.
4. List 1-3 constructive areas for improvement or omitted concepts.
5. You MUST return ONLY valid JSON matching the specified schema.
`.trim();

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const bodyPayload = {
        contents: [
          {
            parts: [{ text: evaluationPrompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              score: {
                type: 'INTEGER',
                description: 'Integer score strictly between 0 and 6 points based on the rubric.'
              },
              feedback: {
                type: 'STRING',
                description: 'Constructive pedagogical feedback explaining the assigned score.'
              },
              strengths: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'List of specific technical strengths observed in the response.'
              },
              improvements: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'List of specific concepts that can be deepened or improved.'
              }
            },
            required: ['score', 'feedback']
          },
          temperature: 0.2
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`Gemini API error [${model}] status ${response.status}: ${errorText}`);
        continue; // Try next fallback model
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        lastError = new Error(`Empty response from Gemini API model ${model}`);
        continue;
      }

      // Parse JSON from model output
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // Fallback: extract JSON block via regex if model wrapped in markdown
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error('Failed to parse JSON response from Gemini');
        }
      }

      let numericScore = Number(parsed.score);
      if (isNaN(numericScore)) numericScore = 3;
      // Clamp strictly between 0 and 6
      numericScore = Math.max(0, Math.min(6, Math.round(numericScore)));

      return {
        success: true,
        score: numericScore,
        feedback: parsed.feedback || 'Response evaluated based on conceptual accuracy and academic rigor.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Valid technical discussion provided.'],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Deepen theoretical derivations and metrics.'],
        modelUsed: model
      };
    } catch (err) {
      lastError = err;
    }
  }

  // If all models failed or encountered a network error
  return {
    success: false,
    score: 0,
    feedback: `Evaluation failed: ${lastError?.message || 'Unable to connect to Gemini API. Please check your API key and network connection.'}`,
    strengths: [],
    improvements: ['Verify that your Gemini API Key is active and has available quota.'],
    error: lastError?.message || 'API_FAILED'
  };
}
