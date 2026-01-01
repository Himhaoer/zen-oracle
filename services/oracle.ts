import { GoogleGenAI } from "@google/genai";
import { OracleMethod, ReadingRequest, ReadingResult, UserProfile, SoulCard } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModelId = "gemini-2.5-flash"; 
const imageModelId = "imagen-4.0-generate-001";

export const generateSoulPortrait = async (profile: UserProfile): Promise<SoulCard> => {
  const genderStr = profile.gender === 'male' ? 'Male' : 'Female';
  const prompt = `
    Create a Chinese Tarot Card style illustration. 
    Subject: A ${genderStr} figure representing the essence of "${profile.name}".
    Role/Archetype: ${profile.occupation}.
    Atmosphere/Mood: ${profile.bio}.
    Style: Traditional Chinese Ink Wash Painting mixed with Mystical Tarot Art. 
    Composition: Central figure or symbol, ornate oriental border, beige or parchment background, ethereal smoke, mystical symbols.
    Quality: Masterpiece, highly detailed, 8k.
  `;

  try {
    const imageResponse = await ai.models.generateImages({
      model: imageModelId,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '3:4',
        outputMimeType: 'image/jpeg'
      }
    });

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
      const base64Image = imageResponse.generatedImages[0].image.imageBytes;
      return {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl: `data:image/jpeg;base64,${base64Image}`,
        description: profile.bio
      };
    }
    throw new Error("Failed to generate image");
  } catch (error) {
    console.error("Soul Portrait generation failed:", error);
    throw error;
  }
};

export const consultOracle = async (request: ReadingRequest): Promise<ReadingResult> => {
  let specificPrompt = "";
  const now = new Date().toLocaleString('zh-CN', { hour12: false });
  const genderInfo = request.gender ? `性别: ${request.gender === 'male' ? '乾造 (男)' : '坤造 (女)'}` : '性别: 未知';

  switch (request.method) {
    case OracleMethod.HE_LUO:
      specificPrompt = `
      方式: 河洛理数。
      ${genderInfo} (此项对大运顺逆至关重要，请严格区分)。
      用户生辰: ${request.birthDate} ${request.birthTime}。
      当前占卜时间: ${now}。
      所求之事: ${request.query}。
      请根据河洛数理推导卦象，注意阴阳顺逆，并结合流年气运进行解读。
      `;
      break;
      
    case OracleMethod.MEI_HUA:
      const n1 = (request.tapInterval1 || 0) % 8 || 8; 
      const n2 = (request.tapInterval2 || 0) % 8 || 8;
      
      specificPrompt = `
      方式: 梅花易数。
      ${genderInfo}。
      起卦机制: 用户叩击屏幕间隔取数 (心韵)。
      间隔一: ${request.tapInterval1}ms (取卦数: ${n1})。
      间隔二: ${request.tapInterval2}ms (取卦数: ${n2})。
      当前占卜时间: ${now}。
      所求之事: ${request.query}。
      请以上述卦数起卦，分析体用生克。
      `;
      break;
      
    case OracleMethod.CE_ZI:
      specificPrompt = `
      方式: 测字。
      ${genderInfo}。
      所测之字: "${request.character}"。
      当前占卜时间: ${now}。
      所求之事: ${request.query}。
      请拆解字形、字音、字义，结合触机进行推断。
      `;
      break;
  }

  // 1. Generate Text Reading
  let fullContent = "";
  let imagePrompt = "";
  let summary = "";

  try {
    const textResponse = await ai.models.generateContent({
      model: textModelId,
      contents: specificPrompt.replace('USER_QUERY_PLACEHOLDER', request.query),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8, 
      },
    });

    fullContent = textResponse.text || "云深不知处，请稍后再试。";
    
    // Extract Image Prompt
    const promptMatch = fullContent.match(/Prompt:\s*(.*?)(\n|$)/i);
    if (promptMatch && promptMatch[1]) {
      imagePrompt = promptMatch[1].trim();
      fullContent = fullContent.replace(promptMatch[0], '').trim();
    } else {
      imagePrompt = `Minimalist ink wash painting, zen atmosphere, abstract landscape, symbol of ${request.query}, high quality, artistic`;
    }

    // Extract Summary
    const lines = fullContent.split('\n').filter(l => l.trim().length > 0);
    summary = lines.find(l => l.includes('【判】'))?.replace(/\*\*|【判】|:/g, '').trim() || "玄机暗藏";

  } catch (error) {
    console.error("Text generation failed:", error);
    throw new Error("灵台蒙尘，连接中断。");
  }

  // 2. Generate Visual Portrait (Image)
  let imageUrl = undefined;
  try {
     const imageResponse = await ai.models.generateImages({
        model: imageModelId,
        prompt: imagePrompt + " , masterpiece, traditional chinese ink style, ethereal, 8k",
        config: {
          numberOfImages: 1,
          aspectRatio: '3:4', 
          outputMimeType: 'image/jpeg'
        }
     });
     
     if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const base64Image = imageResponse.generatedImages[0].image.imageBytes;
        imageUrl = `data:image/jpeg;base64,${base64Image}`;
     }
  } catch (error) {
    console.warn("Image generation failed:", error);
  }

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    method: request.method,
    query: request.query,
    content: fullContent,
    summary: summary,
    imageUrl: imageUrl
  };
};