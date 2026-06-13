import { BusinessIdea } from "../types";

export const SAMPLE_IDEAS: BusinessIdea[] = [
  {
    id: "sample_tea_stall",
    name: "Tea Stall Near College Gate",
    category: "Food & Beverage",
    startupCost: "₹15,000 - ₹25,000",
    expectedProfit: "₹25,000 - ₹40,000 / month",
    riskLevel: "Low",
    feasibilityScore: 92,
    whyWorks: "Colleges have a steady daily flow of energetic students, faculty, and visitors looking for affordable, quick, hot refreshments and a casual social hangout spot in their breaks.",
    firstSteps: [
      "Secure a micro-leasing spot, legal stall permit, or mobile cart within 100 meters of a prominent college gate or coaching institute.",
      "Procure standard commercial tea kettles, gas stove, tea leaves, fresh milk, spices (ginger/cardamom), and biodegradable clay cups (Kulhads).",
      "Launch with 3 signature recipes (Adrak Masala, Elaichi, and Lemon Mint) priced dynamically at student-friendly rates of ₹10 - ₹15."
    ],
    isSample: true
  },
  {
    id: "sample_pickle_business",
    name: "Home-Based Gourmet Pickle Brand",
    category: "Organic Packaged Foods",
    startupCost: "₹5,000 - ₹10,000",
    expectedProfit: "₹12,000 - ₹20,000 / month",
    riskLevel: "Medium",
    feasibilityScore: 85,
    whyWorks: "Handmade, preservative-free traditional pickles carry heavy nostalgic appeal in urban residential areas where busy working couples crave authentic home-style flavors but lack the time or skill to ferment them.",
    firstSteps: [
      "Source fresh seasonal ingredients (raw mango, lemon, green chillies) and pure cold-pressed mustard oil and spices from wholesale farmers' markets.",
      "Acquire airtight food-grade sterilized glass jars, print premium minimalist labels specifying expiration, and maintain supreme batch hygiene.",
      "Distribute bite-sized free tasting samples inside apartment complexes, take pre-orders via local residential community WhatsApp groups, and set up a basic UPI QR payment system."
    ],
    isSample: true
  }
];
