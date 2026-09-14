// WorkBloom In-Memory API Server for AI Studio
import url from 'node:url';

// In-memory data store
const state = {
  users: [
    {
      id: 1,
      employeeId: 1,
      fullName: 'Maya Lin',
      email: 'maya.lin@workbloom.internal',
      department: 'Experience & Culture',
      designation: 'Senior Experience Designer',
      profileImage: '',
      generatedAt: '2025-01-15T09:00:00.000Z',
      recognitionReceivedCount: 14,
      communityPostCount: 8,
      latestMood: 'Steady',
      latestStressLevel: 3,
      latestEnergyLevel: 8,
      unreadNotificationCount: 2,
    },
  ],
  events: [
    {
      id: 1,
      title: 'Mindful Morning Breathwork',
      startDate: '2026-09-16T10:00:00Z',
      location: 'Wellness Studio & Virtual Room',
      eventType: 'Wellness',
      description: 'A 20-minute guided nervous-system reset before the day begins.',
    },
    {
      id: 2,
      title: 'Design Systems & Human Rhythms',
      startDate: '2026-09-18T14:30:00Z',
      location: 'Innovation Hub · Hall 3',
      eventType: 'Learning',
      description: 'Exploring sustainable pacing, quiet focus, and craft in fast environments.',
    },
    {
      id: 3,
      title: 'Autumn Equinox Garden Walk',
      startDate: '2026-09-21T16:00:00Z',
      location: 'Courtyard & Greenhouse Pavilion',
      eventType: 'Community',
      description: 'Seasonal stroll with the Botanical Circle. Fresh herbal tea provided.',
    },
    {
      id: 4,
      title: 'Ergonomics & Desk Reset Clinic',
      startDate: '2026-09-25T11:00:00Z',
      location: 'Wellness Hub',
      eventType: 'Health',
      description: 'Quick postural adjustments and screen fatigue relief with our physical therapist.',
    },
  ],
  destinations: [
    {
      id: 1,
      name: 'Kyoto Forest Sanctuary',
      location: 'Kitayama Cedar Groves, Kyoto',
      description: 'Traditional wood pavilions, natural hot cedar baths, and silent forest walking trails.',
      type: 'Sanctuary',
      rating: 4.9,
    },
    {
      id: 2,
      name: 'Dolomite High Alpine Refuge',
      location: 'Val di Funes, Italy',
      description: 'Crisp mountain air, zero-notification cabins, and panoramic wildflower paths.',
      type: 'Mountain',
      rating: 4.95,
    },
    {
      id: 3,
      name: 'Big Sur Coastal Restpoint',
      location: 'Highway 1, California',
      description: 'Dramatic Pacific cliffs, fragrant eucalyptus groves, and reading pavilions.',
      type: 'Coast',
      rating: 4.88,
    },
    {
      id: 4,
      name: 'Nordic Pine & Lake Sauna Retreat',
      location: 'Saimaa Archipelago, Finland',
      description: 'Gentle woodfire warmth, cold plunge docks, and quiet aurora watching decks.',
      type: 'Lake',
      rating: 4.92,
    },
  ],
  clubs: [
    {
      id: 1,
      name: 'Botanical Circle & Green Desks',
      description: 'Plant lovers sharing cuttings, indoor cultivation tips, and greenhouse shifts.',
      membersCount: 42,
      category: 'Nature',
    },
    {
      id: 2,
      name: 'Mindful Makers & Coders',
      description: 'Software artisans championing thoughtful architecture, slow coding, and low-stress delivery.',
      membersCount: 68,
      category: 'Craft',
    },
    {
      id: 3,
      name: 'Wild Trail Walkers',
      description: 'Weekend hikes, ridge strolls, and restorative lunch-hour outdoor laps.',
      membersCount: 51,
      category: 'Outdoor',
    },
    {
      id: 4,
      name: 'The Quiet Essay & Book Guild',
      description: 'A monthly gathering discussing restorative writing, poetry, and philosophy.',
      membersCount: 37,
      category: 'Literature',
    },
  ],
  courses: [
    {
      id: 1,
      courseName: 'Pacing & Boundary Setting in Creative Work',
      title: 'Pacing & Boundary Setting in Creative Work',
      description: 'Practical tools for establishing sustainable daily cadences without diminishing output quality.',
      duration: '4 modules · 35 min total',
      instructor: 'Dr. Elena Rossi',
    },
    {
      id: 2,
      courseName: 'Restorative Micro-Breaks for Knowledge Workers',
      title: 'Restorative Micro-Breaks for Knowledge Workers',
      description: 'Evidence-backed 3-minute physical and ocular breaks that rebuild cognitive clarity.',
      duration: '3 modules · 20 min total',
      instructor: 'Kenji Takahashi, PT',
    },
    {
      id: 3,
      courseName: 'Empathetic Peer Mentorship & Buddying',
      title: 'Empathetic Peer Mentorship & Buddying',
      description: 'How to show up for teammates with psychological safety, active listening, and calm support.',
      duration: '5 modules · 45 min total',
      instructor: 'Sarah Jenkins',
    },
  ],
  impact: [
    {
      id: 1,
      title: 'Urban School Garden Soil & Seedling Prep',
      description: 'Help build raised vegetable beds and plant indigenous seedlings for local primary schools.',
      date: '2026-09-27',
      spotsLeft: 6,
    },
    {
      id: 2,
      title: 'Creative Tech & Digital Skills Mentoring',
      description: '1-on-1 portfolio review and coding support for young adults entering creative industries.',
      date: '2026-10-04',
      spotsLeft: 4,
    },
    {
      id: 3,
      title: 'Community Food Pantry Packaging Drive',
      description: 'Assemble nutrient-dense meal packages for families across the neighboring district.',
      date: '2026-10-12',
      spotsLeft: 10,
    },
  ],
  community: [
    {
      id: 1,
      title: 'A gentle reminder: leaving on time is cultural leadership.',
      description: 'Closing your laptop at a reasonable hour gives everyone around you permission to do the same.',
      createdAt: '2026-09-13T18:20:00Z',
      author: 'Marcus Chen',
      likes: 29,
    },
    {
      id: 2,
      title: 'The courtyard herb garden is ready for harvesting!',
      description: 'Fresh mint, rosemary, and lemon verbena are thriving by the south brick wall. Help yourself for afternoon tea.',
      createdAt: '2026-09-12T14:10:00Z',
      author: 'Botanical Circle',
      likes: 18,
    },
    {
      id: 3,
      title: 'Our sprint wrapped with zero overtime — what worked.',
      description: 'We cut our WIP limits by half and protected morning focus blocks from ad-hoc syncs.',
      createdAt: '2026-09-11T09:45:00Z',
      author: 'Maya Lin',
      likes: 34,
    },
  ],
  conversations: [
    {
      id: 1,
      title: 'Devon Vance (Wellbeing Buddy)',
      description: '“Enjoy the weekend walk! Let us compare trail notes on Monday.”',
      createdAt: '2026-09-13T17:02:00Z',
    },
    {
      id: 2,
      title: 'Design & Rhythms Circle',
      description: '“Shared the updated typography guidelines with low-contrast dark mode specs.”',
      createdAt: '2026-09-12T11:20:00Z',
    },
    {
      id: 3,
      title: 'Mindful Breathwork Cohort',
      description: '“Audio recording from Wednesday’s 10-minute cadence exercise is pinned.”',
      createdAt: '2026-09-10T16:45:00Z',
    },
  ],
  notifications: [
    {
      id: 1,
      message: 'Devon Vance confirmed your buddy check-in for next Tuesday.',
      read: false,
      timestamp: '2026-09-14T08:30:00Z',
    },
    {
      id: 2,
      message: 'Your check-in note from Friday was saved to your private journal.',
      read: false,
      timestamp: '2026-09-12T17:00:00Z',
    },
  ],
  travelPreferences: {
    preferredPace: 'Restorative & Slow',
    destinationTypes: ['Forest Sanctuary', 'Alpine Cabin'],
    maxTravelHours: 4,
  },
};

