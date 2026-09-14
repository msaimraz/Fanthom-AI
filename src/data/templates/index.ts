import { SummaryTemplate } from '../../types';

export const SUMMARY_TEMPLATES: Record<string, SummaryTemplate> = {
  executive: {
    id: 'executive',
    name: 'Executive Brief',
    description: 'High-level business takeaways, strategic alignment, key decisions, and major next steps.',
    badge: 'Executive',
    iconName: 'Briefcase',
  },
  sales: {
    id: 'sales',
    name: 'Sales Discovery (MEDDPICC)',
    description: 'Structured qualification analyzing Pain, Metrics, Economic Buyer, Decision Criteria, and Rollout.',
    badge: 'Sales',
    iconName: 'TrendingUp',
  },
  engineering: {
    id: 'engineering',
    name: 'Engineering RCA & Tech Sync',
    description: 'Root cause analysis, architectural review, system bottlenecks, and technical mitigation.',
    badge: 'Engineering',
    iconName: 'Terminal',
  },
  one_on_one: {
    id: 'one_on_one',
    name: '1-on-1 Coaching & Goals',
    description: 'Personal check-in, performance feedback, growth milestones, and manager commitments.',
    badge: '1-on-1',
    iconName: 'UserCheck',
  },
};

