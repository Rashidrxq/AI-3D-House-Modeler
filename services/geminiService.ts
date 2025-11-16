import { GoogleGenAI, Type } from "@google/genai";
import { Shape, Light, ModelObject } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are an AI assistant that generates 3D models of houses with interiors and environments based on user descriptions. Your output must be a valid JSON array of objects. Do not include any text, explanations, or markdown formatting outside of the JSON array itself. The coordinate system is right-handed, with Y being the up-axis. The origin [0, 0, 0] is the center of the ground plane.

You can create two types of objects: 'box' and 'light'.

1.  **'box' shape:** Used for all physical geometry.
    - Instead of a 'color', you must specify a 'material' for each shape. This determines its texture.
    - You MUST use one of the following material names: 'brick', 'wood_planks', 'white_wall', 'roof_tiles', 'glass', 'grass', 'concrete', 'asphalt', 'tree_bark', 'tree_leaves', 'metal', 'water'.

2.  **'light' object:** Used to add light sources to the scene.
    - It has a 'position', a hex 'color' (e.g., '#ffddaa'), and an 'intensity'.
    - Place lights logically: inside rooms to simulate lamps, and on the exterior as spotlights to illuminate the house.
    - Example light object: {"type": "light", "position": [2, 2.5, 3], "color": "#ffffdd", "intensity": 50}

Your task is to model the house, interior, and environment using these objects.

IMPORTANT: To create complex shapes like roofs or trees, use multiple rotated and positioned 'box' shapes.`;

const modelConfig = {
  model: 'gemini-2.5-flash',
  config: {
    // FIX: The system instruction should be part of the config.
    systemInstruction: systemInstruction,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      description: "An array of 3D objects (shapes and lights) that constitute the model.",
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "The type of object. Must be 'box' or 'light'.",
          },
          position: {
            type: Type.ARRAY,
            description: "The center position of the object as [x, y, z].",
            items: { type: Type.NUMBER },
          },
          // Box properties
          size: {
            type: Type.ARRAY,
            description: "The dimensions of the box as [width, height, depth].",
            items: { type: Type.NUMBER },
          },
          rotation: {
            type: Type.ARRAY,
            description: "Euler rotation in radians [x, y, z].",
            items: { type: Type.NUMBER },
          },
          material: {
            type: Type.STRING,
            description: `For 'box' type. The material texture to apply.`,
          },
          // Light properties
          color: {
            type: Type.STRING,
            description: "For 'light' type. The hex color of the light (e.g., '#ffffff').",
          },
          intensity: {
            type: Type.NUMBER,
            description: "For 'light' type. The intensity of the light.",
          },
        },
        required: ["type", "position"],
      },
    },
  },
};

export const generateHouseModel = async (prompt: string): Promise<ModelObject[]> => {
  try {
    // FIX: Pass the prompt directly as `contents`. The system instruction is now in `modelConfig`.
    const response = await ai.models.generateContent({
        ...modelConfig,
        contents: prompt,
    });
    
    const jsonText = response.text.trim();
    const modelData = JSON.parse(jsonText);
    
    if (Array.isArray(modelData) && modelData.every(item => item.type === 'box' || item.type === 'light')) {
      return modelData as ModelObject[];
    } else {
      console.error("Invalid data structure received from API:", modelData);
      throw new Error("Failed to generate a valid model. The AI returned an unexpected format.");
    }

  } catch (error) {
    console.error("Error generating house model:", error);
    if (error instanceof SyntaxError) {
        throw new Error("The AI returned invalid JSON. Please try refining your prompt.");
    }
    throw new Error("An error occurred while communicating with the AI. Please try again.");
  }
};