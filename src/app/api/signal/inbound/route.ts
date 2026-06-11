// Inbound report push from Signal. This is the only thing the admin exposes for
// the push model: Signal POSTs a signed payload here, we verify it's genuinely
// Signal, and store it. The admin report page renders from the stored copy and
// never calls out. Nothing here pulls.

import { NextResponse } from "next/server";
import {
  PUSH_SIGNATURE_HEADER,
  verifyPushSignature,
} from "@/lib/signal/push-verify";
import { saveReceivedReport } from "@/lib/signal/received-report-store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.SIGNAL_PUSH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "push receiving is not configured" },
      { status: 503 },
    );
  }

  const signature = req.headers.get(PUSH_SIGNATURE_HEADER);
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 401 });
  }

  // Read the raw body exactly as signed before parsing.
  const body = await req.text();
  if (!verifyPushSignature(body, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Light shape check against the push contract before storing.
  const p = payload as {
    contract_version?: unknown;
    business?: { slug?: unknown };
    ranges?: unknown;
  };
  const slug = p?.business?.slug;
  if (
    p?.contract_version !== 1 ||
    typeof slug !== "string" ||
    typeof p?.ranges !== "object" ||
    p.ranges === null
  ) {
    return NextResponse.json(
      { error: "unexpected payload shape" },
      { status: 422 },
    );
  }

  await saveReceivedReport(slug, payload);

  return NextResponse.json({
    ok: true,
    business: slug,
    received_at: new Date().toISOString(),
  });
}
