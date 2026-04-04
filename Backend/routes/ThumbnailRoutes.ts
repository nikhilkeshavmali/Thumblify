import express, { Request, Response } from "express";
import axios from "axios";
import Thumbnail from "../models/Thumbnail";

const router = express.Router();

// ✅ Generate Thumbnail
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { title, prompt, style, aspect_ratio, color_scheme, text_overlay } =
      req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Combine prompt for AI
    const finalPrompt = `
      YouTube thumbnail style.
      Title: ${title}.
      Style: ${style}.
      Aspect ratio: ${aspect_ratio}.
      Color scheme: ${color_scheme}.
      Extra details: ${prompt}.
      High quality, bold text, eye-catching.
    `;

    // ✅ Call Hugging Face NScale API
    const hfResponse = await axios.post(
      "https://router.huggingface.co/nscale/v1/images/generations",
      {
        prompt: finalPrompt,
        model: "stabilityai/stable-diffusion-xl-base-1.0", // Free model
        response_format: "b64_json",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Check if image returned
    if (!hfResponse.data || !hfResponse.data[0]?.b64_json) {
      return res.status(500).json({
        message: "HuggingFace API did not return an image",
      });
    }

    const base64Image = hfResponse.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    // ✅ Save to MongoDB
    const newThumbnail = await Thumbnail.create({
      title,
      user_prompt: prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      image_url: imageUrl,
    });

    return res.status(201).json({
      message: "Thumbnail generated successfully",
      thumbnail: newThumbnail,
    });
  } catch (error: any) {
    console.error(
      "Thumbnail Generation Error:",
      error.response?.data || error.message,
    );

    // Handle Hugging Face API errors
    if (
      error.response?.status === 401 ||
      error.response?.data?.error?.includes("permissions")
    ) {
      return res.status(401).json({
        message:
          "Invalid Hugging Face token or insufficient permissions. Check HF_TOKEN and model access.",
      });
    }

    if (error.response?.status === 410) {
      return res.status(410).json({
        message: "Hugging Face model not available. Update the model.",
      });
    }

    return res.status(500).json({
      message: "Thumbnail generation failed",
    });
  }
});

// ✅ Get Thumbnail by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const thumbnail = await Thumbnail.findById(req.params.id);

    if (!thumbnail) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }

    return res.json({ thumbnail });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch thumbnail" });
  }
});

export default router;
