import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'

import ChassisSelector from '../components/ChassisSelector.jsx'
import BodySelector from '../components/BodySelector.jsx'
import ConfigurationSummary from '../components/ConfigurationSummary.jsx'

const API_BASE_URL = 'http://localhost:3001/api'

const CONFIGURATION_STEPS = [
  { id: 'chassis', title: 'Select Chassis', description: 'Choose Ford E-Series chassis' },
  { id: 'body', title: 'Select Body', description: 'Choose Endera body configuration' },
  { id: 'options', title: 'Add Options', description: 'Customize features and accessories' },
  { id: 'review', title: 'Review & Quote', description: 'Finalize your configuration' }
]

function ConfiguratorPage({ userType = 'customer' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [selectedChassis, setSelectedChassis] = useState(null)
  const [selectedBody, setSelectedBody] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize session on component mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Update URL when step changes
  useEffect(() => {
    const stepId = CONFIGURATION_STEPS[currentStep]?.id
    if (stepId) {
      setSearchParams({ step: stepId })
    }
  }, [currentStep, setSearchParams])

  // Initialize from URL params
  useEffect(() => {
    const stepParam = searchParams.get('step')
    if (stepParam) {
      const stepIndex = CONFIGURATION_STEPS.findIndex(step => step.id === stepParam)
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex)
      }
    }
  }, [searchParams])

  const initializeSession = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/configurations/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userType,
          sessionData: {
            startedAt: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize session')
      }

      const data = await response.json()
      setSessionId(data.data.sessionId)
    } catch (err) {
      setError('Failed to initialize configurator session')
      console.error('Session initialization error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChassisSelect = async (chassis) => {
    setSelectedChassis(chassis)
    
    // Save selection to session
    if (sessionId) {
      try {
        await fetch(`${API_BASE_URL}/configurations/sessions/${sessionId}/selections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            selectionType: 'chassis',
            selectedItemId: chassis.id,
            selectedItemCode: chassis.seriesCode,
            quantity: 1,
            unitPrice: chassis.msrp,
            totalPrice: chassis.msrp
          })
        })
      } catch (err) {
        console.error('Error saving chassis selection:', err)
      }
    }
  }

  const handleBodySelect = async (body) => {
    setSelectedBody(body)
    
    // Save selection to session
    if (sessionId) {
      try {
        await fetch(`${API_BASE_URL}/configurations/sessions/${sessionId}/selections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            selectionType: 'body',
            selectedItemId: body.id,
            selectedItemCode: body.configCode,
            quantity: 1,
            unitPrice: 0, // Body pricing to be determined
            totalPrice: 0
          })
        })
      } catch (err) {
        console.error('Error saving body selection:', err)
      }
    }
  }

  const handleGenerateQuote = () => {
    // Navigate to quote generation
    setCurrentStep(3) // Review step
  }

  const nextStep = () => {
    if (currentStep < CONFIGURATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Chassis step
        return selectedChassis !== null
      case 1: // Body step
        return selectedBody !== null
      case 2: // Options step
        return true // Options are optional
      default:
        return false
    }
  }

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'upcoming'
  }

  const progress = ((currentStep + 1) / CONFIGURATION_STEPS.length) * 100

  if (loading && !sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing configurator...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Configuration Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={initializeSession} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vehicle Configurator</h1>
              <p className="text-gray-600">Configure your Endera electric vehicle</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {userType === 'dealer' ? 'Dealer View' : 'Customer View'}
              </div>
              <div className="text-sm text-gray-500">
                Session: {sessionId?.slice(-8)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {CONFIGURATION_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            {CONFIGURATION_STEPS.map((step, index) => {
              const status = getStepStatus(index)
              return (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-2 cursor-pointer transition-colors ${
                    status === 'current' ? 'text-purple-600' : 
                    status === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    status === 'current' ? 'border-purple-600 bg-purple-600 text-white' :
                    status === 'completed' ? 'border-green-600 bg-green-600 text-white' :
                    'border-gray-300 text-gray-400'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>{CONFIGURATION_STEPS[currentStep].title}</span>
                </CardTitle>
                <CardDescription>
                  {CONFIGURATION_STEPS[currentStep].description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === 0 && (
                  <ChassisSelector
                    selectedChassis={selectedChassis}
                    onChassisSelect={handleChassisSelect}
                    userType={userType}
                  />
                )}
                
                {currentStep === 1 && (
                  <BodySelector
                    selectedChassis={selectedChassis}
                    selectedBody={selectedBody}
                    onBodySelect={handleBodySelect}
                    userType={userType}
                  />
                )}
                
                {currentStep === 2 && (
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Options & Accessories</h3>
                    <p className="text-gray-500">Additional options will be available here</p>
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Review Your Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedChassis && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Selected Chassis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium">{selectedChassis.seriesCode}</p>
                            <p className="text-sm text-gray-600">{selectedChassis.modelDescription}</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {selectedBody && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Selected Body</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium">{selectedBody.configName}</p>
                            <p className="text-sm text-gray-600">{selectedBody.fuelType} • {selectedBody.passengerCapacity} passengers</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button 
                onClick={nextStep}
                disabled={currentStep === CONFIGURATION_STEPS.length - 1 || !canProceedToNext()}
                className="endera-primary"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="lg:col-span-1">
            <ConfigurationSummary
              selectedChassis={selectedChassis}
              selectedBody={selectedBody}
              sessionId={sessionId}
              userType={userType}
              onGenerateQuote={handleGenerateQuote}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfiguratorPage

