import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  Car, 
  Zap, 
  Users, 
  Settings, 
  Search, 
  Filter,
  ChevronRight,
  Truck,
  Battery,
  Shield,
  Award
} from 'lucide-react'
import './App.css'

// Import pages
import ConfiguratorPage from './pages/ConfiguratorPage.jsx'

// Header Component
function Header({ userType, setUserType }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold endera-text-purple">ENDERA</h1>
              <p className="text-xs text-gray-500 -mt-1">Vehicle Configurator</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
              Home
            </a>
            <a href="/configurator" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
              Configurator
            </a>
            <a href="/catalog" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
              Browse Catalog
            </a>
            <a href="/about" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
              About
            </a>
          </nav>

          {/* User Type Toggle */}
          <div className="flex items-center space-x-4">
            <Tabs value={userType} onValueChange={setUserType} className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="dealer">Dealer</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </header>
  )
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="endera-gradient text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Configure Your Electric Future
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            America's only vertically integrated OEM for Class 4 electric shuttles and school buses
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
              <a href="/configurator">
                <Car className="mr-2 h-5 w-5" />
                Start Configuring
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600" asChild>
              <a href="/catalog">
                <Search className="mr-2 h-5 w-5" />
                Browse Catalog
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: "Electric Powertrains",
      description: "105-150 mile range with fast charging capabilities"
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "ADA Compliant",
      description: "Full accessibility features including wheelchair lifts and securements"
    },
    {
      icon: <Award className="h-8 w-8 text-purple-600" />,
      title: "Altoona Tested",
      description: "Rigorous testing ensures reliability and performance"
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "14-24 Passengers",
      description: "Flexible seating configurations for various applications"
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Endera?
          </h2>
          <p className="text-lg text-gray-600">
            Leading the transition to sustainable transportation
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Configuration Steps Component
function ConfigurationSteps() {
  const [currentStep, setCurrentStep] = useState(1)
  
  const steps = [
    { id: 1, title: "Choose Chassis", description: "Select Ford E-Series chassis", icon: <Truck className="h-5 w-5" /> },
    { id: 2, title: "Select Fuel Type", description: "Gasoline or Electric", icon: <Zap className="h-5 w-5" /> },
    { id: 3, title: "Pick Body Style", description: "Endera body configuration", icon: <Car className="h-5 w-5" /> },
    { id: 4, title: "Add Options", description: "Customize features", icon: <Settings className="h-5 w-5" /> },
    { id: 5, title: "Review & Quote", description: "Finalize your configuration", icon: <Award className="h-5 w-5" /> }
  ]

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple Configuration Process
          </h2>
          <p className="text-lg text-gray-600">
            Configure your perfect vehicle in 5 easy steps
          </p>
        </div>

        {/* Steps Navigation */}
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center space-x-3 cursor-pointer transition-colors ${
                  currentStep === step.id ? 'text-purple-600' : 'text-gray-400'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep === step.id 
                    ? 'border-purple-600 bg-purple-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="hidden md:block h-5 w-5 text-gray-300 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {steps[currentStep - 1].icon}
              <span>{steps[currentStep - 1].title}</span>
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Step {currentStep} content will be implemented here
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Button 
                  className="endera-primary"
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  disabled={currentStep === 5}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

// Quick Stats Component
function QuickStats() {
  const stats = [
    { label: "Vehicle Configurations", value: "50+" },
    { label: "Miles Range", value: "150" },
    { label: "Passenger Capacity", value: "24" },
    { label: "Years Experience", value: "10+" }
  ]

  return (
    <section className="py-16 bg-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-purple-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Main App Component
function App() {
  const [userType, setUserType] = useState('customer')

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header userType={userType} setUserType={setUserType} />
        
        <Routes>
          <Route path="/" element={
            <main>
              <HeroSection />
              <FeaturesSection />
              <ConfigurationSteps />
              <QuickStats />
            </main>
          } />
          <Route path="/configurator" element={<ConfiguratorPage userType={userType} />} />
          <Route path="/catalog" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Catalog Page Coming Soon</h1></div>} />
          <Route path="/about" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">About Page Coming Soon</h1></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">ENDERA</h3>
                <p className="text-gray-400">
                  America's only vertically integrated OEM for Class 4 electric shuttles and school buses.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Configurator</a></li>
                  <li><a href="#" className="hover:text-white">Catalog</a></li>
                  <li><a href="#" className="hover:text-white">Support</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Contact</h4>
                <div className="text-gray-400 space-y-2">
                  <p>1-800-ENDERA-1</p>
                  <p>info@enderamotors.com</p>
                  <p>www.enderamotors.com</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Endera Motors. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App

