import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Handle GET requests for marketplace items
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || ''

  try {
    const items = await prisma.marketplaceItem.findMany({
      where: {
        OR: [
          {
            itemName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching marketplace items', error },
      { status: 500 }
    )
  }
}

