// WorkBloom Enhanced Full-Stack In-Memory API Server
import url from 'node:url';

// Seeded in-memory store
const state = {
  users: [
    {
      id: 1,
      employeeId: 1,
      fullName: 'Maya Lin',
      email: 'maya.lin@workbloom.internal',
      department: 'Experience & Culture',
      designation: 'Senior Experience Designer',
      role: 'EMPLOYEE',
      salary: 115000,
      profileImage: '',
      generatedAt: '2025-01-15T09:00:00.000Z',
      recognitionReceivedCount: 14,
      communityPostCount: 8,
      latestMood: 'Steady',
      latestStressLevel: 3,
      latestEnergyLevel: 8,
      unreadNotificationCount: 2,
    },
    {
      id: 2,
      employeeId: 2,
      fullName: 'Devon Vance',
      email: 'devon.vance@workbloom.internal',
      department: 'Engineering',
      designation: 'Staff Engineer & Mentor',
      role: 'EMPLOYEE',
      salary: 145000,
      profileImage: '',
      generatedAt: '2024-11-10T09:00:00.000Z',
      recognitionReceivedCount: 22,
      communityPostCount: 12,
      latestMood: 'Bright',
      latestStressLevel: 2,
      latestEnergyLevel: 9,
      unreadNotificationCount: 0,
    },
    {
      id: 3,
      employeeId: 3,
      fullName: 'Elena Rostova',
      email: 'elena.rostova@workbloom.internal',
      department: 'People & Wellbeing',
      designation: 'VP of People Operations',
      role: 'HR',
      salary: 160000,
      profileImage: '',
      generatedAt: '2024-06-01T09:00:00.000Z',
      recognitionReceivedCount: 31,
      communityPostCount: 15,
      latestMood: 'Steady',
      latestStressLevel: 3,
      latestEnergyLevel: 8,
      unreadNotificationCount: 3,
    },
    {
      id: 4,
      employeeId: 4,
      fullName: 'Kenji Takahashi',
      email: 'kenji.t@workbloom.internal',
      department: 'Product & Design',
      designation: 'Product Lead',
      role: 'EMPLOYEE',
      salary: 130000,
      profileImage: '',
      generatedAt: '2025-02-01T09:00:00.000Z',
      recognitionReceivedCount: 9,
      communityPostCount: 4,
      latestMood: 'Full',
      latestStressLevel: 5,
      latestEnergyLevel: 6,
      unreadNotificationCount: 1,
    },
    {
      id: 5,
      employeeId: 5,
      fullName: 'Amina Al-Mansoor',
      email: 'amina.m@workbloom.internal',
      department: 'Experience & Culture',
      designation: 'Workplace Ergonomics Specialist',
      role: 'ADMIN',
      salary: 120000,
      profileImage: '',
      generatedAt: '2024-08-15T09:00:00.000Z',
      recognitionReceivedCount: 19,
      communityPostCount: 11,
      latestMood: 'Bright',
      latestStressLevel: 2,
      latestEnergyLevel: 9,
      unreadNotificationCount: 0,
    }
  ],

  events: [
    {
      id: 1,
      title: 'Mindful Morning Breathwork',
      startDate: '2026-09-16T10:00:00Z',
      location: 'Wellness Studio & Virtual Room',
      eventType: 'Wellness',
      description: 'A 20-minute guided nervous-system reset before the day begins with diaphragmatic breathing.',
      capacity: 25,
      attendees: [1, 2],
    },
    {
      id: 2,
      title: 'Design Systems & Human Rhythms',
      startDate: '2026-09-18T14:30:00Z',
      location: 'Innovation Hub · Hall 3',
      eventType: 'Learning',
      description: 'Exploring sustainable pacing, quiet focus blocks, and humane design craft.',
      capacity: 40,
      attendees: [3],
    },
    {
      id: 3,
      title: 'Autumn Equinox Garden Walk',
      startDate: '2026-09-21T16:00:00Z',
      location: 'Courtyard & Greenhouse Pavilion',
      eventType: 'Community',
      description: 'Seasonal stroll with the Botanical Circle. Fresh herbal tea and honey provided.',
      capacity: 30,
      attendees: [1, 4],
    },
    {
      id: 4,
      title: 'Ergonomics & Desk Reset Clinic',
      startDate: '2026-09-25T11:00:00Z',
      location: 'Wellness Hub',
      eventType: 'Health',
      description: 'Quick postural adjustments and screen fatigue relief with physical therapist Amina.',
      capacity: 15,
      attendees: [2],
    },
  ],

  destinations: [
    {
      id: 1,
      name: 'Munnar & Anamalai Tea Sanctuary',
      country: 'India',
      location: 'Western Ghats, Idukki, Kerala',
      coords: { lat: 10.0889, lng: 77.0595 },
      description: 'Misty emerald tea slopes, cool cardamom air, Ayurvedic healing baths, and quiet forest canopy paths.',
      type: 'Tea & Forest Sanctuary',
      theme: 'Deep Rest & Forest Mist Bathing',
      rating: 4.96,
      idealPace: 'Restorative & Slow',
      durationHours: 3.5,
      recommendedMoods: ['Tired', 'Full'],
      moodAffinity: { Tired: 99, Full: 94, Steady: 87, Bright: 78 },
      moodReason: 'Ideal for chronic work fatigue and sensory saturation. High altitude mountain mist and negative ions from tea slopes reduce cortisol levels within 48 hours.',
      sensoryLevel: 'Gentle & Earthy (Soft rain mist, fresh cardamom scent, birdsong)',
      highlights: ['Morning walking through mist-covered tea slopes', 'Natural Ayurvedic herbal oil therapies', 'Zero-traffic mountain bird sanctuary trail'],
      imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      temporaryImage: 'https://picsum.photos/seed/munnar-haven/800/500',
    },
    {
      id: 2,
      name: 'Rishikesh Himalayan Riverside Haven',
      country: 'India',
      location: 'Ganges Foothills, Tapovan, Uttarakhand',
      coords: { lat: 30.0869, lng: 78.2676 },
      description: 'Sacred riverbanks, acoustic Tibetan singing bowls, sunrise pranayama, and silent ashram terraces.',
      type: 'River & Ashram Sanctuary',
      theme: 'Sound Healing, Breathwork & Stillness',
      rating: 4.95,
      idealPace: 'Quiet Contemplation',
      durationHours: 4.0,
      recommendedMoods: ['Full', 'Steady'],
      moodAffinity: { Full: 98, Steady: 93, Tired: 86, Bright: 82 },
      moodReason: 'Tailored for cognitive overload and notification fatigue. The rhythmic glacial Ganges flow and evening silent bowl vibrations re-synchronize brainwave frequencies.',
      sensoryLevel: 'Resonant & Tranquil (Flowing glacial river, singing bowl harmonics, pine breeze)',
      highlights: ['Acoustic sound bowl relaxation at dusk', 'Sunrise pranayama breathwork over the Ganges', 'Silent reading pavilion with herbal mountain teas'],
      imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
      temporaryImage: 'https://picsum.photos/seed/rishikesh-haven/800/500',
    },
    {
      id: 3,
      name: 'Coorg Rainforest & Organic Estate',
      country: 'India',
      location: 'Madikeri, Western Ghats, Karnataka',
      coords: { lat: 12.4244, lng: 75.7382 },
      description: 'Lush rainforest canopy, organic shade-grown coffee groves, natural stream bathing, and soothing rainfall.',
      type: 'Rainforest Sanctuary',
      theme: 'Circulation, Forest Canopy & Sleep Reset',
      rating: 4.93,
      idealPace: 'Restorative & Slow',
      durationHours: 3.0,
      recommendedMoods: ['Tired', 'Steady'],
      moodAffinity: { Tired: 97, Steady: 92, Full: 90, Bright: 81 },
      moodReason: 'The ancient evergreen Western Ghats canopy delivers oxygen-rich microclimates and soothing rain acoustics, unlocking 9+ hours of deep restorative REM sleep.',
      sensoryLevel: 'Deep Forest (Gentle rain on broad leaves, fresh roast coffee aroma, cicadas)',
      highlights: ['Private wooden cottage overlooking dense canopy', 'Guided medicinal plant & herb walks', 'Pure Kodagu honey and fresh plantation harvest dining'],
      imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
      temporaryImage: 'https://picsum.photos/seed/coorg-haven/800/500',
    },
    {
      id: 4,
      name: 'Nubra Valley & Pangong Stargaze Haven',
      country: 'India',
      location: 'Trans-Himalayan Plateau, Ladakh',
      coords: { lat: 34.1526, lng: 77.5771 },
      description: 'Vast high-altitude desert silence, crystal-clear night skies, apricot orchards, and Buddhist monastery stillness.',
      type: 'High Alpine Desert',
      theme: 'Digital Detox & Infinite Horizon Clarity',
      rating: 4.97,
      idealPace: 'Gentle Exploration',
      durationHours: 5.0,
      recommendedMoods: ['Full', 'Bright'],
      moodAffinity: { Full: 99, Bright: 93, Steady: 90, Tired: 79 },
      moodReason: 'The ultimate perspective reset. Operating completely off the digital grid in the high Trans-Himalayas, infinite mountain horizons dissolve cognitive tunnel vision.',
      sensoryLevel: 'Whisper-Quiet (Clean cold dry air, wind through prayer flags, vast silence)',
      highlights: ['Bortle-1 dark sky stargazing deck with telescope', 'Organic apricot grove solar eco-cabins', 'Ancient Diskit monastery early morning gong session'],
      imageUrl: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
      temporaryImage: 'https://picsum.photos/seed/ladakh-haven/800/500',
    },
    {
      id: 5,
      name: 'Varkala Red Cliff & Ocean Mineral Springs',
      country: 'India',
      location: 'Arabian Sea Shoreline, Kerala',
      coords: { lat: 8.7379, lng: 76.7163 },
      description: 'Towering laterite cliffs, natural mineral water springs, warm ocean tides, and holistic Ayurvedic panchakarma.',
      type: 'Ocean & Mineral Springs',
      theme: 'Creative Synthesis & Ocean Wave Therapy',
      rating: 4.91,
      idealPace: 'Quiet Contemplation',
      durationHours: 3.0,
      recommendedMoods: ['Steady', 'Bright'],
      moodAffinity: { Steady: 98, Bright: 95, Full: 86, Tired: 82 },
      moodReason: 'Rhythmic Arabian Sea waves and natural geothermal cliff springs ease tension held in the neck and spine, unlocking open-horizon creative thinking.',
      sensoryLevel: 'Oceanic & Warm (Steady crashing waves, sea salt breeze, warm sun)',
      highlights: ['Cliff-edge shaded open-air reading lounges', 'Natural medicinal spring water baths', 'Classical Ayurvedic panchakarma rejuvenation'],
      imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
      temporaryImage: 'https://picsum.photos/seed/varkala-haven/800/500',
    },
    {
      id: 6,
      name: 'Dharamshala Cedar & Dhauladhar Haven',
      country: 'India',
      location: 'Kangra Valley, Himachal Pradesh',
      coords: { lat: 32.2190, lng: 76.3234 },
      description: 'Towering deodar cedar forests, snow-dusted Dhauladhar peaks, Tibetan tea culture, and quiet pine needle paths.',
      type: 'Mountain Sanctuary',
      theme: 'Sensory Decompression & Cedar Therapy',
      rating: 4.94,
      idealPace: 'Gentle Exploration',
      durationHours: 4.0,
      recommendedMoods: ['Full', 'Tired'],
      moodAffinity: { Full: 96, Tired: 94, Steady: 89, Bright: 84 },
      moodReason: 'Sub-alpine deodar pine forests release natural terpenes that quiet mental hyper-vigilance, clearing the fog of prolonged sprint deadlines.',
      sensoryLevel: 'Crisp & Evergreen (Aromatic pine needles, temple chimes, cool mountain air)',
      highlights: ['Silent deodar cedar meditation trail', 'Tibetan herbal tea blends and acoustic bowls', 'Panoramic Dhauladhar snowpeak sun deck'],
      imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      temporaryImage: 'https://picsum.photos/seed/dharamshala-haven/800/500',
    },
    {
      id: 7,
      name: 'Gokarna Secluded Bay & Palm Grove',
      country: 'India',
      location: 'Karwar Coast, Karnataka',
      coords: { lat: 14.5479, lng: 74.3188 },
      description: 'Uncrowded crescent beaches, secluded cove hammocks, coconut groves, and calm Arabian sea waters.',
      type: 'Secluded Coastal Grove',
      theme: 'Sensory Reset & Warm Sand Grounding',
      rating: 4.90,
      idealPace: 'Restorative & Slow',
      durationHours: 2.5,
      recommendedMoods: ['Tired', 'Steady'],
      moodAffinity: { Tired: 96, Steady: 93, Full: 91, Bright: 85 },
      moodReason: 'Completely uncommercialized coastal havens where barefoot grounding and listening to gentle tides resynchronizes the nervous system to natural diurnal rhythms.',
      sensoryLevel: 'Gentle Coastal (Warm sea breezes, rustling coconut fronds, gentle tide)',
      highlights: ['Barefoot grounding walks along Half Moon beach', 'Shaded coconut grove hammock reading', 'Sunset mineral sea bath and quiet campfire'],
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      temporaryImage: 'https://picsum.photos/seed/gokarna-haven/800/500',
    },
    {
      id: 8,
      name: 'Auroville Quiet Eco-Sanctuary & Banyan Grove',
      country: 'India',
      location: 'Puducherry & Tamil Nadu',
      coords: { lat: 11.9800, lng: 79.8100 },
      description: 'Red earth forest paths, sprawling ancient banyan tree meditation amphitheater, and conscious regenerative organic farms.',
      type: 'Eco-Forest Sanctuary',
      theme: 'Mindful Living & Regenerative Earth Connection',
      rating: 4.95,
      idealPace: 'Quiet Contemplation',
      durationHours: 3.5,
      recommendedMoods: ['Bright', 'Steady'],
      moodAffinity: { Bright: 98, Steady: 94, Full: 89, Tired: 83 },
      moodReason: 'Zero-automobile peace, hand-planted reforestation trails, and mindful community energy re-spark authentic wonder and optimism.',
      sensoryLevel: 'Lush & Serene (Red earth, banyan shade, wind through neem trees)',
      highlights: ['Silent meditation by the ancient banyan tree', 'Organic permaculture farm dining and spirulina juices', 'Shaded forest cycling without motorized traffic'],
      imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
      temporaryImage: 'https://picsum.photos/seed/auroville-haven/800/500',
    },
  ],

  clubs: [
    {
      id: 1,
      name: 'Botanical Circle & Green Desks',
      description: 'Plant lovers sharing cuttings, indoor cultivation tips, and greenhouse shifts.',
      category: 'Nature',
      members: [1, 3, 5],
      meetSchedule: 'Bi-weekly Thursdays at 4:30 PM',
    },
    {
      id: 2,
      name: 'Mindful Makers & Coders',
      description: 'Software artisans championing thoughtful architecture, slow coding, and low-stress delivery.',
      category: 'Craft',
      members: [1, 2, 4],
      meetSchedule: 'Alternate Wednesdays at 12:00 PM',
    },
    {
      id: 3,
      name: 'Wild Trail Walkers',
      description: 'Weekend hikes, ridge strolls, and restorative lunch-hour outdoor laps in nearby parks.',
      category: 'Outdoor',
      members: [2, 5],
      meetSchedule: 'Saturdays at 9:00 AM',
    },
    {
      id: 4,
      name: 'The Quiet Essay & Book Guild',
      description: 'A monthly gathering discussing restorative writing, poetry, and philosophy.',
      category: 'Literature',
      members: [1, 3],
      meetSchedule: 'First Tuesday of every month',
    },
  ],

  courses: [
    {
      id: 1,
      courseName: 'Pacing & Boundary Setting in Creative Work',
      title: 'Pacing & Boundary Setting in Creative Work',
      description: 'Practical tools for establishing sustainable daily cadences without diminishing craft quality.',
      duration: '4 modules · 35 min total',
      instructor: 'Dr. Elena Rossi',
      category: 'Wellbeing',
      modules: ['Recognizing False Urgency', 'The 90-Minute Focus Sprint', 'Async Communication Boundaries', 'The Shutdown Ritual'],
      enrollments: [{ employeeId: 1, progress: 65, status: 'In Progress' }],
    },
    {
      id: 2,
      courseName: 'Restorative Micro-Breaks for Knowledge Workers',
      title: 'Restorative Micro-Breaks for Knowledge Workers',
      description: 'Evidence-backed 3-minute physical and ocular breaks that rebuild cognitive clarity and prevent burnout.',
      duration: '3 modules · 20 min total',
      instructor: 'Kenji Takahashi, PT',
      category: 'Health',
      modules: ['The 20-20-20 Eye Rest Technique', 'Spinal Decompression at the Desk', 'Breath-Paced Nervous System Regulation'],
      enrollments: [{ employeeId: 1, progress: 100, status: 'Completed' }],
    },
    {
      id: 3,
      courseName: 'Empathetic Peer Mentorship & Buddying',
      title: 'Empathetic Peer Mentorship & Buddying',
      description: 'How to show up for teammates with psychological safety, active listening, and calm support.',
      duration: '5 modules · 45 min total',
      instructor: 'Sarah Jenkins',
      category: 'Culture',
      modules: ['Foundations of Psychological Safety', 'Active Listening vs Fixing', 'Navigating Tough Workdays Together', 'Holding Space Without Overextension', 'Celebrating Small Progress'],
      enrollments: [{ employeeId: 2, progress: 40, status: 'In Progress' }],
    },
  ],

  impact: [
    {
      id: 1,
      title: 'Urban School Garden Soil & Seedling Prep',
      description: 'Help build raised vegetable beds and plant indigenous seedlings for local primary schools.',
      date: '2026-09-27',
      location: 'Franklin Elementary School Garden',
      spotsLeft: 5,
      maxSpots: 10,
      volunteers: [1, 2],
    },
    {
      id: 2,
      title: 'Creative Tech & Digital Skills Mentoring',
      description: '1-on-1 portfolio review and coding support for young adults entering creative industries.',
      date: '2026-10-04',
      location: 'Community Technology Center',
      spotsLeft: 4,
      maxSpots: 8,
      volunteers: [3],
    },
    {
      id: 3,
      title: 'Community Food Pantry Packaging Drive',
      description: 'Assemble nutrient-dense meal packages for families across the neighboring district.',
      date: '2026-10-12',
      location: 'Central Neighborhood Food Hub',
      spotsLeft: 9,
      maxSpots: 12,
      volunteers: [1],
    },
  ],

  community: [
    {
      id: 1,
      title: 'A gentle reminder: leaving on time is cultural leadership.',
      description: 'Closing your laptop at a reasonable hour gives everyone around you permission to do the same. Pacing matters more than sprinting.',
      createdAt: '2026-09-13T18:20:00Z',
      author: 'Marcus Chen',
      authorRole: 'Engineering Lead',
      department: 'Engineering',
      category: 'Culture',
      likes: [1, 2, 4],
      comments: [
        { id: 101, author: 'Maya Lin', text: 'Thank you for saying this. Took a real walk at 5:30 today.', time: 'Yesterday' }
      ]
    },
    {
      id: 2,
      title: 'The courtyard herb garden is ready for harvesting!',
      description: 'Fresh mint, rosemary, and lemon verbena are thriving by the south brick wall. Help yourself for your afternoon tea or desk vase.',
      createdAt: '2026-09-12T14:10:00Z',
      author: 'Botanical Circle',
      authorRole: 'Employee Club',
      department: 'Experience & Culture',
      category: 'Community',
      likes: [1, 3, 5],
      comments: []
    },
    {
      id: 3,
      title: 'Our sprint wrapped with zero overtime — what worked.',
      description: 'We cut our WIP limits by half and protected morning focus blocks from ad-hoc syncs. The work got done with much higher clarity.',
      createdAt: '2026-09-11T09:45:00Z',
      author: 'Maya Lin',
      authorRole: 'Senior Experience Designer',
      department: 'Experience & Culture',
      category: 'Mindfulness',
      likes: [2, 3, 4, 5],
      comments: [
        { id: 102, author: 'Devon Vance', text: 'We adopted this in Platform too. Morale is noticeably higher.', time: '2 days ago' }
      ]
    },
  ],

  recognitions: [
    {
      id: 1,
      fromId: 2,
      fromName: 'Devon Vance',
      toId: 1,
      toName: 'Maya Lin',
      badge: 'Calm Anchor',
      category: 'Kindness & Steer',
      message: 'Thank you Maya for bringing calm and clarity to our quarterly roadmap discussion when deadlines felt noisy.',
      createdAt: '2026-09-13T16:00:00Z',
      likes: 8,
    },
    {
      id: 2,
      fromId: 3,
      fromName: 'Elena Rostova',
      toId: 2,
      toName: 'Devon Vance',
      badge: 'Kind Guide',
      category: 'Mentorship',
      message: 'Devon consistently takes time to mentor junior engineers with patience and genuine care.',
      createdAt: '2026-09-12T11:30:00Z',
      likes: 12,
    },
    {
      id: 3,
      fromId: 1,
      fromName: 'Maya Lin',
      toId: 5,
      toName: 'Amina Al-Mansoor',
      badge: 'Cultivator',
      category: 'Wellbeing',
      message: 'Amina’s ergonomics clinic helped my chronic wrist tension immensely. She makes our workspace healthier every day.',
      createdAt: '2026-09-10T14:20:00Z',
      likes: 6,
    }
  ],

  buddies: [
    {
      id: 1,
      employeeId1: 1,
      employeeId2: 2,
      status: 'ACTIVE',
      lastCheckIn: '2026-09-12T17:00:00Z',
      sharedInterests: ['Mindful walking', 'Typography', 'Quiet workspaces'],
    }
  ],

  buddyRequests: [
    {
      id: 101,
      fromId: 4,
      fromName: 'Kenji Takahashi',
      fromRole: 'Product Lead · Product & Design',
      toId: 1,
      status: 'PENDING',
      createdAt: '2026-09-13T10:15:00Z',
      message: 'Hi Maya! I’d love to connect as a wellbeing buddy to share weekly check-ins and mindful design pacing.',
    }
  ],

  wellnessLogs: [
    {
      id: 1,
      employeeId: 1,
      mood: 'Steady',
      energy: 8,
      stress: 3,
      note: 'Morning walk in the courtyard set a peaceful tone for the sprint review.',
      createdAt: '2026-09-14T08:00:00Z',
    },
    {
      id: 2,
      employeeId: 1,
      mood: 'Bright',
      energy: 9,
      stress: 2,
      note: 'Protected 3 hours of uninterrupted focus time. Felt restorative.',
      createdAt: '2026-09-13T08:30:00Z',
    },
    {
      id: 3,
      employeeId: 1,
      mood: 'Tired',
      energy: 4,
      stress: 6,
      note: 'Heavy meeting load in the afternoon. Need to pace hydration and breaks better.',
      createdAt: '2026-09-12T08:15:00Z',
    }
  ],

  counsellingSessions: [
    {
      id: 1,
      employeeId: 1,
      counsellorName: 'Dr. Aris Thorne',
      topic: 'Workplace Rhythm & Preventing Burnout',
      date: '2026-09-22T15:00:00Z',
      status: 'Confirmed',
      notes: 'Confidential 1-on-1 session booked via WorkBloom Employee Care.',
    }
  ],

  conversations: [
    {
      id: 1,
      participantId: 2,
      title: 'Devon Vance (Wellbeing Buddy)',
      participantRole: 'Staff Engineer & Mentor',
      unreadCount: 0,
      messages: [
        { id: 1, senderId: 2, senderName: 'Devon Vance', text: 'Hey Maya, how did your presentation land today?', time: '10:15 AM' },
        { id: 2, senderId: 1, senderName: 'Maya Lin', text: 'It went really gently. Taking a 15-minute breather by the greenhouse now.', time: '10:18 AM' },
        { id: 3, senderId: 2, senderName: 'Devon Vance', text: 'Wonderful! Let’s do our trail walk check-in on Monday.', time: '10:20 AM' },
      ],
      updatedAt: '2026-09-14T10:20:00Z',
    },
    {
      id: 2,
      participantId: 3,
      title: 'Elena Rostova (People & Wellbeing)',
      participantRole: 'VP of People Operations',
      unreadCount: 1,
      messages: [
        { id: 1, senderId: 3, senderName: 'Elena Rostova', text: 'Hi Maya, we’ve approved the new ergonomic seating for the studio!', time: 'Yesterday' },
        { id: 2, senderId: 3, senderName: 'Elena Rostova', text: 'Let me know if you’d like to test the sample chair tomorrow.', time: 'Yesterday' },
      ],
      updatedAt: '2026-09-13T16:45:00Z',
    }
  ],

  notifications: [
    {
      id: 1,
      employeeId: 1,
      title: 'Recognition Received',
      message: 'Devon Vance appreciated you with the “Calm Anchor” badge: “Thank you for bringing calm and clarity...”',
      type: 'recognition',
      read: false,
      timestamp: '2026-09-13T16:00:00Z',
    },
    {
      id: 2,
      employeeId: 1,
      title: 'Buddy Request Waiting',
      message: 'Kenji Takahashi invited you to connect as a Wellbeing Buddy.',
      type: 'buddy',
      read: false,
      timestamp: '2026-09-13T10:15:00Z',
    },
    {
      id: 3,
      employeeId: 1,
      title: 'Check-in Saved',
      message: 'Your morning check-in (Steady · Energy 8/10) was saved to your private rhythm log.',
      type: 'wellness',
      read: true,
      timestamp: '2026-09-12T08:30:00Z',
    }
  ],

  travelPreferences: {
    1: {
      preferredPace: 'Restorative & Slow',
      destinationTypes: ['Sanctuary', 'Mountain'],
      maxTravelHours: 4,
      transportPreference: 'Train & Scenic Transit',
    }
  }
};

