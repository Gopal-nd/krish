'use client'
import ListItemForm from '@/components/market/Lisrtform'
import { Button } from '@/components/ui/button'
import { ArrowBigLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { use } from 'react'

const page = () => {
  const router = useRouter()
  return (
    <div className=' space-y-6 '>
      <div className='flex items-center  '>
<Button onClick={() => router.back()}><ArrowBigLeft /></Button>
      <h1 className='flex-1 text-2xl font-semibold text-center'>List Your Item for the Sell</h1>
      </div>
      <div className='max-w-3xl mx-auto'>
      <ListItemForm />
      </div>
    </div>
  )
}

export default page