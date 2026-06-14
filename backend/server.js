const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
  res.send('RISE backend running');
});

async function callMistralAPI(prompt) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY not configured.");

  const cleanPrompt = prompt + "\n\nIMPORTANT: Respond with pure JSON only. No markdown, no code blocks, no backticks, no explanation. Just raw JSON.";

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: cleanPrompt }],
      max_tokens: 1000
    })
  });

  const data = await response.json();
  let text = data.choices[0].message.content;

  // Strip markdown code blocks
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  console.log("Mistral cleaned response:", text);
  return text;
}

// Helper function to clean markdown formatting and parse JSON
function cleanAndParseJSON(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
  }
  return JSON.parse(cleaned);
}

// POST /generate
app.post('/generate', async (req, res) => {
  try {
    const { prompt, budget, location, interest, count, ideaCount } = req.body;

    let targetPrompt = prompt;
    if (!targetPrompt) {
      if (!budget || !location) {
        return res.status(400).json({ error: 'Budget and Location are required.' });
      }

      const countVal = parseInt(count || ideaCount) || 5;

      const systemPrompt = `You are an expert business consultant specialized in startup planning.
You must return only a valid JSON object matching the requested schema. No conversational filler or markdown formatting outside the JSON block.`;

      const userPrompt = `Generate exactly ${countVal} highly realistic and profitable business ideas suitable for a budget of "${budget}" in the city/location of "${location}".
${interest ? `Focus on categories related to or matching: "${interest}".` : "Try to provide a diverse selection of matching offline or online business types."}

Target Audience: students, side hustlers, small shop owners, and first-time entrepreneurs. Ensure the ideas represent realistic opportunities in India, showing prices/startup costs in INR (Indian Rupees - ₹).

You MUST return a JSON object with a single key "ideas" containing an array of business ideas. Each business idea must have exactly these keys:
- "name": Catchy and localized business name
- "category": Category of the business
- "startupCost": Estimated startup cost (estimate breakdown with ₹ symbol)
- "monthlyProfit": Expected monthly profit (estimate with ₹ symbol)
- "riskLevel": Must be exactly 'Low', 'Medium', or 'High'
- "score": Feasibility score out of 100 (integer)
- "whyItWorks": Explanation of why this works in "${location}"
- "firstSteps": An array of exactly 3 concrete, actionable startup steps (strings)

Output JSON structure template:
{
  "ideas": [
    {
      "name": "example name",
      "category": "example category",
      "startupCost": "₹10,000",
      "monthlyProfit": "₹5,000",
      "riskLevel": "Low",
      "score": 85,
      "whyItWorks": "Works because...",
      "firstSteps": [
        "Step 1...",
        "Step 2...",
        "Step 3..."
      ]
    }
  ]
}`;
      targetPrompt = `${systemPrompt}\n\n${userPrompt}`;
    }

    const rawText = await callMistralAPI(targetPrompt);
    // Send as plain text, not JSON - avoids all JSON parse errors
    res.setHeader('Content-Type', 'text/plain');
    res.send(rawText);
  } catch (err) {
    console.error('Error in /generate:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /plan
app.post('/plan', async (req, res) => {
  try {
    const { idea, ideaName, category, budget, location } = req.body;

    const targetIdeaName = idea ? idea.name : ideaName;
    const targetCategory = idea ? idea.category : category;
    const targetBudget = idea ? idea.startupCost : budget;
    const targetLocation = location || "India";

    if (!targetIdeaName) {
      return res.status(400).json({ error: 'Idea Name is required.' });
    }

    const systemPrompt = `You are an expert business planner specialized in detailed startup strategy and planning.
You must return only a valid JSON object matching the requested schema. No conversational filler or markdown formatting outside the JSON block.`;

    const userPrompt = `Generate a fully comprehensive structural business execution plan for establishing a business called "${targetIdeaName}" (Category: "${targetCategory}") with budget constraints of "${targetBudget}" in "${targetLocation}".

The plan should be highly professional, detailed, and customized to India. Return matching the required JSON schema.
You MUST return a JSON object with a single key "plan" containing the business plan object. The "plan" object must have exactly these keys:
- "overview": Concise overview of the business concept, main value proposition, and why it will succeed.
- "targetCustomers": Detailed profile of primary and secondary target customers and key demographics.
- "startupCostBreakdown": A JSON array of strings, detailing items and estimated startup costs using local pricing (with ₹ symbol where appropriate).
- "equipment": A JSON array of strings, representing an exhaustive list of required equipment, infrastructure, tools, materials, or initial resources.
- "pricingStrategy": Clear, competitive pricing models, ticket size, or rate plans based on the budget.
- "marketingStrategy": A single string summarizing the marketing strategies, tailored for budget "${budget}".
- "monthlyRevenue": Realistic, granular projection of monthly revenue (with ₹ symbol).
- "monthlyExpenses": Granular list of monthly recurring expenses (rent, utilities, salaries, marketing, etc.) (with ₹ symbol).
- "expectedProfit": Expected net monthly profit (Revenue minus Expenses) structured clearly, showing margins (with ₹ symbol).
- "risks": A JSON array of strings, containing key business/operational risk factors, challenges, and brief mitigation actions.
- "first30Days": A JSON array of strings, containing distinct, sequential steps to take in the first 30 days to launch.

Output JSON structure template:
{
  "plan": {
    "overview": "Overview...",
    "targetCustomers": "Target customers...",
    "startupCostBreakdown": ["Item 1: ₹5,000", "Item 2: ₹2,000"],
    "equipment": ["Equipment 1", "Equipment 2"],
    "pricingStrategy": "Pricing details...",
    "marketingStrategy": "Marketing details...",
    "monthlyRevenue": "₹50,000",
    "monthlyExpenses": "₹30,000",
    "expectedProfit": "₹20,000",
    "risks": ["Risk 1: Description and mitigation", "Risk 2: Description and mitigation"],
    "first30Days": ["Step 1", "Step 2", "Step 3"]
  }
}`;

    const promptText = `${systemPrompt}\n\n${userPrompt}`;
    const contentText = await callMistralAPI(promptText);

    const cleanText = contentText
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/\\/g, '\\\\')
      .trim();

    let parsedData;
    try {
      parsedData = cleanAndParseJSON(cleanText);
    } catch (parseErr) {
      console.warn('Parsing sanitized JSON failed, trying raw text:', parseErr);
      parsedData = cleanAndParseJSON(contentText);
    }

    if (!parsedData.plan || typeof parsedData.plan !== 'object') {
      throw new Error('Response did not contain a "plan" object.');
    }

    res.json(parsedData);
  } catch (err) {
    console.error('Error in /plan:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
