import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const { slug, secret } = await req.json();
    const serverSecret = process.env.REVALIDATE_SECRET;

    if (serverSecret && secret !== serverSecret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
    }

    revalidatePath(`/landing/${slug}`);
    revalidatePath("/landing/[slug]", "page");

    return NextResponse.json({ ok: true, revalidated: `/landing/${slug}` });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
