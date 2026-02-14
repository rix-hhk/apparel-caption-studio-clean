import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const emojis = formData.get("emojis") === "true";
    const tone = (formData.get("tone") as string) || "Playful";
    const platform = (formData.get("platform") as string) || "Instagram";

    if (!image) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${image.type};base64,${base64}`;

    const OpenAI = (await import("openai")).default;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const emojiInstruction = emojis
      ? "Include relevant emojis."
      : "Do NOT include emojis.";

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `You are a professional fashion marketing copywriter.

Generate exactly 3 bullet point captions.

Tone: ${tone}
Platform: ${platform}
${emojiInstruction}

Each caption must:
- Start with "- "
- Be complete
- Not be cut off
- Be suitable for ecommerce
- Be high quality marketing copy`,
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: "low",
            },
          ],
        },
      ],
    });

    const outputText =
      response.output_text ??
      "";

    const captions = outputText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .slice(0, 3);

    return NextResponse.json({ captions });
  } catch (error) {
    console.error("CAPTION ERROR:", error);
    return NextResponse.json(
      { error: "Caption generation failed" },
      { status: 500 }
    );
  }
}
