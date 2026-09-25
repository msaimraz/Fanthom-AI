export interface Participant {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  company: string;
  isHost?: boolean;
}

export interface TranscriptWord {
  word: string;
  startTime: number;
  endTime: number;
}

export interface TranscriptTurn {
  id: string;
  speakerId: string;
  startTime: number;
  endTime: number;
  text: string;
  words?: TranscriptWord[];
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assigneeId: string;
  completed: boolean;
  timestamp: number;
  contextQuote: string;
  confidence: number;
  category?: 'Follow-up' | 'Technical' | 'Contract' | 'Product';
}

export interface MeetingSummary {
  templateId: string;
  templateName: string;
  overview: string;
  keyTakeaways: string[];
  nextSteps?: string[];
  chapters?: Chapter[];
  metrics?: Record<string, string | number>;
  sentiment: 'positive' | 'neutral' | 'mixed';
}

export interface Highlight {
  id: string;
  meetingId: string;
  title: string;
  startTime: number;
  endTime: number;
  color: 'violet' | 'amber' | 'emerald' | 'rose' | 'sky';
  category: 'Key Decision' | 'Objection' | 'Pricing' | 'Action' | 'Product Request';
  quote?: string;
}

export interface Clip {
  id: string;
  meetingId: string;
  title: string;
  startTime: number;
  endTime: number;
  speakerIds: string[];
  quote?: string;
  shareId: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  durationSeconds: number;
  category: 'customer' | 'team' | 'one_on_one' | 'executive';
  participants: Participant[];
  mediaUrl: string;
  thumbnailUrl?: string;
  activeTemplateId: string;
  availableTemplateIds: string[];
  summaries: Record<string, MeetingSummary>;
  actionItems: ActionItem[];
  chapters?: Chapter[];
  transcript: TranscriptTurn[];
  clips: Clip[];
  highlights: Highlight[];
  tags: string[];
}

export interface SummaryTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  iconName: string;
}

export interface Workspace {
  id: string;
  slug: string;
  name: string;
  plan: string;
}

export interface UserProfile {
  id: string;
  workspaceId: string;
  slug: string;
  name: string;
  email: string;
  roleTitle: string;
  avatarUrl: string;
  isActive: boolean;
}


