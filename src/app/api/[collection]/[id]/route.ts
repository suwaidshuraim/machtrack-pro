/**
 * /api/[collection]/[id]
 *
 * PUT    /api/machines/m001   → full replace
 * PATCH  /api/machines/m001   → partial update (merge fields)
 * DELETE /api/machines/m001   → remove
 */

import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, VALID_COLLECTIONS } from '../../_db';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ collection: string; id: string }> };

/** Full replace */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { collection: col, id } = await params;

  if (!VALID_COLLECTIONS.includes(col)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  const body = await req.json();
  const item = { ...body, id };

  const db = readDB();
  if (!Array.isArray(db[col])) db[col] = [];

  const idx = db[col].findIndex((i: any) => i.id === id);
  if (idx >= 0) {
    db[col][idx] = item;
  } else {
    db[col].push(item);
  }

  writeDB(db);
  return NextResponse.json(item);
}

/** Partial update (merge) */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { collection: col, id } = await params;

  if (!VALID_COLLECTIONS.includes(col)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  const patch = await req.json();

  const db = readDB();
  if (!Array.isArray(db[col])) db[col] = [];

  const idx = db[col].findIndex((i: any) => i.id === id);
  if (idx < 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  db[col][idx] = { ...db[col][idx], ...patch, id };
  writeDB(db);
  return NextResponse.json(db[col][idx]);
}

/** Delete */
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { collection: col, id } = await params;

  if (!VALID_COLLECTIONS.includes(col)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  const db = readDB();
  if (Array.isArray(db[col])) {
    db[col] = db[col].filter((i: any) => i.id !== id);
  }

  writeDB(db);
  return NextResponse.json({ success: true });
}
