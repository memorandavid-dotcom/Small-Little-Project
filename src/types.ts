export enum TaskStatus {
  TODO = 'To-Do',
  IN_PROGRESS = 'In Progress',
  OVERDUE = 'Overdue',
  COMPLETED = 'Finished'
}

export interface SubStep {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  subject?: string;
  description?: string;
  status: TaskStatus;
  deadline?: string; // ISO string
  reminderFrequency?: 'none' | 'hourly' | 'daily' | 'weekly';
  reminderWindow?: {
    start: string; // HH:mm
    end: string;   // HH:mm
  };
  dailyReminderTime?: string; // HH:mm
  weeklyReminderDay?: string; // Monday, Tuesday, etc.
  hourlyReminderLimit?: number;
  hourlyReminderInterval?: number; // in hours
  reminderCount?: number;
  priority: 'low' | 'medium' | 'high';
  subSteps: SubStep[];
  requirements?: {
    process: string;
    materials: string;
  };
  lastRemindedAt?: string; // ISO string
  createdAt: string;
  category: 'work' | 'personal' | 'study' | 'other';
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  completedAt?: string; // ISO string
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  type: 'work' | 'break' | 'meeting' | 'personal';
  isAIProposed?: boolean;
  locationType?: 'Online' | 'In-Person' | 'Hybrid';
  location?: string;
  platform?: string;
  link?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // ISO string
  isSent: boolean;
}

export interface TimeUsageLog {
  id: string;
  activity: string;
  startTime: string;
  endTime?: string;
  type: 'productive' | 'non-important';
  taskId?: string;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  body?: string;
  date: string; // ISO string
  isRead: boolean;
  isImportant: boolean;
  isArchived: boolean;
  avatar?: string;
}
