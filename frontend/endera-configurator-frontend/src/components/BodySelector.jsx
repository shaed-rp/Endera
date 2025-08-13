import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  Bus, 
  Users, 
  Zap, 
  Fuel,
  Accessibility,
  CheckCircle,
  Battery,
  Gauge
} from 'lucide-react'
import { API_BASE_URL, API_ENDPOINTS } from '../lib/api.js'

function BodySelector({ selectedChassis, selectedBody, onBodySelect, userType = 'customer' }) {
  const [bodyOptions, setBodyOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFuelType, setSelectedFuelType] = useState('all')

  useEffect(() => {
    if (selectedChassis) {
      fetchBodyOptions()
    }
  }, [selectedChassis])

  const fetchBodyOptions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BODIES}`)
      if (!response.ok) {
        throw new Error('Failed to fetch body options')
      }
      const data = await response.json()
      setBodyOptions(data.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching bodies:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredBodies = bodyOptions.filter(body => {
    if (selectedFuelType === 'all') return true
    return body.fuelType === selectedFuelType
  })

  const fuelTypes = [...new Set(bodyOptions.map(body => body.fuelType).filter(Boolean))]

  const getFuelIcon = (fuelType) => {
    switch (fuelType) {
      case 'Electric':
        return <Zap className="h-4 w-4" />
      case 'Gasoline':
        return <Fuel className="h-4 w-4" />
      default:
        return <Gauge className="h-4 w-4" />
    }
  }

  const getFuelColor = (fuelType) => {
    switch (fuelType) {
      case 'Electric':
        return 'bg-green-100 text-green-800'
      case 'Gasoline':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!selectedChassis) {
    return (
      <div className="text-center py-12">
        <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Chassis First</h3>
        <p className="text-gray-500">Choose a Ford E-Series chassis to see compatible body options</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Body Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading body options: {error}</p>
        <Button onClick={fetchBodyOptions} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Endera Body Configuration</h3>
        <p className="text-gray-600">Choose the body style and fuel type for your vehicle</p>
      </div>

      {/* Fuel Type Filter */}
      <Tabs value={selectedFuelType} onValueChange={setSelectedFuelType} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Types</TabsTrigger>
          <TabsTrigger value="Electric" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Electric</span>
          </TabsTrigger>
          <TabsTrigger value="Gasoline" className="flex items-center space-x-2">
            <Fuel className="h-4 w-4" />
            <span>Gasoline</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBodies.map((body) => (
          <Card 
            key={body.id}
            className={`cursor-pointer transition-all duration-200 vehicle-card ${
              selectedBody?.id === body.id 
                ? 'ring-2 ring-purple-600 border-purple-600' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => onBodySelect(body)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{body.configName}</CardTitle>
                  <CardDescription className="text-sm">
                    {body.configCode}
                  </CardDescription>
                </div>
                {selectedBody?.id === body.id && (
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Body Image Placeholder */}
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Bus className="h-12 w-12 text-gray-400" />
              </div>

              {/* Fuel Type Badge */}
              <div className="flex justify-between items-center">
                <Badge className={`${getFuelColor(body.fuelType)} flex items-center space-x-1`}>
                  {getFuelIcon(body.fuelType)}
                  <span>{body.fuelType}</span>
                </Badge>
                {body.fuelType === 'Electric' && body.electricRangeMiles && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Battery className="h-4 w-4" />
                    <span>{body.electricRangeMiles} mi range</span>
                  </div>
                )}
              </div>

              {/* Key Specifications */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{body.passengerCapacity} passengers</span>
                </div>
                {body.wheelchairPositions > 0 && (
                  <div className="flex items-center space-x-2">
                    <Accessibility className="h-4 w-4 text-gray-500" />
                    <span>{body.wheelchairPositions} wheelchair</span>
                  </div>
                )}
              </div>

              {/* Features */}
              {body.features && body.features.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {body.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature.featureName}
                      </Badge>
                    ))}
                    {body.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{body.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing Placeholder */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Body Price</span>
                  <span className="font-semibold text-lg endera-text-purple">
                    Contact for pricing
                  </span>
                </div>
              </div>

              {/* Selection Button */}
              <Button 
                className={`w-full ${
                  selectedBody?.id === body.id 
                    ? 'endera-primary' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onBodySelect(body)
                }}
              >
                {selectedBody?.id === body.id ? 'Selected' : 'Select Body'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBodies.length === 0 && (
        <div className="text-center py-8">
          <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {selectedFuelType === 'all' 
              ? 'No body configurations available' 
              : `No ${selectedFuelType.toLowerCase()} body configurations available`
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default BodySelector

