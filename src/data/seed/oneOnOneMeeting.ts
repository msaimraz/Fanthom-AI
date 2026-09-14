import { Meeting } from '../../types';

export const oneOnOneMeeting: Meeting = {
  id: 'manager-1-on-1-career-growth',
  title: 'Manager 1-on-1: Quarterly Career & Feedback Review',
  date: '2026-09-12T11:00:00Z',
  durationSeconds: 140,
  category: 'one_on_one',
  mediaUrl: '/assets/audio/hero-sales.mp3', // Fallback audio
  activeTemplateId: 'one_on_one',
  availableTemplateIds: ['one_on_one', 'executive'],
  tags: ['1-on-1', 'Career', 'Engineering', 'Leadership'],
  participants: [
    {
      id: 'maya-patel',
      name: 'Maya Patel',
      email: 'maya@fanthom.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=128&h=128&fit=crop&crop=face',
      role: 'Engineering Director',
      company: 'Fathom Labs',
      isHost: true,
    },
    {
      id: 'chris-evans',
      name: 'Chris Evans',
      email: 'chris.evans@fanthom.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face',
      role: 'Staff ML Engineer',
      company: 'Fathom Labs',
    },
  ],
  summaries: {
    one_on_one: {
      templateId: 'one_on_one',
      templateName: '1-on-1 Coaching & Goals',
      overview:
        'Quarterly career milestone review. Chris demonstrated outstanding technical leadership on the real-time inference latency initiative. Maya agreed to sponsor Chris for Principal Engineer promotion this cycle.',
      keyTakeaways: [
        'Impact Review: Led the GPU optimization initiative that cut cluster spend by 35% while increasing throughput.',
        'Mentorship & Multiplier: Chris will formally mentor two junior infrastructure engineers to expand team depth.',
        'Promotion Committee: Maya will compile the nomination packet for the October promotion committee review.',
        'Focus & Well-being: Established dedicated no-meeting morning blocks for deep architectural writing and research.',
      ],
      nextSteps: [
        'Maya to draft nomination portfolio for promotion committee by October 15th.',
        'Chris to kick off bi-weekly mentorship check-ins with Jordan and Sarah.',
      ],
      metrics: {
        'Promotion Track': 'Principal Engineer',
        'Cost Reduction': '35%',
        'Mentees': '2 Engineers',
      },
      sentiment: 'positive',
    },
    executive: {
      templateId: 'executive',
      templateName: 'Executive Brief',
      overview:
        'High-performing staff engineer retention and leadership calibration. Chris Evans on track for principal promotion with strong technical leverage and cultural leadership.',
      keyTakeaways: [
        'Strategic Contribution: High retention priority; driving core proprietary inference optimizations.',
        'Organizational Growth: Taking on senior mentorship responsibilities to develop tier-2 engineering talent.',
      ],
      nextSteps: [
        'Align compensation band for Principal Engineer title change.',
      ],
      sentiment: 'positive',
    },
  },
  actionItems: [
    {
      id: 'act-1on1-1',
      text: 'Draft proposal for mentoring two junior ML engineers on distributed model training.',
      assigneeId: 'chris-evans',
      completed: false,
      timestamp: 48,
      contextQuote: "I'd love to mentor Jordan and Sarah on distributed GPU memory management starting next sprint.",
      confidence: 0.98,
      category: 'Follow-up',
    },
    {
      id: 'act-1on1-2',
      text: 'Submit Principal Engineer promotion nomination portfolio to executive committee by October 15th.',
      assigneeId: 'maya-patel',
      completed: false,
      timestamp: 88,
      contextQuote: "I will personally prepare and champion your promotion dossier for the October committee review.",
      confidence: 0.99,
      category: 'Follow-up',
    },
    {
      id: 'act-1on1-3',
      text: 'Block three 3-hour no-meeting focus blocks in calendar for core architectural whitepaper writeup.',
      assigneeId: 'chris-evans',
      completed: true,
      timestamp: 118,
      contextQuote: "I will configure Google Calendar to protect Tuesday and Thursday mornings for deep work.",
      confidence: 0.94,
      category: 'Follow-up',
    },
  ],
  transcript: [
    {
      id: '1on1-turn-1',
      speakerId: 'maya-patel',
      startTime: 0,
      endTime: 24,
      text: "Chris, thanks for taking the time for our quarterly check-in. Looking back at Q3, your work optimizing our inference clusters cut thirty-five percent off our GPU bill while maintaining p99 latency under target. The entire leadership team noticed.",
    },
    {
      id: '1on1-turn-2',
      speakerId: 'chris-evans',
      startTime: 25,
      endTime: 62,
      text: "Thanks Maya, that means a lot. The team worked really hard on the custom CUDA kernels. Looking ahead, I really want to focus on engineering leverage. I'd love to mentor Jordan and Sarah on distributed GPU memory management starting next sprint, so we build stronger bench depth.",
    },
    {
      id: '1on1-turn-3',
      speakerId: 'maya-patel',
      startTime: 63,
      endTime: 98,
      text: "That kind of organizational multiplying effect is exactly what distinguishes a Principal Engineer. I will personally prepare and champion your promotion dossier for the October committee review. You have earned this recognition.",
    },
    {
      id: '1on1-turn-4',
      speakerId: 'chris-evans',
      startTime: 99,
      endTime: 140,
      text: "I appreciate that sponsorship so much Maya. To keep up the momentum without burning out, I will configure Google Calendar to protect Tuesday and Thursday mornings for deep work so I can finish the streaming inference whitepaper.",
    },
  ],
  clips: [
    {
      id: 'clip-1on1-1',
      meetingId: 'manager-1-on-1-career-growth',
      title: 'Principal Promotion Sponsorship & Mentorship Commitment',
      startTime: 63,
      endTime: 98,
      speakerIds: ['maya-patel'],
      quote: 'That kind of organizational multiplying effect is exactly what distinguishes a Principal Engineer.',
      shareId: 'share-1on1-promotion',
      createdAt: '2026-09-12T12:00:00Z',
    },
  ],
  highlights: [
    {
      id: 'hl-1on1-1',
      meetingId: 'manager-1-on-1-career-growth',
      title: 'Principal Promotion Endorsed',
      startTime: 63,
      endTime: 98,
      color: 'emerald',
      category: 'Key Decision',
    },
  ],
};

