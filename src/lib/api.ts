/**
 * API 客户端 — 对接 Lean-SpinMeal 后端
 */
import type { Recipe } from '@/src/constants';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiUser {
  id: string;
  phone: string;
  name: string;
  avatar: string;
  height?: number;
  weight?: number;
  targetWeight?: number;
  streak: number;
  wallet: number;
}

export interface ApiOrder {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  type: string;
  chefName?: string;
  tags?: string[];
}

export interface ApiChef {
  id: string;
  name: string;
  name_zh?: string;
  avatar: string;
  distance: string;
  distance_zh?: string;
  rating: number;
  specialty: string;
  specialty_zh?: string;
  responseTime: string;
  responseTime_zh?: string;
}

export interface SpinResult {
  slots: Array<{ slot: string; label: string; recipe: Recipe | null }>;
  slotIndices: number[];
  combined: { kcal: number; protein: number; carbs: number; fat: number };
  combo: Recipe & { title_zh?: string };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const TOKEN_KEY = 'kinetic_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`服务器无响应 (${res.status})，请确认后端已启动`);
  }

  if (res.status === 401) {
    setToken(null);
    throw new Error('登录已过期，请重新登录后再发布');
  }

  if (!res.ok || !json.success) {
    throw new Error(json.message || `请求失败 (${res.status})`);
  }

  return json.data;
}

// ---------- Auth ----------
export async function sendCode(phone: string) {
  return request<{ expiresIn: number; devCode?: string }>('/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function loginByCode(phone: string, code: string) {
  return request<{ token: string; user: ApiUser }>('/auth/login-by-code', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}

export async function login(phone: string, password: string) {
  return request<{ token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

// ---------- User ----------
export async function fetchProfile() {
  return request<ApiUser>('/users/profile');
}

export async function updateProfile(data: { name?: string; avatar?: string }) {
  return request<ApiUser>('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateBody(data: {
  height?: number;
  weight?: number;
  targetWeight?: number;
  note?: string;
}) {
  return request<ApiUser>('/users/body', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function fetchWeightRecords(page = 1) {
  return request<{ records: Array<{ weight: number; recordedAt: string; note?: string }> }>(
    `/users/weight-records?page=${page}&limit=30`
  );
}

// ---------- Recipes & Community ----------
export async function fetchCommunityRecipes(page = 1, limit = 20) {
  return request<{
    recipes: Recipe[];
    pagination: { page: number; total: number; hasMore: boolean };
  }>(`/community/recipes?page=${page}&limit=${limit}`);
}

export async function postRecipe(data: {
  title: string;
  description?: string;
  image?: File | null;
  kcal?: number;
  protein?: number;
}) {
  const form = new FormData();
  form.append('title', data.title);
  form.append('description', data.description || '');
  form.append('kcal', String(data.kcal ?? 450));
  form.append('protein', String(data.protein ?? 25));
  if (data.image) form.append('image', data.image);
  return request<Recipe>('/recipes/post', { method: 'POST', body: form });
}

export async function uploadRecipe(image: File, description = '', title = '') {
  const form = new FormData();
  form.append('image', image);
  form.append('description', description);
  if (title) form.append('title', title);
  return request<Recipe>('/recipes', { method: 'POST', body: form });
}

export async function createRecipeManual(data: Partial<Recipe> & { title: string }) {
  return request<Recipe>('/recipes/manual', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function toggleLike(recipeId: string) {
  return request<Recipe>(`/recipes/${recipeId}/like`, { method: 'POST' });
}

export async function addComment(recipeId: string, text: string) {
  return request<Recipe>(`/recipes/${recipeId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text, text_zh: text }),
  });
}

// ---------- Spin ----------
export async function fetchSpin(diet: 'regular' | 'vegan' = 'regular') {
  const q = diet === 'vegan' ? '?diet=vegan' : '';
  return request<SpinResult>(`/spin${q}`);
}

// ---------- Chefs & Orders ----------
export async function fetchChefs() {
  return request<ApiChef[]>('/chefs');
}

export async function registerChef(data: { name: string; specialty: string }) {
  return request<ApiChef>('/chefs/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createOrder(data: {
  chefId?: string;
  title?: string;
  description?: string;
  price?: number;
  type?: string;
  dietaryPreferences?: string;
  allergies?: string;
  notes?: string;
  tags?: string[];
}) {
  return request<ApiOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchMyOrders(status?: string) {
  const q = status ? `?status=${status}` : '';
  return request<ApiOrder[]>(`/orders/mine${q}`);
}

export async function fetchMarketOrders() {
  return request<ApiOrder[]>('/orders/market');
}

export async function acceptOrder(orderId: string) {
  return request<ApiOrder>(`/orders/${orderId}/accept`, { method: 'POST' });
}

// ---------- Feedback ----------
export async function submitFeedback(category: string, message: string) {
  return request<null>('/community/feedback', {
    method: 'POST',
    body: JSON.stringify({ category, message }),
  });
}

/** 将 API 用户映射为前端 profile 结构 */
export function mapApiUser(u: ApiUser) {
  return {
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    phone: u.phone,
    height: u.height,
    weight: u.weight,
    targetWeight: u.targetWeight,
    streak: u.streak,
    wallet: u.wallet,
  };
}

/** 将 API 厨师映射为前端 MOCK_CHEFS 结构 */
export function mapApiChef(c: ApiChef) {
  return {
    id: c.id,
    name: c.name,
    name_zh: c.name_zh,
    avatar: c.avatar,
    distance: c.distance,
    distance_zh: c.distance_zh,
    rating: c.rating,
    specialty: c.specialty,
    specialty_zh: c.specialty_zh,
    responseTime: c.responseTime,
    responseTime_zh: c.responseTime_zh,
  };
}

/** 将 API 订单映射为前端 MOCK_REQUESTS 结构 */
export function mapApiOrder(o: ApiOrder) {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    price: o.price,
    tags: o.tags || [],
  };
}
