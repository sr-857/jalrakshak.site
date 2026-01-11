import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { alertText, lang } = await request.json();
    
    // In a production environment, this would call a TTS service like Google TTS, Azure, or ElevenLabs.
    // Here we simulate the generation and return a small silent WAV blob to satisfy the requirement.
    // Base64 for 1 second of silence (8000Hz, Mono, 16-bit)
    const silentWavBase64 = "UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    const buffer = Buffer.from(silentWavBase64, 'base64');

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/wav",
        "X-Alert-Text": alertText, // Metadata for the frontend to potentially use for Web Speech fallback
        "X-Lang": lang
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
  }
}
