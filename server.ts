import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API route: Generate Business Ideas
app.post("/api/generate-ideas", async (req, res) => {
  try {
    const { budget, location, interest, ideaCount } = req.body;

    if (!budget || !location) {
      res.status(400).json({ error: "Budget and Location are required." });
      return;
    }

    const ai = getGeminiClient();
    const count = parseInt(ideaCount) || 5;

    const promptText = `Generate exactly ${count} highly realistic and profitable business ideas suitable for a budget of "${budget}" in the city/location of "${location}".
${interest ? `Focus on categories related to or matching: "${interest}".` : "Try to provide a diverse selection of matching offline or online business types."}

Target Audience: students, side hustlers, small shop owners, and first-time entrepreneurs in India. Ensure the ideas represent realistic opportunities in India, showing prices/startup costs in INR (Indian Rupees - ₹).

For each business idea, provide:
1. Business name (catchy and localized to India)
2. Category
3. Startup cost (estimate breakdown with ₹ symbol)
4. Expected monthly profit (estimate with ₹ symbol)
5. Risk level (must be exactly 'Low', 'Medium', or 'High')
6. Feasibility score out of 100 (integer)
7. Why this works in "${location}"
8. First 3 steps to start (exactly 3 distinct startup steps, short and actionable)

Return directly as a JSON array matching the required schema. Ensure values are practical and realistic.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              startupCost: { type: Type.STRING },
              expectedProfit: { type: Type.STRING },
              riskLevel: { type: Type.STRING },
              feasibilityScore: { type: Type.INTEGER },
              whyWorks: { type: Type.STRING },
              firstSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of exactly 3 concrete and actionable steps."
              }
            },
            required: [
              "name",
              "category",
              "startupCost",
              "expectedProfit",
              "riskLevel",
              "feasibilityScore",
              "whyWorks",
              "firstSteps"
            ]
          }
        },
        temperature: 0.7,
      }
    });

    const ideasText = response.text;
    if (!ideasText) {
      throw new Error("Empty response from AI");
    }

    const parsedIdeas = JSON.parse(ideasText);
    res.json({ ideas: parsedIdeas });
  } catch (err: any) {
    console.error("Error generating business ideas:", err);
    res.status(500).json({ error: err.message || "Failed to generate business ideas" });
  }
});

// 2. API route: Generate Full Detailed Business Plan
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { ideaName, category, budget, location } = req.body;

    if (!ideaName) {
      res.status(400).json({ error: "Idea Name is required." });
      return;
    }

    const ai = getGeminiClient();

    const promptText = `Generate a fully comprehensive structural business execution plan for establishing a business called "${ideaName}" (Category: "${category}") with a budget constraints of "${budget}" in "${location}".
Return a highly professional structure with:
1. businessOverview: A concise overview of the business concept, including its main value proposition and why it will succeed.
2. targetCustomers: A detailed profile of primary and secondary target customers and key demographics in ${location}.
3. startupCostBreakdown: A detailed breakdown of estimated startup costs using local pricing (with ₹ symbol where appropriate).
4. requiredEquipment: An exhaustive list of required equipment, infrastructure, tools, materials, or initial resources.
5. pricingStrategy: Clear, competitive pricing models, ticket size, or rate plans based on the budget.
6. marketingStrategy: A checklist of exactly 5 marketing strategies layout, tailored for budget "${budget}".
7. monthlyRevenueEstimate: Realistic, granular projection of monthly revenue (with ₹ symbol).
8. monthlyExpenseEstimate: Granular list of monthly recurring expenses (rent, utilities, salaries, marketing, etc.) (with ₹ symbol).
9. expectedProfit: Expected net monthly profit (Revenue minus Expenses) structured clearly, showing margins (with ₹ symbol).
10. riskFactors: Key business and operational risk factors, challenges, and brief mitigation actions.
11. first30DayActionPlan: A checklist of distinct, sequential steps to take in the first 30 days to launch the business.

Each section MUST be realistic, highly detailed, and customized to India. Return matching the required JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessOverview: { type: Type.STRING },
            targetCustomers: { type: Type.STRING },
            startupCostBreakdown: { type: Type.STRING },
            requiredEquipment: { type: Type.STRING },
            pricingStrategy: { type: Type.STRING },
            marketingStrategy: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            monthlyRevenueEstimate: { type: Type.STRING },
            monthlyExpenseEstimate: { type: Type.STRING },
            expectedProfit: { type: Type.STRING },
            riskFactors: { type: Type.STRING },
            first30DayActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "businessOverview",
            "targetCustomers",
            "startupCostBreakdown",
            "requiredEquipment",
            "pricingStrategy",
            "marketingStrategy",
            "monthlyRevenueEstimate",
            "monthlyExpenseEstimate",
            "expectedProfit",
            "riskFactors",
            "first30DayActionPlan"
          ]
        },
        temperature: 0.7,
      }
    });

    const planText = response.text;
    if (!planText) {
      throw new Error("Empty business plan response from AI");
    }

    const plan = JSON.parse(planText);
    res.json({ plan });
  } catch (err: any) {
    console.error("Error generating business plan:", err);
    res.status(500).json({ error: err.message || "Failed to generate business plan" });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
