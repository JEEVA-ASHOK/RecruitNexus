const API_BASE_URL = 'http://localhost:5000/api';

function getHeaders(isMultipart = false): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  isMultipart = false
): TaskResult<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: getHeaders(isMultipart),
  };
  
  if (body) {
    options.body = isMultipart ? body : JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return { data, error: null };
  } catch (error: any) {
    return { data: null as any, error: error.message || 'Network error' };
  }
}

type TaskResult<T> = Promise<{
  data: T;
  error: string | null;
}>;

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || !targetLanguage || targetLanguage === 'English') return text;
  
  // 1. Try backend Gemini API translation first
  const { data, error } = await apiRequest('/ai/translate', 'POST', { text, targetLanguage });
  if (!error && data && data.translatedText && !data.translatedText.startsWith('[Mock Translation')) {
    return data.translatedText;
  }
  
  // 2. Fallback to free Google Translate API if backend is in Mock/Demo mode or offline
  try {
    const langCodes: Record<string, string> = {
      'Tamil': 'ta',
      'Hindi': 'hi',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Telugu': 'te',
      'Malayalam': 'ml',
      'Kannada': 'kn',
      'English': 'en'
    };
    const tl = langCodes[targetLanguage] || 'en';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json && json[0]) {
        return json[0].map((part: any) => part[0] || '').join('');
      }
    }
  } catch (e) {
    console.error('Translation fallback failed:', e);
  }
  
  return text;
}
