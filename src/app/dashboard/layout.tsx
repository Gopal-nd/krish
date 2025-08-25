"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "react-responsive"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu, X, Cloud, MessageSquare, BookOpen, Image as ImageIcon,
  ShoppingBag, Home, ChevronLeft, ChevronRight, Wheat, HistoryIcon,
  Package, Store, MessageCircle, TrendingUp
} from "lucide-react"
import NavbarProfile from "@/components/NavbarProfile"

export default function Component({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" })

  useEffect(() => {
    setIsSidebarOpen(isLargeScreen)
  }, [isLargeScreen])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLinkClick = () => {
    if (!isLargeScreen) setIsSidebarOpen(false)
  }

  const SidebarContent = () => (
    <nav className="space-y-2 flex flex-col h-full justify-between items-start">
    <div>
        <Link href="/dashboard" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link href="/dashboard/marketplace" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <ShoppingBag className="h-5 w-5" />
          <span>Marketplace</span>
        </Link>
        <Link href="/dashboard/equipment" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <Package className="h-5 w-5" />
          <span>Equipment</span>
        </Link>
        <Link href="/dashboard/current-prices" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <TrendingUp className="h-5 w-5" />
          <span>Current Prices</span>
        </Link>
        <Link href="/dashboard/weather" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <Cloud className="h-5 w-5" />
          <span>Weather</span>
        </Link>
        <Link href="/dashboard/ai-chat" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <MessageSquare className="h-5 w-5" />
          <span>AI Chat</span>
        </Link>
      
        <Link href="/dashboard/image-recognition" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <ImageIcon className="h-5 w-5" />
          <span>Crop Disease Detection</span>
        </Link>
        <Link href="/dashboard/sell" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <Store className="h-5 w-5" />
          <span>Equipment Dashboard</span>
        </Link>
        <Link href="/dashboard/inquiries" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <MessageCircle className="h-5 w-5" />
          <span>Inquiries</span>
        </Link>
        <Link href="/dashboard/become-farmer" className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <Wheat className="h-5 w-5" />
          <span>Become Seller</span>
        </Link>
      </div>
      <div className="flex items-start">
        <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" onClick={handleLinkClick}>
          <HistoryIcon className="h-5" />
          <span>History</span>
        </div>
      </div>
    </nav>
  )
  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      <header className="flex items-center justify-between p-2 border-b">
        <div className="flex gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Wheat className="h-6 w-6" />
            <span className="text-xl font-bold">Krishi</span>
          </Link>
          {isLargeScreen && (
            <Button
              size="icon"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <NavbarProfile />
          {!isLargeScreen && (
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>
      <div className="flex">
        {isLargeScreen && (
          <aside className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-0"}`}>
            <div className={`h-[calc(100vh-65px)] p-4 overflow-hidden ${isSidebarOpen ? "border-r" : ""}`}>
              <SidebarContent />
            </div>
          </aside>
        )}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
