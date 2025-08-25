
'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, ShoppingBag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowBigLeft } from 'lucide-react'

interface MarketplaceItem {
  id: string
  itemName: string
  description?: string
  estimatedWeightKg: number
  priceRangePerKg: string
  contactLink: string
  estimatedAvailability: string
  status: boolean
  createdAt: string
}

const fetchMarketplaceItems = async (): Promise<MarketplaceItem[]> => {
  const { data } = await axios.get('/api/marketplace')
  return data
}

const MyListings = () => {
  const { data, isLoading, isError, error } = useQuery<MarketplaceItem[], Error>({
    queryKey: ['marketplaceItems'],
    queryFn: fetchMarketplaceItems,
  })
  const router = useRouter()
  const { data: session } = useSession()
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Listings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Listings</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load your listings items: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (

    <nav className=" shadow-lg sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center h-16">
        {/* Back Button */}
        <Button
          className=" p-2 rounded-md"
          onClick={() => router.back()}
        >
          <ArrowBigLeft />
        </Button>
        <h1 className=' flex-1 text-2xl text-center font-medium'>My Listings</h1>
      </div>
      <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!data || data.length === 0 ? (
          <p className="text-center text-lg">No listings found.</p>
        ) : null}
        {data?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.itemName}</CardTitle>
              <CardDescription>
                Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{item.description}</p>
              <p className="mb-2">Weight: {item.estimatedWeightKg}kg</p>
              <p className="mb-2">Price: {item.priceRangePerKg}</p>
              <p className="mb-2">
                Available: <Badge variant={item.status ? "default" : "secondary"}>{item.status ? 'Yes' : 'No'}</Badge>
              </p>
              <p className="mb-2">Availability Date: {new Date(item.estimatedAvailability).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <a href={item.contactLink} target="_blank" rel="noopener noreferrer">
                  Contact <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button>
                <ShoppingBag className="mr-2 h-4 w-4" /> Buy Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
    </div>
  </nav>
  
  )
}

export default MyListings
