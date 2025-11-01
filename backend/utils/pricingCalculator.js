const MINIMUM_CHARGE = 400;
const BASE_FEE = 250;

// Suggested per km rates based on vehicle type
const SUGGESTED_RATES = {
  SMALL_VAN: 9,      
  MEDIUM_TRUCK: 18,  
  LARGE_TRUCK: 25, 
  OTHER: 12
};

const LOAD_FEE_RANGES = {
  SMALL_VAN: 150,
  MEDIUM_TRUCK: 200,
  LARGE_TRUCK: 300,
  OTHER: 150
};

function calculatePrice({
  distance,
  baseRate = BASE_FEE,
  perKmRate,
  loadFee = 150,
  helpersCount = 0,
  helperRate = 150,
  moveType = 'APARTMENT'
}) {
  const baseCost = baseRate;
  const distanceCost = distance * perKmRate;
  const loadCost = loadFee;
  const helpersCost = helpersCount * helperRate;

  let subtotal = baseCost + distanceCost + loadCost + helpersCost;

  // Apply move type complexity multiplier
  const complexityMultipliers = {
    APARTMENT: 1.0,
    OFFICE: 1.3,
    SINGLE_ITEM: 0.7,
    OTHER: 1.0,
  };
  
  const multiplier = complexityMultipliers[moveType] || 1.0;
  let total = subtotal * multiplier;

  // Apply minimum charge
  if (total < MINIMUM_CHARGE) {
    total = MINIMUM_CHARGE;
  }

  return {
    baseRate: baseCost,
    distanceCost: Math.round(distanceCost * 100) / 100,
    loadFee: loadCost,
    helpersCost,
    subtotal: Math.round(subtotal * 100) / 100,
    complexityMultiplier: multiplier,
    total: Math.round(total * 100) / 100,
    minimumApplied: subtotal * multiplier < MINIMUM_CHARGE
  };
}

function getSuggestedRates(vehicleType) {
  return {
    perKmRate: SUGGESTED_RATES[vehicleType] || SUGGESTED_RATES.OTHER,
    loadFee: LOAD_FEE_RANGES[vehicleType] || LOAD_FEE_RANGES.OTHER,
    baseRate: BASE_FEE,
    minimumCharge: MINIMUM_CHARGE
  };
}

module.exports = {
  calculatePrice,
  getSuggestedRates,
  MINIMUM_CHARGE,
  BASE_FEE,
  SUGGESTED_RATES,
  LOAD_FEE_RANGES
};