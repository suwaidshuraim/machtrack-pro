/**
 * /api/[collection]
 *
 * GET  /api/machines            → return all machines
 * POST /api/machines            → add or replace a machine (body may include an id)
 */

import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, VALID_COLLECTIONS } from '../_db';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ collection: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { collection: col } = await params;

  if (!VALID_COLLECTIONS.includes(col)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  const db = readDB();
  return NextResponse.json(db[col] ?? []);
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { collection: col } = await params;

  if (!VALID_COLLECTIONS.includes(col)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  const body = await req.json();

  // Generate an id if the caller didn't supply one
  const id: string =
    body.id ||
    Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

  const item = { ...body, id };

  const db = readDB();
  if (!Array.isArray(db[col])) db[col] = [];

  const idx = db[col].findIndex((i: any) => i.id === id);
  if (idx >= 0) {
    db[col][idx] = item;         // replace existing
  } else {
    db[col].push(item);          // append new
  }

  writeDB(db);
  return NextResponse.json(item, { status: 201 });
}
