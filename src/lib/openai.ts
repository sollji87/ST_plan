// OpenAI 연결 유틸리티

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * 환경 변수에서 OpenAI API 키 가져오기
 */
function getOpenAIKeyFromEnv(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  }
  return apiKey;
}

/**
 * OpenAI 클라이언트 초기화 (환경 변수 사용)
 */
export function initOpenAIFromEnv(): OpenAI {
  const apiKey = getOpenAIKeyFromEnv();
  return initOpenAI(apiKey);
}

/**
 * OpenAI 클라이언트 초기화
 */
export function initOpenAI(apiKey: string): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
}

/**
 * OpenAI 클라이언트 가져오기 (자동으로 환경 변수에서 초기화)
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    // 자동으로 환경 변수에서 초기화
    return initOpenAIFromEnv();
  }
  return openaiClient;
}

/**
 * ChatGPT를 사용한 텍스트 생성
 */
export async function generateText(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const client = getOpenAIClient();
  
  const response = await client.chat.completions.create({
    model: options?.model || 'gpt-4',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 1000,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * 데이터 분석을 위한 프롬프트 생성
 */
export async function analyzeData(
  data: any,
  question: string
): Promise<string> {
  const prompt = `
다음 데이터를 분석하여 질문에 답변해주세요.

데이터:
${JSON.stringify(data, null, 2)}

질문: ${question}

답변:
  `;

  return generateText(prompt, {
    model: 'gpt-4',
    temperature: 0.3,
  });
}

