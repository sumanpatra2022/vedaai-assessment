import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      question,
      expectedAnswer,
      studentAnswer,
      maxMarks,
    } = body;

    if (!question || !studentAnswer || maxMarks === undefined) {
      return NextResponse.json(
        {
          error:
            "Question, student answer and maxMarks are required",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are an exam answer evaluator.

Evaluate the student's answer based on the question and expected answer.

IMPORTANT:
- Do NOT require exact wording.
- Different wording with the same meaning should receive marks.
- Give partial marks when the answer is partially correct.
- Do not give marks for irrelevant information.
- Never give more than the maximum marks.
- Be fair and concise.

Question:
${question}

Expected Answer:
${expectedAnswer || "Use the question and your subject knowledge to determine the correct answer."}

Student Answer:
${studentAnswer}

Maximum Marks:
${maxMarks}

Return ONLY valid JSON in this exact format:

{
  "obtainedMarks": 0,
  "status": "Incorrect",
  "reason": "Short explanation"
}

The status must be exactly one of:
"Correct"
"Partially Correct"
"Incorrect"

obtainedMarks must be a number between 0 and ${maxMarks}.
`;

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content:
              "You are a strict but fair exam evaluator. Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
      });

    const content =
      completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error(
        "No evaluation response from Groq"
      );
    }

    // Remove possible markdown code fences
    const cleanedContent = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const evaluation =
      JSON.parse(cleanedContent);

    return NextResponse.json({
      success: true,
      obtainedMarks: Number(
        evaluation.obtainedMarks
      ),
      maxMarks: Number(maxMarks),
      status: evaluation.status,
      reason: evaluation.reason,
    });

  } catch (error) {
    console.error(
      "Evaluation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Evaluation failed",
      },
      { status: 500 }
    );
  }
}