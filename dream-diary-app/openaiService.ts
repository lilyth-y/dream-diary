const OPENAI_PROXY_URL = 'https://openai-embedding-proxy.dbwnstjr2017.workers.dev/';

export async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(OPENAI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '임베딩 서버 오류');
  }
  const data = await res.json();
  return data.embedding;
}

export async function getDreamImage(prompt: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API 키가 설정되지 않았습니다.');

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: '512x512',
      response_format: 'url',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || '이미지 생성 오류');
  }
  const data = await res.json();
  return data.data[0].url;
}

export async function analyzeDream(dreamContent: string): Promise<{ emotion: string; keywords: string[]; summary: string }> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API 키가 설정되지 않았습니다.');

  const prompt = `다음 꿈 내용을 분석해주세요:
"${dreamContent}"

다음 JSON 형식으로 응답해주세요:
{
  "emotion": "주요 감정 (예: 기쁨, 슬픔, 두려움, 평온함, 흥미, 혼란 등)",
  "keywords": ["주요 키워드1", "주요 키워드2", "주요 키워드3"],
  "summary": "꿈의 간단한 요약 (50자 이내)"
}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || '꿈 분석 오류');
  }

  const data = await res.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error('분석 결과 파싱 오류');
  }
} 