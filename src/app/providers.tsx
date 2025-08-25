'use client'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import React,{ FC } from 'react'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
interface providersProps {
 children:React.ReactNode 
}

const Providers: FC<providersProps> = ({children}) => {
  const query = new QueryClient()
  return <>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          ><SessionProvider >
<QueryClientProvider client={query}>
            {children}
</QueryClientProvider>
            <Toaster />
          </SessionProvider>
          </ThemeProvider>
  </>
}

export default Providers