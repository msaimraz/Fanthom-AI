import { Meeting } from '../../types';

export const productMeeting: Meeting = {
  id: 'product-sync-mobile-app',
  title: 'Q4 Product Strategy & Design Sync: Fathom Mobile App',
  date: '2026-09-13T16:00:00Z',
  durationSeconds: 165,
  category: 'team',
  mediaUrl: '/assets/audio/hero-sales.mp3', // Audio asset
  activeTemplateId: 'executive',
  availableTemplateIds: ['executive', 'engineering'],
  tags: ['Product', 'Mobile', 'iOS', 'Design', 'Roadmap'],
  participants: [
    {
      id: 'jessica-wu',
      name: 'Jessica Wu',
      email: 'jessica@fathom.design',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face',
      role: 'Head of Product',
      company: 'Fathom Labs',
      isHost: true,
    },
    {
      id: 'liam-oconnor',
      name: "Liam O'Connor",
      email: 'liam@fathom.design',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=128&h=128&fit=crop&crop=face',
      role: 'Lead Product Designer',
      company: 'Fathom Labs',
    },
    {
      id: 'ben-miller',
      name: 'Ben Miller',
      email: 'ben@fathom.design',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&crop=face',
      role: 'iOS Tech Lead',
      company: 'Fathom Labs',
    },
  ],
  summaries: {
    executive: {
      templateId: 'executive',
      templateName: 'Executive Brief',
      overview:
        'Product and design alignment on the upcoming v2.0 iOS release. Key decisions made to prioritize offline recording cache and a bottom-sheet gesture for one-tap clip creation before TestFlight deployment.',
      keyTakeaways: [
        'TestFlight Milestone: Scheduled for October 1st with a target internal beta cohort of 80 users.',
        'Core UX Pivot: Replaced complex modal clip editor with swipeable mini-scrubber sheet.',
        'Offline Reliability: Background audio uploads will queue locally in SQLite with auto-retry on reconnect.',
      ],
      nextSteps: [
        'Liam to deliver finalized Figma component tokens for dark-mode player by Thursday.',
        'Ben to run battery consumption benchmarks for the background audio capture service.',
      ],
      metrics: {
        'Beta Target': 'Oct 1st',
        'Target Crash Free': '99.5%',
        'Design Handoff': 'Complete',
      },
      sentiment: 'positive',
    },
    engineering: {
      templateId: 'engineering',
      templateName: 'Engineering RCA & Tech Sync',
      overview:
        'Architectural review of iOS background processing constraints and AVFoundation audio buffer streaming to local CoreData store.',
      keyTakeaways: [
        'AVAudioSession: Must handle interruptions (phone calls, Siri) gracefully without terminating meeting stream.',
        'Chunked Uploads: Network layer will upload 10-second compressed Opus audio chunks.',
        'Memory Footprint: Peak memory capped at 45MB during active 1-hour recording session.',
      ],
      nextSteps: [
        'Write integration test for audio route changes (Bluetooth disconnect).',
        'Benchmark SQLite write latency under high frame-rate UI scrolling.',
      ],
      sentiment: 'positive',
    },
  },
  actionItems: [
    {
      id: 'act-prod-1',
      text: 'Finalize Figma design tokens for iOS audio scrubber and bottom-sheet clip drawer by Thursday.',
      assigneeId: 'liam-oconnor',
      completed: true,
      timestamp: 45,
      contextQuote: "I will have the updated gesture specs and tokens in Figma by Thursday afternoon.",
      confidence: 0.97,
      category: 'Product',
    },
    {
      id: 'act-prod-2',
      text: 'Run battery consumption profile on iOS background audio capture service.',
      assigneeId: 'ben-miller',
      completed: false,
      timestamp: 92,
      contextQuote: "I'll run Xcode Instruments on an iPhone 15 Pro to check battery drain over an hour-long recording.",
      confidence: 0.94,
      category: 'Technical',
    },
  ],
  transcript: [
    {
      id: 'prod-turn-1',
      speakerId: 'jessica-wu',
      startTime: 0,
      endTime: 25,
      text: "Thanks for meeting Liam and Ben. We're three weeks away from our target October first TestFlight beta for the new mobile app. Today I want to lock down the offline recording buffer and make sure our clipping interaction feels effortless on smaller screens.",
    },
    {
      id: 'prod-turn-2',
      speakerId: 'liam-oconnor',
      startTime: 26,
      endTime: 55,
      text: "On the design side, we replaced the modal popup with an interactive bottom sheet. Users can swipe up directly on any transcript turn to immediately grab a 30-second highlight snippet. I will have the updated gesture specs and tokens in Figma by Thursday afternoon.",
    },
    {
      id: 'prod-turn-3',
      speakerId: 'ben-miller',
      startTime: 56,
      endTime: 105,
      text: "That bottom sheet feels super responsive in the prototype. On the engineering side, we've implemented the local SQLite audio buffer. If the user walks into an elevator or loses cellular connection, audio continues recording seamlessly and syncs in chunked Opus buffers once back online. I'll run Xcode Instruments on an iPhone 15 Pro to check battery drain over an hour-long recording.",
    },
    {
      id: 'prod-turn-4',
      speakerId: 'jessica-wu',
      startTime: 106,
      endTime: 165,
      text: "That sounds like a massive win for user trust. Let's make sure the battery drain stays under three percent per hour. Once Liam's tokens are in, Ben can start wiring the bottom sheet for our beta build next week.",
    },
  ],
  clips: [
    {
      id: 'clip-prod-1',
      meetingId: 'product-sync-mobile-app',
      title: 'Bottom Sheet Clip Interaction & Offline Buffer',
      startTime: 26,
      endTime: 105,
      speakerIds: ['liam-oconnor', 'ben-miller'],
      quote: 'Users can swipe up directly on any transcript turn to immediately grab a highlight snippet.',
      shareId: 'share-prod-clip',
      createdAt: '2026-09-13T17:00:00Z',
    },
  ],
  highlights: [
    {
      id: 'hl-prod-1',
      meetingId: 'product-sync-mobile-app',
      title: 'Bottom Sheet Clip UX Approved',
      startTime: 26,
      endTime: 55,
      color: 'violet',
      category: 'Product Request',
    },
  ],
};

