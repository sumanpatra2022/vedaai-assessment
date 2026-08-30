import { NextResponse } from "next/server";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const questionFile = formData.get("questionFile") as File | null;
    const answerFile = formData.get("answerFile") as File | null;

    if (!questionFile || !answerFile) {
      return NextResponse.json(
        { error: "Both files are required" },
        { status: 400 }
      );
    }

    const questionBuffer = Buffer.from(
      await questionFile.arrayBuffer()
    );

    const answerBuffer = Buffer.from(
      await answerFile.arrayBuffer()
    );

    // Extract question paper text
    const questionParser = new PDFParse({
      data: questionBuffer,
    });

    const questionResult = await questionParser.getText();
    await questionParser.destroy();

    // Extract answer sheet text
    const answerParser = new PDFParse({
      data: answerBuffer,
    });

    const answerResult = await answerParser.getText();
    await answerParser.destroy();

    const questionText = questionResult.text;
    const answerText = answerResult.text;

    console.log("QUESTION TEXT:");
    console.log(questionText);

    console.log("ANSWER TEXT:");
    console.log(answerText);

    return NextResponse.json({
      success: true,
      questionText,
      answerText,
    });

  } catch (error) {
    console.error("Extraction error:", error);

    return NextResponse.json(
      { error: "Extraction failed" },
      { status: 500 }
    );
  }
}