
import { GoogleGenAI } from "@google/genai";
import { CyclePhase } from "../types";
import { getLogForDate, getLocalDateString } from "./storageService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Scientifically grounded fallback insights
const FALLBACK_INSIGHTS: Record<CyclePhase, string[]> = {
  [CyclePhase.MENSTRUAL]: [
    "Estrogen and progesterone are at their lowest; rest is scientifically beneficial.",
    "Inflammation markers may be higher; gentle movement can help circulation.",
    "Iron levels drop with blood loss; consider iron-rich foods like spinach.",
    "Uterine contractions cause cramps; magnesium may help muscle relaxation."
  ],
  [CyclePhase.FOLLICULAR]: [
    "Estrogen is rising, boosting serotonin and energy levels.",
    "Insulin sensitivity improves now; great time for complex carbs.",
    "Collagen production increases with estrogen; your skin may glow.",
    "Rising hormones improve cognitive function and verbal skills."
  ],
  [CyclePhase.OVULATION]: [
    "Peak estrogen triggers the LH surge; energy and libido are highest.",
    "Testosterone spikes slightly, increasing confidence and drive.",
    "Body temperature dips slightly before rising; you are most fertile.",
    "Immune system shifts slightly; prioritize hydration and hygiene."
  ],
  [CyclePhase.LUTEAL]: [
    "Progesterone rises, increasing body temperature and calorie burn.",
    "Progesterone has a sedating effect; you may feel sleepier.",
    "Blood sugar is less stable; focus on protein to avoid mood swings.",
    "Pre-menstrual drop in hormones can trigger neurotransmitter dips."
  ]
};

const getRandomFallback = (phase: CyclePhase): string => {
  const options = FALLBACK_INSIGHTS[phase] || FALLBACK_INSIGHTS[CyclePhase.MENSTRUAL];
  return options[Math.floor(Math.random() * options.length)];
};

export const getCycleInsight = async (phase: CyclePhase, day: number, mood: string): Promise<string> => {
  const today = getLocalDateString();
  const cacheKey = `insight_${today}_${phase}`;
  
  if (typeof localStorage !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return cached;
    }
  }

  if (!process.env.API_KEY) {
      return getRandomFallback(phase);
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      Act as a clinical women's health expert. The user is on day ${day} of their cycle (${phase} phase).
      Their mood is "${mood}".
      
      Provide a 1-sentence scientific health insight.
      Explain what is happening hormonally (Estrogen/Progesterone/LH) and how it affects them.
      Keep it under 25 words. Be empathetic but factual.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    const text = response.text || getRandomFallback(phase);
    
    if (typeof localStorage !== 'undefined' && response.text) {
        localStorage.setItem(cacheKey, text);
    }

    return text;
  } catch (error) {
    console.error("Error fetching Gemini insight:", error);
    return getRandomFallback(phase);
  }
};
