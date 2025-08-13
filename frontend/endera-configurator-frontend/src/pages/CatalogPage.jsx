import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Car, 
  Zap, 
  Users, 
  Settings, 
  Search, 
  Filter,
  Truck,
  Battery,
  Shield,
  Award
} from 'lucide-react'

// Import components
import Logo from '../components/ui/logo.jsx'

// Sample vehicle data
const vehicles = [
  {
    id: 1,
    name: "Endera Electric Shuttle",
    type: "Shuttle",
    image: "/src/assets/vehicles/electric-shuttle-1.jpg",
    description: "Class 4 electric shuttle with 14-24 passenger capacity",
    features: ["105-150 mile range", "ADA Compliant", "Altoona Tested", "Fast Charging"],
    price: "Starting at $125,000"
  },
  {
    id: 2,
    name: "Endera Electric School Bus",
    type: "School Bus",
    image: "/src/assets/vehicles/electric-school-bus-1.jpg",
    description: "Electric school bus designed for safety and efficiency",
    features: ["150 mile range", "Wheelchair Accessible", "Safety Certified", "Low Maintenance"],
    price: "Starting at $145,000"
  },
  {
    id: 3,
    name: "Ford E-350 Passenger Van",
    type: "Passenger Van",
    image: "/src/assets/vehicles/ford-e-350-passenger.jpg",
    description: "Gasoline-powered passenger van with Endera body",
    features: ["Gasoline Engine", "15 Passenger", "Reliable", "Cost Effective"],
    price: "Starting at $85,000"
  },
  {
    id: 4,
    name: "Ford E-450 Cutaway",
    type: "Cutaway",
    image: "/src/assets/vehicles/ford-e-450-cutaway.png",
    description: "Versatile cutaway chassis for custom applications",
    features: ["Customizable", "Multiple Configurations", "Durable", "Flexible"],
    price: "Starting at $95,000"
  }
]

function CatalogPage() {
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesType = selectedType === 'all' || vehicle.type.toLowerCase() === selectedType.toLowerCase()
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const vehicleTypes = ['all', ...new Set(vehicles.map(v => v.type))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vehicle Catalog</h1>
                <p className="text-gray-600">Browse our complete lineup of electric and conventional vehicles</p>
              </div>
            </div>
            <Button asChild>
              <a href="/configurator">
                <Car className="mr-2 h-4 w-4" />
                Configure Vehicle
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {vehicleTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map(vehicle => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <Car className="h-12 w-12 text-gray-400" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {vehicle.type}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{vehicle.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg text-purple-600">{vehicle.price}</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" asChild>
                      <a href={`/configurator?vehicle=${vehicle.id}`}>
                        Configure
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
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
            <div className="text-center">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Electric Powertrains</h3>
              <p className="text-gray-600 text-sm">105-150 mile range with fast charging capabilities</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">ADA Compliant</h3>
              <p className="text-gray-600 text-sm">Full accessibility features including wheelchair lifts</p>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Altoona Tested</h3>
              <p className="text-gray-600 text-sm">Rigorous testing ensures reliability and performance</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">14-24 Passengers</h3>
              <p className="text-gray-600 text-sm">Flexible seating configurations for various applications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CatalogPage
