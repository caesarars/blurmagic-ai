
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Resizes an image if it exceeds a maximum dimension to ensure API stability.
 * High-resolution images often trigger 'IMAGE_OTHER' errors in current GenAI models.
 */
async function resizeImageIfNeeded(base64Url: string, maxDimension: number = 1024): Promise<{ data: string, mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width <= maxDimension && height <= maxDimension) {
        const data = base64Url.split(',')[1] || base64Url;
        const mimeType = base64Url.match(/data:([^;]+);/)?.[1] || 'image/png';
        resolve({ data, mimeType });
        return;
      }

      if (width > height) {
        if (width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const resizedUrl = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG for smaller payload
      const data = resizedUrl.split(',')[1];
      const mimeType = 'image/jpeg';
      resolve({ data, mimeType });
    };
    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    img.src = base64Url;
  });
}

export async function aiProcessImage(base64Url: string, prompt: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const { data: base64Data, mimeType } = await resizeImageIfNeeded(base64Url, 1024);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `ACTION: ${prompt}. 
            
FORMAT: Return the modified image data as an inline image part. No text, no explanation.`,
          },
        ],
      },
      config: {
        systemInstruction: "You are a professional digital privacy assistant. You receive images and apply specific redaction or blur effects as requested. You specialize in privacy edits (faces, text, background). You MUST return only the edited image part. Do not provide any text or commentary.",
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      if (candidate.finishReason === 'IMAGE_SAFETY') {
        throw new Error("Safety Filter: The model flagged the content. Try a different image or prompt.");
      }
      throw new Error(`AI Edit Failed: ${candidate.finishReason}.`);
    }

    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function aiDetectAreas(base64Url: string, prompt: string): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const { data: base64Data, mimeType } = await resizeImageIfNeeded(base64Url, 1024);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detected_areas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER },
                    description: "Normalized coordinates [ymin, xmin, ymax, xmax] from 0 to 1000."
                  },
                  label: { type: Type.STRING }
                },
                required: ["box_2d", "label"]
              }
            }
          }
        },
        systemInstruction: "You are a specialized image analysis agent. Your task is to identify specific bounding boxes for sensitive regions in an image for compliance and censorship purposes. You must be precise and return normalized coordinates [ymin, xmin, ymax, xmax] for each area found.",
      }
    });

    const text = response.text;
    if (!text) return [];
    const json = JSON.parse(text);
    return json.detected_areas || [];
  } catch (error) {
    console.error("Area Detection Error:", error);
    throw error;
  }
}