// Helper to parse JSON body
async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(payload));
}

export async function apiMiddleware(req, res, next) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '';

  if (!pathname.startsWith('/api')) {
    return next ? next() : false;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    });
    return res.end();
  }

  const subpath = pathname.replace(/^\/api/, '');

  // 1. Auth: Login
  if (subpath === '/auth/login' && req.method === 'POST') {
    const body = await readJson(req);
    const existing = state.users.find((u) => u.email?.toLowerCase() === body.email?.toLowerCase());
    const user = existing || {
      ...state.users[0],
      email: body.email || state.users[0].email,
      fullName: body.email ? body.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : state.users[0].fullName,
    };
    return sendJson(res, 200, {
      token: 'wb_token_' + Date.now(),
      employeeId: user.employeeId || user.id,
      id: user.id,
      user,
    });
  }

  // 2. Auth: Register
  if (subpath === '/auth/register' && req.method === 'POST') {
    const body = await readJson(req);
    const newUser = {
      id: state.users.length + 1,
      employeeId: state.users.length + 1,
      fullName: body.fullName || 'New Member',
      email: body.email || 'member@workbloom.internal',
      department: body.department || 'Experience & Culture',
      designation: body.designation || 'Team Member',
      profileImage: '',
      generatedAt: new Date().toISOString(),
      recognitionReceivedCount: 0,
      communityPostCount: 0,
      latestMood: 'Steady',
      latestStressLevel: 2,
      latestEnergyLevel: 7,
      unreadNotificationCount: 1,
    };
    state.users.push(newUser);
    return sendJson(res, 201, {
      token: 'wb_token_' + Date.now(),
      employeeId: newUser.employeeId,
      id: newUser.id,
      user: newUser,
    });
  }

  // 3. Auth: Forgot Password
  if (subpath === '/auth/forgot-password' && req.method === 'POST') {
    return sendJson(res, 200, {
      message: 'Password reset instructions have been dispatched if the account exists.',
    });
  }

  // 4. Dashboard for employee
  if (subpath.startsWith('/dashboard/employee/')) {
    const empId = Number(subpath.split('/').pop()) || 1;
    const user = state.users.find((u) => u.employeeId === empId || u.id === empId) || state.users[0];
    return sendJson(res, 200, {
      ...user,
      upcomingEvents: state.events,
      learning: {
        inProgressCount: 2,
        completedCount: 5,
      },
      impact: {
        registeredCount: 1,
        hoursContributed: 8,
      },
      clubs: {
        activeMembershipCount: state.clubs.length,
      },
      buddy: {
        activeBuddy: {
          id: 99,
          fullName: 'Devon Vance',
          name: 'Devon Vance',
          department: 'Engineering',
          designation: 'Staff Engineer',
        },
        pendingRequestCount: 0,
      },
      unreadNotifications: state.notifications,
    });
  }

  // 5. Wellness Mood check-in
  if (subpath.startsWith('/wellness/mood')) {
    if (req.method === 'POST') {
      const body = await readJson(req);
      const empId = Number(parsedUrl.query.employeeId) || 1;
      const user = state.users.find((u) => u.employeeId === empId || u.id === empId) || state.users[0];
      if (body.mood) {
        user.latestMood = body.mood;
        if (body.mood === 'Steady') { user.latestStressLevel = 2; user.latestEnergyLevel = 7; }
        else if (body.mood === 'Bright') { user.latestStressLevel = 1; user.latestEnergyLevel = 9; }
        else if (body.mood === 'Tired') { user.latestStressLevel = 6; user.latestEnergyLevel = 3; }
        else if (body.mood === 'Full') { user.latestStressLevel = 7; user.latestEnergyLevel = 5; }
      }
      return sendJson(res, 200, { success: true, latestMood: user.latestMood, stress: user.latestStressLevel, energy: user.latestEnergyLevel });
    }
    return sendJson(res, 200, [{ mood: state.users[0].latestMood, date: new Date().toISOString() }]);
  }

  // 6. Wellness General check-in
  if (subpath.startsWith('/wellness')) {
    if (req.method === 'POST') {
      const body = await readJson(req);
      const empId = Number(parsedUrl.query.employeeId) || 1;
      const user = state.users.find((u) => u.employeeId === empId || u.id === empId) || state.users[0];
      if (body.energy != null) user.latestEnergyLevel = body.energy;
      if (body.stress != null) user.latestStressLevel = body.stress;
      return sendJson(res, 200, { success: true, data: user });
    }
    return sendJson(res, 200, state.users[0]);
  }

  // 7. Travel destinations
  if (subpath === '/travel/destinations') {
    return sendJson(res, 200, state.destinations);
  }

  // 8. Travel Route optimize
  if (subpath === '/travel/routes/optimize' && req.method === 'POST') {
    return sendJson(res, 200, {
      optimizedRoute: ['Trailhead Gate', 'Old Cedar Sanctuary', 'Quiet Meadow Rest Stop', 'Tea Pavilion'],
      restScore: 94,
    });
  }

  // 9. Travel Preferences
  if (subpath.startsWith('/travel/preferences')) {
    if (req.method === 'POST') {
      const body = await readJson(req);
      state.travelPreferences = { ...state.travelPreferences, ...body };
      return sendJson(res, 200, state.travelPreferences);
    }
    return sendJson(res, 200, state.travelPreferences);
  }

  // 10. Events
  if (subpath === '/events') {
    return sendJson(res, 200, state.events);
  }

  // 11. Clubs
  if (subpath === '/clubs') {
    return sendJson(res, 200, state.clubs);
  }

  // 12. Learning Courses
  if (subpath === '/learning/courses') {
    return sendJson(res, 200, state.courses);
  }

  // 13. Impact Opportunities
  if (subpath === '/impact/events') {
    return sendJson(res, 200, state.impact);
  }

  // 14. Community Posts
  if (subpath === '/community/posts') {
    return sendJson(res, 200, state.community);
  }

  // 15. Conversations (Messages)
  if (subpath === '/chat/conversations') {
    return sendJson(res, 200, state.conversations);
  }

  // 16. Notifications
  if (subpath.includes('/notifications/')) {
    return sendJson(res, 200, state.notifications);
  }

  // 17. Health check
  if (subpath === '/integrations/health') {
    return sendJson(res, 200, { status: 'UP', service: 'workbloom', time: new Date().toISOString() });
  }

  // Fallback for unknown /api route
  return sendJson(res, 200, { status: 'ok', endpoint: subpath });
}