// Helper: parse JSON body safely
async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// Helper: send JSON with CORS headers
function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(payload));
}

// Helper: authenticate request from Bearer token or header
function getAuthUser(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    // Token format: wb_token_{userId}_{timestamp} or wb_token_{timestamp}
    const match = token.match(/^wb_token_(\d+)_/);
    if (match) {
      const uId = Number(match[1]);
      const found = state.users.find((u) => u.id === uId || u.employeeId === uId);
      if (found) return found;
    }
  }
  // Default to Maya Lin (Employee 1) if valid Bearer token provided
  if (authHeader.startsWith('Bearer ')) {
    return state.users[0];
  }
  return null;
}

// Helper: create a notification for an employee
function triggerNotification(employeeId, title, message, type) {
  const newNotif = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    employeeId,
    title,
    message,
    type,
    read: false,
    timestamp: new Date().toISOString(),
  };
  state.notifications.unshift(newNotif);
  const targetUser = state.users.find((u) => u.id === employeeId || u.employeeId === employeeId);
  if (targetUser) {
    targetUser.unreadNotificationCount = (targetUser.unreadNotificationCount || 0) + 1;
  }
  return newNotif;
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
  const currentUser = getAuthUser(req) || state.users[0]; // Active authenticated user

  // ==========================================
  // 1. AUTHENTICATION ENDPOINTS
  // ==========================================
  if (subpath === '/auth/login' && req.method === 'POST') {
    const body = await readJson(req);
    const email = body.email?.toLowerCase().trim();
    const existing = state.users.find((u) => u.email?.toLowerCase() === email);
    const user = existing || {
      ...state.users[0],
      email: body.email || state.users[0].email,
      fullName: body.email ? body.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : state.users[0].fullName,
    };
    return sendJson(res, 200, {
      token: `wb_token_${user.id}_${Date.now()}`,
      employeeId: user.employeeId || user.id,
      id: user.id,
      user,
    });
  }

  if (subpath === '/auth/register' && req.method === 'POST') {
    const body = await readJson(req);
    const newId = state.users.length + 1;
    const newUser = {
      id: newId,
      employeeId: newId,
      fullName: body.fullName || 'New Member',
      email: body.email || `member${newId}@workbloom.internal`,
      department: body.department || 'Experience & Culture',
      designation: body.designation || 'Team Member',
      role: 'EMPLOYEE',
      salary: 95000,
      profileImage: '',
      generatedAt: new Date().toISOString(),
      recognitionReceivedCount: 0,
      communityPostCount: 0,
      latestMood: 'Steady',
      latestStressLevel: 2,
      latestEnergyLevel: 8,
      unreadNotificationCount: 1,
    };
    state.users.push(newUser);
    triggerNotification(newUser.id, 'Welcome to WorkBloom', 'Your calm workspace is ready. Take one small step today.', 'welcome');
    return sendJson(res, 201, {
      token: `wb_token_${newUser.id}_${Date.now()}`,
      employeeId: newUser.employeeId,
      id: newUser.id,
      user: newUser,
    });
  }

  if (subpath === '/auth/forgot-password' && req.method === 'POST') {
    return sendJson(res, 200, {
      message: 'Password reset instructions have been dispatched if the account exists.',
    });
  }

  // Switch active demo role for testing (EMPLOYEE vs HR vs ADMIN)
  if (subpath === '/auth/switch-role' && req.method === 'POST') {
    const body = await readJson(req);
    const targetRole = body.role || 'EMPLOYEE';
    const match = state.users.find((u) => u.role === targetRole) || state.users[0];
    return sendJson(res, 200, {
      token: `wb_token_${match.id}_${Date.now()}`,
      employeeId: match.employeeId,
      id: match.id,
      user: match,
    });
  }

  // ==========================================
  // 2. EMPLOYEE DIRECTORY & PRIVACY GATING
  // ==========================================
  // GET /api/employees - list directory with search & department filter
  if (subpath === '/employees' && req.method === 'GET') {
    const search = (parsedUrl.query.search || '').toLowerCase();
    const department = parsedUrl.query.department || '';

    let list = state.users.map((u) => {
      // SECURITY RULE: Mask salary unless current user is HR or ADMIN, or viewing own profile
      const canViewSalary = (currentUser.id === u.id) || (currentUser.role === 'HR' || currentUser.role === 'ADMIN');
      return {
        id: u.id,
        employeeId: u.employeeId,
        fullName: u.fullName,
        email: u.email,
        department: u.department,
        designation: u.designation,
        role: u.role,
        salary: canViewSalary ? u.salary : undefined,
        latestMood: u.latestMood,
        generatedAt: u.generatedAt,
      };
    });

    if (department && department !== 'All') {
      list = list.filter((u) => u.department.toLowerCase() === department.toLowerCase());
    }
    if (search) {
      list = list.filter((u) => u.fullName.toLowerCase().includes(search) || u.designation.toLowerCase().includes(search) || u.department.toLowerCase().includes(search));
    }

    return sendJson(res, 200, {
      employees: list,
      total: list.length,
      requesterRole: currentUser.role,
    });
  }

  // GET /api/employees/:id - view individual profile
  if (subpath.startsWith('/employees/') && req.method === 'GET') {
    const targetId = Number(subpath.split('/').pop());
    const targetUser = state.users.find((u) => u.id === targetId || u.employeeId === targetId);
    if (!targetUser) {
      return sendJson(res, 404, { error: 'Employee not found' });
    }

    // PRIVACY / SECURITY VERIFICATION:
    // Confirm GET /api/employees/{id} does not return salary to anyone other than profile owner or HR/ADMIN
    const isOwnerOrAdmin = (currentUser.id === targetUser.id) || (currentUser.role === 'HR' || currentUser.role === 'ADMIN');

    const result = {
      ...targetUser,
      salary: isOwnerOrAdmin ? targetUser.salary : undefined,
    };
    return sendJson(res, 200, result);
  }

  // ==========================================
  // 3. DASHBOARD SUMMARY
  // ==========================================
  if (subpath.startsWith('/dashboard/employee/')) {
    const empId = Number(subpath.split('/').pop()) || currentUser.id;
    const user = state.users.find((u) => u.employeeId === empId || u.id === empId) || currentUser;

    const myEvents = state.events.filter((e) => e.attendees.includes(user.id));
    const myImpact = state.impact.filter((i) => i.volunteers.includes(user.id));
    const activeBuddy = state.buddies.find((b) => b.employeeId1 === user.id || b.employeeId2 === user.id && b.status === 'ACTIVE');
    const partnerId = activeBuddy ? (activeBuddy.employeeId1 === user.id ? activeBuddy.employeeId2 : activeBuddy.employeeId1) : null;
    const partnerUser = partnerId ? state.users.find((u) => u.id === partnerId) : null;

    const myNotifications = state.notifications.filter((n) => n.employeeId === user.id);
    const unreadCount = myNotifications.filter((n) => !n.read).length;

    return sendJson(res, 200, {
      ...user,
      unreadNotificationCount: unreadCount,
      upcomingEvents: state.events,
      myRegisteredEventsCount: myEvents.length,
      learning: {
        inProgressCount: state.courses.filter((c) => c.enrollments.some((e) => e.employeeId === user.id && e.status === 'In Progress')).length,
        completedCount: state.courses.filter((c) => c.enrollments.some((e) => e.employeeId === user.id && e.status === 'Completed')).length,
      },
      impact: {
        registeredCount: myImpact.length,
        hoursContributed: myImpact.length * 4,
      },
      clubs: {
        activeMembershipCount: state.clubs.filter((c) => c.members.includes(user.id)).length,
      },
      buddy: {
        activeBuddy: partnerUser ? {
          id: partnerUser.id,
          fullName: partnerUser.fullName,
          department: partnerUser.department,
          designation: partnerUser.designation,
          sharedInterests: activeBuddy?.sharedInterests || ['Wellbeing walks', 'Pacing'],
        } : null,
        pendingRequestCount: state.buddyRequests.filter((r) => r.toId === user.id && r.status === 'PENDING').length,
      },
      unreadNotifications: myNotifications.filter((n) => !n.read),
    });
  }

  // ==========================================
  // 4. WELLNESS (LOGS, MOOD, PRIVACY GATING)
  // ==========================================
  if (subpath.startsWith('/wellness/mood')) {
    const requestedEmpId = Number(parsedUrl.query.employeeId) || currentUser.id;

    // PRIVACY VERIFICATION:
    // Employee cannot view or modify another employee's wellness logs without HR/ADMIN role
    if (requestedEmpId !== currentUser.id && currentUser.role !== 'HR' && currentUser.role !== 'ADMIN') {
      return sendJson(res, 403, {
        error: "Privacy Access Denied: You cannot view or modify another employee's private wellness logs.",
      });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const user = state.users.find((u) => u.id === requestedEmpId) || currentUser;
      if (body.mood) {
        user.latestMood = body.mood;
        if (body.mood === 'Steady') { user.latestStressLevel = 2; user.latestEnergyLevel = 8; }
        else if (body.mood === 'Bright') { user.latestStressLevel = 1; user.latestEnergyLevel = 9; }
        else if (body.mood === 'Tired') { user.latestStressLevel = 6; user.latestEnergyLevel = 3; }
        else if (body.mood === 'Full') { user.latestStressLevel = 7; user.latestEnergyLevel = 5; }
      }
      if (body.energy != null) user.latestEnergyLevel = Number(body.energy);
      if (body.stress != null) user.latestStressLevel = Number(body.stress);

      const newLog = {
        id: Date.now(),
        employeeId: requestedEmpId,
        mood: user.latestMood,
        energy: user.latestEnergyLevel,
        stress: user.latestStressLevel,
        note: body.note || 'Reflected during daily check-in.',
        createdAt: new Date().toISOString(),
      };
      state.wellnessLogs.unshift(newLog);

      triggerNotification(requestedEmpId, 'Check-in Saved', `Your daily rhythm check-in (${user.latestMood}) has been recorded quietly.`, 'wellness');

      return sendJson(res, 200, {
        success: true,
        data: user,
        latestMood: user.latestMood,
        stress: user.latestStressLevel,
        energy: user.latestEnergyLevel,
        logs: state.wellnessLogs.filter((l) => l.employeeId === requestedEmpId),
      });
    }

    // GET mood history
    const logs = state.wellnessLogs.filter((l) => l.employeeId === requestedEmpId);
    return sendJson(res, 200, logs);
  }

  // GET or POST general wellness data / counselling
  if (subpath.startsWith('/wellness/counselling')) {
    const requestedEmpId = Number(parsedUrl.query.employeeId) || currentUser.id;
    if (requestedEmpId !== currentUser.id && currentUser.role !== 'HR' && currentUser.role !== 'ADMIN') {
      return sendJson(res, 403, { error: "Privacy Access Denied: Confidential counselling records are strictly private." });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const session = {
        id: Date.now(),
        employeeId: requestedEmpId,
        counsellorName: body.counsellorName || 'Dr. Aris Thorne',
        topic: body.topic || 'Workplace Rhythm & Sustainable Pacing',
        date: body.date || new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'Scheduled',
        notes: body.notes || 'Private support consultation.',
      };
      state.counsellingSessions.unshift(session);
      triggerNotification(requestedEmpId, 'Counselling Session Scheduled', `Confidential session with ${session.counsellorName} is confirmed for ${new Date(session.date).toLocaleDateString()}.`, 'wellness');
      return sendJson(res, 201, { success: true, session });
    }

    return sendJson(res, 200, state.counsellingSessions.filter((s) => s.employeeId === requestedEmpId));
  }

  // AI Wellness Insight Endpoint (connecting to n8n with graceful fallback)
  if (subpath === '/wellness/ai-insight' && req.method === 'POST') {
    const body = await readJson(req);
    const empId = body.employeeId || currentUser.id;
    const user = state.users.find((u) => u.id === empId) || currentUser;
    const recentLogs = state.wellnessLogs.filter((l) => l.employeeId === empId).slice(0, 3);

    // Call real n8n webhook with timeout guard
    const n8nWebhookUrl = 'http://127.0.0.1:5678/webhook/workbloom/wellness';
    let aiResponse = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const resN8n = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: empId,
          mood: user.latestMood,
          energy: user.latestEnergyLevel,
          stress: user.latestStressLevel,
          recentLogs,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (resN8n.ok) {
        aiResponse = await resN8n.json();
      }
    } catch {
      // n8n is unreachable in sandbox: Graceful fallback per requirements!
      aiResponse = null;
    }

    if (aiResponse && aiResponse.insight) {
      return sendJson(res, 200, {
        success: true,
        source: 'n8n_ollama',
        insight: aiResponse.insight,
      });
    }

    // Humane, graceful fallback with real tailored insight based on signals
    const guidanceByMood = {
      Steady: 'Your nervous system is holding steady ground today. This is an ideal cadence for creative synthesis and deep focus. Protect one 60-minute quiet block and avoid back-to-back context shifts.',
      Bright: 'High energy and natural lift are carrying your workday. Channel this vitality into connecting with colleagues or advancing an ambitious project, but remember to schedule a grounding pause before dusk.',
      Tired: 'You are carrying more than usual today. Lower your daily expectations by one notch: protect essential commitments, defer non-critical syncs, and take a 10-minute courtyard walk to decompress.',
      Full: 'A lot of cognitive stimulation is moving through you. Ground yourself with simple 4-7-8 breathwork, sip chamomile tea, and refrain from committing to new tasks until tomorrow morning.',
    };

    const insight = guidanceByMood[user.latestMood] || 'Listen gently to your body’s signals today. A short 5-minute pause away from screens can restore cognitive balance.';

    return sendJson(res, 200, {
      success: true,
      source: 'graceful_fallback',
      n8nServiceStatus: 'Offline or Unreachable in sandbox — graceful degradation active',
      insight,
      recommendedActivity: user.latestEnergyLevel < 5 ? 'Restorative Garden Stroll' : 'Mindful Morning Breathwork',
      generatedAt: new Date().toISOString(),
    });
  }

  if (subpath.startsWith('/wellness')) {
    const requestedEmpId = Number(parsedUrl.query.employeeId) || currentUser.id;
    if (requestedEmpId !== currentUser.id && currentUser.role !== 'HR' && currentUser.role !== 'ADMIN') {
      return sendJson(res, 403, { error: "Privacy Access Denied: You cannot view another employee's wellness data." });
    }
    const user = state.users.find((u) => u.id === requestedEmpId) || currentUser;
    return sendJson(res, 200, {
      user,
      logs: state.wellnessLogs.filter((l) => l.employeeId === requestedEmpId),
      sessions: state.counsellingSessions.filter((s) => s.employeeId === requestedEmpId),
    });
  }

  // ==========================================
  // 5. EVENTS & RSVP
  // ==========================================
  if (subpath === '/events' && req.method === 'GET') {
    const list = state.events.map((e) => ({
      ...e,
      attendeeCount: e.attendees.length,
      isRegistered: e.attendees.includes(currentUser.id),
    }));
    return sendJson(res, 200, list);
  }

  // RSVP / Cancel RSVP for event
  if (subpath.match(/^\/events\/(\d+)\/rsvp$/) && req.method === 'POST') {
    const eventId = Number(subpath.split('/')[2]);
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return sendJson(res, 404, { error: 'Event not found' });

    const isAttending = event.attendees.includes(currentUser.id);
    if (isAttending) {
      event.attendees = event.attendees.filter((id) => id !== currentUser.id);
      triggerNotification(currentUser.id, 'RSVP Cancelled', `You have cancelled your attendance for "${event.title}".`, 'event');
    } else {
      if (event.attendees.length >= event.capacity) {
        return sendJson(res, 400, { error: 'Event capacity reached.' });
      }
      event.attendees.push(currentUser.id);
      triggerNotification(currentUser.id, 'RSVP Confirmed', `You are registered for "${event.title}" on ${new Date(event.startDate).toLocaleDateString()}.`, 'event');
    }
    return sendJson(res, 200, {
      success: true,
      event: { ...event, isRegistered: !isAttending, attendeeCount: event.attendees.length },
    });
  }

  // Create event (GATED: HR or ADMIN only!)
  if (subpath === '/events' && req.method === 'POST') {
    if (currentUser.role !== 'HR' && currentUser.role !== 'ADMIN') {
      return sendJson(res, 403, { error: 'Access Denied: Only HR or Admin staff can schedule official company gatherings.' });
    }
    const body = await readJson(req);
    const newEvent = {
      id: Date.now(),
      title: body.title || 'New Community Gathering',
      startDate: body.startDate || new Date(Date.now() + 86400000 * 7).toISOString(),
      location: body.location || 'Wellness Pavilion',
      eventType: body.eventType || 'Community',
      description: body.description || 'A mindful gathering for colleagues.',
      capacity: Number(body.capacity) || 30,
      attendees: [currentUser.id],
    };
    state.events.unshift(newEvent);
    return sendJson(res, 201, newEvent);
  }

  // ==========================================
  // 6. COMMUNITY & POSTS
  // ==========================================
  if (subpath === '/community/posts') {
    if (req.method === 'GET') {
      const posts = state.community.map((p) => ({
        ...p,
        likeCount: p.likes.length,
        hasLiked: p.likes.includes(currentUser.id),
      }));
      return sendJson(res, 200, posts);
    }
    if (req.method === 'POST') {
      const body = await readJson(req);
      if (!body.title || !body.description) {
        return sendJson(res, 400, { error: 'Post title and description are required.' });
      }
      const newPost = {
        id: Date.now(),
        title: body.title,
        description: body.description,
        createdAt: new Date().toISOString(),
        author: currentUser.fullName,
        authorRole: currentUser.designation,
        department: currentUser.department,
        category: body.category || 'Culture',
        likes: [],
        comments: [],
      };
      state.community.unshift(newPost);
      currentUser.communityPostCount = (currentUser.communityPostCount || 0) + 1;
      triggerNotification(currentUser.id, 'Post Published', `Your note "${body.title}" is now shared in the community room.`, 'community');
      return sendJson(res, 201, { success: true, post: newPost });
    }
  }

  // Like community post
  if (subpath.match(/^\/community\/posts\/(\d+)\/like$/) && req.method === 'POST') {
    const postId = Number(subpath.split('/')[3]);
    const post = state.community.find((p) => p.id === postId);
    if (!post) return sendJson(res, 404, { error: 'Post not found' });

    const idx = post.likes.indexOf(currentUser.id);
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(currentUser.id);
    }
    return sendJson(res, 200, { success: true, likes: post.likes.length, hasLiked: idx === -1 });
  }

  // ==========================================
  // 7. RECOGNITION (WALL OF APPRECIATION)
  // ==========================================
  if (subpath === '/recognition') {
    if (req.method === 'GET') {
      return sendJson(res, 200, state.recognitions);
    }
    if (req.method === 'POST') {
      const body = await readJson(req);
      const recipient = state.users.find((u) => u.id === Number(body.toId) || u.fullName.toLowerCase() === body.toName?.toLowerCase());
      if (!recipient) {
        return sendJson(res, 400, { error: 'Recipient employee was not found.' });
      }

      const rec = {
        id: Date.now(),
        fromId: currentUser.id,
        fromName: currentUser.fullName,
        toId: recipient.id,
        toName: recipient.fullName,
        badge: body.badge || 'Calm Anchor',
        category: body.category || 'Kindness',
        message: body.message,
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      state.recognitions.unshift(rec);
      recipient.recognitionReceivedCount = (recipient.recognitionReceivedCount || 0) + 1;

      // NOTIFICATION TRIGGER: Send celebratory notification to recipient!
      triggerNotification(
        recipient.id,
        'Appreciation Received! 🌸',
        `${currentUser.fullName} celebrated you with the "${rec.badge}" badge: "${rec.message.slice(0, 80)}..."`,
        'recognition'
      );

      return sendJson(res, 201, { success: true, recognition: rec });
    }
  }

  // ==========================================
  // 8. WELLBEING BUDDY SYSTEM
  // ==========================================
  if (subpath.startsWith('/buddy')) {
    if (subpath === '/buddy/status') {
      const activeBuddy = state.buddies.find((b) => (b.employeeId1 === currentUser.id || b.employeeId2 === currentUser.id) && b.status === 'ACTIVE');
      const partnerId = activeBuddy ? (activeBuddy.employeeId1 === currentUser.id ? activeBuddy.employeeId2 : activeBuddy.employeeId1) : null;
      const partner = partnerId ? state.users.find((u) => u.id === partnerId) : null;

      const pendingRequests = state.buddyRequests.filter((r) => r.toId === currentUser.id && r.status === 'PENDING');
      const sentRequests = state.buddyRequests.filter((r) => r.fromId === currentUser.id && r.status === 'PENDING');
      const potentialBuddies = state.users.filter((u) => u.id !== currentUser.id && u.id !== partnerId);

      return sendJson(res, 200, {
        activeBuddy: partner ? {
          id: partner.id,
          fullName: partner.fullName,
          email: partner.email,
          department: partner.department,
          designation: partner.designation,
          lastCheckIn: activeBuddy?.lastCheckIn,
          sharedInterests: activeBuddy?.sharedInterests || ['Courtyard strolls', 'Deep focus blocks'],
        } : null,
        pendingRequests,
        sentRequests,
        potentialBuddies: potentialBuddies.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          department: u.department,
          designation: u.designation,
        })),
      });
    }

    // Send buddy request
    if (subpath === '/buddy/request' && req.method === 'POST') {
      const body = await readJson(req);
      const recipient = state.users.find((u) => u.id === Number(body.toId));
      if (!recipient) return sendJson(res, 400, { error: 'Colleague not found' });

      const request = {
        id: Date.now(),
        fromId: currentUser.id,
        fromName: currentUser.fullName,
        fromRole: `${currentUser.designation} · ${currentUser.department}`,
        toId: recipient.id,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        message: body.message || 'I would love to be paired as a wellbeing buddy with you.',
      };
      state.buddyRequests.push(request);

      // NOTIFICATION TRIGGER: Send notification to recipient!
      triggerNotification(
        recipient.id,
        'New Buddy Request',
        `${currentUser.fullName} invited you to connect as a Wellbeing Buddy.`,
        'buddy'
      );

      return sendJson(res, 201, { success: true, request });
    }

    // Accept or decline buddy request
    if (subpath.match(/^\/buddy\/request\/(\d+)\/respond$/) && req.method === 'POST') {
      const reqId = Number(subpath.split('/')[3]);
      const body = await readJson(req);
      const reqItem = state.buddyRequests.find((r) => r.id === reqId);
      if (!reqItem) return sendJson(res, 404, { error: 'Request not found' });

      if (body.action === 'ACCEPT') {
        reqItem.status = 'ACCEPTED';
        state.buddies.push({
          id: Date.now(),
          employeeId1: reqItem.fromId,
          employeeId2: currentUser.id,
          status: 'ACTIVE',
          lastCheckIn: new Date().toISOString(),
          sharedInterests: ['Wellbeing walks', 'Pacing & Boundaries'],
        });

        // NOTIFICATION TRIGGER: Notify requester that request was accepted!
        triggerNotification(
          reqItem.fromId,
          'Buddy Paired! 🤝',
          `${currentUser.fullName} accepted your Wellbeing Buddy request. Start with a gentle hello!`,
          'buddy'
        );
      } else {
        reqItem.status = 'DECLINED';
      }
      return sendJson(res, 200, { success: true, status: reqItem.status });
    }
  }

  // ==========================================
  // 9. LEARNING COURSES & PROGRESS
  // ==========================================
  if (subpath === '/learning/courses' && req.method === 'GET') {
    const list = state.courses.map((c) => {
      const enrollment = c.enrollments.find((e) => e.employeeId === currentUser.id);
      return {
        ...c,
        isEnrolled: Boolean(enrollment),
        progress: enrollment?.progress || 0,
        enrollmentStatus: enrollment?.status || 'Not Enrolled',
      };
    });
    return sendJson(res, 200, list);
  }

  // Enroll / Progress in course
  if (subpath.match(/^\/learning\/courses\/(\d+)\/enroll$/) && req.method === 'POST') {
    const courseId = Number(subpath.split('/')[3]);
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return sendJson(res, 404, { error: 'Course not found' });

    let enrollment = course.enrollments.find((e) => e.employeeId === currentUser.id);
    if (!enrollment) {
      enrollment = { employeeId: currentUser.id, progress: 25, status: 'In Progress' };
      course.enrollments.push(enrollment);
      triggerNotification(currentUser.id, 'Course Enrolled', `You have begun "${course.title}". Learn at your own gentle pace.`, 'learning');
    } else if (enrollment.progress < 100) {
      enrollment.progress = Math.min(100, enrollment.progress + 25);
      if (enrollment.progress === 100) {
        enrollment.status = 'Completed';
        triggerNotification(currentUser.id, 'Course Completed! 🎓', `Congratulations on finishing "${course.title}"!`, 'learning');
      }
    }
    return sendJson(res, 200, { success: true, enrollment });
  }

  // ==========================================
  // 10. CLUBS & CIRCLES
  // ==========================================
  if (subpath === '/clubs' && req.method === 'GET') {
    const list = state.clubs.map((c) => ({
      ...c,
      membersCount: c.members.length,
      isMember: c.members.includes(currentUser.id),
    }));
    return sendJson(res, 200, list);
  }

  // Join / Leave club
  if (subpath.match(/^\/clubs\/(\d+)\/toggle$/) && req.method === 'POST') {
    const clubId = Number(subpath.split('/')[2]);
    const club = state.clubs.find((c) => c.id === clubId);
    if (!club) return sendJson(res, 404, { error: 'Club not found' });

    const idx = club.members.indexOf(currentUser.id);
    let joined = false;
    if (idx > -1) {
      club.members.splice(idx, 1);
      triggerNotification(currentUser.id, 'Left Circle', `You have stepped back from "${club.name}".`, 'club');
    } else {
      club.members.push(currentUser.id);
      joined = true;
      triggerNotification(currentUser.id, 'Joined Circle! 🌿', `Welcome to "${club.name}". Discover shared ideas and upcoming meetups.`, 'club');
    }
    return sendJson(res, 200, { success: true, isMember: joined, membersCount: club.members.length });
  }

  // ==========================================
  // 11. COMMUNITY IMPACT VOLUNTEERING
  // ==========================================
  if (subpath === '/impact/events' && req.method === 'GET') {
    const list = state.impact.map((i) => ({
      ...i,
      isVolunteered: i.volunteers.includes(currentUser.id),
    }));
    return sendJson(res, 200, list);
  }

  // Volunteer RSVP / Cancel RSVP
  if (subpath.match(/^\/impact\/events\/(\d+)\/volunteer$/) && req.method === 'POST') {
    const impactId = Number(subpath.split('/')[3]);
    const item = state.impact.find((i) => i.id === impactId);
    if (!item) return sendJson(res, 404, { error: 'Impact initiative not found' });

    const isVolunteered = item.volunteers.includes(currentUser.id);
    if (isVolunteered) {
      item.volunteers = item.volunteers.filter((id) => id !== currentUser.id);
      item.spotsLeft = Math.min(item.maxSpots, item.spotsLeft + 1);
      triggerNotification(currentUser.id, 'Volunteer Spot Cancelled', `You released your spot for "${item.title}".`, 'impact');
    } else {
      if (item.spotsLeft <= 0) return sendJson(res, 400, { error: 'No volunteer spots remaining.' });
      item.volunteers.push(currentUser.id);
      item.spotsLeft = Math.max(0, item.spotsLeft - 1);
      triggerNotification(currentUser.id, 'Volunteering Confirmed! ❤️', `Thank you for signing up for "${item.title}" on ${item.date}.`, 'impact');
    }
    return sendJson(res, 200, { success: true, isVolunteered: !isVolunteered, spotsLeft: item.spotsLeft });
  }

  // ==========================================
  // 12. CHAT & MESSAGES
  // ==========================================
  if (subpath === '/chat/conversations') {
    if (req.method === 'GET') {
      return sendJson(res, 200, state.conversations);
    }
  }

  // Send message in conversation
  if (subpath.match(/^\/chat\/conversations\/(\d+)\/messages$/) && req.method === 'POST') {
    const convId = Number(subpath.split('/')[3]);
    const conv = state.conversations.find((c) => c.id === convId);
    if (!conv) return sendJson(res, 404, { error: 'Conversation not found' });

    const body = await readJson(req);
    if (!body.text || !body.text.trim()) {
      return sendJson(res, 400, { error: 'Message cannot be empty.' });
    }

    const newMsg = {
      id: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      text: body.text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    conv.messages.push(newMsg);
    conv.updatedAt = new Date().toISOString();

    // NOTIFICATION TRIGGER: Notify recipient of new message!
    if (conv.participantId && conv.participantId !== currentUser.id) {
      triggerNotification(
        conv.participantId,
        `Message from ${currentUser.fullName}`,
        `"${newMsg.text.slice(0, 60)}${newMsg.text.length > 60 ? '...' : ''}"`,
        'chat'
      );
    }

    return sendJson(res, 201, { success: true, message: newMsg, conversation: conv });
  }

  // ==========================================
  // 13. TRAVEL & ROUTE OPTIMIZATION
  // ==========================================
  if (subpath === '/travel/ai-recommendation' && req.method === 'POST') {
    const body = await readJson(req);
    const empId = body.employeeId || currentUser.id;
    const user = state.users.find((u) => u.id === empId) || currentUser;

    const answers = {
      mood: body.mood || user.latestMood || 'Steady',
      energy: Number(body.energy) || user.latestEnergyLevel || 6,
      sensoryPreference: body.sensoryPreference || 'Silent cedar forest & natural soaks',
      burnoutSource: body.burnoutSource || 'Screen and notification fatigue',
      rechargeGoal: body.rechargeGoal || 'Deep nervous system reset & uninterrupted sleep',
    };

    const n8nWebhookUrl = process.env.N8N_TRAVEL_WEBHOOK_URL || 'http://127.0.0.1:5678/webhook/workbloom/travel-destination';
    const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434/api/generate';
    let aiResponse = null;
    let usedSource = 'graceful_engine';

    // 1. Attempt connection to n8n Webhook
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1600);
      const resN8n = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: empId,
          user: { fullName: user.fullName, designation: user.designation },
          answers,
          candidates: state.destinations,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (resN8n.ok) {
        aiResponse = await resN8n.json();
        usedSource = 'n8n_ollama';
      }
    } catch {
      // If n8n is unreachable, attempt direct Ollama if available
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 1200);
        const prompt = `You are a mindful occupational therapist. Choose the best Indian restorative sanctuary for mood: ${answers.mood}, energy: ${answers.energy}/10, sensory: ${answers.sensoryPreference}, burnout: ${answers.burnoutSource}, goal: ${answers.rechargeGoal} from: Munnar Tea Sanctuary, Rishikesh Himalayan Haven, Coorg Rainforest Estate, Nubra Valley Ladakh, Varkala Ocean Springs, Dharamshala Cedar Haven, Gokarna Secluded Bay, or Auroville Eco-Sanctuary. Output JSON with destinationName, reason.`;
        const resOllama = await fetch(ollamaApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3',
            prompt,
            format: 'json',
            stream: false,
          }),
          signal: controller2.signal,
        });
        clearTimeout(timeoutId2);
        if (resOllama.ok) {
          const raw = await resOllama.json();
          aiResponse = JSON.parse(raw.response || '{}');
          usedSource = 'ollama_direct';
        }
      } catch {
        aiResponse = null;
      }
    }

    // 2. Fallback / Enrichment Logic
    let matchedDest = null;
    if (aiResponse && (aiResponse.destinationId || aiResponse.destinationName)) {
      matchedDest = state.destinations.find(
        (d) => d.id === aiResponse.destinationId || d.name.toLowerCase().includes((aiResponse.destinationName || '').toLowerCase())
      );
    }

    if (!matchedDest) {
      // Score-based algorithmic match aligned with questions
      let bestScore = -1;
      state.destinations.forEach((d) => {
        let score = (d.moodAffinity?.[answers.mood] || 75);
        if ((answers.sensoryPreference.toLowerCase().includes('tea') || answers.sensoryPreference.toLowerCase().includes('mist')) && d.id === 1) score += 15;
        if ((answers.sensoryPreference.toLowerCase().includes('river') || answers.sensoryPreference.toLowerCase().includes('sound') || answers.sensoryPreference.toLowerCase().includes('ashram')) && d.id === 2) score += 15;
        if ((answers.sensoryPreference.toLowerCase().includes('coffee') || answers.sensoryPreference.toLowerCase().includes('rainforest')) && d.id === 3) score += 15;
        if ((answers.sensoryPreference.toLowerCase().includes('desert') || answers.sensoryPreference.toLowerCase().includes('stargaz') || answers.sensoryPreference.toLowerCase().includes('alpine')) && d.id === 4) score += 15;
        if ((answers.sensoryPreference.toLowerCase().includes('cliff') || answers.sensoryPreference.toLowerCase().includes('mineral') || answers.sensoryPreference.toLowerCase().includes('ocean')) && d.id === 5) score += 15;
        if ((answers.sensoryPreference.toLowerCase().includes('cedar') || answers.sensoryPreference.toLowerCase().includes('pine')) && d.id === 6) score += 15;
        if ((answers.sensoryPreference.toLowerCase().includes('beach') || answers.sensoryPreference.toLowerCase().includes('cove') || answers.sensoryPreference.toLowerCase().includes('palm')) && d.id === 7) score += 15;
        if ((answers.sensoryPreference.toLowerCase().includes('eco') || answers.sensoryPreference.toLowerCase().includes('banyan') || answers.sensoryPreference.toLowerCase().includes('earth')) && d.id === 8) score += 15;

        if (answers.burnoutSource.toLowerCase().includes('screen') && (d.id === 4 || d.id === 2 || d.id === 1)) score += 10;
        if (answers.burnoutSource.toLowerCase().includes('physical') && (d.id === 1 || d.id === 3 || d.id === 5)) score += 10;
        if (answers.burnoutSource.toLowerCase().includes('creative') && (d.id === 5 || d.id === 7 || d.id === 8)) score += 10;
        if (answers.burnoutSource.toLowerCase().includes('emotional') && (d.id === 2 || d.id === 6 || d.id === 8)) score += 10;

        if (score > bestScore) {
          bestScore = score;
          matchedDest = d;
        }
      });
    }

    if (!matchedDest) matchedDest = state.destinations[0];

    const matchPercentage = Math.min(99, Math.max(91, (matchedDest.moodAffinity?.[answers.mood] || 88) + 5));

    const personalizedReason = aiResponse?.reason || aiResponse?.aiReasoning || (
      `Based on your current mood of "${answers.mood}" (Energy: ${answers.energy}/10) and your sensitivity to ${answers.burnoutSource.toLowerCase()}, ${matchedDest.name} in ${matchedDest.location} provides the ideal restorative frequency. ${matchedDest.moodReason} The sanctuary directly fulfills your wish for "${answers.rechargeGoal.toLowerCase()}".`
    );

    const biologicalBenefit = matchedDest.sensoryLevel
      ? `Parasympathetic nervous system recovery via ${matchedDest.sensoryLevel}. Dramatic reduction in cognitive strain biomarkers.`
      : 'Somatic nervous system reset and natural circadian recalibration.';

    const rhythmsByDestId = {
      1: [
        { time: '07:00 AM', activity: 'Dawn mist walking trail through emerald tea slopes' },
        { time: '10:30 AM', activity: 'Fresh cardamom infusion & mindful silence on wood veranda' },
        { time: '03:30 PM', activity: 'Ayurvedic herbal oil therapy and warm cedar bath' },
        { time: '07:30 PM', activity: 'Evening fire pit contemplation and restful slumber' },
      ],
      2: [
        { time: '06:30 AM', activity: 'Sunrise pranayama breathwork along the jade Ganges bank' },
        { time: '11:00 AM', activity: 'Tibetan acoustic singing bowl harmonic sound therapy' },
        { time: '03:30 PM', activity: 'Herbal mountain tulsi tea on quiet ashram reading terrace' },
        { time: '07:00 PM', activity: 'Silent dusk river meditation under Himalayan foothills' },
      ],
      3: [
        { time: '07:30 AM', activity: 'Birdsong symphony & fresh organic roast coffee brew' },
        { time: '11:00 AM', activity: 'Rainforest canopy walk under ancient Western Ghats trees' },
        { time: '03:30 PM', activity: 'Natural mountain stream soak & Kodagu honey tasting' },
        { time: '08:00 PM', activity: 'Veranda rain acoustics & 9+ hours uninterrupted sleep' },
      ],
      4: [
        { time: '07:30 AM', activity: 'Sunlit apricot grove meditation in Trans-Himalayan calm' },
        { time: '11:30 AM', activity: 'Diskit monastery silent gong session & solar eco-dining' },
        { time: '04:00 PM', activity: 'Infinite sand dunes walking in crisp zero-signal air' },
        { time: '08:30 PM', activity: 'Bortle-1 Milky Way stargazing on panoramic dark sky deck' },
      ],
      5: [
        { time: '07:00 AM', activity: 'Red cliff coastal walk overlooking Arabian Sea waves' },
        { time: '11:00 AM', activity: 'Natural mineral spring bath and Ayurvedic Panchakarma' },
        { time: '04:00 PM', activity: 'Clifftop shaded reading terrace & creative journaling' },
        { time: '07:30 PM', activity: 'Rhythmic ocean surf sunset meditation and sound sleep' },
      ],
      6: [
        { time: '07:30 AM', activity: 'Silent deodar pine needle trail in fresh mountain air' },
        { time: '11:00 AM', activity: 'Tibetan herbal tea blends & acoustic monastery bells' },
        { time: '03:30 PM', activity: 'Sunbathing on wooden terrace facing snowy Dhauladhar peaks' },
        { time: '07:30 PM', activity: 'Cedarwood hearthside journaling and mental quietude' },
      ],
      7: [
        { time: '07:00 AM', activity: 'Barefoot grounding walk on pristine Half Moon beach' },
        { time: '11:00 AM', activity: 'Fresh coconut water & hammock rest under coconut palms' },
        { time: '04:00 PM', activity: 'Gentle warm saltwater float in secluded turquoise cove' },
        { time: '07:30 PM', activity: 'Sunset tide listening and restorative coastal dinner' },
      ],
      8: [
        { time: '06:30 AM', activity: 'Silent meditation under the ancient sacred Banyan tree' },
        { time: '11:00 AM', activity: 'Organic permaculture garden walk and spirulina refreshment' },
        { time: '03:30 PM', activity: 'Shaded red earth bicycle ride through regenerating forest' },
        { time: '07:30 PM', activity: 'Conscious community gratitude circle & quiet reflection' },
      ],
    };

    return sendJson(res, 200, {
      success: true,
      source: usedSource,
      engine: 'n8n Workflow + Ollama AI (Llama 3 / Mistral)',
      n8nServiceStatus: usedSource === 'n8n_ollama'
        ? 'Connected to live n8n webhook'
        : 'n8n webhook configured (running via built-in neural fallback engine)',
      n8nWebhookUrl,
      matchScore: matchPercentage,
      destination: matchedDest,
      aiReasoning: personalizedReason,
      biologicalBenefit,
      recommendedDailyRhythm: rhythmsByDestId[matchedDest.id] || rhythmsByDestId[1],
      evaluatedAnswers: answers,
      generatedAt: new Date().toISOString(),
    });
  }

  if (subpath === '/travel/destinations' && req.method === 'GET') {
    const selectedMood = parsedUrl.query.mood || currentUser.latestMood || 'Steady';
    const list = state.destinations.map((d) => {
      const matchScore = d.moodAffinity?.[selectedMood] || 85;
      const isRecommended = d.recommendedMoods?.includes(selectedMood) || matchScore >= 90;
      return {
        ...d,
        activeMood: selectedMood,
        matchScore,
        isRecommended,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return sendJson(res, 200, list);
  }

  if (subpath === '/travel/routes/optimize' && req.method === 'POST') {
    const body = await readJson(req);
    const originStr = body.origin || body.startPoint || 'Bengaluru, Karnataka';
    const destinationStr = body.destination || 'Munnar & Anamalai Tea Sanctuary, India';
    const pacingMode = body.pacingMode || body.pace || 'Scenic & Slow Pacing';

    // Find destination or match by name
    const destMatch = state.destinations.find(
      (d) => destinationStr.toLowerCase().includes(d.name.toLowerCase()) || destinationStr.toLowerCase().includes(d.country.toLowerCase())
    ) || state.destinations[0];

    const KNOWN_COORDS = {
      'bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, Karnataka' },
      'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, Karnataka' },
      'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai, Maharashtra' },
      'delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi, Delhi' },
      'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' },
      'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, Telangana' },
      'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune, Maharashtra' },
      'kochi': { lat: 9.9312, lng: 76.2673, name: 'Kochi, Kerala' },
      'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata, West Bengal' },
      'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad, Gujarat' },
      'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur, Rajasthan' },
      'goa': { lat: 15.2993, lng: 74.1240, name: 'Goa' },
      'coimbatore': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore, Tamil Nadu' },
      'mysuru': { lat: 12.2958, lng: 76.6394, name: 'Mysuru, Karnataka' },
      'chandigarh': { lat: 30.7333, lng: 76.7794, name: 'Chandigarh' },
    };

    const originKey = Object.keys(KNOWN_COORDS).find((k) => originStr.toLowerCase().includes(k));
    const originCoords = originKey ? KNOWN_COORDS[originKey] : { lat: 12.9716, lng: 77.5946, name: originStr };
    const destCoords = destMatch ? destMatch.coords : { lat: 10.0889, lng: 77.0595, name: destinationStr };

    // Intermediate restorative waypoints in India
    const waypoint1Lat = Number((originCoords.lat * 0.75 + destCoords.lat * 0.25).toFixed(4));
    const waypoint1Lng = Number((originCoords.lng * 0.75 + destCoords.lng * 0.25).toFixed(4));
    const waypoint2Lat = Number((originCoords.lat * 0.5 + destCoords.lat * 0.5).toFixed(4));
    const waypoint2Lng = Number((originCoords.lng * 0.5 + destCoords.lng * 0.5).toFixed(4));
    const waypoint3Lat = Number((originCoords.lat * 0.25 + destCoords.lat * 0.75).toFixed(4));
    const waypoint3Lng = Number((originCoords.lng * 0.25 + destCoords.lng * 0.75).toFixed(4));

    const waypoints = [
      {
        id: 'start',
        name: originStr,
        coords: originCoords,
        type: 'origin',
        label: `Departure Point: ${originStr}`,
        restAction: 'Mindful departure with zero rush buffer',
        recommendedPauseMinutes: 0,
      },
      {
        id: 'wp1',
        name: 'Ghats Scenic Forest Corridor',
        coords: { lat: waypoint1Lat, lng: waypoint1Lng },
        type: 'scenic_pause',
        label: 'Quiet Shaded Forest Rest Station',
        restAction: '15-minute natural light exposure and deep diaphragm breathing',
        recommendedPauseMinutes: 20,
      },
      {
        id: 'wp2',
        name: 'Spice Plantation & Organic Tea Restpoint',
        coords: { lat: waypoint2Lat, lng: waypoint2Lng },
        type: 'organic_nutrition',
        label: 'Organic Farm Stand & Herbal Kadha',
        restAction: 'Freshly brewed herbal tea and restorative walking stretch',
        recommendedPauseMinutes: 35,
      },
      {
        id: 'wp3',
        name: 'Low-Decibel Foothill Transition Shelter',
        coords: { lat: waypoint3Lat, lng: waypoint3Lng },
        type: 'sensory_decompression',
        label: 'Acoustic Sound Buffer & Mountain Foothills',
        restAction: 'Phone power-down, quiet arrival contemplation',
        recommendedPauseMinutes: 25,
      },
      {
        id: 'dest',
        name: destMatch.name,
        coords: destCoords,
        type: 'destination',
        label: `Sanctuary Arrival: ${destMatch.name}`,
        restAction: `Check-in to ${destMatch.theme}. Zero notifications permitted.`,
        recommendedPauseMinutes: 120,
      },
    ];

    const optimizedTitles = waypoints.map((w) => `${w.name} (${w.restAction})`);

    const restScore = pacingMode.includes('Slow') ? 98 : pacingMode.includes('Minimum') ? 93 : 95;

    return sendJson(res, 200, {
      origin: originStr,
      destination: destMatch.name,
      destinationCountry: destMatch.country,
      pacingMode,
      originCoords,
      destCoords,
      waypoints,
      optimizedRoute: optimizedTitles,
      restScore,
      estimatedHours: pacingMode.includes('Slow') ? 4.5 : 3.0,
      sceneryNotes: `Route dynamically mapped for low sensory overwhelm, shaded terrain buffers, and regenerative breaks.`,
      transitProfile: {
        totalStops: waypoints.length,
        restMinutesTotal: 80,
        noisePollutionRating: 'Ultra-Low (<35 dB)',
        carbonOffsetKg: 28.4,
      },
    });
  }

  if (subpath.startsWith('/travel/preferences')) {
    const requestedEmpId = Number(parsedUrl.query.employeeId) || currentUser.id;
    if (requestedEmpId !== currentUser.id && currentUser.role !== 'HR' && currentUser.role !== 'ADMIN') {
      return sendJson(res, 403, { error: "Privacy Access Denied: Travel preferences are private." });
    }
    if (req.method === 'POST') {
      const body = await readJson(req);
      state.travelPreferences[requestedEmpId] = {
        ...(state.travelPreferences[requestedEmpId] || {}),
        ...body,
      };
      triggerNotification(requestedEmpId, 'Travel Preferences Saved', 'Your restorative pace and route preferences are updated.', 'travel');
      return sendJson(res, 200, state.travelPreferences[requestedEmpId]);
    }
    return sendJson(res, 200, state.travelPreferences[requestedEmpId] || {
      preferredPace: 'Restorative & Slow',
      destinationTypes: ['Sanctuary', 'Mountain'],
      maxTravelHours: 4,
      transportPreference: 'Train & Scenic Transit',
    });
  }

  // ==========================================
  // 14. NOTIFICATIONS
  // ==========================================
  if (subpath.startsWith('/notifications/employee/')) {
    const empId = Number(subpath.split('/')[3]) || currentUser.id;
    const userNotifs = state.notifications.filter((n) => n.employeeId === empId);
    return sendJson(res, 200, userNotifs);
  }

  if (subpath.match(/^\/notifications\/(\d+)\/read$/) && req.method === 'POST') {
    const notifId = Number(subpath.split('/')[2]);
    const notif = state.notifications.find((n) => n.id === notifId);
    if (notif) notif.read = true;
    const userNotifs = state.notifications.filter((n) => n.employeeId === currentUser.id);
    currentUser.unreadNotificationCount = userNotifs.filter((n) => !n.read).length;
    return sendJson(res, 200, { success: true, unreadCount: currentUser.unreadNotificationCount });
  }

  if (subpath === '/notifications/read-all' && req.method === 'POST') {
    state.notifications.forEach((n) => {
      if (n.employeeId === currentUser.id) n.read = true;
    });
    currentUser.unreadNotificationCount = 0;
    return sendJson(res, 200, { success: true, unreadCount: 0 });
  }

  // ==========================================
  // 15. ANALYTICS (PERSONAL VS ROLE-GATED COMPANY)
  // ==========================================
  if (subpath.startsWith('/analytics/personal/')) {
    const empId = Number(subpath.split('/').pop()) || currentUser.id;
    if (empId !== currentUser.id && currentUser.role !== 'HR' && currentUser.role !== 'ADMIN') {
      return sendJson(res, 403, { error: 'Access Denied: Personal analytics can only be viewed by the employee.' });
    }
    return sendJson(res, 200, {
      weeklyEnergyAverage: 7.8,
      weeklyStressAverage: 2.6,
      focusHoursProtected: 14.5,
      checkInConsistency: '92%',
      balanceIndex: 'Optimal Pace',
      recentTrends: [
        { day: 'Mon', energy: 8, stress: 3 },
        { day: 'Tue', energy: 9, stress: 2 },
        { day: 'Wed', energy: 6, stress: 5 },
        { day: 'Thu', energy: 8, stress: 2 },
        { day: 'Fri', energy: 8, stress: 2 },
      ]
    });
  }

  // ROLE-GATED ENDPOINT: Company-wide analytics requires HR or ADMIN!
  if (subpath === '/analytics/company' && req.method === 'GET') {
    if (currentUser.role !== 'HR' && currentUser.role !== 'ADMIN') {
      return sendJson(res, 403, {
        error: 'Access Denied (403): Company-wide organizational analytics require HR or Administrator authorization.',
        currentRole: currentUser.role,
      });
    }
    return sendJson(res, 200, {
      totalEmployees: state.users.length,
      overallWellbeingIndex: 86,
      averageDailyEnergy: 7.6,
      averageDailyStress: 2.8,
      participatingInClubs: '78%',
      recognitionsSentThisMonth: state.recognitions.length + 18,
      volunteerHoursThisQuarter: 142,
      departmentRhythms: [
        { department: 'Experience & Culture', score: 91, energy: 8.2, stress: 2.3 },
        { department: 'Engineering', score: 84, energy: 7.4, stress: 3.1 },
        { department: 'Product & Design', score: 87, energy: 7.8, stress: 2.7 },
        { department: 'People & Wellbeing', score: 94, energy: 8.6, stress: 2.0 },
      ]
    });
  }

  // ==========================================
  // 16. HEALTH CHECK
  // ==========================================
  if (subpath === '/integrations/health') {
    return sendJson(res, 200, {
      status: 'UP',
      service: 'workbloom-fullstack-api',
      mode: 'in-memory-realistic',
      database: 'PostgreSQL-compatible mock store',
      n8nServiceConfiguredUrl: 'http://127.0.0.1:5678/webhook/workbloom/wellness',
      time: new Date().toISOString(),
    });
  }

  return sendJson(res, 200, { status: 'ok', endpoint: subpath });
}
