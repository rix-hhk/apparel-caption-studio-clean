"use client";

import { useState } from "react";

const tones = [
  "Playful",
  "Luxury",
  "Premium",
  "Minimal",
  "Emotional",
  "High-Converting Sales",
  "Trendy Gen-Z",
  "Festive",
  "Corporate Professional",
];

const platforms = [
  "Instagram",
  "Facebook",
  "Amazon",
  "Flipkart",
  "Myntra",
  "Shopify",
  "Website SEO",
  "WhatsApp Catalog",
];

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [emojis, setEmojis] = useState(true);
  const [tone, setTone] = useState("Playful");
  const [platform, setPlatform] = useState("Instagram");

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setCaptions([]);
    setDescriptions([]);
  }

  async function generate(type: "caption" | "description") {
    if (!image) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("emojis", String(emojis));
    formData.append("tone", tone);
    formData.append("platform", platform);

    const endpoint =
      type === "caption"
        ? "/api/generate-caption"
        : "/api/generate-description";

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (type === "caption") {
      setCaptions(data.captions || []);
    } else {
      setDescriptions(data.descriptions || []);
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        background: "#f8f6f3",
        minHeight: "100vh",
        padding: "60px 20px",
        fontFamily: "system-ui",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          Apparel Caption Studio ✨
        </h1>

        <p style={{ color: "#666", marginBottom: 40 }}>
          Generate high-converting fashion captions & descriptions using AI.
        </p>

        {/* Upload Card */}
        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 20,
            boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
          }}
        >
          <label
            style={{
              background: "#111",
              color: "white",
              padding: "12px 24px",
              borderRadius: 12,
              cursor: "pointer",
              display: "inline-block",
              marginBottom: 20,
            }}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
            />
          </label>

          <div style={{ marginBottom: 20 }}>
            <label style={{ marginRight: 20 }}>
              Tone:
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{ marginLeft: 10, padding: 6 }}
              >
                {tones.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>

            <label style={{ marginRight: 20 }}>
              Platform:
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                style={{ marginLeft: 10, padding: 6 }}
              >
                {platforms.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>

            <label>
              <input
                type="checkbox"
                checked={emojis}
                onChange={() => setEmojis(!emojis)}
              />{" "}
              Include Emojis
            </label>
          </div>

          {preview && (
            <>
              <img
                src={preview}
                alt="preview"
                style={{
                  width: 300,
                  borderRadius: 16,
                  marginBottom: 20,
                }}
              />

              <div>
                <button
                  onClick={() => generate("caption")}
                  disabled={loading}
                  style={{
                    padding: "10px 18px",
                    marginRight: 10,
                    borderRadius: 10,
                    border: "none",
                    background: "#000",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Generate Captions
                </button>

                <button
                  onClick={() => generate("description")}
                  disabled={loading}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Generate Descriptions
                </button>
              </div>
            </>
          )}
        </div>

        {loading && (
          <p style={{ marginTop: 30, color: "#555" }}>Generating...</p>
        )}

        {captions.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2>Captions</h2>
            <ul>
              {captions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {descriptions.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2>Descriptions</h2>
            <ul>
              {descriptions.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
