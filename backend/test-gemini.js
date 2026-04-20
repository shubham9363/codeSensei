require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  try {
    console.log("Using Key:", process.env.GEMINI_API_KEY ? "Set" : "Not Set");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Generating content...");
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
