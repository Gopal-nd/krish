'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Send } from "lucide-react"

interface Message {
  id: number
  sender: string
  content: string
}

const ChatMessage: React.FC<Message> = ({ sender, content }) => (
  <div className={`flex ${sender === 'Agent' ? 'justify-start' : 'justify-end'} mb-4`}>
    <div className={`flex items-end ${sender === 'Agent' ? 'flex-row' : 'flex-row-reverse'}`}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={sender === 'Agent' ? "/agent-avatar.png" : "/user-avatar.png"} />
        <AvatarFallback>{sender[0]}</AvatarFallback>
      </Avatar>
      <div className={`mx-2 py-3 px-4 rounded-2xl ${
        sender === 'Agent' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
      }`}>
        {content}
      </div>
    </div>
  </div>
)

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const currentUser = 'Farmer123'

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const [chat] = useState(() =>
    model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Hello' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Great to meet you. How can I assist you with your crops?' }],
        },
      ],
    })
  )

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return

    const userMessage = { id: messages.length + 1, sender: currentUser, content: newMessage }
    setMessages(prevMessages => [...prevMessages, userMessage])
    setNewMessage('')
    setIsLoading(true)

    try {
      const result = await chat.sendMessage(newMessage)
      const aiMessage = { id: messages.length + 2, sender: 'Agent', content: result.response.text() }
      setMessages(prevMessages => [...prevMessages, aiMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full mx-auto h-[90vh] flex flex-col">
      <CardHeader>
        <CardTitle>Chat with Crop Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
          {isLoading && (
            <div className="text-muted-foreground text-sm animate-pulse">Agent is typing...</div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex w-full space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default Chat

