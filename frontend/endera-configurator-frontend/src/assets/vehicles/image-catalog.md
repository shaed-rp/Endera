# Vehicle Image Catalog

This directory contains vehicle images organized by category for the Endera Vehicle Configurator.

## Endera Vehicles
- `endera-curbside-2.png` - Official Endera electric shuttle bus (curbside view)

## Ford E-Series Chassis
- `ford-e-series-chassis-1.tif` - Ford E-Series stripped chassis (side view)
- `ford-e-series-chassis-2.tif` - Ford E-Series chassis (wide angle)
- `ford-e-series-chassis-3.tif` - Ford E-Series chassis (detailed view)
- `ford-e-450-cutaway.png` - Ford E-450 cutaway chassis

## Ford E-Series Complete Vehicles
- `ford-e-series-shuttle-1.tif` - Ford E-Series shuttle bus (white, side view)
- `ford-e-series-shuttle-2.tif` - Ford E-Series shuttle bus (campus setting)
- `ford-e-350-shuttle.jpg` - Ford E-350 shuttle bus (Starcraft)
- `ford-e-350-passenger.jpg` - Ford E-350 passenger shuttle (Turtle Top)
- `ford-shuttle-fleet.jpg` - Multiple Ford shuttle buses (fleet view)

## Electric Vehicles (Reference)
- `electric-shuttle-1.jpg` - Star EV M-Series electric shuttle
- `electric-shuttle-2.png` - Marshell electric sightseeing bus
- `electric-school-bus-1.jpg` - Electric school buses (multiple units)
- `electric-school-bus-2.jpg` - GreenPower electric school bus
- `electric-transit-bus.jpg` - Electric transit bus (blue/white)

## Usage Guidelines

### For Chassis Selection
Use Ford E-Series chassis images (chassis-1, chassis-2, chassis-3, e-450-cutaway) to show the base platform options.

### For Body Configuration
Use the Endera vehicle image as the primary example, with electric vehicle references for comparison.

### For Complete Vehicle Gallery
Use Ford E-Series complete vehicles to show various body styles and configurations available.

### Image Formats
- `.png` files: Best for web display with transparency support
- `.jpg` files: Good for photographs with smaller file sizes
- `.tif` files: High quality, may need conversion for web use

## Integration Notes

When importing these images into React components:
```javascript
import enderaCurbside from './vehicles/endera-curbside-2.png';
import fordChassis from './vehicles/ford-e-series-chassis-1.tif';
// etc.
```

Consider converting .tif files to .jpg or .png for better web compatibility if needed.

