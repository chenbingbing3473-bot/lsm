/**
 * 通义千问 VL 视觉识别服务
 * 文档：https://help.aliyun.com/zh/model-studio/developer-reference/qwen-vl-api
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const DASHSCOPE_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

/** 将本地图片转为 base64 data URI */
function imageToDataUri(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  const mime = mimeMap[ext] || 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

/** 从 VL 返回文本中提取 JSON */
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : text.trim();

  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error('无法解析 AI 返回的 JSON');
  }
}

/**
 * 调用通义千问 VL 识别菜品营养信息
 * @param {string} imagePath - 本地图片路径
 * @param {string} description - 用户文字描述（可选）
 * @returns {Promise<object>} 结构化营养数据
 */
async function analyzeFoodImage(imagePath, description = '') {
  if (!config.dashscopeApiKey) {
    throw new Error('未配置 DASHSCOPE_API_KEY，请在 server/.env 中设置');
  }

  const imageUri = imageToDataUri(imagePath);

  const prompt = `你是一位专业营养师。请分析这张食物图片${description ? `，用户补充描述：「${description}」` : ''}。

请严格只返回 JSON，不要任何多余文字，格式如下：
{
  "title": "菜名（中文）",
  "title_en": "English dish name",
  "description": "简短描述（中文）",
  "description_en": "Short description in English",
  "ingredients": [
    { "name": "食材中文名", "name_en": "Ingredient EN", "weight": "100g" }
  ],
  "kcal": 数字,
  "protein": 数字,
  "carbs": 数字,
  "fat": 数字,
  "category": "staple|protein|vegetable|combo",
  "isVegan": true或false,
  "instructions": ["步骤1中文", "步骤2中文"],
  "instructions_en": ["Step 1", "Step 2"]
}

category 规则：
- staple: 主食类（米饭、面条、面包、薯类等）
- protein: 蛋白质为主（肉、鱼、蛋、豆腐等）
- vegetable: 蔬菜沙拉类
- combo: 完整混合餐（无法单一归类时）

数值请给出合理估算整份餐食的值。`;

  const body = {
    model: config.qwenVlModel,
    input: {
      messages: [
        {
          role: 'user',
          content: [
            { image: imageUri },
            { text: prompt },
          ],
        },
      ],
    },
    parameters: {
      result_format: 'message',
    },
  };

  const response = await fetch(DASHSCOPE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.dashscopeApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok) {
    const msg = result.message || result.code || '通义千问 VL 调用失败';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }

  const content = result?.output?.choices?.[0]?.message?.content;
  let text = '';

  if (Array.isArray(content)) {
    text = content.map((c) => c.text || '').join('\n');
  } else if (typeof content === 'string') {
    text = content;
  } else {
    text = JSON.stringify(content || result);
  }

  const parsed = extractJson(text);

  return {
    title: parsed.title || '未知菜品',
    title_en: parsed.title_en || parsed.title || 'Unknown Dish',
    description: parsed.description || description || '',
    description_en: parsed.description_en || parsed.description || description || '',
    ingredientsList: (parsed.ingredients || []).map((ing) => ({
      name: ing.name_en || ing.name || '',
      name_zh: ing.name || ing.name_en || '',
      weight: ing.weight || '',
    })),
    kcal: Math.round(Number(parsed.kcal) || 0),
    protein: Math.round(Number(parsed.protein) || 0),
    carbs: Math.round(Number(parsed.carbs) || 0),
    fat: Math.round(Number(parsed.fat) || 0),
    category: ['staple', 'protein', 'vegetable', 'combo'].includes(parsed.category)
      ? parsed.category
      : 'combo',
    isVegan: Boolean(parsed.isVegan),
    instructions: parsed.instructions || [],
    instructions_zh: parsed.instructions || [],
    instructions_en: parsed.instructions_en || [],
    aiRaw: { parsed, rawText: text },
  };
}

module.exports = { analyzeFoodImage };
