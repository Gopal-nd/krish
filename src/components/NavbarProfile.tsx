import { FC } from 'react'

import { getAuthSession } from '@/lib/auth'

import { buttonVariants } from './ui/button'
import Link from 'next/link'
import { db } from '@/lib/db'
import { useSession } from 'next-auth/react'
import { ModeToggle } from './ThemeToggle'
import UserAccounNav from './UserAccountNav'

interface NavbarProfileProps {
  
}

const NavbarProfile: FC<NavbarProfileProps> = ({}) => {
    const {data:session} = useSession()

  
    
  return (
    
    <div className="flex justify-end items-centerc  gap-2 md:gap-4">
          <ModeToggle />
          {session ? (
            <UserAccounNav user={session.user as any} />
            
          ) : (
            
              <Link href={"/login"} >
                Login
              </Link>
            
          )}
        </div>
    
  )
}

export default NavbarProfile