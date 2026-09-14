import { Meeting } from '../../types';
import { heroSalesMeeting } from './heroSalesMeeting';
import { incidentMeeting } from './incidentMeeting';
import { productMeeting } from './productMeeting';
import { oneOnOneMeeting } from './oneOnOneMeeting';

export const INITIAL_MEETINGS: Meeting[] = [
  heroSalesMeeting,
  incidentMeeting,
  productMeeting,
  oneOnOneMeeting,
];

export const INITIAL_MEETINGS_MAP: Record<string, Meeting> = INITIAL_MEETINGS.reduce(
  (acc, meeting) => {
    acc[meeting.id] = meeting;
    return acc;
  },
  {} as Record<string, Meeting>
);

