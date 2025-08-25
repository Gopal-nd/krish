'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import SearchBar from '@/components/market/Searchbar'


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

const fetchMarketplaceItems = async (query: string): Promise<MarketplaceItem[]> => {
  const { data } = await axios.get('/api/marketplace/search', { params: { query } })
  return data
}

const MarketplaceItems = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, isError, error, refetch } = useQuery<MarketplaceItem[], Error>({
    queryKey: ['marketplaceItems', searchQuery],
    queryFn: () => fetchMarketplaceItems(searchQuery),
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Marketplace Items</h1>
        <SearchBar onSearch={handleSearch} />
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
        <h1 className="text-3xl font-bold mb-6">Marketplace Items</h1>
        <SearchBar onSearch={handleSearch} />
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load marketplace items: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Marketplace Items</h1>
      <SearchBar onSearch={handleSearch} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data?.map((item) => (
          <Card
            key={item.id}
            className="transition-transform hover:scale-105 hover:shadow-lg border"
          >
            <CardHeader className="p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  {item.itemName}
                </CardTitle>
                <Badge className={item.status ? "bg-green-500" : "bg-red-500"}>
                  {item.status ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <CardDescription className="text-sm mt-2">
                Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-2">
              <p className="line-clamp-3">
                <strong>Description:</strong> <span className="text-foreground">{item.description}</span>
              </p>
              <p>
                <strong>Weight:</strong> {item.estimatedWeightKg}kg
              </p>
              <p>
                <strong>Price:</strong> {item.priceRangePerKg} ₹/kg
              </p>
              <p>
                <strong>Availability Date:</strong> {new Date(item.estimatedAvailability).toLocaleDateString()}
              </p>
            </CardContent>

            <CardFooter className="p-4 flex justify-between rounded-b-lg">
              <Button
                variant="outline"
                asChild
              >
                <a
                  href={`https://wa.me/+91${item.contactLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  Contact <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default MarketplaceItems