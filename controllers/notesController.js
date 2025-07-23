/**
 * controllers/notesController.js
 * Handles note summarization (AI), saving, and retrieval from MongoDB.
 */

import Notes from "../models/Notes.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

/**
 * Summarizes beautified notes using OpenRouter (GPT-3.5-turbo-instruct).
 * Expects: { text: String } in req.body
 * Returns: { summaryText, takeaways }
 */
export const summarizeNotes = async (req, res) => {
  let responded = false;
  try {
    // Parse input
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      responded = true;
      return res.status(400).json({ error: "No text provided" });
    }

    // Flexible prompt for takeaways
    const prompt =
      "Summarize the following notes in 3-5 lines. Then, under the heading 'Key Takeaways:' or 'Takeaways:', provide 3 bullet points.";

    // Timeout helper for fetch
    const fetchWithTimeout = (url, options, timeout = 12000) => {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AI API timeout")), timeout)
        ),
      ]);
    };

    // Function to call OpenRouter API for summarization
    const callOpenRouter = async () => {
      return fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
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
              content: prompt,
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.4,
        }),
      });
    };

    let response, responseData;
    let errorOccurred = false;

    // First attempt
    try {
      response = await callOpenRouter();
      responseData = await response.json();
    } catch (err) {
      errorOccurred = true;
    }

    // Retry once if error or timeout
    if (errorOccurred || !responseData || !responseData.choices) {
      await new Promise((resolve) => setTimeout(resolve, 1200)); // 1.2s delay
      try {
        response = await callOpenRouter();
        responseData = await response.json();
        errorOccurred = false;
      } catch (err) {
        errorOccurred = true;
      }
    }

    if (
      !errorOccurred &&
      responseData &&
      responseData.choices &&
      responseData.choices[0] &&
      responseData.choices[0].message &&
      responseData.choices[0].message.content
    ) {
      // Split summary and takeaways (accept both headings)
      const output = responseData.choices[0].message.content;
      const [summaryText, ...takeawaysArr] = output.split(
        /Takeaways:|Key Takeaways:/i
      );
      let takeaways = [];
      if (takeawaysArr.length > 0) {
        // Parse bullet points from AI output
        takeaways = takeawaysArr
          .join("")
          .split(/\n- |\n  |\n/)
          .map((t) => t.trim())
          .filter(Boolean);
      }
      responded = true;
      res.json({
        success: true,
        data: { summaryText: summaryText.trim(), takeaways },
      });
      return;
    } else {
      responded = true;
      res.status(500).json({
        error:
          "The AI service is currently busy or slow. Please try again in a few moments.",
      });
      return;
    }
  } catch (error) {
    if (!responded) {
      res.status(500).json({
        error:
          "The AI service is currently unavailable. Please try again later.",
      });
    }
    return;
  }
  // Final failsafe
  if (!responded) {
    res
      .status(500)
      .json({ error: "Unexpected error. Please try again later." });
  }
};

/**
 * Saves a note to MongoDB.
 * Expects: { rawText, beautifiedText, summaryText, takeaways } in req.body
 * Returns: The saved note document.
 */
export const saveNote = async (req, res) => {
  try {
    const { rawText, beautifiedText, summaryText, takeaways } = req.body;
    if (!rawText || !beautifiedText || !summaryText || !takeaways) {
      return res.status(400).json({ error: "Missing required note fields." });
    }
    const note = new Notes({
      rawText,
      beautifiedText,
      summaryText,
      takeaways,
      user: req.user.userId,
    });
    await note.save();
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ error: "Failed to save note. Please try again." });
  }
};

/**
 * Retrieves all saved notes for the authenticated user from MongoDB, sorted by creation date (newest first).
 * Returns: Array of note documents.
 */
export const getAllNotes = async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes. Please try again." });
  }
};
