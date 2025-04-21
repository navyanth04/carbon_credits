// src/utils/carbonCalculator.js
// (now as ES modules)

const SPEED_THRESHOLDS = [
    { mode: 'WALKING', maxSpeed: 2.0 },
    { mode: 'BIKING',  maxSpeed: 8.3 },
    { mode: 'BUS',     maxSpeed: 16.7 },
    { mode: 'RAIL',    maxSpeed: 27.8 },
    { mode: 'CAR',     maxSpeed: Infinity },
  ];
  
  const EMISSION_FACTORS = {
    WALKING:   0,
    BIKING:    0,
    BUS:       279,
    RAIL:      104,
    CAR:       404,
    RIDESHARE: 404,
  };
  
  export function inferMode(maxSpeed) {
    for (let { mode, maxSpeed: threshold } of SPEED_THRESHOLDS) {
      if (maxSpeed <= threshold) return mode;
    }
    return 'CAR';
  }
  
  export function computeEmissions(distanceMeters, mode) {
    const miles = distanceMeters / 1609.34;
    const factor = EMISSION_FACTORS[mode] ?? EMISSION_FACTORS.CAR;
    return miles * factor;
  }
  
  export function computeCredits(distanceMeters, mode) {
    const carEm = computeEmissions(distanceMeters, 'CAR');
    const actEm = computeEmissions(distanceMeters, mode);
    const avoided = carEm - actEm;
    return Math.max(0, avoided / 100);
  }
  