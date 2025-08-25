// app/api/marketplace/route.ts
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
  // Assuming prisma is setup in lib/prisma.ts

// GET: Fetch all marketplace items
export async function GET() {
  const user = await getAuthSession()
  if(!user){
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const items = await db.marketplaceItem.findMany({
      where: {
        userId: user.user.id
      }
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST: Create a new marketplace item
export async function POST(request: Request) {
    const user = await getAuthSession()
    if(!user){
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  try {
    const data = await request.json();
    const newItem = await db.marketplaceItem.create({
      data: {
        itemName: data.itemName,
        description: data.description,
        estimatedWeightKg: data.estimatedWeightKg,
        priceRangePerKg: data.priceRangePerKg,
        contactLink: data.contactLink,
        estimatedAvailability: new Date(data.estimatedAvailability),
        status: data.status,
        userId: user.user.id
          },
    });
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
