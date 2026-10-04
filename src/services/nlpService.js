/**
 * Local Rule-Based NLP Extraction Service
 * Extracts structured data from natural language food donations and recipient requirements.
 * Operates 100% locally with zero external API dependencies.
 */

// Helper to convert 12-hour time (e.g., "2 PM", "2:30 pm", "8 PM") to 24-hour "HH:MM"
function parseTimeTo24h(timeStr) {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toLowerCase();
  
  // Match standard 24h: "14:00" or "08:30"
  const m24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const hh = String(parseInt(m24[1], 10)).padStart(2, '0');
    return `${hh}:${m24[2]}`;
  }

  // Match 12h: "2 pm", "2:30 pm", "2pm", "12 am"
  const m12 = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (m12) {
    let hours = parseInt(m12[1], 10);
    const minutes = m12[2] ? m12[2] : '00';
    const period = m12[3].toLowerCase();

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  return null;
}

// Capitalize title
function toTitleCase(str) {
  if (!str) return 'UNKNOWN';
  return str
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Analyzes natural language donor text
 * @param {string} text 
 * @returns {object} Extracted fields
 */
export function analyzeDonationText(text) {
  if (!text || typeof text !== 'string') {
    return {
      foodName: 'UNKNOWN',
      foodCategory: 'UNKNOWN',
      quantity: 1,
      unit: 'packets',
      servings: 1,
      dietType: 'UNKNOWN',
      preparedAt: 'UNKNOWN',
      consumeBefore: 'UNKNOWN',
      urgency: 'MEDIUM',
      storageCondition: 'ROOM_TEMPERATURE',
      allergens: 'None',
      location: 'UNKNOWN'
    };
  }

  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. Diet Type Extraction
  let dietType = 'UNKNOWN';
  if (/\b(non-veg|non-vegetarian|chicken|mutton|meat|fish|beef|pork|seafood)\b/i.test(lower)) {
    dietType = 'NON_VEGETARIAN';
  } else if (/\b(vegan|plant-based)\b/i.test(lower)) {
    dietType = 'VEGAN';
  } else if (/\b(eggetarian|egg-only|contains egg)\b/i.test(lower)) {
    dietType = 'EGGETARIAN';
  } else if (/\b(vegetarian|pure veg|veg)\b/i.test(lower)) {
    dietType = 'VEGETARIAN';
  }

  // 2. Quantity & Unit Extraction
  // Pattern: "40 packets", "25 kg", "50 boxes", "30 meals"
  let quantity = 1;
  let unit = 'packets';
  const qtyRegex = /(\d+(?:\.\d+)?)\s*(packets?|boxes?|plates?|kg|kilograms?|meals?|portions?|loaves|loaf|liters?|litres?|cans?|containers?|bowls?|trays?|servings?|pieces?|buns?)/i;
  const qtyMatch = lower.match(qtyRegex);
  if (qtyMatch) {
    quantity = parseFloat(qtyMatch[1]);
    unit = qtyMatch[2].toLowerCase();
    if (unit.endsWith('s') && !['packets', 'boxes', 'plates', 'meals', 'portions', 'loaves', 'containers', 'bowls', 'trays', 'servings'].includes(unit)) {
      // keep common plural
    }
  }

  // 3. Servings Extraction
  // Pattern: "can serve 40 people", "serve 40 people", "serves 40", "for 40 people"
  let servings = null;
  const servMatch = lower.match(/(?:can\s+)?serv(?:e|es|ing)\s*(?:around|about|approx|up to)?\s*(\d+)/i) ||
                    lower.match(/for\s*(?:around|about|approx)?\s*(\d+)\s*(?:people|persons|individuals|kids|children)/i) ||
                    lower.match(/servings?:\s*(\d+)/i);
  if (servMatch) {
    servings = parseInt(servMatch[1], 10);
  } else {
    // If unit indicates individual portion, use quantity
    if (['packets', 'plates', 'meals', 'portions', 'servings', 'boxes'].includes(unit)) {
      servings = Math.round(quantity);
    } else {
      servings = Math.round(quantity);
    }
  }

  // 4. Food Name & Food Category Extraction
  let foodName = 'UNKNOWN';
  let foodCategory = 'UNKNOWN';

  // Look for: "packets of [Food Name] prepared" or "have [qty] [unit] of [Food Name]"
  const nameOfMatch = raw.match(/(?:\d+)?\s*(?:packets?|boxes?|plates?|kg|meals?|portions?|loaves|cans?|containers?|bowls?|trays?)\s+of\s+([a-zA-Z\s\-]+?)(?=\s+(?:prepared|made|cooked|ready|at|which|that|can|should|before|\.|\,|$))/i);
  if (nameOfMatch && nameOfMatch[1].trim()) {
    foodName = toTitleCase(nameOfMatch[1].trim());
  } else {
    // Fallback: search common food terms
    const foodKeywords = [
      { term: 'vegetarian biryani', name: 'Vegetarian Biryani', category: 'Cooked Food' },
      { term: 'chicken biryani', name: 'Chicken Biryani', category: 'Cooked Food' },
      { term: 'biryani', name: 'Biryani', category: 'Cooked Food' },
      { term: 'veg pulao', name: 'Vegetable Pulao', category: 'Cooked Food' },
      { term: 'pulao', name: 'Pulao', category: 'Cooked Food' },
      { term: 'fried rice', name: 'Fried Rice', category: 'Cooked Food' },
      { term: 'curry', name: 'Curry & Gravy', category: 'Cooked Food' },
      { term: 'sambar rice', name: 'Sambar Rice', category: 'Cooked Food' },
      { term: 'meals', name: 'Cooked Meals', category: 'Cooked Food' },
      { term: 'bread', name: 'Wheat Bread', category: 'Bakery' },
      { term: 'buns', name: 'Buns & Pastries', category: 'Bakery' },
      { term: 'apples', name: 'Fresh Apples', category: 'Fruits' },
      { term: 'fruits', name: 'Fresh Fruits', category: 'Fruits' },
      { term: 'vegetables', name: 'Fresh Vegetables', category: 'Vegetables' },
      { term: 'milk', name: 'Fresh Milk', category: 'Beverages' },
      { term: 'juice', name: 'Fruit Juice', category: 'Beverages' }
    ];

    for (const item of foodKeywords) {
      if (lower.includes(item.term)) {
        foodName = item.name;
        foodCategory = item.category;
        break;
      }
    }
  }

  // Refine Food Category if still UNKNOWN
  if (foodCategory === 'UNKNOWN') {
    if (/\b(biryani|rice|curry|dal|pulao|roti|chapati|noodles|pasta|soup|sambar|cooked food|cooked|gravy|khichdi|paneer|meals?)\b/i.test(lower)) {
      foodCategory = 'Cooked Food';
    } else if (/\b(bread|bun|buns|cake|pastry|pastries|loaf|loaves|croissant|bakery)\b/i.test(lower)) {
      foodCategory = 'Bakery';
    } else if (/\b(fruit|fruits|apple|apples|banana|bananas|orange|oranges|mango|grapes)\b/i.test(lower)) {
      foodCategory = 'Fruits';
    } else if (/\b(vegetable|vegetables|potato|tomato|onion|carrot|cabbage|spinach)\b/i.test(lower)) {
      foodCategory = 'Vegetables';
    } else if (/\b(canned|packaged|biscuit|biscuits|chips|instant|sealed)\b/i.test(lower)) {
      foodCategory = 'Packaged Food';
    } else if (/\b(juice|milk|beverage|tea|coffee|shake|drink)\b/i.test(lower)) {
      foodCategory = 'Beverages';
    } else if (/\b(flour|atta|pulses|raw grains|groceries|sugar|oil)\b/i.test(lower)) {
      foodCategory = 'Groceries';
    } else if (lower.includes('cooked') || lower.includes('prepared')) {
      foodCategory = 'Cooked Food';
    } else {
      foodCategory = 'Cooked Food'; // default standard
    }
  }

  // 5. Prepared At Extraction
  // Pattern: "prepared at 2 PM", "cooked at 14:00", "made at 11 am"
  let preparedAt = 'UNKNOWN';
  const prepMatch = lower.match(/(?:prepared|cooked|made|packed)\s+at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})/i) ||
                    lower.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  if (prepMatch) {
    const t = parseTimeTo24h(prepMatch[1]);
    if (t) preparedAt = t;
  }

  // 6. Consume Before Extraction
  // Pattern: "consumed before 8 PM", "before 8 PM", "by 8:00 PM", "consume before 20:00"
  let consumeBefore = 'UNKNOWN';
  const expMatch = lower.match(/(?:consume(?:d)?\s+)?before\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})/i) ||
                   lower.match(/(?:use|eat|distribute)\s+by\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})/i) ||
                   lower.match(/by\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  if (expMatch) {
    const t = parseTimeTo24h(expMatch[1]);
    if (t) consumeBefore = t;
  }

  // 7. Urgency Extraction
  let urgency = 'MEDIUM';
  if (/\b(urgent|urgently|immediately|asap|within 2 hours|quick)\b/i.test(lower)) {
    urgency = 'HIGH';
  } else if (consumeBefore !== 'UNKNOWN' && preparedAt !== 'UNKNOWN') {
    // If time gap is <= 6 hours, it's high urgency for cooked food
    const [ph, pm] = preparedAt.split(':').map(Number);
    const [ch, cm] = consumeBefore.split(':').map(Number);
    let diff = (ch * 60 + cm) - (ph * 60 + pm);
    if (diff < 0) diff += 24 * 60;
    if (diff <= 360) {
      urgency = 'HIGH';
    } else {
      urgency = 'MEDIUM';
    }
  } else if (foodCategory === 'Cooked Food') {
    urgency = 'HIGH';
  } else if (['Bakery', 'Fruits', 'Vegetables'].includes(foodCategory)) {
    urgency = 'MEDIUM';
  } else {
    urgency = 'LOW';
  }

  // 8. Storage Condition
  let storageCondition = 'ROOM_TEMPERATURE';
  if (/\b(refrigerat(?:ed|e|or)|fridge|keep cool|cold storage)\b/i.test(lower)) {
    storageCondition = 'REFRIGERATED';
  } else if (/\b(frozen|freezer|keep frozen)\b/i.test(lower)) {
    storageCondition = 'FROZEN';
  } else if (/\b(warm|hot|insulated|keep hot)\b/i.test(lower)) {
    storageCondition = 'WARM';
  } else if (/\b(room temperature|normal)\b/i.test(lower)) {
    storageCondition = 'ROOM_TEMPERATURE';
  }

  // 9. Allergens
  const allergenList = [];
  if (/\b(peanut|peanuts|groundnut)\b/i.test(lower)) allergenList.push('Peanuts');
  if (/\b(gluten|wheat)\b/i.test(lower)) allergenList.push('Gluten');
  if (/\b(dairy|milk|cheese|butter)\b/i.test(lower)) allergenList.push('Dairy');
  if (/\b(nut|nuts|cashew|almond|walnut)\b/i.test(lower)) allergenList.push('Nuts');
  if (/\b(soy|soya)\b/i.test(lower)) allergenList.push('Soy');
  if (/\b(egg|eggs)\b/i.test(lower)) allergenList.push('Eggs');
  if (/\b(fish|shellfish|prawn|crab)\b/i.test(lower)) allergenList.push('Seafood');
  const allergens = allergenList.length > 0 ? allergenList.join(', ') : 'None';

  // 10. Location (City / Area)
  let location = 'UNKNOWN';
  const cities = ['chennai', 'coimbatore', 'madurai', 'bangalore', 'mumbai', 'delhi', 'hyderabad', 'trichy', 'salem'];
  for (const c of cities) {
    if (lower.includes(c)) {
      location = toTitleCase(c);
      break;
    }
  }

  return {
    foodName,
    foodCategory,
    quantity,
    unit,
    servings,
    dietType,
    preparedAt,
    consumeBefore,
    urgency,
    storageCondition,
    allergens,
    location
  };
}

