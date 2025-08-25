'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React,{ FC } from 'react'



const Dashboard = () => {
  const { data: session, status } = useSession()

  // Loading state - render the same on both server and client
  if (status === "loading") {
    return (
      <div className="space-y-4">
        <h2 className='text-center font-bold text-2xl'>Loading...</h2>
        <div className="flex flex-col items-center justify-center space-y-10 min-h-screen">
          <div className="text-center p-10 w-full">
            <h1 className="text-4xl font-bold">Get Ready to Revolutionalize Agriculture.</h1>
            <p className="mt-4 text-lg">
              Leveraging technology to achieve Zero Hunger and sustainable growth.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated - render the same on both server and client
  if (!session) {
    return (
      <div className="space-y-4">
        <h2 className='text-center font-bold text-2xl'>Please sign in</h2>
        <div className="flex flex-col items-center justify-center space-y-10 min-h-screen">
          <div className="text-center p-10 w-full">
            <h1 className="text-4xl font-bold">Get Ready to Revolutionalize Agriculture.</h1>
            <p className="mt-4 text-lg">
              Leveraging technology to achieve Zero Hunger and sustainable growth.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated user - render the full dashboard
  return (
    <div className="space-y-4">
      <h2 className='text-center font-bold text-2xl'>Welcome <span className='text-blue-500'>{session.user?.name}</span></h2>
      <div className="flex flex-col items-center justify-center space-y-10 min-h-screen">
        {/* Hero Section */}
        <div className="text-center p-10 w-full">
          <h1 className="text-4xl font-bold">Get Ready to Revolutionalize Agriculture.</h1>
          <p className="mt-4 text-lg">
            Leveraging technology to achieve Zero Hunger and sustainable growth.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-6">
          {/* Feature: Agricultural Marketplace */}
          <FeatureCard
            title="Agricultural Marketplace"
            description="Buy and sell farming equipment with verified listings and direct connections."
            link="/dashboard/marketplace"
          />
          {/* Feature: Equipment Certification */}
          <FeatureCard
            title="Equipment Certification"
            description="Quality assurance with verified certifications from recognized standards."
            link="/dashboard/equipment"
          />

          {/* Feature: Current Market Prices */}
          <FeatureCard
            title="Current Market Prices"
            description="Real-time commodity prices from Indian markets with government data."
            link="/dashboard/current-prices"
          />

          {/* Feature: Weather Reports */}
          <FeatureCard
            title="Weather Reports"
            description="Accurate weather forecasts and real-time updates for your location."
            link="/dashboard/weather"
          />

          {/* Feature: Crop Image Analysis */}
          <FeatureCard
            title="Crop Image Analysis"
            description="AI-powered crop disease detection and farming advice."
            link="/dashboard/image-recognition"
          />

          {/* Feature: AI Chat Assistant */}
          <FeatureCard
            title="AI Chat Assistant"
            description="24/7 farming advice and answers from our AI chat bot."
            link="/dashboard/ai-chat/new"
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard;

const FeatureCard = ({ title, description, link }: { title: string; description: string; link: string }) => (
  <div className="border rounded-lg shadow-lg p-6 text-center">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <Link href={link}>
      <p className="px-4 py-2 border">Get started</p>
    </Link>
  </div>
)