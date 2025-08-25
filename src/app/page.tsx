import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Leaf, Sun, Sprout, ShoppingBag, Bug, BookOpen, ChevronRight, Wheat, TrendingUp, MessageCircle, ImageIcon, Shield, Users, Zap, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import hero from '../assets/herosection.jpg'
import { ModeToggle } from "@/components/ThemeToggle"

import { getAuthSession } from "@/lib/auth"


export default async function LandingPage() {
const session =await getAuthSession()
  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto ">
      <header className="px-4 lg:px-6 h-14 flex items-center  border-b py-4">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-2xl font-bold text-primary flex gap-1 items-center"><Wheat /> Krishi</span>
        </Link>
        <div className="ml-auto flex item-center gap-4 ">
        <ModeToggle />
        {session?.user ?
        <Link href={'/dashboard'}>
          <Button >Dashboard</Button>
        </Link>:
        <Link href={'/login'}>
          <Button >Login</Button>
        </Link>
        }
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 border-b">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Empowering Farmers with Integrated AgriTech Solutions
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Revolutionize your farming practices with our comprehensive webapp. Get real-time updates,
                    personalized recommendations, and connect directly with buyers.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              <Image
                alt="Hero Image"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                height="550"
                src={hero}
                width="550"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32  border-b">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Mission</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We're committed to achieving SDG 2: Zero Hunger by empowering farmers with cutting-edge technology and
                  sustainable practices.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 border-b">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Our Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover the powerful tools and features designed to empower farmers and streamline agricultural operations
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                    <ShoppingBag className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Agricultural Marketplace</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Buy and sell farming equipment with our comprehensive marketplace. List your equipment, browse verified listings, and connect directly with buyers.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      <Badge variant="secondary" className="text-xs">Equipment Trading</Badge>
                      <Badge variant="secondary" className="text-xs">Direct Connections</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <Leaf className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Equipment Certification</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ensure quality with our certification system. Equipment comes with verified certifications from recognized standards like ISO, GMP, and more.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      <Badge variant="secondary" className="text-xs">Quality Assurance</Badge>
                      <Badge variant="secondary" className="text-xs">Verified Standards</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                    <TrendingUp className="h-10 w-10 text-orange-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Current Market Prices</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get real-time commodity prices from Indian markets. Filter by state, commodity, and market with live data from government sources.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      <Badge variant="secondary" className="text-xs">Real-time Data</Badge>
                      <Badge variant="secondary" className="text-xs">Export CSV</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <Sun className="h-10 w-10 text-purple-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Weather Reports</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get accurate weather forecasts and real-time updates for your location. Plan your farming activities with precise weather information.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      <Badge variant="secondary" className="text-xs">Real-time Updates</Badge>
                      <Badge variant="secondary" className="text-xs">Location-based</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-red-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                    <ImageIcon className="h-10 w-10 text-red-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Crop Image Analysis</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Upload crop images for AI-powered analysis. Detect diseases, get treatment recommendations, and receive farming advice instantly.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
                      <Badge variant="secondary" className="text-xs">Disease Detection</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-yellow-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors">
                    <MessageCircle className="h-10 w-10 text-yellow-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">AI Chat Assistant</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get instant answers to your farming questions with our AI chat bot. Receive personalized advice and farming recommendations 24/7.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      <Badge variant="secondary" className="text-xs">24/7 Support</Badge>
                      <Badge variant="secondary" className="text-xs">Expert Advice</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 border-b">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Why Choose Krishi?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of farmers who trust Krishi to transform their agricultural operations
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-4 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                    <Wheat className="h-12 w-12 text-emerald-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Save Time & Money</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Cut out middlemen and get direct access to buyers. Our platform helps you save up to 30% on equipment costs while finding the best prices for your crops.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-cyan-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-4 bg-cyan-100 rounded-xl group-hover:bg-cyan-200 transition-colors">
                    <TrendingUp className="h-12 w-12 text-cyan-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Increase Your Profits</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Make data-driven decisions with real-time market prices and AI insights. Maximize your crop yields and optimize your farming investments.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-violet-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-4 bg-violet-100 rounded-xl group-hover:bg-violet-200 transition-colors">
                    <Shield className="h-12 w-12 text-violet-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Peace of Mind</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every transaction is protected with our certification system. Get expert advice from our AI assistant and ensure quality in every deal.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-amber-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-4 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                    <Users className="h-12 w-12 text-amber-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Join a Community</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Connect with farmers across India, share knowledge, and build lasting relationships. Our platform fosters collaboration and growth.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-rose-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-4 bg-rose-100 rounded-xl group-hover:bg-rose-200 transition-colors">
                    <Zap className="h-12 w-12 text-rose-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Stay Ahead of Challenges</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Detect crop diseases early with AI image analysis and get weather alerts to protect your investments and maximize productivity.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-teal-200">
                <CardContent className="flex flex-col items-center space-y-4 p-8">
                  <div className="p-4 bg-teal-100 rounded-xl group-hover:bg-teal-200 transition-colors">
                    <Clock className="h-12 w-12 text-teal-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Work Smarter, Not Harder</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Automate routine tasks with our intelligent dashboard. Focus on what matters most - growing your farm and increasing your yields.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-b">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get started with Krishi in just a few simple steps
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Register as a Farmer</h3>
                <p className="text-muted-foreground">
                  Create your account and complete the farmer registration process to unlock all platform features.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">List Your Equipment</h3>
                <p className="text-muted-foreground">
                  Add your farming equipment with detailed specifications, certifications, and high-quality photos.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">Connect & Trade</h3>
                <p className="text-muted-foreground">
                  Receive inquiries from interested buyers, communicate directly, and complete secure transactions.
                </p>
              </div>
            </div>
          </div>
        </section>

      
       
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2025 KRISHI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Features
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            About
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Contact
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}