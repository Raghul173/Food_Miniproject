/**
 * FoodShare Mock API Request Handler
 * Emulates the complete FoodShare backend in the browser using localStorage.
 * Enables 100% standalone frontend operation with zero network dependencies.
 */

import { loadDatabase, saveDatabase } from './mockData.js';
import { analyzeDonationText, analyzeRequirementText } from './nlpService.js';
import { calculateMatch } from './matchingService.js';

// Helper to simulate slight natural latency for UI loading states
export function simulateDelay(ms = 60) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseUrl(url) {
  const [pathPart, queryPart] = url.split('?');
  const params = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  }
  return { path: pathPart.replace(/^\/api/, ''), query: params };
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function handleMockRequest(config) {
  await simulateDelay(60);

  const method = (config.method || 'get').toLowerCase();
  const { path, query } = parseUrl(config.url || '');
  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data;
    }
  }

  const db = loadDatabase();
  const currentUser = getCurrentUser();

  const success = (data, message = 'Success', status = 200) => ({
    status,
    statusText: 'OK',
    headers: {},
    config,
    data: { success: true, message, data }
  });

  const error = (message, status = 400, errors = []) => {
    const err = new Error(message);
    err.response = {
      status,
      statusText: 'Error',
      headers: {},
      config,
      data: { success: false, message, errors }
    };
    throw err;
  };

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================
  if (path === '/auth/login' && method === 'post') {
    const { email, password } = body;
    const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (!user) {
      return error('Invalid email or password.', 401);
    }
    if (!user.is_active) {
      return error('Your account has been deactivated or suspended.', 403);
    }

    // Attach profile
    let profile = null;
    if (user.role === 'DONOR') {
      profile = db.donorProfiles.find((p) => p.user_id === user.id) || null;
    } else if (user.role === 'RECIPIENT') {
      profile = db.recipientProfiles.find((p) => p.user_id === user.id) || null;
    }

    const userData = { ...user, profile };
    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`;
    return success({ token: mockToken, user: userData }, 'Login successful');
  }

  if (path === '/auth/register' && method === 'post') {
    const {
      name,
      email,
      phone,
      role,
      organization_type,
      contact_person,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      fssai_license,
      capacity,
      registration_number
    } = body;

    if (!['DONOR', 'RECIPIENT'].includes(role)) {
      return error('Public registration is only permitted for DONOR or RECIPIENT roles.', 400);
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (existing) {
      return error('An account with this email address already exists.', 409);
    }

    const newId = Math.max(0, ...db.users.map((u) => u.id)) + 1;
    const newUser = {
      id: newId,
      name,
      email: email.trim(),
      phone: phone || null,
      role,
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);

    let profile = null;
    if (role === 'DONOR') {
      profile = {
        user_id: newId,
        organization_type: organization_type || 'RESTAURANT',
        contact_person: contact_person || name,
        address: address || '',
        city: city || 'Chennai',
        state: state || 'Tamil Nadu',
        pincode: pincode || '600001',
        latitude: latitude ? parseFloat(latitude) : 13.0827,
        longitude: longitude ? parseFloat(longitude) : 80.2707,
        fssai_license: fssai_license || 'FSSAI-DEMO-001'
      };
      db.donorProfiles.push(profile);
    } else {
      profile = {
        user_id: newId,
        organization_type: organization_type || 'COMMUNITY_CENTER',
        contact_person: contact_person || name,
        address: address || '',
        city: city || 'Chennai',
        state: state || 'Tamil Nadu',
        pincode: pincode || '600001',
        latitude: latitude ? parseFloat(latitude) : 13.0827,
        longitude: longitude ? parseFloat(longitude) : 80.2707,
        capacity: capacity ? parseInt(capacity, 10) : 50,
        registration_number: registration_number || 'NGO-REG-DEMO'
      };
      db.recipientProfiles.push(profile);
    }

    saveDatabase(db);
    const mockToken = `mock-jwt-token-${newId}-${Date.now()}`;
    return success({ token: mockToken, user: { ...newUser, profile } }, 'Registration successful!', 201);
  }

  if (path === '/auth/me' && method === 'get') {
    if (!currentUser) {
      return error('Unauthorized', 401);
    }
    const freshUser = db.users.find((u) => u.id === currentUser.id);
    if (!freshUser || !freshUser.is_active) {
      return error('Unauthorized', 401);
    }

    let profile = null;
    if (freshUser.role === 'DONOR') {
      profile = db.donorProfiles.find((p) => p.user_id === freshUser.id) || null;
    } else if (freshUser.role === 'RECIPIENT') {
      profile = db.recipientProfiles.find((p) => p.user_id === freshUser.id) || null;
    }
    return success({ user: { ...freshUser, profile } });
  }

  if (path === '/auth/logout' && method === 'post') {
    return success({}, 'Logout successful');
  }

  if (path === '/auth/profile' && method === 'put') {
    if (!currentUser) return error('Unauthorized', 401);

    const userIndex = db.users.findIndex((u) => u.id === currentUser.id);
    if (userIndex === -1) return error('User not found', 404);

    if (body.name) db.users[userIndex].name = body.name;
    if (body.phone) db.users[userIndex].phone = body.phone;

    let profile = null;
    if (currentUser.role === 'DONOR') {
      const pIdx = db.donorProfiles.findIndex((p) => p.user_id === currentUser.id);
      if (pIdx !== -1) {
        db.donorProfiles[pIdx] = { ...db.donorProfiles[pIdx], ...body };
        profile = db.donorProfiles[pIdx];
      }
    } else if (currentUser.role === 'RECIPIENT') {
      const pIdx = db.recipientProfiles.findIndex((p) => p.user_id === currentUser.id);
      if (pIdx !== -1) {
        db.recipientProfiles[pIdx] = { ...db.recipientProfiles[pIdx], ...body };
        profile = db.recipientProfiles[pIdx];
      }
    }

    saveDatabase(db);
    const updatedUser = { ...db.users[userIndex], profile };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return success({ user: updatedUser }, 'Profile updated successfully');
  }

  // ==========================================
  // NLP ANALYSIS ROUTES
  // ==========================================
  if (path === '/nlp/analyze-donation' && method === 'post') {
    const text = body.text || '';
    const extracted = analyzeDonationText(text);
    return success(extracted, 'NLP analysis completed successfully.');
  }

  if (path === '/nlp/analyze-requirement' && method === 'post') {
    const text = body.text || '';
    const extracted = analyzeRequirementText(text);
    return success(extracted, 'Requirement NLP analysis completed successfully.');
  }

  // ==========================================
  // ANALYTICS & DASHBOARD STATS
  // ==========================================
  if (path === '/analytics/donor' && method === 'get') {
    const donorId = currentUser?.id || 2;
    const donorDonations = db.donations.filter((d) => d.donor_id === donorId);
    const totalDonations = donorDonations.length;
    const activeDonations = donorDonations.filter((d) => d.status === 'AVAILABLE').length;
    const completedDonations = donorDonations.filter((d) => d.status === 'COMPLETED').length;
    const expiredDonations = donorDonations.filter((d) => d.status === 'EXPIRED').length;

    const completedItems = donorDonations.filter((d) => d.status === 'COMPLETED');
    const totalFoodRescued = completedItems.reduce((acc, d) => acc + (parseFloat(d.quantity) || 0), 0);
    const peopleServed = completedItems.reduce((acc, d) => acc + (parseInt(d.servings, 10) || 0), 0);

    const donorRatings = db.ratings.filter((r) => r.reviewee_id === donorId);
    const reviewCount = donorRatings.length;
    const averageRating = reviewCount
      ? parseFloat((donorRatings.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
      : 5.0;

    const catMap = {};
    donorDonations.forEach((d) => {
      catMap[d.food_category] = (catMap[d.food_category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    const recentDonations = [...donorDonations]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((d) => ({
        id: d.id,
        food_name: d.food_name,
        food_category: d.food_category,
        servings: d.servings,
        status: d.status,
        created_at: d.created_at
      }));

    return success({
      totalDonations,
      activeDonations,
      completedDonations,
      expiredDonations,
      totalFoodRescued: Math.round(totalFoodRescued),
      peopleServed,
      reviewCount,
      averageRating,
      categoryBreakdown,
      recentDonations
    });
  }

  if (path === '/analytics/recipient' && method === 'get') {
    const recipientId = currentUser?.id || 5;
    const userRequests = db.requests.filter((r) => r.recipient_id === recipientId);
    const totalRequests = userRequests.length;
    const pendingRequests = userRequests.filter((r) => r.status === 'PENDING').length;
    const acceptedRequests = userRequests.filter((r) => r.status === 'ACCEPTED').length;
    const completedRequests = userRequests.filter((r) => r.status === 'COMPLETED').length;

    const completed = userRequests.filter((r) => r.status === 'COMPLETED');
    const mealsReceived = completed.reduce((acc, r) => acc + (parseInt(r.requested_servings, 10) || 0), 0);

    const activeRequirements = db.requirements.filter(
      (req) => req.recipient_id === recipientId && req.status === 'OPEN'
    ).length;

    const recentRequests = [...userRequests]
      .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at))
      .slice(0, 5)
      .map((r) => {
        const donation = db.donations.find((d) => d.id === r.donation_id) || {};
        const donor = db.users.find((u) => u.id === donation.donor_id) || {};
        return {
          ...r,
          food_name: donation.food_name || 'Food Item',
          food_category: donation.food_category || 'Cooked Food',
          donor_name: donor.name || 'Anonymous Donor'
        };
      });

    return success({
      totalRequests,
      pendingRequests,
      acceptedRequests,
      completedRequests,
      mealsReceived,
      activeRequirements,
      recentRequests
    });
  }

  if (path === '/analytics/admin' && method === 'get') {
    const totalDonations = db.donations.length;
    const completedDonations = db.donations.filter((d) => d.status === 'COMPLETED').length;
    const cancelledDonations = db.donations.filter((d) => d.status === 'CANCELLED').length;
    const availableDonations = db.donations.filter((d) => d.status === 'AVAILABLE').length;

    const completedList = db.donations.filter((d) => d.status === 'COMPLETED');
    const foodRescued = Math.round(completedList.reduce((acc, d) => acc + (parseFloat(d.quantity) || 0), 0));
    const peopleServed = completedList.reduce((acc, d) => acc + (parseInt(d.servings, 10) || 0), 0);
    const successfulMatches = db.requests.filter((r) => r.status === 'COMPLETED').length;

    const catMap = {};
    db.donations.forEach((d) => {
      catMap[d.food_category] = (catMap[d.food_category] || 0) + 1;
    });
    const categories = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    const statusMap = {};
    db.donations.forEach((d) => {
      statusMap[d.status] = (statusMap[d.status] || 0) + 1;
    });
    const statusDist = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    const dietMap = {};
    db.donations.forEach((d) => {
      dietMap[d.diet_type] = (dietMap[d.diet_type] || 0) + 1;
    });
    const dietDist = Object.entries(dietMap).map(([name, value]) => ({ name, value }));

    const byMonth = [
      { month: 'Nov 2025', count: 12, completed: 10 },
      { month: 'Dec 2025', count: 18, completed: 15 },
      { month: 'Jan 2026', count: 24, completed: 21 },
      { month: 'Feb 2026', count: 32, completed: 28 },
      { month: 'Mar 2026', count: 45, completed: 39 },
      { month: 'Apr 2026', count: totalDonations, completed: completedDonations }
    ];

    const userGrowth = [
      { month: 'Nov 2025', donors: 8, recipients: 12 },
      { month: 'Dec 2025', donors: 14, recipients: 19 },
      { month: 'Jan 2026', donors: 22, recipients: 27 },
      { month: 'Feb 2026', donors: 31, recipients: 38 },
      { month: 'Mar 2026', donors: 42, recipients: 49 },
      { month: 'Apr 2026', donors: db.users.filter((u) => u.role === 'DONOR').length, recipients: db.users.filter((u) => u.role === 'RECIPIENT').length }
    ];

    const recentActivity = [
      { action: 'DONATION_PUBLISHED', details: '{"food_name": "Vegetarian Biryani"}', created_at: new Date().toISOString() },
      { action: 'REQUEST_ACCEPTED', details: '{"request_id": 2}', created_at: new Date().toISOString() },
      { action: 'USER_VERIFIED_BY_ADMIN', details: '{"targetUserId": 6}', created_at: new Date().toISOString() },
      { action: 'RATING_SUBMITTED', details: '{"rating": 5}', created_at: new Date().toISOString() }
    ];

    return success({
      totalDonations,
      completedDonations,
      cancelledDonations,
      availableDonations,
      foodRescued,
      peopleServed,
      successfulMatches,
      byMonth,
      categories,
      statusDist,
      dietDist,
      userGrowth,
      recentActivity
    });
  }

  if (path === '/admin/dashboard' && method === 'get') {
    const totalUsers = db.users.length;
    const totalDonors = db.users.filter((u) => u.role === 'DONOR').length;
    const totalRecipients = db.users.filter((u) => u.role === 'RECIPIENT').length;

    const activeDonations = db.donations.filter((d) => d.status === 'AVAILABLE').length;
    const completedDonations = db.donations.filter((d) => d.status === 'COMPLETED').length;
    const expiredDonations = db.donations.filter((d) => d.status === 'EXPIRED').length;
    const cancelledDonations = db.donations.filter((d) => d.status === 'CANCELLED').length;

    const pendingRequests = db.requests.filter((r) => r.status === 'PENDING').length;
    const acceptedRequests = db.requests.filter((r) => r.status === 'ACCEPTED').length;
    const successfulMatches = db.requests.filter((r) => r.status === 'COMPLETED').length;

    const completedItems = db.donations.filter((d) => d.status === 'COMPLETED');
    const foodRescuedKg = Math.round(completedItems.reduce((acc, d) => acc + (parseFloat(d.quantity) || 0), 0));
    const peopleServed = completedItems.reduce((acc, d) => acc + (parseInt(d.servings, 10) || 0), 0);

    const complaints = db.complaints.length;
    const pendingComplaints = db.complaints.filter((c) => c.status === 'PENDING').length;

    return success({
      totalUsers,
      totalDonors,
      totalRecipients,
      activeDonations,
      pendingRequests,
      completedDonations,
      expiredDonations,
      cancelledDonations,
      successfulMatches,
      peopleServed,
      foodRescuedKg,
      complaints,
      pendingComplaints
    });
  }

  // ==========================================
  // DONATIONS ROUTES
  // ==========================================
  if (path === '/donations' && method === 'get') {
    let rows = db.donations.map((d) => {
      const donor = db.users.find((u) => u.id === d.donor_id) || {};
      const profile = db.donorProfiles.find((p) => p.user_id === d.donor_id) || {};
      const pendingReqs = db.requests.filter((r) => r.donation_id === d.id && r.status === 'PENDING').length;
      return {
        ...d,
        donor_name: donor.name || 'Anonymous Donor',
        donor_phone: donor.phone || '',
        donor_org_type: profile.organization_type || 'RESTAURANT',
        fssai_license: profile.fssai_license || '',
        pending_requests_count: pendingReqs
      };
    });

    if (query.status) {
      rows = rows.filter((d) => d.status === query.status);
    }
    if (query.food_category) {
      rows = rows.filter((d) => d.food_category === query.food_category);
    }
    if (query.diet_type) {
      rows = rows.filter((d) => d.diet_type === query.diet_type);
    }
    if (query.city) {
      rows = rows.filter((d) => (d.city || '').toLowerCase().includes(query.city.toLowerCase()));
    }
    if (query.donor_id) {
      rows = rows.filter((d) => String(d.donor_id) === String(query.donor_id));
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      rows = rows.filter(
        (d) =>
          (d.food_name || '').toLowerCase().includes(s) ||
          (d.description || '').toLowerCase().includes(s) ||
          (d.city || '').toLowerCase().includes(s)
      );
    }

    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (query.limit) {
      rows = rows.slice(0, parseInt(query.limit, 10));
    }

    return success(rows);
  }

  if (path === '/donations' && method === 'post') {
    const donorId = currentUser?.id || 2;
    const newId = Math.max(0, ...db.donations.map((d) => d.id)) + 1;
    const profile = db.donorProfiles.find((p) => p.user_id === donorId) || {};

    const newDonation = {
      id: newId,
      donor_id: donorId,
      food_name: body.food_name || 'Food Donation',
      food_category: body.food_category || 'Cooked Food',
      description: body.description || '',
      quantity: parseFloat(body.quantity) || 1,
      unit: body.unit || 'packets',
      servings: parseInt(body.servings, 10) || 1,
      diet_type: body.diet_type || 'VEGETARIAN',
      prepared_at: body.prepared_at || new Date().toISOString(),
      consume_before: body.consume_before || new Date(Date.now() + 6 * 3600000).toISOString(),
      storage_condition: body.storage_condition || 'ROOM_TEMPERATURE',
      packaging_condition: body.packaging_condition || 'Standard food boxes',
      allergens: body.allergens || 'None',
      pickup_address: body.pickup_address || profile.address || 'Chennai',
      city: body.city || profile.city || 'Chennai',
      state: body.state || profile.state || 'Tamil Nadu',
      pincode: body.pincode || profile.pincode || '600001',
      latitude: body.latitude ? parseFloat(body.latitude) : profile.latitude || 13.0827,
      longitude: body.longitude ? parseFloat(body.longitude) : profile.longitude || 80.2707,
      urgency: body.urgency || 'MEDIUM',
      status: 'AVAILABLE',
      nlp_source_text: body.nlp_source_text || '',
      created_at: new Date().toISOString()
    };

    db.donations.unshift(newDonation);
    saveDatabase(db);
    return success(newDonation, 'Donation published successfully!', 201);
  }

  const matchDonationId = path.match(/^\/donations\/(\d+)$/);
  if (matchDonationId && method === 'delete') {
    const id = parseInt(matchDonationId[1], 10);
    const idx = db.donations.findIndex((d) => d.id === id);
    if (idx !== -1) {
      db.donations[idx].status = 'CANCELLED';
      saveDatabase(db);
    }
    return success({}, 'Donation cancelled successfully.');
  }

  const matchDonationReq = path.match(/^\/donations\/(\d+)\/request$/);
  if (matchDonationReq && method === 'post') {
    const donationId = parseInt(matchDonationReq[1], 10);
    const recipientId = currentUser?.id || 5;
    const donation = db.donations.find((d) => d.id === donationId);

    if (!donation) return error('Donation not found.', 404);
    if (donation.status !== 'AVAILABLE') return error('This donation is no longer available.', 400);

    const newId = Math.max(0, ...db.requests.map((r) => r.id)) + 1;
    const newReq = {
      id: newId,
      donation_id: donationId,
      recipient_id: recipientId,
      requirement_id: body.requirement_id || null,
      requested_servings: parseInt(body.requested_servings, 10) || donation.servings,
      message: body.message || 'Food request submitted.',
      match_score: parseFloat(body.match_score) || 90.0,
      status: 'PENDING',
      requested_at: new Date().toISOString()
    };

    db.requests.push(newReq);

    // Add donor notification
    db.notifications.unshift({
      id: Math.max(0, ...db.notifications.map((n) => n.id)) + 1,
      user_id: donation.donor_id,
      title: 'New Donation Request',
      message: `${currentUser?.name || 'A recipient'} requested ${newReq.requested_servings} servings of "${donation.food_name}".`,
      type: 'REQUEST',
      is_read: false,
      link: '/donor/requests',
      created_at: new Date().toISOString()
    });

    saveDatabase(db);
    return success({ id: newId, donation_id: donationId, status: 'PENDING' }, 'Food request submitted successfully!', 201);
  }

  // ==========================================
  // FOOD REQUIREMENTS ROUTES
  // ==========================================
  if (path === '/requirements' && method === 'get') {
    let rows = db.requirements.map((r) => {
      const rec = db.users.find((u) => u.id === r.recipient_id) || {};
      const profile = db.recipientProfiles.find((p) => p.user_id === r.recipient_id) || {};
      return {
        ...r,
        recipient_name: rec.name || 'Recipient Organization',
        recipient_phone: rec.phone || '',
        recipient_org_type: profile.organization_type || 'COMMUNITY_CENTER',
        recipient_capacity: profile.capacity || 50
      };
    });

    if (query.recipient_id) {
      rows = rows.filter((r) => String(r.recipient_id) === String(query.recipient_id));
    }
    if (query.status) {
      rows = rows.filter((r) => r.status === query.status);
    }
    if (query.food_category) {
      rows = rows.filter((r) => r.food_category === query.food_category);
    }
    if (query.city) {
      rows = rows.filter((r) => (r.city || '').toLowerCase().includes(query.city.toLowerCase()));
    }

    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return success(rows);
  }

  if (path === '/requirements' && method === 'post') {
    const recipientId = currentUser?.id || 5;
    const newId = Math.max(0, ...db.requirements.map((r) => r.id)) + 1;
    const profile = db.recipientProfiles.find((p) => p.user_id === recipientId) || {};

    const newReq = {
      id: newId,
      recipient_id: recipientId,
      source_text: body.source_text || '',
      food_category: body.food_category || 'Cooked Food',
      food_name: body.food_name || 'Cooked Food',
      required_servings: parseInt(body.required_servings, 10) || 20,
      diet_type: body.diet_type || 'VEGETARIAN',
      required_before: body.required_before || new Date(Date.now() + 6 * 3600000).toISOString(),
      urgency: body.urgency || 'MEDIUM',
      city: body.city || profile.city || 'Chennai',
      pincode: body.pincode || profile.pincode || '600001',
      latitude: body.latitude ? parseFloat(body.latitude) : profile.latitude || 13.0750,
      longitude: body.longitude ? parseFloat(body.longitude) : profile.longitude || 80.2600,
      status: 'OPEN',
      created_at: new Date().toISOString()
    };

    db.requirements.unshift(newReq);
    saveDatabase(db);
    return success(newReq, 'Food requirement registered successfully!', 201);
  }

  const matchReqDelete = path.match(/^\/requirements\/(\d+)$/);
  if (matchReqDelete && method === 'delete') {
    const id = parseInt(matchReqDelete[1], 10);
    db.requirements = db.requirements.filter((r) => r.id !== id);
    saveDatabase(db);
    return success({}, 'Requirement deleted.');
  }

  // ==========================================
  // REQUESTS & PICKUPS ROUTES
  // ==========================================
  if (path === '/requests' && method === 'get') {
    const role = currentUser?.role || 'DONOR';
    const userId = currentUser?.id;

    let rows = db.requests.map((dr) => {
      const donation = db.donations.find((d) => d.id === dr.donation_id) || {};
      const recipient = db.users.find((u) => u.id === dr.recipient_id) || {};
      const recProfile = db.recipientProfiles.find((p) => p.user_id === dr.recipient_id) || {};
      const donor = db.users.find((u) => u.id === donation.donor_id) || {};
      const donorProfile = db.donorProfiles.find((p) => p.user_id === donation.donor_id) || {};
      const pickup = db.pickupDetails.find((p) => p.request_id === dr.id) || null;

      return {
        ...dr,
        donor_id: donation.donor_id,
        food_name: donation.food_name || 'Food Item',
        food_category: donation.food_category || 'Cooked Food',
        diet_type: donation.diet_type || 'VEGETARIAN',
        available_servings: donation.servings || 0,
        consume_before: donation.consume_before || '',
        donation_pickup_address: donation.pickup_address || '',
        donation_city: donation.city || '',
        donation_status: donation.status || 'AVAILABLE',
        recipient_name: recipient.name || 'Recipient',
        recipient_email: recipient.email || '',
        recipient_phone: recipient.phone || '',
        recipient_org_type: recProfile.organization_type || 'NGO',
        recipient_address: recProfile.address || '',
        donor_name: donor.name || 'Donor',
        donor_email: donor.email || '',
        donor_phone: donor.phone || '',
        donor_org_type: donorProfile.organization_type || 'RESTAURANT',
        pickup_id: pickup ? pickup.id : null,
        pickup_date: pickup ? pickup.pickup_date : null,
        pickup_time: pickup ? pickup.pickup_time : null,
        pickup_address: pickup ? pickup.pickup_address : null,
        delivery_method: pickup ? pickup.delivery_method : null,
        special_instructions: pickup ? pickup.special_instructions : null,
        pickup_contact_phone: pickup ? pickup.contact_phone : null
      };
    });

    if (role === 'DONOR' && userId) {
      rows = rows.filter((r) => r.donor_id === userId);
    } else if (role === 'RECIPIENT' && userId) {
      rows = rows.filter((r) => r.recipient_id === userId);
    } // ADMIN gets all

    if (query.status) {
      rows = rows.filter((r) => r.status === query.status);
    }
    if (query.donation_id) {
      rows = rows.filter((r) => String(r.donation_id) === String(query.donation_id));
    }

    rows.sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at));
    return success(rows);
  }

  const matchReqAccept = path.match(/^\/requests\/(\d+)\/accept$/);
  if (matchReqAccept && method === 'patch') {
    const requestId = parseInt(matchReqAccept[1], 10);
    const reqItem = db.requests.find((r) => r.id === requestId);
    if (!reqItem) return error('Request not found', 404);

    reqItem.status = 'ACCEPTED';
    const donation = db.donations.find((d) => d.id === reqItem.donation_id);
    if (donation) donation.status = 'ACCEPTED';

    // Add or update pickup details
    const existingPickup = db.pickupDetails.find((p) => p.request_id === requestId);
    const pickupData = {
      id: existingPickup ? existingPickup.id : Math.max(0, ...db.pickupDetails.map((p) => p.id)) + 1,
      request_id: requestId,
      donation_id: reqItem.donation_id,
      pickup_date: body.pickup_date || new Date().toISOString().slice(0, 10),
      pickup_time: body.pickup_time || '17:00:00',
      pickup_address: body.pickup_address || donation?.pickup_address || 'Chennai',
      delivery_method: body.delivery_method || 'SELF_PICKUP',
      special_instructions: body.special_instructions || '',
      contact_phone: body.contact_phone || '+91 9444123456'
    };

    if (existingPickup) {
      Object.assign(existingPickup, pickupData);
    } else {
      db.pickupDetails.push(pickupData);
    }

    // Notify recipient
    db.notifications.unshift({
      id: Math.max(0, ...db.notifications.map((n) => n.id)) + 1,
      user_id: reqItem.recipient_id,
      title: 'Pickup Scheduled',
      message: `Your food request for "${donation?.food_name || 'Food'}" was accepted! Pickup scheduled on ${pickupData.pickup_date}.`,
      type: 'PICKUP',
      is_read: false,
      link: '/recipient/requests',
      created_at: new Date().toISOString()
    });

    saveDatabase(db);
    return success(pickupData, 'Donation request accepted and pickup scheduled.');
  }

  const matchReqReject = path.match(/^\/requests\/(\d+)\/reject$/);
  if (matchReqReject && method === 'patch') {
    const requestId = parseInt(matchReqReject[1], 10);
    const reqItem = db.requests.find((r) => r.id === requestId);
    if (reqItem) {
      reqItem.status = 'REJECTED';
      saveDatabase(db);
    }
    return success({}, 'Request rejected.');
  }

  const matchReqCancel = path.match(/^\/requests\/(\d+)\/cancel$/);
  if (matchReqCancel && method === 'patch') {
    const requestId = parseInt(matchReqCancel[1], 10);
    const reqItem = db.requests.find((r) => r.id === requestId);
    if (reqItem) {
      reqItem.status = 'CANCELLED';
      saveDatabase(db);
    }
    return success({}, 'Request cancelled.');
  }

  const matchReqStatus = path.match(/^\/requests\/(\d+)\/status$/);
  if (matchReqStatus && method === 'patch') {
    const requestId = parseInt(matchReqStatus[1], 10);
    const { status: newStatus } = body;
    const reqItem = db.requests.find((r) => r.id === requestId);
    if (!reqItem) return error('Request not found', 404);

    reqItem.status = newStatus;
    const donation = db.donations.find((d) => d.id === reqItem.donation_id);
    if (donation && newStatus === 'COMPLETED') {
      donation.status = 'COMPLETED';
    }

    saveDatabase(db);
    return success({}, `Status updated to ${newStatus}`);
  }

  // ==========================================
  // MATCHING ALGORITHM ROUTE
  // ==========================================
  if (path === '/matches' && method === 'get') {
    const { requirementId, minScore = 20 } = query;
    const availableDonations = db.donations.filter((d) => d.status === 'AVAILABLE');

    let targetRequirements = [];
    if (requirementId) {
      const found = db.requirements.find((r) => String(r.id) === String(requirementId));
      if (found) targetRequirements = [found];
    } else {
      const recipientId = currentUser?.id || 5;
      targetRequirements = db.requirements.filter((r) => r.recipient_id === recipientId && r.status === 'OPEN');
      if (targetRequirements.length === 0) {
        targetRequirements = db.requirements.slice(0, 1);
      }
    }

    const matches = [];
    for (const req of targetRequirements) {
      for (const don of availableDonations) {
        const donor = db.users.find((u) => u.id === don.donor_id) || {};
        const donorProfile = db.donorProfiles.find((p) => p.user_id === don.donor_id) || {};
        const donationWithDonor = {
          ...don,
          donor_name: donor.name || 'Green Leaf Restaurant',
          donor_phone: donor.phone || '',
          donor_org_type: donorProfile.organization_type || 'RESTAURANT',
          fssai_license: donorProfile.fssai_license || ''
        };

        const matchResult = calculateMatch(don, req);
        if (matchResult.score >= parseInt(minScore, 10)) {
          matches.push({
            donation: donationWithDonor,
            requirement: req,
            ...matchResult
          });
        }
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return success(matches);
  }

  // ==========================================
  // ADMIN ROUTES
  // ==========================================
  if (path === '/admin/users' && method === 'get') {
    let rows = db.users.map((u) => {
      const dp = db.donorProfiles.find((p) => p.user_id === u.id) || {};
      const rp = db.recipientProfiles.find((p) => p.user_id === u.id) || {};
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        is_verified: u.is_verified,
        is_active: u.is_active,
        created_at: u.created_at,
        donor_org: dp.organization_type || null,
        fssai_license: dp.fssai_license || null,
        donor_city: dp.city || null,
        recipient_org: rp.organization_type || null,
        recipient_capacity: rp.capacity || null,
        recipient_city: rp.city || null
      };
    });

    if (query.role) rows = rows.filter((u) => u.role === query.role);
    if (query.is_active !== undefined && query.is_active !== '') {
      const boolActive = query.is_active === 'true' || query.is_active === '1';
      rows = rows.filter((u) => u.is_active === boolActive);
    }
    if (query.is_verified !== undefined && query.is_verified !== '') {
      const boolVerified = query.is_verified === 'true' || query.is_verified === '1';
      rows = rows.filter((u) => u.is_verified === boolVerified);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      rows = rows.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }

    return success(rows);
  }

  const matchUserVerify = path.match(/^\/admin\/users\/(\d+)\/verify$/);
  if (matchUserVerify && method === 'patch') {
    const id = parseInt(matchUserVerify[1], 10);
    const user = db.users.find((u) => u.id === id);
    if (user) {
      user.is_verified = true;
      saveDatabase(db);
    }
    return success({}, 'User verified successfully.');
  }

  const matchUserSuspend = path.match(/^\/admin\/users\/(\d+)\/suspend$/);
  if (matchUserSuspend && method === 'patch') {
    const id = parseInt(matchUserSuspend[1], 10);
    const user = db.users.find((u) => u.id === id);
    if (user) {
      user.is_active = false;
      saveDatabase(db);
    }
    return success({}, 'User account suspended.');
  }

  const matchUserActivate = path.match(/^\/admin\/users\/(\d+)\/activate$/);
  if (matchUserActivate && method === 'patch') {
    const id = parseInt(matchUserActivate[1], 10);
    const user = db.users.find((u) => u.id === id);
    if (user) {
      user.is_active = true;
      saveDatabase(db);
    }
    return success({}, 'User account reactivated.');
  }

  if (path === '/admin/complaints' && method === 'get') {
    let rows = db.complaints.map((c) => {
      const complainant = db.users.find((u) => u.id === c.complainant_id) || {};
      const donation = db.donations.find((d) => d.id === c.donation_id) || {};
      return {
        ...c,
        complainant_name: complainant.name || 'Anonymous User',
        complainant_email: complainant.email || '',
        complainant_role: complainant.role || 'USER',
        food_name: donation.food_name || 'Food item'
      };
    });

    if (query.status) rows = rows.filter((c) => c.status === query.status);
    return success(rows);
  }

  const matchComplaintUpdate = path.match(/^\/admin\/complaints\/(\d+)$/);
  if (matchComplaintUpdate && method === 'patch') {
    const id = parseInt(matchComplaintUpdate[1], 10);
    const complaint = db.complaints.find((c) => c.id === id);
    if (complaint) {
      if (body.status) complaint.status = body.status;
      if (body.resolution_notes) complaint.resolution_notes = body.resolution_notes;
      saveDatabase(db);
    }
    return success({}, 'Complaint updated successfully.');
  }

  // ==========================================
  // NOTIFICATIONS ROUTES
  // ==========================================
  if (path === '/notifications' && method === 'get') {
    const userId = currentUser?.id || 1;
    const userNotes = db.notifications.filter((n) => n.user_id === userId);
    const unreadCount = userNotes.filter((n) => !n.is_read).length;
    return success({
      notifications: userNotes,
      unreadCount
    });
  }

  if (path === '/notifications/read-all' && method === 'patch') {
    const userId = currentUser?.id || 1;
    db.notifications.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    saveDatabase(db);
    return success({}, 'All notifications marked as read.');
  }

  // ==========================================
  // RATINGS ROUTES
  // ==========================================
  if (path === '/ratings' && method === 'post') {
    const reviewerId = currentUser?.id || 5;
    const { request_id, rating, comment } = body;
    const reqItem = db.requests.find((r) => r.id === parseInt(request_id, 10));

    if (!reqItem) return error('Donation request not found.', 404);

    const donation = db.donations.find((d) => d.id === reqItem.donation_id) || {};
    const revieweeId = reviewerId === donation.donor_id ? reqItem.recipient_id : donation.donor_id;

    const newId = Math.max(0, ...db.ratings.map((r) => r.id)) + 1;
    const newRating = {
      id: newId,
      donation_id: reqItem.donation_id,
      request_id: reqItem.id,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating: parseInt(rating, 10) || 5,
      comment: comment || '',
      created_at: new Date().toISOString()
    };

    db.ratings.push(newRating);
    saveDatabase(db);
    return success({ id: newId }, 'Thank you for your rating and feedback!', 201);
  }

  // Catch-all
  console.warn(`[MockAPI] Unhandled route: ${method.toUpperCase()} ${path}`);
  return success([], 'OK');
}
