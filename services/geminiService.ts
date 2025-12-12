import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VisionResult, AudioAnalysisResult, VideoPlanResult, MeditationResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Identity: You are ROOTS, a specialized cultural and spiritual education co-pilot. You function as a Comparative Mythologist and Ethical Storyteller.

Mission: Your sole purpose is to provide neutral, authoritative, and age-appropriate explanations of global spiritual, ethical, and cultural concepts.

Tone: Calm, poetic, clear, and universally respectful. Avoid modern jargon unless translating a concept. Solarpunk Authority.

The Neutrality Mandate:
- Do Not Preach: Never declare one tradition, belief, or deity as superior, true, or definitive.
- Cite Context: Use phrases like "In the Hindu tradition...", "Many followers of Islam believe...", etc.
- Bias-Free: Do not express personal opinions.

Visual Language: Use specific emojis sparingly and intentionally (✨, 🌿, 📜, 🕊️) to denote wisdom, nature, and history.
`;

// Helper for audio decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<VisionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: "Identify this religious object, ritual, or symbol. Follow the Neutrality Mandate. Return JSON." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            explanation: { type: Type.STRING },
            symbolism: { type: Type.STRING },
            history: { type: Type.STRING }
          },
          required: ["title", "explanation", "symbolism", "history"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as VisionResult;
  } catch (error) {
    console.error("Vision Analysis Error:", error);
    throw error;
  }
};

export const analyzeAudio = async (base64Audio: string, mimeType: string): Promise<AudioAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType: mimeType } },
          { text: "Identify this chant, mantra, or prayer. Return JSON with title, meaning, and origin." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                meaning: { type: Type.STRING },
                origin: { type: Type.STRING }
            },
            required: ["title", "meaning", "origin"]
        }
      }
    });
    const text = response.text;
    if(!text) throw new Error("No response");
    return JSON.parse(text) as AudioAnalysisResult;
  } catch (error) {
    console.error("Audio Analysis Error:", error);
    return {
        title: "Signal Faint 📡",
        meaning: "The frequencies were a bit low. Please try closer to the source.",
        origin: "Unknown Source"
    };
  }
};

export const sendChatMessage = async (message: string, history: {role: string, parts: {text: string}[]}[] = []): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      history: history
    });
    
    const response = await chat.sendMessage({ message });
    return response.text || "I am meditating on that thought... please ask again.";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

export const generateKidsStory = async (topic: string): Promise<{ story: string, prompt: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Write a short fable about "${topic}". Structure: Engaging opening, middle challenge, resolution, moral. Keep it under 150 words. Provide an image generation prompt. Return JSON.`,
      config: {
        systemInstruction: "You are a cosmic storyteller for the Creators Atelier. Use wonder and magic.",
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["story", "imagePrompt"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No story generated");
    const json = JSON.parse(text);
    return { story: json.story, prompt: json.imagePrompt };
  } catch (error) {
    console.error("Story Gen Error:", error);
    throw error;
  }
};

export const generateStoryImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt + " style: soft lighting, storybook illustration, dreamlike, high quality" }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Gen Error:", error);
    return "https://picsum.photos/500/500?blur=4"; 
  }
};

export const generateVideoPlan = async (topic: string, image?: string): Promise<VideoPlanResult> => {
  try {
    const parts: any[] = [{ text: `Create a cinematic short video plan about: "${topic}". 
    The vibe is "Ancient Wisdom x Future Tech". 
    Include gold highlights, soft particles, and deep meaning.
    
    Return JSON with:
    1. title (authoritative)
    2. script (punchy narration)
    3. scenes (visual & audio details)
    4. voiceoverDialogues (strings)
    5. visualStyle (aesthetic description)
    ` }];

    if (image) {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      parts.unshift({ inlineData: { data: base64Data, mimeType } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: "You are a visionary director for the Creators Atelier.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            script: { type: Type.STRING },
            visualStyle: { type: Type.STRING },
            voiceoverDialogues: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  visual: { type: Type.STRING },
                  audio: { type: Type.STRING }
                },
                required: ["sceneNumber", "visual", "audio"]
              }
            }
          },
          required: ["title", "script", "visualStyle", "scenes", "voiceoverDialogues"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No video plan generated");
    return JSON.parse(text) as VideoPlanResult;
  } catch (error) {
    console.error("Video Plan Error:", error);
    throw error;
  }
};

export const generateMeditation = async (): Promise<MeditationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { text: "Generate a 2-3 minute guided meditation session. 1. Intro grounding (breathwork). 2. A visualization (cosmic, peaceful, glowing). 3. A reflection takeaway (1-2 lines). Use a calm, spiritual tone blended with futuristic insights." },
      config: {
        systemInstruction: "You are a calm, authoritative meditation guide. Focus on breath, light, and inner spaciousness.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            intro: { type: Type.STRING, description: "Breathing and grounding instructions" },
            visualization: { type: Type.STRING, description: "The main visualization journey" },
            reflection: { type: Type.STRING, description: "A final thought or mantra" }
          },
          required: ["title", "intro", "visualization", "reflection"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No meditation generated");
    return JSON.parse(text) as MeditationResult;
  } catch (error) {
    console.error("Meditation Gen Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<void> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Using Fenrir for a deeper, more authoritative tone
            },
        },
      },
    });

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNode);
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};