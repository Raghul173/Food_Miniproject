/**
 * Intelligent Explainable Matching Algorithm
 * Calculates transparent 0-100 weighted matching score between
 * food donations and recipient requirements with human-readable explanations.
 * 
 * Weights:
 * - Food category: 25%
 * - Diet compatibility: 20%
 * - Quantity/servings: 20%
 * - Time compatibility: 15%
 * - Location: 10% (Haversine formula or city/pincode fallback)
 * - Urgency: 10%
 */

// Haversine formula to calculate great-circle distance in kilometers
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const numLat1 = parseFloat(lat1);
  const numLon1 = parseFloat(lon1);
  const numLat2 = parseFloat(lat2);
  const numLon2 = parseFloat(lon2);

  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;

  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(numLat2 - numLat1);
  const dLon = toRad(numLon2 - numLon1);
  const rLat1 = toRad(numLat1);
  const rLat2 = toRad(numLat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates match score and reasons between a donation and a recipient requirement
 * @param {object} donation 
 * @param {object} requirement 
 * @returns {object} { score: number, reasons: string[], breakdown: object }
 */
export function calculateMatch(donation, requirement) {
  let score = 0;
  const reasons = [];
  const breakdown = {
    category: { weight: 25, score: 0, reason: '' },
    diet: { weight: 20, score: 0, reason: '' },
    servings: { weight: 20, score: 0, reason: '' },
    time: { weight: 15, score: 0, reason: '' },
    location: { weight: 10, score: 0, reason: '' },
    urgency: { weight: 10, score: 0, reason: '' },
  };

  // 1. Food Category (25 points)
  const donCat = (donation.food_category || '').trim().toLowerCase();
  const reqCat = (requirement.food_category || '').trim().toLowerCase();

  if (donCat === reqCat && donCat !== '') {
    breakdown.category.score = 25;
    breakdown.category.reason = `✓ Food category matches (${donation.food_category})`;
    reasons.push(breakdown.category.reason);
  } else if (
    (reqCat.includes('cooked') && donCat.includes('cooked')) ||
    (reqCat.includes('fruit') && donCat.includes('fruit')) ||
    (reqCat.includes('vegetable') && donCat.includes('vegetable')) ||
    (reqCat.includes('bakery') && donCat.includes('bakery')) ||
    reqCat === 'other'
  ) {
    breakdown.category.score = 20;
    breakdown.category.reason = `✓ Food category compatible (${donation.food_category})`;
    reasons.push(breakdown.category.reason);
  } else {
    breakdown.category.score = 5;
    breakdown.category.reason = `~ Food category differs (${donation.food_category} vs requested ${requirement.food_category})`;
    reasons.push(breakdown.category.reason);
  }
  score += breakdown.category.score;

  // 2. Diet Compatibility (20 points)
  const donDiet = (donation.diet_type || 'UNKNOWN').toUpperCase();
  const reqDiet = (requirement.diet_type || 'UNKNOWN').toUpperCase();

  if (reqDiet === 'VEGAN') {
    if (donDiet === 'VEGAN') {
      breakdown.diet.score = 20;
      breakdown.diet.reason = '✓ Vegan requirement strictly satisfied';
      reasons.push(breakdown.diet.reason);
    } else {
      breakdown.diet.score = 0;
      breakdown.diet.reason = `✗ Not certified vegan (${donDiet})`;
      reasons.push(breakdown.diet.reason);
    }
  } else if (reqDiet === 'VEGETARIAN') {
    if (donDiet === 'VEGETARIAN' || donDiet === 'VEGAN') {
      breakdown.diet.score = 20;
      breakdown.diet.reason = '✓ Vegetarian requirement matches';
      reasons.push(breakdown.diet.reason);
    } else {
      breakdown.diet.score = 0;
      breakdown.diet.reason = `✗ Non-vegetarian / contains egg, incompatible with vegetarian requirement`;
      reasons.push(breakdown.diet.reason);
    }
  } else if (reqDiet === 'EGGETARIAN') {
    if (['VEGETARIAN', 'VEGAN', 'EGGETARIAN'].includes(donDiet)) {
      breakdown.diet.score = 20;
      breakdown.diet.reason = '✓ Eggetarian diet requirement satisfied';
      reasons.push(breakdown.diet.reason);
    } else {
      breakdown.diet.score = 0;
      breakdown.diet.reason = '✗ Contains meat / non-vegetarian ingredients';
      reasons.push(breakdown.diet.reason);
    }
  } else if (reqDiet === 'NON_VEGETARIAN') {
    // Non-vegetarian recipients can consume all types
    breakdown.diet.score = 20;
    breakdown.diet.reason = '✓ Diet compatibility confirmed';
    reasons.push(breakdown.diet.reason);
  } else {
    // UNKNOWN
    breakdown.diet.score = 15;
    breakdown.diet.reason = `~ Diet type general match (${donDiet})`;
    reasons.push(breakdown.diet.reason);
  }
  score += breakdown.diet.score;

  // 3. Quantity / Servings (20 points)
  const donServings = parseInt(donation.servings || 1, 10);
  const reqServings = parseInt(requirement.required_servings || 1, 10);

  if (donServings >= reqServings) {
    breakdown.servings.score = 20;
    breakdown.servings.reason = `✓ Enough servings available (${donServings} available vs ${reqServings} required)`;
    reasons.push(breakdown.servings.reason);
  } else if (donServings > 0 && reqServings > 0) {
    const ratio = donServings / reqServings;
    const partialScore = Math.max(5, Math.round(20 * ratio));
    breakdown.servings.score = partialScore;
    breakdown.servings.reason = `~ Partial servings available (${donServings} of ${reqServings} needed - ${Math.round(ratio * 100)}%)`;
    reasons.push(breakdown.servings.reason);
  } else {
    breakdown.servings.score = 5;
    breakdown.servings.reason = '✗ Quantity insufficient';
    reasons.push(breakdown.servings.reason);
  }
  score += breakdown.servings.score;

  // 4. Time Compatibility (15 points)
  const now = new Date();
  const donExp = donation.consume_before ? new Date(donation.consume_before) : null;
  const reqTime = requirement.required_before ? new Date(requirement.required_before) : null;

  if (donExp && donExp < now) {
    breakdown.time.score = 0;
    breakdown.time.reason = '✗ Donation has passed its consumption deadline';
    reasons.push(breakdown.time.reason);
  } else if (donExp && reqTime) {
    // If donation expires after or roughly at recipient requirement time
    if (donExp >= reqTime) {
      breakdown.time.score = 15;
      breakdown.time.reason = `✓ Deadline is compatible (Good until ${donExp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, needed by ${reqTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
      reasons.push(breakdown.time.reason);
    } else {
      // Expires before requirement
      const diffHours = (reqTime - donExp) / (1000 * 60 * 60);
      if (diffHours <= 1.5) {
        breakdown.time.score = 8;
        breakdown.time.reason = '~ Food expires shortly before required time (immediate pickup needed)';
        reasons.push(breakdown.time.reason);
      } else {
        breakdown.time.score = 2;
        breakdown.time.reason = '✗ Food expires well before recipient distribution time';
        reasons.push(breakdown.time.reason);
      }
    }
  } else if (donExp) {
    // Check if donation has at least 2 hours freshness remaining
    const hoursLeft = (donExp - now) / (1000 * 60 * 60);
    if (hoursLeft >= 2) {
      breakdown.time.score = 15;
      breakdown.time.reason = `✓ Adequate freshness window (${Math.round(hoursLeft)} hours left)`;
      reasons.push(breakdown.time.reason);
    } else {
      breakdown.time.score = 8;
      breakdown.time.reason = '~ Limited consumption window remaining';
      reasons.push(breakdown.time.reason);
    }
  } else {
    breakdown.time.score = 10;
    breakdown.time.reason = '✓ Standard timeline';
    reasons.push(breakdown.time.reason);
  }
  score += breakdown.time.score;

  // 5. Location (10 points)
  const distanceKm = calculateHaversineDistance(
    donation.latitude,
    donation.longitude,
    requirement.latitude,
    requirement.longitude
  );

  if (distanceKm !== null) {
    if (distanceKm <= 5) {
      breakdown.location.score = 10;
      breakdown.location.reason = `✓ Donor is nearby (~${distanceKm.toFixed(1)} km)`;
    } else if (distanceKm <= 15) {
      breakdown.location.score = 8;
      breakdown.location.reason = `✓ Within local distribution reach (~${distanceKm.toFixed(1)} km)`;
    } else if (distanceKm <= 30) {
      breakdown.location.score = 5;
      breakdown.location.reason = `~ Moderate transit distance (~${distanceKm.toFixed(1)} km)`;
    } else {
      breakdown.location.score = 2;
      breakdown.location.reason = `! Extended transit distance (~${distanceKm.toFixed(1)} km)`;
    }
    reasons.push(breakdown.location.reason);
  } else {
    // Fallback: city / pincode string matching
    const donCity = (donation.city || '').trim().toLowerCase();
    const reqCity = (requirement.city || '').trim().toLowerCase();
    const donPin = (donation.pincode || '').trim();
    const reqPin = (requirement.pincode || '').trim();

    if (donCity && reqCity && donCity === reqCity) {
      if (donPin && reqPin && donPin === reqPin) {
        breakdown.location.score = 10;
        breakdown.location.reason = `✓ Donor in same postal area (${donation.city} - ${donPin})`;
      } else {
        breakdown.location.score = 8;
        breakdown.location.reason = `✓ Donor located in same city (${donation.city})`;
      }
    } else if (!reqCity || !donCity) {
      breakdown.location.score = 6;
      breakdown.location.reason = '~ Location coordinates unavailable; local dispatch recommended';
    } else {
      breakdown.location.score = 2;
      breakdown.location.reason = `! Different cities (${donation.city || 'N/A'} vs ${requirement.city || 'N/A'})`;
    }
    reasons.push(breakdown.location.reason);
  }
  score += breakdown.location.score;

  // 6. Urgency (10 points)
  const donUrg = (donation.urgency || 'MEDIUM').toUpperCase();
  const reqUrg = (requirement.urgency || 'MEDIUM').toUpperCase();

  if (donUrg === reqUrg) {
    breakdown.urgency.score = 10;
    breakdown.urgency.reason = `✓ Urgency level aligned (${donation.urgency})`;
  } else if (donUrg === 'HIGH' || reqUrg === 'HIGH') {
    breakdown.urgency.score = 8;
    breakdown.urgency.reason = '✓ High-priority dispatch match';
  } else {
    breakdown.urgency.score = 6;
    breakdown.urgency.reason = '✓ Standard dispatch timeline';
  }
  reasons.push(breakdown.urgency.reason);
  score += breakdown.urgency.score;

  // Final bounded score
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    score: finalScore,
    matchPercentage: `${finalScore}% Match`,
    reasons,
    breakdown
  };
}
