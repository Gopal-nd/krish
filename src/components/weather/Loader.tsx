import { LoaderCircle } from 'lucide-react'
import React from 'react'

export const Loader = () => {
  return (
    <div className='flex items-center justify-center h-full w-full'>
         <p className=' animate-spin '><LoaderCircle className='h-10 w-10' /></p>
    </div>
  )
}

export default Loader