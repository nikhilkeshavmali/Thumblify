import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import axios from "axios";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Thumbnail Style Prompts
const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",
  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, DSLR-style photography, lifestyle realism, shallow depth of field",
  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

// Color Schemes
const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session as any;
    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    if (!title || !style) {
      return res
        .status(400)
        .json({ message: "Missing required fields: title, style" });
    }

    // Create DB record first
    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    // Build AI prompt
    let prompt = `Create a ${
      stylePrompts[style as keyof typeof stylePrompts]
    } for: "${title}". `;

    if (color_scheme) {
      prompt += `Use a ${
        colorSchemeDescriptions[
          color_scheme as keyof typeof colorSchemeDescriptions
        ]
      }. `;
    }

    if (user_prompt) {
      prompt += `Additional details: ${user_prompt}. `;
    }

    prompt +=
      "The thumbnail should be visually stunning, bold, professional, and designed to maximize click-through rate.";

    // Call HuggingFace API
    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      },
    );

    // Check if HF returned error JSON instead of image
    const contentType = hfResponse.headers["content-type"];

    if (contentType && contentType.includes("application/json")) {
      const errorJson = JSON.parse(
        Buffer.from(hfResponse.data).toString("utf-8"),
      );
      throw new Error(errorJson.error || "HuggingFace Error");
    }

    const finalBuffer = Buffer.from(hfResponse.data);

    // Save image locally temporarily
    const filename = `thumbnail-${Date.now()}.png`;
    const filePath = path.join("images", filename);

    fs.mkdirSync("images", { recursive: true });
    fs.writeFileSync(filePath, finalBuffer);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
    });

    // Update DB
    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    // Delete local file
    fs.unlinkSync(filePath);

    res.json({
      message: "Thumbnail Generated Successfully",
      thumbnail,
    });
  } catch (error: any) {
    console.error("Thumbnail Generation Error:", error.message);

    res.status(500).json({
      message: error.message || "Thumbnail generation failed",
    });
  }
};

// Delete Thumbnail
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session as any;

    await Thumbnail.findOneAndDelete({ _id: id, userId });

    res.json({ message: "Thumbnail deleted successfully" });
  } catch (error: any) {
  console.error("========== ERROR START ==========");
  console.error(error);
  console.error("MESSAGE:", error.message);
  console.error("RESPONSE:", error.response?.data);
  console.error("========== ERROR END ==========");

  res.status(500).json({
    message: error.message || "Thumbnail generation failed",
  });
}
};
