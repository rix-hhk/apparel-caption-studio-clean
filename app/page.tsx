"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [emojis, setEmojis] = useState(true);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setCaptions([]);
    setDescriptions([]);
  }

  async function generateCaptions() {
    if (!image) return;

    setLoading(true);
    setCaptions([]);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("emojis", String(emojis));

    const res = await fetch("/api/generate-caption", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setCaptions(data.captions || []);
    setLoading(false);
  }

  async function generateDescriptions() {
    if (!image) return;

    setLoading(true);
    setDescriptions([]);

    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch("/api/generate-description", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setDescriptions(data.descriptions || []);
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        Apparel Caption Studio 👕
      </h1>

      <p style={{ marginBottom: 20 }}>
        Upload any apparel image and generate AI captions + descriptions.
      </p>

      <label
        style={{
          background: "black",
          color: "white",
          padding: "10px 20px",
          borderRadius: 6,
          cursor: "pointer",
          display: "inline-block",
        }}
      >
        Choose Image
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleUpload}
        />
      </label>

      <div style={{ marginTop: 15 }}>
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
        <div style={{ marginTop: 30 }}>
          <img
            src={preview}
            alt="preview"
            style={{ width: 300, borderRadius: 8 }}
          />

          <div style={{ marginTop: 20 }}>
            <button
              onClick={generateCaptions}
              disabled={loading}
              style={{
                padding: "10px 15px",
                marginRight: 10,
                cursor: "pointer",
              }}
            >
              Generate Captions
            </button>

            <button
              onClick={generateDescriptions}
              disabled={loading}
              style={{
                padding: "10px 15px",
                cursor: "pointer",
              }}
            >
              Generate Descriptions
            </button>
          </div>
        </div>
      )}

      {loading && <p style={{ marginTop: 20 }}>Generating...</p>}

      {captions.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>Captions</h2>
          <ul>
            {captions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {descriptions.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>Descriptions</h2>
          <ul>
            {descriptions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
