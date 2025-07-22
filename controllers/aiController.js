/**
 * controllers/aiController.js
 * Handles AI-powered note beautification using the OpenRouter API.
 */

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

/**
 * Beautifies raw notes using OpenRouter (GPT-3.5-turbo-instruct).
 * Expects: { content: String } in req.body
 * Returns: { result: beautifiedText }
 */
export const beautifyNotes = async (req, res) => {
  try {
    // Parse input
    const { content } = req.body;
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "No content provided" });
    }

    // Call OpenRouter API for beautification
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3-235b-a22b-07-25:free",
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant that cleans up, beautifies, and summarizes class notes. Format the notes with bullet points, headings, and short paragraphs.",
            },
            {
              role: "user",
              content: content,
            },
          ],
          temperature: 0.4,
        }),
      }
    );

    const responseData = await response.json();

    if (
      responseData.choices &&
      responseData.choices[0] &&
      responseData.choices[0].message &&
      responseData.choices[0].message.content
    ) {
      res.status(200).json({ result: responseData.choices[0].message.content });
    } else {
      res.status(500).json({
        error: "AI beautification failed. Please try again.",
        details: responseData,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "AI service unavailable. Please try again later." });
  }
};
