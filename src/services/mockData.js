/**
 * FoodShare Mock Database Seed & Storage
 * Self-contained local storage database with demo accounts, donations,
 * food requirements, requests, pickups, ratings, and analytics.
 */

const STORAGE_KEY = 'foodshare_standalone_db_v1';

export function getInitialData() {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const pastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const todayDateStr = now.toISOString().slice(0, 10);

  const users = [
    {
      id: 1,
      name: 'System Administrator',
      email: 'admin@foodshare.org',
      phone: '+91 9876543210',
      role: 'ADMIN',
      is_verified: true,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      name: 'Green Leaf Restaurant',
      email: 'donor1@foodshare.org',
      phone: '+91 9444123456',
      role: 'DONOR',
      is_verified: true,
      is_active: true,
      created_at: '2026-01-10T00:00:00.000Z'
    },
    {
      id: 3,
      name: 'Royal Feast Catering',
      email: 'donor2@foodshare.org',
      phone: '+91 9444654321',
      role: 'DONOR',
      is_verified: true,
      is_active: true,
      created_at: '2026-01-15T00:00:00.000Z'
    },
    {
      id: 4,
      name: 'Fresh Mart Supermarket',
      email: 'donor3@foodshare.org',
      phone: '+91 9884112233',
      role: 'DONOR',
      is_verified: true,
      is_active: true,
      created_at: '2026-02-01T00:00:00.000Z'
    },
    {
      id: 5,
      name: 'Hope Community Center',
      email: 'recipient1@foodshare.org',
      phone: '+91 9940123789',
      role: 'RECIPIENT',
      is_verified: true,
      is_active: true,
      created_at: '2026-01-05T00:00:00.000Z'
    },
    {
      id: 6,
      name: 'Karuna Orphanage Trust',
      email: 'recipient2@foodshare.org',
      phone: '+91 9840987654',
      role: 'RECIPIENT',
      is_verified: true,
      is_active: true,
      created_at: '2026-01-20T00:00:00.000Z'
    },
    {
      id: 7,
      name: 'Anbu Shelter Home',
      email: 'recipient3@foodshare.org',
      phone: '+91 9790554433',
      role: 'RECIPIENT',
      is_verified: true,
      is_active: true,
      created_at: '2026-02-10T00:00:00.000Z'
    }
  ];

  const donorProfiles = [
    {
      user_id: 2,
      organization_type: 'RESTAURANT',
      contact_person: 'Ramesh Kumar',
      address: '12 Anna Salai, T. Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      latitude: 13.0827,
      longitude: 80.2707,
      fssai_license: 'FSSAI-12423001000123'
    },
    {
      user_id: 3,
      organization_type: 'HOTEL',
      contact_person: 'Anand Raj',
      address: '45 Sterling Road, Nungambakkam',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600034',
      latitude: 13.0600,
      longitude: 80.2500,
      fssai_license: 'FSSAI-12423001000456'
    },
    {
      user_id: 4,
      organization_type: 'SUPERMARKET',
      contact_person: 'Priya Sundaram',
      address: '88 Cross Cut Road, Gandhipuram',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641012',
      latitude: 11.0168,
      longitude: 76.9558,
      fssai_license: 'FSSAI-12423001000789'
    }
  ];

  const recipientProfiles = [
    {
      user_id: 5,
      organization_type: 'COMMUNITY_CENTER',
      contact_person: 'Sister Mary',
      address: '24 Pantheon Road, Egmore',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600008',
      latitude: 13.0750,
      longitude: 80.2600,
      capacity: 120,
      registration_number: 'NGO-TN-2018-8834'
    },
    {
      user_id: 6,
      organization_type: 'ORPHANAGE',
      contact_person: 'Venkatesh S',
      address: '102 Cathedral Road, Gopalapuram',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600086',
      latitude: 13.0500,
      longitude: 80.2400,
      capacity: 80,
      registration_number: 'TRUST-TN-2015-1129'
    },
    {
      user_id: 7,
      organization_type: 'SHELTER',
      contact_person: 'Murugan K',
      address: '15 Avinashi Road, Peelamedu',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641004',
      latitude: 11.0200,
      longitude: 76.9600,
      capacity: 65,
      registration_number: 'NGO-TN-2020-4491'
    }
  ];

  const donations = [
    {
      id: 1,
      donor_id: 2,
      food_name: 'Vegetarian Biryani',
      food_category: 'Cooked Food',
      description: 'Freshly prepared vegetarian biryani with flavorful spiced basmati rice, vegetables, and raita.',
      quantity: 40,
      unit: 'packets',
      servings: 40,
      diet_type: 'VEGETARIAN',
      prepared_at: twoHoursAgo,
      consume_before: sixHoursLater,
      storage_condition: 'ROOM_TEMPERATURE',
      packaging_condition: 'Individual insulated foil meal boxes',
      allergens: 'None',
      pickup_address: '12 Anna Salai, T. Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      latitude: 13.0827,
      longitude: 80.2707,
      urgency: 'HIGH',
      status: 'AVAILABLE',
      nlp_source_text: 'We have 40 packets of vegetarian biryani prepared at 2 PM. It can serve 40 people and should be consumed before 8 PM.',
      created_at: twoHoursAgo
    },
    {
      id: 2,
      donor_id: 2,
      food_name: 'Assorted Wheat Bread and Dinner Buns',
      food_category: 'Bakery',
      description: 'Unsold evening batch of fresh whole wheat sandwich loaves and soft dinner buns, hygienically wrapped.',
      quantity: 25,
      unit: 'loaves',
      servings: 50,
      diet_type: 'VEGAN',
      prepared_at: twoHoursAgo,
      consume_before: twentyFourHoursLater,
      storage_condition: 'ROOM_TEMPERATURE',
      packaging_condition: 'Food-grade sealed polybags',
      allergens: 'Gluten',
      pickup_address: '12 Anna Salai, T. Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      latitude: 13.0827,
      longitude: 80.2707,
      urgency: 'MEDIUM',
      status: 'AVAILABLE',
      nlp_source_text: 'We have 25 loaves of assorted wheat bread and buns baked this morning. Suitable for around 50 people.',
      created_at: twoHoursAgo
    },
    {
      id: 3,
      donor_id: 3,
      food_name: 'Mixed Veg Pulao & Dal Tadka',
      food_category: 'Cooked Food',
      description: 'Surplus catering banquet food kept at continuous warm storage in stainless steel insulated containers.',
      quantity: 60,
      unit: 'meals',
      servings: 60,
      diet_type: 'VEGETARIAN',
      prepared_at: twoHoursAgo,
      consume_before: sixHoursLater,
      storage_condition: 'WARM',
      packaging_condition: 'Stainless steel catering containers',
      allergens: 'None',
      pickup_address: '45 Sterling Road, Nungambakkam',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600034',
      latitude: 13.0600,
      longitude: 80.2500,
      urgency: 'HIGH',
      status: 'AVAILABLE',
      nlp_source_text: '60 meals of hot mixed veg pulao with yellow dal tadka prepared for wedding reception.',
      created_at: twoHoursAgo
    },
    {
      id: 4,
      donor_id: 4,
      food_name: 'Fresh Seasonal Fruit Crates',
      food_category: 'Fruits',
      description: 'Crates of ripe sweet apples, Nagpur oranges, and bananas suitable for immediate distribution.',
      quantity: 15,
      unit: 'kg',
      servings: 30,
      diet_type: 'VEGAN',
      prepared_at: null,
      consume_before: twentyFourHoursLater,
      storage_condition: 'ROOM_TEMPERATURE',
      packaging_condition: 'Ventilated wooden crates',
      allergens: 'None',
      pickup_address: '88 Cross Cut Road, Gandhipuram',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641012',
      latitude: 11.0168,
      longitude: 76.9558,
      urgency: 'MEDIUM',
      status: 'AVAILABLE',
      nlp_source_text: '15 kg of sweet seasonal fruit crates available for donation to local shelters.',
      created_at: twoHoursAgo
    },
    {
      id: 5,
      donor_id: 3,
      food_name: 'South Indian Rice & Sambar Meals',
      food_category: 'Cooked Food',
      description: 'Hygienic traditional South Indian meals with steamed rice, sambar, kootu, and appalam.',
      quantity: 30,
      unit: 'plates',
      servings: 30,
      diet_type: 'VEGETARIAN',
      prepared_at: pastDay,
      consume_before: pastDay,
      storage_condition: 'ROOM_TEMPERATURE',
      packaging_condition: 'Banana leaf lined meal boxes',
      allergens: 'None',
      pickup_address: '45 Sterling Road, Nungambakkam',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600034',
      latitude: 13.0600,
      longitude: 80.2500,
      urgency: 'LOW',
      status: 'COMPLETED',
      nlp_source_text: '30 plates of South Indian meals donated and successfully delivered.',
      created_at: pastDay
    }
  ];

  const requirements = [
    {
      id: 1,
      recipient_id: 5,
      source_text: 'We need vegetarian cooked food for around 35 people before 7 PM.',
      food_category: 'Cooked Food',
      food_name: 'Cooked Food',
      required_servings: 35,
      diet_type: 'VEGETARIAN',
      required_before: sixHoursLater,
      urgency: 'HIGH',
      city: 'Chennai',
      pincode: '600008',
      latitude: 13.0750,
      longitude: 80.2600,
      status: 'OPEN',
      created_at: twoHoursAgo
    },
    {
      id: 2,
      recipient_id: 6,
      source_text: 'Need nutritious bakery items or wholesome evening snack for 40 orphan children.',
      food_category: 'Bakery',
      food_name: 'Bakery / Snack',
      required_servings: 40,
      diet_type: 'VEGETARIAN',
      required_before: twentyFourHoursLater,
      urgency: 'MEDIUM',
      city: 'Chennai',
      pincode: '600086',
      latitude: 13.0500,
      longitude: 80.2400,
      status: 'OPEN',
      created_at: twoHoursAgo
    },
    {
      id: 3,
      recipient_id: 7,
      source_text: 'Urgent requirement for fresh fruits and wholesome food for 25 homeless elders.',
      food_category: 'Fruits',
      food_name: 'Fresh Fruits',
      required_servings: 25,
      diet_type: 'VEGAN',
      required_before: sixHoursLater,
      urgency: 'HIGH',
      city: 'Coimbatore',
      pincode: '641004',
      latitude: 11.0200,
      longitude: 76.9600,
      status: 'OPEN',
      created_at: twoHoursAgo
    }
  ];

  const requests = [
    {
      id: 1,
      donation_id: 3,
      recipient_id: 5,
      requirement_id: 1,
      requested_servings: 35,
      message: 'Hope Community Center requests 35 meals of Veg Pulao for evening shelter dinner.',
      match_score: 94.00,
      status: 'PENDING',
      requested_at: twoHoursAgo
    },
    {
      id: 2,
      donation_id: 2,
      recipient_id: 6,
      requirement_id: 2,
      requested_servings: 25,
      message: 'Karuna Orphanage requests whole wheat bread and dinner buns for evening children snack.',
      match_score: 88.00,
      status: 'ACCEPTED',
      requested_at: twoHoursAgo
    },
    {
      id: 3,
      donation_id: 5,
      recipient_id: 5,
      requirement_id: 1,
      requested_servings: 30,
      message: 'Delivered 30 South Indian meals to community members.',
      match_score: 92.00,
      status: 'COMPLETED',
      requested_at: pastDay
    },
    {
      id: 4,
      donation_id: 4,
      recipient_id: 7,
      requirement_id: 3,
      requested_servings: 25,
      message: 'Anbu Shelter Home requests fresh fruit crates for elderly residents.',
      match_score: 95.00,
      status: 'PENDING',
      requested_at: twoHoursAgo
    },
    {
      id: 5,
      donation_id: 1,
      recipient_id: 6,
      requirement_id: 2,
      requested_servings: 30,
      message: 'Karuna Trust requests 30 packets of Veg Biryani for lunch distribution.',
      match_score: 90.00,
      status: 'PENDING',
      requested_at: twoHoursAgo
    }
  ];

  const pickupDetails = [
    {
      id: 1,
      request_id: 2,
      donation_id: 2,
      pickup_date: todayDateStr,
      pickup_time: '16:30:00',
      pickup_address: '12 Anna Salai, T. Nagar, Chennai',
      delivery_method: 'SELF_PICKUP',
      special_instructions: 'Please check in at the reception dispatch gate. Bring insulated crates.',
      contact_phone: '+91 9444123456'
    },
    {
      id: 2,
      request_id: 3,
      donation_id: 5,
      pickup_date: todayDateStr,
      pickup_time: '13:00:00',
      pickup_address: '45 Sterling Road, Nungambakkam, Chennai',
      delivery_method: 'DONOR_DELIVERY',
      special_instructions: 'Delivered directly to community hall door #2.',
      contact_phone: '+91 9444654321'
    }
  ];

  const ratings = [
    {
      id: 1,
      donation_id: 5,
      request_id: 3,
      reviewer_id: 5,
      reviewee_id: 3,
      rating: 5,
      comment: 'Exceptional quality hot meals delivered punctually! Served 30 people in our shelter.',
      created_at: pastDay
    },
    {
      id: 2,
      donation_id: 5,
      request_id: 3,
      reviewer_id: 3,
      reviewee_id: 5,
      rating: 5,
      comment: 'Hope Community Center is well-organized, respectful, and transparent. Happy to partner again.',
      created_at: pastDay
    }
  ];

  const complaints = [
    {
      id: 1,
      complainant_id: 5,
      donation_id: 3,
      subject: 'Inquiry regarding packing containers',
      description: 'Requested clarification whether stainless steel trays need to be returned after event.',
      status: 'RESOLVED',
      resolution_notes: 'Donor clarified containers are disposable food boxes, no return required.',
      created_at: pastDay
    },
    {
      id: 2,
      complainant_id: 7,
      donation_id: 4,
      subject: 'Transit route query',
      description: 'Seeking volunteer assistance for heavy fruit crate transportation in Coimbatore.',
      status: 'PENDING',
      resolution_notes: null,
      created_at: twoHoursAgo
    }
  ];

  const notifications = [
    {
      id: 1,
      user_id: 2,
      title: 'New Donation Request',
      message: 'Hope Community Center requested 35 servings from your Vegetarian Biryani donation.',
      type: 'REQUEST',
      is_read: false,
      link: '/donor/requests',
      created_at: twoHoursAgo
    },
    {
      id: 2,
      user_id: 3,
      title: 'New Donation Request',
      message: 'Hope Community Center requested 35 meals of Mixed Veg Pulao.',
      type: 'REQUEST',
      is_read: false,
      link: '/donor/requests',
      created_at: twoHoursAgo
    },
    {
      id: 3,
      user_id: 6,
      title: 'Pickup Scheduled',
      message: 'Green Leaf Restaurant confirmed your pickup for Assorted Wheat Bread at 4:30 PM today.',
      type: 'PICKUP',
      is_read: false,
      link: '/recipient/requests',
      created_at: twoHoursAgo
    },
    {
      id: 4,
      user_id: 5,
      title: 'Donation Completed & Rated',
      message: 'Your South Indian Meals request has been completed and verified.',
      type: 'COMPLETED',
      is_read: true,
      link: '/recipient/history',
      created_at: pastDay
    },
    {
      id: 5,
      user_id: 1,
      title: 'System Health Check',
      message: 'Frontend standalone mode active. All components & NLP matching operational.',
      type: 'SYSTEM',
      is_read: true,
      link: '/admin/dashboard',
      created_at: twoHoursAgo
    }
  ];

  return {
    users,
    donorProfiles,
    recipientProfiles,
    donations,
    requirements,
    requests,
    pickupDetails,
    ratings,
    complaints,
    notifications
  };
}

export function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.users && parsed.donations) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading mock database from localStorage, initializing fresh:', err);
  }
  const fresh = getInitialData();
  saveDatabase(fresh);
  return fresh;
}

export function saveDatabase(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save mock database to localStorage:', err);
  }
}
