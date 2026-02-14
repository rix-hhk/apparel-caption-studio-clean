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
    const tone = (formData.get("tone") as string) || "Professional";
    const platform = (formData.get("platform") as string) || "Amazon";

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

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `You are an expert ecommerce apparel copywriter.

Generate exactly 3 bullet point product descriptions.

Tone: ${tone}
Platform: ${platform}

Each description must:
- Start with "- "
- Be 25-35 words
- Be complete
- Be suitable for ecommerce
- Not be cut off`,
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

    const descriptions = outputText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .slice(0, 3);

    return NextResponse.json({ descriptions });
  } catch (error) {
    console.error("DESCRIPTION ERROR:", error);
    return NextResponse.json(
      { error: "Description generation failed" },
      { status: 500 }
    );
  }
}
