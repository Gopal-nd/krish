'use client'
import { Button } from "@/components/ui/button"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {ArrowBigLeft} from "lucide-react"
export default function Component() {
  const router = useRouter()
  return (
    
  
    <div className="mx-auto max-w-sm space-y-6 flex justify-center flex-col gap-2 items-center h-screen ">
      <div className="flex items-center w-full">
        <Button className="flex" onClick={() => router.back()}>
          <ArrowBigLeft className="h-6 w-6 mr-2" />
        </Button>

        <h1 className=" flex-1 text-center text-3xl font-bold">Welcome To Krishi</h1>
      </div>
      <div className=" text-center">
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>
      <div>
        <div className="space-y-4">
          <Button onClick={async() => await signIn("google")} variant="outline" className="w-full">
            <GoogleIcon className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">By creating account you agree to the <span className=" underline"> Terms and Conditions</span> of krishi</p>
      </div>
    </div>

  )
}

function GoogleIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M44.5 20H24v8.5h11.8C34.5 32.9 30.5 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8.1 3.2L39 9.3C35.1 5.8 29.8 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.6 0 19.4-7.6 19.4-20 0-1.3-.1-2.6-.3-4z"
          fill="#FFC107"
        />
        <path
          d="M6.3 14.6l6.6 4.8C14.9 16 18.9 14 24 14c3.1 0 5.9 1.2 8.1 3.2L39 9.3C35.1 5.8 29.8 4 24 4 16.1 4 9.3 8.3 6.3 14.6z"
          fill="#FF3D00"
        />
        <path
          d="M24 44c5.5 0 10.4-1.8 14.2-4.9l-6.6-5.1c-2.1 1.4-4.8 2.2-7.6 2.2-6.5 0-10.7-4-12.7-9.4l-6.6 5C9.4 39.5 16.2 44 24 44z"
          fill="#4CAF50"
        />
        <path
          d="M44.5 20H24v8.5h11.8c-1.3 3.5-5 6-11.8 6-6.5 0-10.7-4-12.7-9.4l-6.6 5C9.4 39.5 16.2 44 24 44c10.6 0 19.4-7.6 19.4-20 0-1.3-.1-2.6-.3-4z"
          fill="#1976D2"
        />
      </svg>
    );
  }
  