/**
 * Analyzes natural language recipient requirement
 * @param {string} text 
 * @returns {object} Extracted fields
 */
export function analyzeRequirementText(text) {
  if (!text || typeof text !== 'string') {
    return {
      foodCategory: 'UNKNOWN',
      dietType: 'UNKNOWN',
      requiredServings: 1,
      requiredBefore: 'UNKNOWN',
      urgency: 'MEDIUM',
      foodName: 'Food',
      location: 'UNKNOWN'
    };
  }

  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. Diet Type
  let dietType = 'UNKNOWN';
  if (/\b(non-veg|non-vegetarian|chicken|mutton|meat|fish)\b/i.test(lower)) {
    dietType = 'NON_VEGETARIAN';
  } else if (/\b(vegan|plant-based)\b/i.test(lower)) {
    dietType = 'VEGAN';
  } else if (/\b(eggetarian|egg)\b/i.test(lower)) {
    dietType = 'EGGETARIAN';
  } else if (/\b(vegetarian|pure veg|veg)\b/i.test(lower)) {
    dietType = 'VEGETARIAN';
  }

  // 2. Food Category
  let foodCategory = 'UNKNOWN';
  if (/\b(cooked food|cooked|biryani|rice|meals?|curry|dal|pulao|dinner|lunch)\b/i.test(lower)) {
    foodCategory = 'Cooked Food';
  } else if (/\b(bread|bun|buns|bakery|snacks|biscuits)\b/i.test(lower)) {
    foodCategory = 'Bakery';
  } else if (/\b(fruit|fruits|apples|oranges)\b/i.test(lower)) {
    foodCategory = 'Fruits';
  } else if (/\b(vegetable|vegetables|raw veg)\b/i.test(lower)) {
    foodCategory = 'Vegetables';
  } else if (/\b(packaged|canned|dry ration)\b/i.test(lower)) {
    foodCategory = 'Packaged Food';
  } else if (/\b(juice|milk|beverage)\b/i.test(lower)) {
    foodCategory = 'Beverages';
  } else if (/\b(groceries|grains|raw pulses)\b/i.test(lower)) {
    foodCategory = 'Groceries';
  } else {
    foodCategory = 'Cooked Food'; // default if requirement implies meal
  }

  // 3. Required Servings
  // Pattern: "for around 35 people", "for 35 people", "need food for 50", "servings: 40"
  let requiredServings = 1;
  const servMatch = lower.match(/(?:for\s+(?:around|about|approx|at least)?\s*|need\s+food\s+for\s*)(\d+)\s*(?:people|persons|individuals|kids|children)?/i) ||
                    lower.match(/(\d+)\s*(?:people|persons|meals|servings|plates)/i);
  if (servMatch) {
    requiredServings = parseInt(servMatch[1], 10);
  }

  // 4. Required Before
  // Pattern: "before 7 PM", "by 7:00 PM", "before 19:00"
  let requiredBefore = 'UNKNOWN';
  const timeMatch = lower.match(/(?:before|by|until)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})/i);
  if (timeMatch) {
    const t = parseTimeTo24h(timeMatch[1]);
    if (t) requiredBefore = t;
  }

  // 5. Urgency
  let urgency = 'MEDIUM';
  if (/\b(urgent|urgently|immediately|critical|emergency|asap)\b/i.test(lower)) {
    urgency = 'HIGH';
  } else if (requiredBefore !== 'UNKNOWN') {
    urgency = 'HIGH';
  } else {
    urgency = 'MEDIUM';
  }

  // 6. Food Name / Preference
  let foodName = foodCategory;
  if (lower.includes('biryani')) foodName = 'Biryani';
  else if (lower.includes('meals')) foodName = 'Cooked Meals';
  else if (lower.includes('bread')) foodName = 'Bread & Bakery';
  else if (lower.includes('fruits')) foodName = 'Fresh Fruits';

  // 7. Location
  let location = 'UNKNOWN';
  const cities = ['chennai', 'coimbatore', 'madurai', 'bangalore', 'mumbai', 'delhi', 'hyderabad', 'trichy', 'salem'];
  for (const c of cities) {
    if (lower.includes(c)) {
      location = toTitleCase(c);
      break;
    }
  }

  return {
    foodCategory,
    dietType,
    requiredServings,
    requiredBefore,
    urgency,
    foodName,
    location
  };
}
