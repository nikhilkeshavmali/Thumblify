import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        inputs: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      },
    );

    // ✅ Check if API returned JSON error instead of image
    const contentType = response.headers["content-type"];

    if (contentType && contentType.includes("application/json")) {
      const errorJson = JSON.parse(
        Buffer.from(response.data).toString("utf-8"),
      );

      console.log("HF Error:", errorJson);

      return res.status(500).json({
        success: false,
        error: errorJson.error || "HF returned error",
      });
    }

    const base64Image = Buffer.from(response.data).toString("base64");

    return res.json({
      success: true,
      image: `data:image/png;base64,${base64Image}`,
    });
  } catch (error: any) {
    if (error.response?.data) {
      console.log(
        "HF Error:",
        Buffer.from(error.response.data).toString("utf-8"),
      );
    } else {
      console.log("AI Generation Error:", error.message);
    }

    return res.status(500).json({
      success: false,
      error: "Thumbnail generation failed",
    });
  }
});

export default router;
