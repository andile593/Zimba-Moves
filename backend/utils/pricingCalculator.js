function validatePricingInputs({ distance, perKmRate, baseRate, loadFee }) {
  const errors = [];

  if (typeof distance !== 'number' || distance < 0) {
    errors.push('Distance must be a non-negative number');
  }

  if (typeof perKmRate !== 'number' || perKmRate < 0) {
    errors.push('Per km rate must be a non-negative number');
  }

  if (typeof baseRate !== 'number' || baseRate <= 0) {
    errors.push('Base rate must be a positive number');
  }

  if (typeof loadFee !== 'number' || loadFee < 0) {
    errors.push('Load fee must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function calculatePrice({
  distance,
  baseRate = 250,
  perKmRate = 0,
  loadFee = 150,
  moveType = 'APARTMENT'
}) {
  // Calculate base costs (no helper charges)
  const distanceCost = distance * perKmRate;
  
  // Subtotal before complexity multiplier
  const subtotal = baseRate + distanceCost + loadFee;

  // Apply move type complexity multiplier
  const complexityMultipliers = {
    APARTMENT: 1.0,
    OFFICE: 1.3,
    SINGLE_ITEM: 0.7,
    OTHER: 1.0,
  };

  const multiplier = complexityMultipliers[moveType] || 1.0;
  let total = subtotal * multiplier;

  // Apply minimum charge of R400
  const minimumCharge = 400;
  const minimumApplied = total < minimumCharge;
  
  if (minimumApplied) {
    total = minimumCharge;
  }

  return {
    baseRate,
    distanceCost: parseFloat(distanceCost.toFixed(2)),
    loadFee,
    helpersCost: 0, // Always 0 - helpers included
    subtotal: parseFloat(subtotal.toFixed(2)),
    complexityMultiplier: multiplier,
    total: parseFloat(total.toFixed(2)),
    minimumApplied
  };
}

module.exports = {
  calculatePrice,
  validatePricingInputs
};