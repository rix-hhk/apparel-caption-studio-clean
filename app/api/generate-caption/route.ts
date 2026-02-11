import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image") as File;
    const emojis = formData.get("emojis") === "true";

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString("base64");
    const imageUrl = `data:${image.type};base64,${base64}`;

    const OpenAI = (await import("openai")).default;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Generate exactly 3 short Instagram captions for this apparel image.
Each caption must:
- Be on a new line
- Be playful and ecommerce-ready
- ${emojis ? "Include relevant emojis" : "Do NOT include emojis"}
Return only the captions.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: imageUrl,
              detail: "low"
            }
          ]
        }
      ]
    });

    const text =
      response.output_text ??
      "";

    const captions = text
      .split("\n")
      .filter(Boolean);

    return NextResponse.json({ captions });

  } catch (error: any) {
    console.error("CAPTION ERROR:", error);
    return NextResponse.json(
      { error: "Caption generation failed" },
      { status: 500 }
    );
  }
}
