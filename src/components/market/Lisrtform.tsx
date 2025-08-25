'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from '../ui/label'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from '../ui/checkbox'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { UserRole } from '@prisma/client'


interface NewItem {
  itemName: string
  description: string
  estimatedWeightKg: number
  priceRangePerKg: string
  contactLink: string
  estimatedAvailability: string
  status: boolean
  userId: string
}

const CreateMarketplaceItem = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState<NewItem>({
    itemName: '',
    description: '',
    estimatedWeightKg: 0,
    priceRangePerKg: '',
    contactLink: '',
    estimatedAvailability: '',
    status: false,
    userId: '',
  })

  // Update userId when session loads
  useEffect(() => {
    if (session?.user?.id) {
      setFormData(prev => ({
        ...prev,
        userId: session.user.id
      }));
    }
  }, [session?.user?.id]);

  const mutation = useMutation({
    mutationFn: (newItem: NewItem) => axios.post('/api/marketplace', newItem),
    onSuccess: () => {
      toast({
        title: "Item Created",
        description: "Your marketplace item has been successfully created.",
      })
      router.push('/dashboard/marketplace')
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error creating your item. Please try again.",
        variant: "destructive",
      })
      console.error('Error creating item:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <RoleGuard requiredRole="FARMER">
      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className='text-center'>Add a new item to the marketplace</CardTitle>

      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              placeholder="Enter item name"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your item"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedWeightKg">Estimated Weight (kg)</Label>
            <Input
              id="estimatedWeightKg"
              type="number"
              placeholder="Enter estimated weight"
              value={formData.estimatedWeightKg || ''}
              onChange={(e) => setFormData({ ...formData, estimatedWeightKg: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceRangePerKg">Price Range per kg</Label>
            <Input
              id="priceRangePerKg"
              placeholder="e.g. 30-100rs"
              value={formData.priceRangePerKg}
              onChange={(e) => setFormData({ ...formData, priceRangePerKg: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactLink">Contact Number</Label>
            <Input
              id="contactLink"
              type="tel"
              placeholder="Enter contact number"
              value={formData.contactLink}
              onChange={(e) => setFormData({ ...formData, contactLink: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedAvailability">Estimated Availability</Label>
            <Input
              id="estimatedAvailability"
              type="date"
              value={formData.estimatedAvailability}
              onChange={(e) => setFormData({ ...formData, estimatedAvailability: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="status"
              checked={formData.status}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked as boolean })}
            />
            <Label htmlFor="status">Available</Label>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create Item'}
        </Button>
      </CardFooter>
    </Card>
    </RoleGuard>
  )
}

export default CreateMarketplaceItem