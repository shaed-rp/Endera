import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'
import { 
  Truck, 
  Gauge, 
  Weight, 
  Ruler,
  DollarSign,
  CheckCircle
} from 'lucide-react'

const API_BASE_URL = 'http://localhost:3001/api'

function ChassisSelector({ selectedChassis, onChassisSelect, userType = 'customer' }) {
  const [chassisOptions, setChassisOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchChassisOptions()
  }, [])

  const fetchChassisOptions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/chassis`)
      if (!response.ok) {
        throw new Error('Failed to fetch chassis options')
      }
      const data = await response.json()
      setChassisOptions(data.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching chassis:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price, type = 'retail') => {
    if (!price) return 'Price on request'
    const amount = userType === 'dealer' && type === 'invoice' ? price.dealerInvoice : price.suggestedRetail
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getChassisImage = (seriesCode) => {
    // Return placeholder for now - will be replaced with actual images
    return '/api/placeholder/300/200'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Chassis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
        <p className="text-red-600 mb-4">Error loading chassis options: {error}</p>
        <Button onClick={fetchChassisOptions} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Ford E-Series Chassis</h3>
        <p className="text-gray-600">Choose the foundation for your Endera vehicle configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chassisOptions.map((chassis) => (
          <Card 
            key={chassis.id}
            className={`cursor-pointer transition-all duration-200 vehicle-card ${
              selectedChassis?.id === chassis.id 
                ? 'ring-2 ring-purple-600 border-purple-600' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => onChassisSelect(chassis)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{chassis.seriesCode}</CardTitle>
                  <CardDescription className="text-sm">
                    {chassis.modelDescription}
                  </CardDescription>
                </div>
                {selectedChassis?.id === chassis.id && (
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Chassis Image Placeholder */}
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Truck className="h-12 w-12 text-gray-400" />
              </div>

              {/* Key Specifications */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Ruler className="h-4 w-4 text-gray-500" />
                  <span>{chassis.wheelbaseInches}"</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Weight className="h-4 w-4 text-gray-500" />
                  <span>{chassis.gvwrPounds?.toLocaleString()} lbs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-gray-500" />
                  <span>{chassis.engineSeries}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {chassis.drivetrainType}
                  </Badge>
                </div>
              </div>

              {/* Category */}
              <div>
                <Badge variant="secondary" className="text-xs">
                  {chassis.category?.name || 'Commercial'}
                </Badge>
              </div>

              {/* Pricing */}
              {chassis.pricing && (
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {userType === 'dealer' ? 'Invoice' : 'MSRP'}
                    </span>
                    <span className="font-semibold text-lg endera-text-purple">
                      {formatPrice(chassis.pricing, userType === 'dealer' ? 'invoice' : 'retail')}
                    </span>
                  </div>
                  {chassis.pricing.destinationCharge && (
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>+ Destination</span>
                      <span>${chassis.pricing.destinationCharge.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Selection Button */}
              <Button 
                className={`w-full ${
                  selectedChassis?.id === chassis.id 
                    ? 'endera-primary' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onChassisSelect(chassis)
                }}
              >
                {selectedChassis?.id === chassis.id ? 'Selected' : 'Select Chassis'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {chassisOptions.length === 0 && (
        <div className="text-center py-8">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No chassis options available</p>
        </div>
      )}
    </div>
  )
}

export default ChassisSelector

