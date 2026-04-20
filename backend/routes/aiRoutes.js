const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/hint — Get a hint for a problem
router.post("/hint", auth, async (req, res) => {
  try {
    const { problemId, code, problemTitle, problemDescription } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI Hint feature is not configured (missing API key)." });
    }

    if (!code || code.trim() === "") {
      return res.status(400).json({ message: "Please write some code before asking for a hint!" });
    }

    const prompt = `
      You are an expert programming mentor known as "CodeSensei". 
      A student is trying to solve the following problem:
      Title: ${problemTitle}
      Description: ${problemDescription}

      Here is their current code:
      \`\`\`
      ${code}
      \`\`\`

      Provide a short, conceptual hint to help them get unblocked. 
      DO NOT give them the direct answer or the actual code solution.
      Keep your response to a maximum of 3 short sentences. Guide them conceptually.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({ hint: response.text() });
  } catch (err) {
    console.error("AI Hint Error:", err);
    res.status(500).json({ message: "Failed to generate hint: " + err.message });
  }
});

module.exports = router;
