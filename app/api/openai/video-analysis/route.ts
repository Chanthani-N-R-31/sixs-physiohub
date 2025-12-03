import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { videos, question, chatHistory } = await request.json();

    if (!videos || videos.length === 0) {
      return NextResponse.json(
        { error: "No videos provided" },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "No question provided" },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Build conversation context
    const messages = [
      {
        role: "system",
        content: `You are an expert biomechanics analyst specializing in movement analysis, gait analysis, and sports performance. 
        You analyze videos to provide insights on:
        - Running mechanics and gait patterns
        - Movement efficiency and biomechanics
        - Injury risk factors
        - Performance optimization
        - Postural assessments
        - Kinematic and kinetic observations
        
        Provide detailed, professional analysis based on the video content. If you cannot see specific details, mention limitations.
        Be concise but comprehensive in your responses.`,
      },
      ...(chatHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: `${question}\n\nI have ${videos.length} video(s) uploaded. Please analyze them and answer my question.`,
      },
    ];

    // Note: OpenAI's vision API (GPT-4 Vision) can analyze images but not videos directly
    // For video analysis, you would typically:
    // 1. Extract frames from videos (server-side)
    // 2. Use GPT-4 Vision to analyze key frames
    // 3. Or use a video-to-text transcription service first
    
    // For now, we'll use GPT-4 to provide general biomechanics analysis
    // In production, you'd want to integrate actual video frame extraction
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview", // Use GPT-4 Turbo which supports vision if needed
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: error.error?.message || "Failed to analyze video" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || "No response generated";

    return NextResponse.json({
      response: assistantMessage,
      model: data.model,
    });
  } catch (error: any) {
    console.error("Video analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

