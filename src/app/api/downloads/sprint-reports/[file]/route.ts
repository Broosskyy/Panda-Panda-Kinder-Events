import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const ALLOWED = new Set([
  "Statistik-Report.pdf",
  "CMS-Bugfix-Report.pdf",
  "Sprint-Report-CMS-Admin.pdf",
  "Sprint-Report-Mobile-Bugfix.pdf",
  "Sprint-Report-Premium-Design-V3.pdf",
  "Sprint-Report-Accessibility.pdf",
  "Sprint-Report-Premium-UI-UX-V2.pdf",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const { file } = await params;

  if (!ALLOWED.has(file)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buffer = await readFile(
      join(process.cwd(), "public/downloads/sprint-reports", file)
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
