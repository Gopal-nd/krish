import { getServerSession, NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {db} from "./db"
import { nanoid } from "nanoid"
import GoogleProvider from "next-auth/providers/google"
export const authOptions:NextAuthOptions={
    adapter:PrismaAdapter(db),
    session:{
        strategy:"jwt",
    },
    pages:{
        signIn:'/login'
    },
    providers:[
        GoogleProvider({
            clientId:process.env.GOOGLE_CLIENT_ID!,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET!,
            
        }),
    ],
    callbacks:{
        async session({token,session}) {
                if(token){
                    session.user.id= token.id
                    session.user.name = token.name
                    session.user.email = token.email
                    session.user.image = token.picture
                    session.user.username = token.username
                    session.user.role = token.role
                    session.user.whatsappNumber = token.whatsappNumber
                }
                return session
        },
        async jwt({token,user}) {
            const dbuser = await db.user.findFirst({
                where:{
                    email:token.email
                }
            })
            if(!dbuser){
                token.id = user!.id
                return token
            }
            if(!dbuser.username){
                await db.user.update({
                    where:{
                        id:dbuser.id
                    },
                    data:{
                        username:nanoid(10)
                    }
                })
            }
            return {
                id:dbuser.id,
                name:dbuser.name,
                email:dbuser.email,
                picture:dbuser.image,
                username:dbuser.username,
                role:dbuser.role,
                whatsappNumber:dbuser.whatsappNumber
            }
        },
        redirect(){
            return '/dashboard'
        }
    },
    secret:process.env.NEXTAUTH_SECRET!
}


export const getAuthSession=async () =>  getServerSession(authOptions)

export const getCurrentUser = async () => {
  const session = await getAuthSession()
  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    whatsappNumber: session.user.whatsappNumber
  }
}

export const requireRole = (user: any, requiredRole: string) => {
  if (!user) {
    throw new Error('Authentication required')
  }
  if (user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`)
  }
}