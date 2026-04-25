import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LayoutDashboard, 
  MessageSquare, 
  Plus, 
  AlertCircle,
  Bell,
  Settings,
  LogOut,
  User,
  Mail,
  Shield,
  Camera,
  UserPlus,
  ArrowLeft,
  Timer,
  BookOpen,
  Trash2,
  Target,
  Zap,
  Star,
  Check,
  Edit2,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Video,
  MapPin,
  Link as LinkIcon,
  Globe,
  BarChart3,
  AlertTriangle,
  Menu,
  X,
  Lock,
  Upload,
  Download,
  Maximize2,
  ShieldCheck
} from 'lucide-react';
import { useChronosStore } from './hooks/useChronosStore';
import { geminiService } from './services/geminiService';
import { Task, TaskStatus, ScheduleItem, Reminder, Email, Course } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster, toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  format, 
  isValid,
  isAfter, 
  isBefore, 
  addHours, 
  startOfToday, 
  addMinutes, 
  subMinutes, 
  isSameDay, 
  isSameWeek,
  set,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  addYears,
  subYears
} from 'date-fns';
import { FocusTimer } from './components/FocusTimer';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { AnalogClock } from './components/AnalogClock';

const PREDEFINED_AVATARS = [
  "https://picsum.photos/seed/avatar1/200/200",
  "https://picsum.photos/seed/avatar2/200/200",
  "https://picsum.photos/seed/avatar3/200/200",
  "https://picsum.photos/seed/avatar4/200/200",
  "https://picsum.photos/seed/avatar5/200/200",
  "https://picsum.photos/seed/avatar6/200/200",
  "https://picsum.photos/seed/avatar7/200/200",
  "https://picsum.photos/seed/avatar8/200/200",
];

const PLAN_PRICING: Record<string, number> = {
  'basic': 0,
  'student': 5.99,
  'pro': 9.99,
  'premium': 21.99,
  'business': 28.00
};

const PLAN_HIERARCHY: Record<string, number> = {
  'basic': 0,
  'student': 1,
  'pro': 2,
  'premium': 3,
  'business': 4
};

const PlanGuard = ({ 
  plan, 
  userPlan, 
  userAddons = [],
  children, 
  label,
  addonId,
  onNavigate,
  onPurchaseAddon
}: { 
  plan: string, 
  userPlan: string, 
  userAddons?: string[],
  children: React.ReactNode, 
  label: string,
  addonId?: string,
  onNavigate: (tab: string) => void,
  onPurchaseAddon?: (id: string, price: number) => void
}) => {
  const isUnlockedByPlan = (PLAN_HIERARCHY[userPlan] || 0) >= (PLAN_HIERARCHY[plan] || 0);
  const isUnlockedByAddon = addonId ? userAddons.includes(addonId) : false;
  const isLocked = !isUnlockedByPlan && !isUnlockedByAddon;

  if (isLocked) {
    const planGap = (PLAN_PRICING[plan] || 0) - (PLAN_PRICING[userPlan] || 0);
    const addonPrice = Math.max(0.99, Math.round(planGap * 0.3 * 100) / 100);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 bg-[#F8F9FA]/50 rounded-[3rem] border-2 border-dashed border-[#E9ECEF] p-12"
      >
        <div className="w-24 h-24 bg-white border border-[#E9ECEF] text-[#1A1A1A] rounded-[2.5rem] flex items-center justify-center shadow-xl relative overflow-hidden group">
          <Lock size={40} className="relative z-10 opacity-40" />
          <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-2">
          <Badge className="bg-gray-200 text-gray-600 border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
            Locked Feature
          </Badge>
          <h2 className="text-4xl font-bold tracking-tighter grayscale italic text-gray-400">Exclusive Content</h2>
          <p className="text-[#868E96] mt-4 max-w-md mx-auto leading-relaxed font-medium">
            The <span className="text-[#1A1A1A] font-bold underline decoration-blue-500/30">{label}</span> is part of our {plan.toUpperCase()} toolkit. 
            Choose how you want to unlock this power.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl pt-4">
          <Card className="p-6 rounded-[2rem] border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onNavigate('settings')}>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">Full Access</p>
            <h4 className="text-lg font-bold mb-2 tracking-tight group-hover:text-blue-600 transition-colors">Upgrade to {plan.toUpperCase()}</h4>
            <p className="text-xs text-[#868E96] font-medium mb-6">Unlock all features in current and higher tiers instantly.</p>
            <Button className="w-full rounded-xl bg-[#1A1A1A] text-white font-bold h-12">Upgrade Plan</Button>
          </Card>
          
          {addonId && (
            <Card className="p-6 rounded-[2rem] border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onPurchaseAddon?.(addonId, addonPrice)}>
              <p className="text-[10px] font-bold text-purple-600 uppercase tracking-[0.2em] mb-4">A La Carte</p>
              <h4 className="text-lg font-bold mb-2 tracking-tight group-hover:text-purple-600 transition-colors">Buy Individual Add-On</h4>
              <p className="text-xs text-[#868E96] font-medium mb-6">Keep your plan and add just this feature for <span className="font-bold text-purple-600">${addonPrice.toFixed(2)}</span>.</p>
              <Button variant="outline" className="w-full rounded-xl border-purple-200 text-purple-600 font-bold h-12 hover:bg-purple-50">Add to Plan</Button>
            </Card>
          )}
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
};

const getZonedTime = (date: Date, tz: string) => {
  try {
    return new Date(date.toLocaleString('en-US', { timeZone: tz }));
  } catch (e) {
    return date;
  }
};

export default function App() {
  const { 
    tasks, addTask, updateTask, deleteTask,
    schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem,
    reminders, addReminder, deleteReminder,
    logs, addLog,
    draftTask, setDraftTask,
    draftEvent, setDraftEvent,
    user, accounts, isAuthenticated, login, register, recoverAccount, verifyLogin, logout, updateProfile,
    deleteFinishedTasks, fetchEmails, purchaseAddon,
    emails, markEmailAsRead, toggleEmailRead, toggleEmailImportant, archiveEmail, deleteEmail,
    goals, setGoals,
    courses, setCourses,
    gradingConfig, setGradingConfig,
    semesterTimeline, setSemesterTimeline,
    billableHours, setBillableHours,
    productivityMode, setProductivityMode, getProductivityStats, resetProductivity,
    timezone, setTimezone, savedTimezones, addTimezone, removeTimezone,
    clockType, setClockType,
    timeFormat, setTimeFormat,
    productiveSeconds, reviewSeconds,
    overdueNotificationsEnabled, setOverdueNotificationsEnabled,
    changePassword, toggle2SV, verify2SV,
    sendOTP, verifyOTPAndResetPassword, verifyEmail, setInitialPassword, removeAccount, updateUserPlan
  } = useChronosStore();

  const handlePurchaseAddonAction = (id: string, price: number) => {
    toast(`Unlock "${id.replace('_', ' ')}" for $${price.toFixed(2)}?`, {
      action: {
        label: 'Purchase',
        onClick: () => purchaseAddon(id)
      },
    });
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mini Calendar State
  const [taskViewMode, setTaskViewMode] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduleViewMode, setScheduleViewMode] = useState<'day' | 'week'>('day');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0 });
      }
      window.scrollTo({ top: 0 });
    }
  }, [isAuthenticated, activeTab]);

  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || user?.name || '');
  const [editContactInfo, setEditContactInfo] = useState(user?.contactInfo || '');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailFilter, setEmailFilter] = useState<'inbox' | 'important' | 'archived'>('inbox');
  const [editPlan, setEditPlan] = useState(user?.plan || 'pro');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isAvatarSelectOpen, setIsAvatarSelectOpen] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'productivity' | 'security' | 'notifications'>('profile');
  const [isPlanConfirmOpen, setIsPlanConfirmOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<'basic' | 'student' | 'pro' | 'premium' | 'business' | null>(null);
  
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isTimezoneDialogOpen, setIsTimezoneDialogOpen] = useState(false);
  const [tzStep, setTzStep] = useState<'continent' | 'zone' | 'confirm'>('continent');
  const [selCont, setSelCont] = useState('');
  const [selZone, setSelZone] = useState('');

  const ALL_TIMEZONES = useMemo(() => Intl.supportedValuesOf('timeZone'), []);
  const CONTINENTS = useMemo(() => Array.from(new Set(ALL_TIMEZONES.map(tz => tz.split('/')[0]))).sort(), [ALL_TIMEZONES]);
  const PLAN_TIMEZONE_LIMITS: Record<string, number> = {
    'basic': 2,
    'student': 3,
    'pro': 3,
    'premium': 4,
    'business': 10
  };

  const tzLimit = PLAN_TIMEZONE_LIMITS[user?.plan || 'basic'] || 2;
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleItem | null>(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loginView, setLoginView] = useState<'select' | 'create_choice' | 'create_new' | 'recover' | 'plan_selection'>('select');
  const [accountToDelete, setAccountToDelete] = useState<{ email: string; name: string } | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userPendingPlan, setUserPendingPlan] = useState<any>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedAccountForLogin, setSelectedAccountForLogin] = useState<{ email: string; name: string; avatar: string } | null>(null);
  
  const [selectedPlanForPreview, setSelectedPlanForPreview] = useState<'basic' | 'student' | 'pro' | 'premium' | 'business'>('basic');
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [timelineFilters, setTimelineFilters] = useState({
    finished: true,
    pending: true,
    overdue: true,
    timeScoped: false
  });
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [show2SVInput, setShow2SVInput] = useState(false);
  const [svCode, setSvCode] = useState('');
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPasswordForm, setNewPasswordForm] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [is2SVSetupOpen, setIs2SVSetupOpen] = useState(false);
  
  const [resetEmail, setResetEmail] = useState('');
  const [resetOTP, setResetOTP] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'input_email' | 'input_otp' | 'input_new_password'>('input_email');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  
  const [verificationOTP, setVerificationOTP] = useState('');
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [onVerificationSuccess, setOnVerificationSuccess] = useState<(() => void) | null>(null);
  const [isPasswordSetupMode, setIsPasswordSetupMode] = useState(false);
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmSetupPassword, setConfirmSetupPassword] = useState('');
  const [isRecoveryConfirmOpen, setIsRecoveryConfirmOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [courseStep, setCourseStep] = useState(1); // 1: Duration, 2: Volume, 3: Iterative Entry
  const [iterativeCourseIndex, setIterativeCourseIndex] = useState(0);
  const [tempCourses, setTempCourses] = useState<Partial<Course>[]>([]);
  const [isGradingSetupOpen, setIsGradingSetupOpen] = useState(false);
  const [gradingStep, setGradingStep] = useState(1);
  const [isAnalyzeGradesDialogOpen, setIsAnalyzeGradesDialogOpen] = useState(false);
  
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: '',
    code: '',
    credits: 3,
    grade: 'A',
    percentage: 95,
    passingThreshold: 60,
    isAlphabetical: true
  });

  const GRADE_VALS: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  const calculatedGPA = useMemo(() => {
    if (courses.length === 0) return '0.00';
    
    if (gradingConfig.format === 'numerical') {
      const avg = courses.reduce((acc, c) => acc + (parseFloat(c.grade) || 0), 0) / courses.length;
      return avg.toFixed(2);
    }
    
    // Alphabetical mode using mappings or default GRADE_VALS
    // Mapping: Letter -> Percentage Weight
    const totalPoints = courses.reduce((acc, course) => {
      let weight = 0;
      if (gradingConfig.mappings && gradingConfig.mappings[course.grade] !== undefined) {
        weight = gradingConfig.mappings[course.grade] / 25; // Simple conversion to 4.0 scale if 100%
      } else {
        weight = GRADE_VALS[course.grade] || 0;
      }
      return acc + (weight * course.credits);
    }, 0);
    
    const totalCredits = courses.reduce((acc, course) => acc + course.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  }, [courses, gradingConfig]);

  const handleAddCourseSequence = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseStep === 1) {
      setCourseStep(2);
    } else if (courseStep === 2) {
      setCourseStep(3);
      setIterativeCourseIndex(0);
      setTempCourses(Array(semesterTimeline.plannedCourseCount || 1).fill({
        name: '',
        code: '',
        credits: 3,
        grade: 'A',
        percentage: 95,
        passingThreshold: 60,
        isAlphabetical: true
      }));
    } else if (courseStep === 3) {
      const course: Course = {
        id: crypto.randomUUID(),
        name: newCourse.name || `Course ${iterativeCourseIndex + 1}`,
        code: newCourse.code || `C${iterativeCourseIndex + 1}`,
        credits: newCourse.credits || 3,
        grade: newCourse.grade || 'A',
        percentage: newCourse.percentage,
        passingThreshold: newCourse.passingThreshold || 60,
        isAlphabetical: newCourse.isAlphabetical ?? true
      };
      
      const updatedCourses = [...courses, course];
      setCourses(updatedCourses);

      if (iterativeCourseIndex < (semesterTimeline.plannedCourseCount || 1) - 1) {
        setIterativeCourseIndex(iterativeCourseIndex + 1);
        setNewCourse({
            name: '',
            code: '',
            credits: 3,
            grade: 'A',
            percentage: 95,
            passingThreshold: 60,
            isAlphabetical: true
        });
      } else {
        setIsAddCourseDialogOpen(false);
        setCourseStep(1);
        toast.success("Semester enrollment complete!");
      }
    }
  };

  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    setIsScrolling(true);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  const handleConnectGmail = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      const authWindow = window.open(url, 'gmail_auth', 'width=600,height=700');
      
      if (!authWindow) {
        toast.error("Popup blocked! Please allow popups to connect Gmail.");
      }
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      toast.error("Failed to connect to Gmail");
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        updateProfile({ gmailTokens: event.data.tokens });
        toast.success("Gmail connected successfully!");
        fetchEmails();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (user) {
      setEditFirstName(user.firstName || '');
      setEditLastName(user.lastName || '');
      setEditDisplayName(user.displayName || user.name || '');
      setEditContactInfo(user.contactInfo || '');
      setEditPlan(user.plan || 'pro');
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = React.useMemo(() => {
    const list: { id: string, title: string, description: string, type: 'task' | 'event' | 'overdue', date: Date, link: string }[] = [];
    const now = new Date();
    const today = startOfToday();

    // Overdue tasks
    tasks.filter(t => t.status === TaskStatus.OVERDUE).forEach(t => {
      list.push({
        id: `overdue-${t.id}`,
        title: `Overdue: ${t.title}`,
        description: 'This project is past its deadline.',
        type: 'overdue',
        date: t.deadline ? new Date(t.deadline) : now,
        link: 'tasks'
      });
    });

    // Upcoming tasks (due today or tomorrow)
    tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.OVERDUE && t.deadline).forEach(t => {
      const deadline = new Date(t.deadline!);
      if (deadline > now && deadline < addHours(now, 48)) {
        list.push({
          id: `task-${t.id}`,
          title: `Upcoming Deadline: ${t.title}`,
          description: `Due ${format(deadline, 'MMM d, h:mm a')}`,
          type: 'task',
          date: deadline,
          link: 'tasks'
        });
      }
    });

    // Upcoming schedule items (next 4 hours)
    schedule.filter(item => {
      const startTime = new Date(item.startTime);
      return startTime > now && startTime < addHours(now, 4);
    }).forEach(item => {
      list.push({
        id: `event-${item.id}`,
        title: `Starting Soon: ${item.title}`,
        description: `Starts at ${format(new Date(item.startTime), 'h:mm a')}`,
        type: 'event',
        date: new Date(item.startTime),
        link: 'schedule'
      });
    });

    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks, schedule]);

  const productivity = getProductivityStats();

  const academicStats = useMemo(() => {
    const focusTime = logs.filter(l => l.activity.toLowerCase().includes('focus') || l.activity.toLowerCase().includes('work')).length;
    const reviewTime = logs.filter(l => (l.activity.toLowerCase().includes('review'))).length;
    const breakTime = logs.filter(l => (l.activity.toLowerCase().includes('break'))).length;
    
    // Performance Bar: Consistency in maintaining good grade
    const passingCount = courses.filter(c => {
      if (gradingConfig.format === 'alphabetical') {
        return (GRADE_VALS[c.grade] || 0) >= (GRADE_VALS[gradingConfig.passingGrade as string] || 0);
      }
      const g = parseFloat(c.grade);
      const p = parseFloat(gradingConfig.passingGrade as string);
      return gradingConfig.isLowerBetter ? g <= p : g >= p;
    }).length;
    
    const performance = courses.length > 0 ? Math.round((passingCount / courses.length) * 100) : 0;
    
    // Consistency Score: Balance and session count
    const totalSessions = focusTime + reviewTime + breakTime;
    const focusRatio = totalSessions > 0 ? (focusTime / totalSessions) : 0;
    const balance = totalSessions > 0 ? 100 - Math.abs(focusRatio * 100 - 60) : 0; 
    const consistencyScore = Math.min(100, Math.round((totalSessions * 5) + balance));
    
    return { focusTime, reviewTime, breakTime, performance, consistencyScore, totalSessions };
  }, [logs, courses, gradingConfig, GRADE_VALS]);

  // Check for reminders and deadlines
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      // Check task-specific reminders
      tasks.forEach(task => {
        if (task.status === TaskStatus.COMPLETED || !task.deadline || task.reminderFrequency === 'none') return;

        const deadline = new Date(task.deadline);
        if (isBefore(deadline, now)) return;

        // Check reminder window
        if (task.reminderWindow) {
          const [startH, startM] = task.reminderWindow.start.split(':').map(Number);
          const [endH, endM] = task.reminderWindow.end.split(':').map(Number);
          const currentH = now.getHours();
          const currentM = now.getMinutes();
          
          const currentTimeInMins = currentH * 60 + currentM;
          const startInMins = startH * 60 + startM;
          const endInMins = endH * 60 + endM;

          if (currentTimeInMins < startInMins || currentTimeInMins > endInMins) return;
        }

        const lastReminded = task.lastRemindedAt ? new Date(task.lastRemindedAt) : null;
        let shouldRemind = false;

        if (task.reminderFrequency === 'daily' && task.dailyReminderTime) {
          const [h, m] = task.dailyReminderTime.split(':').map(Number);
          if (now.getHours() === h && now.getMinutes() === m) {
            if (!lastReminded || !isSameDay(lastReminded, now)) {
              shouldRemind = true;
            }
          }
        } else if (task.reminderFrequency === 'weekly' && task.weeklyReminderDay) {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const targetDay = days.indexOf(task.weeklyReminderDay);
          if (now.getDay() === targetDay) {
            const [h, m] = (task.dailyReminderTime || '10:00').split(':').map(Number);
            if (now.getHours() === h && now.getMinutes() === m) {
              if (!lastReminded || !isSameDay(lastReminded, now)) {
                shouldRemind = true;
              }
            }
          }
        } else {
          if (!lastReminded) {
            shouldRemind = true;
          } else {
            const hoursSinceLast = (now.getTime() - lastReminded.getTime()) / (1000 * 60 * 60);
            const interval = task.hourlyReminderInterval || 1;
            const limit = task.hourlyReminderLimit || Infinity;
            const currentCount = task.reminderCount || 0;

            if (task.reminderFrequency === 'hourly' && hoursSinceLast >= interval && currentCount < limit) {
              shouldRemind = true;
            }
          }
        }

        if (shouldRemind) {
          toast.info(`Task Reminder: ${task.title}`, {
            description: `Deadline: ${format(deadline, 'MMM d, HH:mm')}. Subject: ${task.subject || 'N/A'}`,
            duration: 10000,
          });
          updateTask(task.id, { 
            lastRemindedAt: now.toISOString(),
            reminderCount: (task.reminderCount || 0) + 1
          });
        }
      });

      // Check general reminders
      reminders.forEach(r => {
        if (!r.isSent && isBefore(new Date(r.time), now)) {
          toast.info(`Reminder: ${r.title}`, {
            description: `Scheduled for ${format(new Date(r.time), 'p')}`,
          });
          // Note: In a real app, we'd update the reminder status here
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders, tasks, updateTask]);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size too large (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateProfile({ avatar: result, uploadedAvatar: result });
        toast.success("Profile picture uploaded!");
        setIsAvatarSelectOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyAndLogin = () => {
    if (!selectedAccountForLogin) return;
    
    // Check if account has a password
    const account = accounts.find(acc => acc.email === selectedAccountForLogin.email);
    if (account && !account.password) {
      toast.info("Your account doesn't have a password. Please set one.");
      setIsPasswordSetupMode(true);
      return;
    }
    
    const result = verifyLogin(selectedAccountForLogin.email, loginPassword);
    if (result.success) {
      if ((result as any).requires2SV) {
        setShow2SVInput(true);
        toast.info("Two-Step Verification Required");
        return;
      }
      if (account) {
        if (!account.plan) {
          setUserPendingPlan(account);
          setLoginView('plan_selection');
          setShow2SVInput(false);
          setLoginPassword('');
        } else {
          login(account as any);
          toast.success(`Welcome back, ${account.name}!`);
          setActiveTab('dashboard');
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
          }
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    } else {
      // Logic for attempts and lockout is handled in verifyLogin but we can format the message
      toast.error(result.message || "Failed to login");
    }
    setLoginPassword('');
  };

  const handleForgotPassword = () => {
    // Skip OTP as requested
    setResetStep('input_new_password');
  };

  const handleVerifyOTP = () => {
    // This might not be needed if we skip OTP
    setResetStep('input_new_password');
  };

  const handleResetPassword = () => {
    const res = verifyOTPAndResetPassword(resetEmail, 'SKIP_OTP', resetNewPassword);
    if (res.success) {
      setIsForgotPasswordOpen(false);
      setResetStep('input_email');
      setResetEmail('');
      setResetOTP('');
      setResetNewPassword('');
    } else {
      toast.error(res.message || "Failed to reset password");
    }
  };

  const handleSendVerificationEmail = (email: string, onSuccess: () => void) => {
    // Skip OTP as requested, just verify immediately
    const res = verifyEmail(email, 'SKIP_OTP'); 
    if (res.success) {
      onSuccess();
    }
  };

  const handleConfirmVerification = () => {
    if (!user) return;
    const res = verifyEmail(user.email, 'SKIP_OTP');
    if (res.success) {
      setIsVerificationModalOpen(false);
      setVerificationOTP('');
      if (onVerificationSuccess) onVerificationSuccess();
    } else {
      toast.error(res.message || "Verification failed");
    }
  };

  const handleVerify2SV = () => {
    if (!selectedAccountForLogin) return;
    const result = verify2SV(selectedAccountForLogin.email, svCode);
    if (result.success) {
      const account = accounts.find(acc => acc.email === selectedAccountForLogin.email);
      if (account) {
        if (!account.plan) {
          setUserPendingPlan(account);
          setLoginView('plan_selection');
          setShow2SVInput(false);
          setSvCode('');
        } else {
          login(account as any);
          toast.success(`Welcome back, ${account.name}!`);
          setShow2SVInput(false);
          setSvCode('');
          setActiveTab('dashboard');
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
          }
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    } else {
      toast.error(result.message || "Invalid 2SV code");
    }
  };

  const loginContent = !isAuthenticated && (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.03),transparent),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.02),transparent)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-white"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#1A1A1A] rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/20">
              <Clock className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter mb-2">Chronos AI</h1>
            <p className="text-[#868E96] font-medium px-4">
              {loginView === 'select' 
                ? (selectedAccountForLogin ? `Verify ${selectedAccountForLogin.name}` : 'Welcome back! Choose an account') 
                : loginView === 'create_choice' ? 'How would you like to start?'
                : loginView === 'create_new' ? 'Create your new workspace'
                : loginView === 'recover' ? 'Recover your workspace'
                : loginView === 'plan_selection' ? 'Select your membership plan'
                : 'Account Limit Reached'}
            </p>
          </div>

          {/* Account Limit View */}
          {loginView === 'create_choice' && accounts.length >= 3 && (
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100/50">
                <div className="flex items-center gap-3 text-red-600 mb-3">
                  <AlertCircle size={20} />
                  <p className="font-bold text-sm tracking-tight">Account Limit Reached</p>
                </div>
                <p className="text-xs text-red-600/80 leading-relaxed font-medium">
                  To create or recover a new account, you must first remove one of your existing local profiles.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] text-[#ADB5BD] font-bold uppercase tracking-widest px-2">Choose an account to remove</p>
                {accounts.map(acc => (
                  <div key={acc.email} className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8F9FA] border border-transparent hover:border-red-200 transition-all group">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0">
                      <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{acc.name}</p>
                      <p className="text-xs text-[#868E96] truncate">{acc.email}</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setAccountToDelete({ email: acc.email, name: acc.name });
                        setIsDeleteConfirmOpen(true);
                      }}
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <Button 
                variant="ghost" 
                onClick={() => setLoginView('select')}
                className="w-full rounded-2xl h-12 font-bold text-[#868E96] hover:text-[#1A1A1A]"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Login
              </Button>
            </div>
          )}

          {/* Create Choice View */}
          {loginView === 'create_choice' && accounts.length < 3 && (
             <div className="space-y-4">
              <button 
                onClick={() => setLoginView('create_new')}
                className="w-full p-6 text-left border-2 border-[#E9ECEF] rounded-[2rem] hover:border-[#1A1A1A] hover:bg-black/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F1F3F5] rounded-2xl flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors">
                    <UserPlus size={20} className="text-[#495057] group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">New Account</h3>
                    <p className="text-sm text-[#868E96]">Start fresh with a new workspace</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setLoginView('recover')}
                className="w-full p-6 text-left border-2 border-[#E9ECEF] rounded-[2rem] hover:border-[#1A1A1A] hover:bg-black/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F1F3F5] rounded-2xl flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors">
                    <ShieldCheck size={20} className="text-[#495057] group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Recover Account</h3>
                    <p className="text-sm text-[#868E96]">Already have an account elsewhere?</p>
                  </div>
                </div>
              </button>

              <div className="pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setLoginView('select')}
                  className="w-full rounded-2xl h-12 font-bold text-[#868E96] hover:text-[#1A1A1A]"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Login
                </Button>
              </div>
             </div>
          )}

          {/* New Account Form */}
          {loginView === 'create_new' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96] px-1">Full Name</Label>
                <Input 
                  placeholder="John Doe" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-2xl h-12 border-[#E9ECEF] focus:ring-[#1A1A1A]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96] px-1">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="john@example.com" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-2xl h-12 border-[#E9ECEF] focus:ring-[#1A1A1A]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96] px-1">Password</Label>
                <Input 
                  type="password"
                  placeholder="Create a password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-2xl h-12 border-[#E9ECEF] focus:ring-[#1A1A1A]" 
                />
              </div>
              
              <div className="pt-4 space-y-3">
                <Button 
                  disabled={!newName || !newEmail || !newPassword}
                  onClick={() => {
                    const result = register({
                      name: newName,
                      email: newEmail,
                      password: newPassword,
                      avatar: `https://picsum.photos/seed/${newEmail}/200/200`
                    });
                    if (result.success) {
                      toast.success("Account created successfully! Please log in.");
                      setNewName('');
                      setNewEmail('');
                      setNewPassword('');
                      setLoginView('select');
                    } else if (result.existsRemotely) {
                      setRecoveryEmail(newEmail);
                      setIsRecoveryConfirmOpen(true);
                    }
                  }}
                  className="w-full bg-[#1A1A1A] text-white rounded-2xl h-14 font-bold shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                  Create Account
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setLoginView('create_choice')}
                  className="w-full rounded-2xl h-12 font-bold text-[#868E96] hover:text-[#1A1A1A]"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Recover View */}
          {loginView === 'recover' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96] px-1">Restore Email</Label>
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="rounded-2xl h-12 border-[#E9ECEF] focus:ring-[#1A1A1A]" 
                />
              </div>
              <p className="text-xs text-[#868E96] leading-relaxed">
                Enter the email associated with your remote account. If found, it will be added to this device.
              </p>
              
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={() => {
                    const found = recoverAccount(recoveryEmail);
                    if (found) {
                      setLoginView('select');
                      setRecoveryEmail('');
                    } else {
                      toast.error("Account not found in remote database.");
                    }
                  }}
                  className="w-full bg-[#1A1A1A] text-white rounded-2xl h-14 font-bold shadow-xl hover:translate-y-[-2px] transition-all"
                >
                  Find Account
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setLoginView('create_choice')}
                  className="w-full rounded-2xl h-12 font-bold text-[#868E96] hover:text-[#1A1A1A]"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Standard Login / Account Selection */}
          {loginView === 'select' && (
            <div className="space-y-4">
              {!selectedAccountForLogin ? (
                <>
                  {accounts.length > 0 ? (
                      <div className="space-y-3 mb-8">
                        <p className="text-[10px] text-[#ADB5BD] font-bold uppercase tracking-widest px-2">Saved Accounts</p>
                        {accounts.map((acc) => {
                          const isLocked = acc.lockoutUntil && new Date(acc.lockoutUntil) > new Date();
                          return (
                            <div
                              key={acc.email}
                              className={`w-full flex items-center gap-4 p-4 rounded-2xl border border-[#E9ECEF] transition-all group relative overflow-hidden ${isLocked ? 'opacity-60 grayscale' : 'hover:bg-[#F8F9FA] hover:border-[#1A1A1A]'}`}
                            >
                              <div 
                                className={`flex flex-1 items-center gap-4 min-w-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                onClick={() => !isLocked && setSelectedAccountForLogin(acc)}
                              >
                                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0">
                                  <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <p className="font-bold text-sm truncate">{acc.name}</p>
                                  <p className="text-xs text-[#868E96] truncate">{acc.email}</p>
                                  {isLocked && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase flex items-center gap-1">
                                      <Lock size={10} /> Locked
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 z-10">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAccountToDelete({ email: acc.email, name: acc.name });
                                      setIsDeleteConfirmOpen(true);
                                    }}
                                    className="w-10 h-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                {!isLocked && <ChevronRight size={16} className="text-[#CED4DA] group-hover:text-[#1A1A1A]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  ) : (
                    <div className="text-center py-6 px-4 bg-[#F8F9FA] rounded-[2rem] mb-8 border border-[#E9ECEF]">
                      <p className="text-sm text-[#868E96] font-medium">No accounts on this device.</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => setLoginView('create_choice')}
                    variant="outline"
                    className="w-full rounded-2xl h-14 font-bold flex items-center justify-center gap-2 border-[#E9ECEF] hover:bg-[#F8F9FA] hover:border-[#1A1A1A] transition-all"
                  >
                    <UserPlus size={18} />
                    Create New Account
                  </Button>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Account detail card */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                      <img src={selectedAccountForLogin.avatar} alt={selectedAccountForLogin.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{selectedAccountForLogin.name}</p>
                      <p className="text-xs text-[#868E96] truncate">{selectedAccountForLogin.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedAccountForLogin(null);
                      setShow2SVInput(false);
                    }} className="rounded-full">
                      <X size={16} />
                    </Button>
                  </div>

                  {!show2SVInput ? (
                    <>
                      {isPasswordSetupMode ? (
                        <div className="space-y-4">
                          <p className="text-xs text-[#868E96] font-medium leading-relaxed">
                            Securing your data. Please create a password for this workspace.
                          </p>
                          <div className="space-y-4">
                            <Input 
                              type="password"
                              value={setupPassword}
                              onChange={(e) => setSetupPassword(e.target.value)}
                              placeholder="New Password"
                              className="rounded-2xl h-12 border-[#E9ECEF]"
                            />
                            <Input 
                              type="password"
                              value={confirmSetupPassword}
                              onChange={(e) => setConfirmSetupPassword(e.target.value)}
                              placeholder="Confirm Password"
                              className="rounded-2xl h-12 border-[#E9ECEF]"
                            />
                          </div>
                          <Button 
                            onClick={() => {
                              if (setupPassword !== confirmSetupPassword) {
                                toast.error("Passwords do not match");
                                return;
                              }
                              setInitialPassword(selectedAccountForLogin.email, setupPassword);
                              setIsPasswordSetupMode(false);
                            }}
                            className="w-full bg-[#1A1A1A] text-white rounded-2xl h-14 font-bold"
                          >
                            Set & Secure
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                              <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Password</Label>
                              <button 
                                onClick={() => {
                                  setResetEmail(selectedAccountForLogin.email);
                                  setIsForgotPasswordOpen(true);
                                }}
                                className="text-[10px] font-bold text-blue-600 uppercase"
                              >
                                Forgot?
                              </button>
                            </div>
                            <Input 
                              type="password"
                              placeholder="••••••••" 
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleVerifyAndLogin()}
                              className="rounded-2xl h-12 border-[#E9ECEF] focus:ring-1 focus:ring-black" 
                              autoFocus
                            />
                          </div>

                          <div className="pt-2 space-y-3">
                            <Button 
                              onClick={handleVerifyAndLogin}
                              className="w-full bg-[#1A1A1A] text-white rounded-2xl h-14 font-bold shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
                            >
                              Login to Workspace
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={() => setSelectedAccountForLogin(null)}
                              className="w-full rounded-2xl h-12 font-bold text-[#868E96] transition-colors"
                            >
                              Choose Different
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96] px-1">Security Code (2SV)</Label>
                        <Input 
                          placeholder="Recovery code" 
                          value={svCode}
                          onChange={(e) => setSvCode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleVerify2SV()}
                          className="rounded-2xl h-12 border-[#E9ECEF]" 
                          autoFocus
                        />
                      </div>

                      <div className="pt-2 space-y-3">
                        <Button 
                          onClick={handleVerify2SV}
                          className="w-full bg-[#1A1A1A] text-white rounded-2xl h-14 font-bold shadow-xl shadow-black/10 transition-all"
                        >
                          Verify & Enter
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setShow2SVInput(false);
                            setSvCode('');
                          }}
                          className="w-full rounded-2xl h-12 font-bold text-[#868E96]"
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Plan Selection View */}
          {loginView === 'plan_selection' && userPendingPlan && (
            <div className="space-y-6">
               {!isConfirmingPayment ? (
                 <>
                  <div className="flex gap-1.5 p-1 bg-[#F1F3F5] rounded-[2rem] mb-2 overflow-x-auto no-scrollbar scroll-smooth">
                    {['basic', 'student', 'pro', 'premium', 'business'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPlanForPreview(p as any)}
                        className={`flex-none px-4 py-2.5 rounded-[1.25rem] text-[9px] font-bold uppercase tracking-[0.15em] transition-all ${selectedPlanForPreview === p ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#868E96] hover:text-[#495057]'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#F8F9FA] rounded-[2.5rem] p-8 border border-[#E9ECEF] relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-bold tracking-tight mb-1">{selectedPlanForPreview.charAt(0).toUpperCase() + selectedPlanForPreview.slice(1)}</h3>
                          <p className="text-xs text-[#868E96] font-medium">Membership plan</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {selectedPlanForPreview === 'basic' ? 'Free' : 
                             selectedPlanForPreview === 'pro' ? '$9.99' : 
                             selectedPlanForPreview === 'premium' ? '$21.99' : 
                             selectedPlanForPreview === 'student' ? '$5.99' : '$28.00'}
                          </p>
                          <p className="text-[10px] text-[#ADB5BD] font-bold uppercase tracking-widest">per month</p>
                        </div>
                      </div>

                      <ul className="space-y-4 mb-8">
                        {(
                          selectedPlanForPreview === 'basic' ? ['Standard Tasks', 'My Day Planner', 'Basic Calendar Sync (View-only)', 'Max 3 Projects'] :
                          selectedPlanForPreview === 'pro' ? ['Everything in Basic', 'Unlimited Projects & Tags', 'Pomodoro & Focus Timer', 'Advanced Statistics', 'Priority Support', '2-Way Calendar Sync'] :
                          selectedPlanForPreview === 'premium' ? ['Everything in Pro', 'AI Smart Scheduling', 'Workflow Automation', 'Goal Tracking', 'Advanced Analytics (Heatmaps)'] :
                          selectedPlanForPreview === 'student' ? ['Everything in Pro', 'Academic Hub', 'Course & Grade Tracker', 'Study Collaboration', 'Basic AI Assistant'] :
                          ['Everything in Premium', 'Shared Timelines', 'Billable Hours Tracker', 'Meeting Audit', 'Team Dashboard', 'Volume Licensing']
                        ).map((f, i) => (
                          <li key={i} className="flex items-center gap-3 text-xs font-semibold text-[#495057]">
                            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={12} className="text-blue-500" />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <Button 
                        onClick={() => {
                          if (selectedPlanForPreview === 'basic') {
                            updateUserPlan(userPendingPlan.email, 'basic');
                            login({ ...userPendingPlan, plan: 'basic' } as any);
                            toast.success("Basic plan activated. Welcome!");
                            setActiveTab('dashboard');
                            setUserPendingPlan(null);
                            setLoginView('select');
                            if (scrollContainerRef.current) {
                              scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
                            }
                            window.scrollTo({ top: 0, behavior: 'instant' });
                          } else {
                            setIsConfirmingPayment(true);
                          }
                        }}
                        className="w-full h-14 bg-[#1A1A1A] text-white rounded-2xl font-bold shadow-xl shadow-black/10 active:scale-[0.98] transition-all"
                      >
                        Get {selectedPlanForPreview.charAt(0).toUpperCase() + selectedPlanForPreview.slice(1)} Now
                      </Button>
                    </div>
                  </div>
                 </>
               ) : (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="space-y-6"
                 >
                   <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 text-center">
                     <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="text-blue-600" size={32} />
                     </div>
                     <h3 className="text-xl font-bold tracking-tight mb-2">Confirm Payment</h3>
                     <p className="text-sm text-blue-900/70 font-medium px-4 leading-relaxed">
                       Are you sure you want to pay <span className="text-blue-600 font-bold">
                         {selectedPlanForPreview === 'pro' ? '$9.99' : 
                          selectedPlanForPreview === 'premium' ? '$21.99' : 
                          selectedPlanForPreview === 'student' ? '$5.99' : '$28.00'}
                       </span> and continue with the <span className="text-blue-600 font-bold uppercase">{selectedPlanForPreview}</span> plan?
                     </p>
                   </div>

                   <div className="p-6 border-2 border-dashed border-[#E9ECEF] rounded-[2rem] space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#868E96] font-medium">Subscription</span>
                        <span className="font-bold uppercase tracking-tight">{selectedPlanForPreview} Plan</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#868E96] font-medium">Billing Cycle</span>
                        <span className="font-bold">Monthly Plan</span>
                      </div>
                      <div className="pt-3 border-t border-[#E9ECEF] flex justify-between items-center">
                        <span className="font-bold text-[#1A1A1A]">Total Due Today</span>
                        <span className="text-xl font-bold text-[#1A1A1A]">
                          {selectedPlanForPreview === 'pro' ? '$9.99' : 
                           selectedPlanForPreview === 'premium' ? '$21.99' : 
                           selectedPlanForPreview === 'student' ? '$5.99' : '$28.00'}
                        </span>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <Button 
                        onClick={() => {
                          updateUserPlan(userPendingPlan.email, selectedPlanForPreview);
                          login({ ...userPendingPlan, plan: selectedPlanForPreview } as any);
                          toast.success(`${selectedPlanForPreview.toUpperCase()} payment successful!`);
                          setActiveTab('dashboard');
                          setUserPendingPlan(null);
                          setLoginView('select');
                          setIsConfirmingPayment(false);
                          if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
                          }
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors"
                      >
                        Confirm & Pay Securely
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsConfirmingPayment(false)}
                        className="w-full h-12 text-[#868E96] font-bold hover:text-[#1A1A1A]"
                      >
                        Change Selection
                      </Button>
                   </div>
                 </motion.div>
               )}

               {!isConfirmingPayment && (
                 <Button 
                   variant="ghost" 
                   onClick={() => {
                     setUserPendingPlan(null);
                     setLoginView('select');
                   }}
                   className="w-full rounded-2xl h-12 font-bold text-[#868E96] hover:text-[#1A1A1A]"
                 >
                   Back to Authentication
                 </Button>
               )}
            </div>
          )}
        </motion.div>

        {/* Global Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
           <DialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl max-w-sm">
             <div className="text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Delete Account?</h3>
                <p className="text-sm text-[#868E96] leading-relaxed mb-8">
                  Are you sure you want to remove <span className="font-bold text-[#1A1A1A]">{accountToDelete?.name}</span>? This will permanently delete ALL associated tasks, logs, and settings.
                </p>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="destructive"
                    className="w-full rounded-2xl h-14 font-bold shadow-lg shadow-red-200"
                    onClick={() => {
                      if (accountToDelete) {
                        removeAccount(accountToDelete.email);
                        setIsDeleteConfirmOpen(false);
                        setAccountToDelete(null);
                        if (loginView === 'create_choice' && accounts.length <= 3) {
                          // Allow proceed if we were in the limit view
                        }
                      }
                    }}
                  >
                    Delete Permanently
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full h-12 font-bold text-[#868E96]"
                    onClick={() => {
                      setIsDeleteConfirmOpen(false);
                      setAccountToDelete(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
             </div>
           </DialogContent>
        </Dialog>
      </div>
    ) as any;

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsAiLoading(true);
    try {
      const result = await geminiService.parsePrompt(aiInput, { tasks, schedule, logs });
      
      if (result.intent === 'schedule_day' && result.data.events) {
        result.data.events.forEach((event: any) => {
          const startTime = new Date(event.startTime);
          const newItem: ScheduleItem = {
            id: crypto.randomUUID(),
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime || addHours(startTime, 1).toISOString(),
            type: event.type || 'work',
            isAIProposed: true
          };
          addScheduleItem(newItem);

          // Add 1hr reminder
          addReminder({
            id: crypto.randomUUID(),
            title: `Reminder: ${event.title} starts in 1 hour`,
            time: subMinutes(startTime, 60).toISOString(),
            isSent: false
          });

          // Add 30min reminder
          addReminder({
            id: crypto.randomUUID(),
            title: `Reminder: ${event.title} starts in 30 minutes`,
            time: subMinutes(startTime, 30).toISOString(),
            isSent: false
          });
        });
        toast.success(`Scheduled ${result.data.events.length} events with reminders`);
      } else if (result.intent === 'task_breakdown') {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: result.data.title,
          status: TaskStatus.TODO,
          priority: 'medium',
          category: 'other',
          createdAt: new Date().toISOString(),
          subSteps: (result.data.subSteps || []).map((s: string) => ({
            id: crypto.randomUUID(),
            title: s,
            isCompleted: false
          }))
        };
        addTask(newTask);
        
        toast.info("Task Breakdown", {
          description: result.data.suggestion,
          action: (result.data.questions && result.data.questions.length > 0) ? {
            label: "View Questions",
            onClick: () => {
              result.data.questions?.forEach((q: string) => toast.info(q));
            }
          } : undefined
        });
      } else if (result.intent === 'clear_event') {
        const targetDate = result.data.targetDate;
        const isWholeDay = result.data.isWholeDay;
        const startTime = result.data.startTime ? new Date(result.data.startTime) : null;
        const endTime = result.data.endTime ? new Date(result.data.endTime) : null;

        const itemsToRemove = schedule.filter(item => {
          const itemStart = new Date(item.startTime);
          const itemEnd = new Date(item.endTime);
          const itemDate = format(itemStart, 'yyyy-MM-dd');
          
          if (itemDate !== targetDate) return false;
          if (isWholeDay) return true;
          
          if (startTime && endTime) {
            // Check for any overlap between the item and the target period
            return (itemStart < endTime && itemEnd > startTime);
          }
          return false;
        });

        itemsToRemove.forEach(item => deleteScheduleItem(item.id));
        toast.success(`Cleared ${itemsToRemove.length} events for ${targetDate}`);
      } else if (result.intent === 'analyze_time') {
        toast.info("Time Analysis", {
          description: result.data.analysis,
          duration: 10000,
        });
        result.data.suggestions?.forEach((s: string) => {
          toast.success("Suggestion", { description: s });
        });
      } else if (result.intent === 'query') {
        toast.info("AI Assistant", {
          description: result.data.answer,
        });
      }
      
      setAiInput('');
    } catch (error) {
      console.error(error);
      toast.error("Failed to process AI request");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleSubStep = (taskId: string, stepId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubSteps = task.subSteps.map(s => 
      s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    
    const allCompleted = newSubSteps.every(s => s.isCompleted);
    updateTask(taskId, { 
      subSteps: newSubSteps,
      status: allCompleted ? TaskStatus.COMPLETED : TaskStatus.IN_PROGRESS,
      completedAt: allCompleted ? new Date().toISOString() : undefined
    });
  };

  const completedTasksCount = tasks.filter(t => t.status === TaskStatus.COMPLETED && t.completedAt && isSameDay(new Date(t.completedAt), new Date())).length;
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
  const upcomingDeadlines = tasks.filter(t => t.deadline && t.status !== TaskStatus.COMPLETED);

  const todayFocusSeconds = logs
    .filter(log => log.type === 'productive' && isSameDay(new Date(log.startTime), new Date()))
    .reduce((acc, log) => {
      if (log.endTime) {
        return acc + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000;
      }
      return acc;
    }, 0) + productiveSeconds;

  return (
    <div className="min-h-screen">
      {loginContent}
      
      <Dialog open={!!selectedEmail} onOpenChange={(open) => !open && setSelectedEmail(null)}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedEmail && (
            <div className="flex flex-col h-[80vh]">
              <div className="bg-[#1A1A1A] p-8 text-white shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-white/10 text-white border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                    Email Message
                  </Badge>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleEmailImportant(selectedEmail.id)}
                      className={`p-2 rounded-xl transition-all ${selectedEmail.isImportant ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                    >
                      <Star size={18} className={selectedEmail.isImportant ? 'fill-white' : ''} />
                    </button>
                    <button 
                      onClick={() => toggleEmailRead(selectedEmail.id)}
                      className="p-2 bg-white/10 text-white/60 hover:bg-white/20 rounded-xl transition-all"
                    >
                      <Mail size={18} />
                    </button>
                    {!selectedEmail.isArchived && (
                      <button 
                        onClick={() => {
                          archiveEmail(selectedEmail.id);
                          setSelectedEmail(null);
                          toast.success("Email archived");
                        }}
                        className="p-2 bg-white/10 text-white/60 hover:bg-white/20 rounded-xl transition-all"
                      >
                        <Shield size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        deleteEmail(selectedEmail.id);
                        setSelectedEmail(null);
                        toast.success("Email deleted");
                      }}
                      className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter mb-2">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-4 mt-6">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
                    <img src={selectedEmail.avatar} alt={selectedEmail.sender} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{selectedEmail.sender}</p>
                    <p className="text-sm text-white/60">{format(new Date(selectedEmail.date), 'MMMM d, yyyy • h:mm a')}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-10 bg-white">
                <div className="prose prose-slate max-w-none">
                  {selectedEmail.body?.split('\n').map((line, i) => (
                    <p key={i} className="text-[#495057] leading-relaxed mb-4">{line}</p>
                  )) || <p className="text-[#495057] leading-relaxed">{selectedEmail.preview}</p>}
                </div>
              </div>
              <div className="p-8 bg-[#F8F9FA] border-t border-[#F1F3F5] flex justify-end gap-4 shrink-0">
                <Button 
                  variant="outline" 
                  className="rounded-2xl border-[#E9ECEF] px-8 h-12 font-bold hover:bg-white transition-all"
                  onClick={() => setSelectedEmail(null)}
                >
                  Close
                </Button>
                <Button 
                  className="bg-[#1A1A1A] text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-black/10 hover:translate-y-[-2px] transition-all"
                  onClick={() => toast.success("Reply feature coming soon!")}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster position="top-right" richColors />

      {isAuthenticated && (
        <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
          {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[101] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                    <Zap className="text-white w-5 h-5" />
                  </div>
                  <h1 className="font-bold text-xl tracking-tight">Chronos AI</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="rounded-full">
                  <X size={20} />
                </Button>
              </div>

              <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {[
                  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                  { id: 'tasks', icon: CheckCircle2, label: 'Tasks & Projects' },
                  { id: 'schedule', icon: Calendar, label: 'Schedule' },
                  { id: 'emails', icon: Mail, label: 'Email Center', plan: 'pro', addonId: 'advanced_mail' },
                  { id: 'focus', icon: Timer, label: 'Focus Timer', plan: 'pro', addonId: 'focus_tools' },
                  { id: 'productivity', icon: BarChart3, label: 'Statistics', plan: 'pro', addonId: 'advanced_stats' },
                  { id: 'ai', icon: MessageSquare, label: 'Team AI', plan: 'premium', addonId: 'ai_scheduling' },
                  { id: 'goals', icon: Target, label: 'Goal Tracking', plan: 'premium', addonId: 'goal_tracker' },
                  { id: 'academic', icon: BookOpen, label: 'Academic Hub', plan: 'student', addonId: 'academic_suite' },
                  { id: 'teams', icon: ShieldCheck, label: 'Team Sync', plan: 'business', addonId: 'business_sync' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                ].filter(item => {
                  if (!item.plan) return true;
                  const currentPlan = user?.plan || 'basic';
                  const hasPlanAccess = (PLAN_HIERARCHY[currentPlan] || 0) >= (PLAN_HIERARCHY[item.plan] || 0);
                  const hasAddonAccess = item.addonId && user?.purchasedAddons?.includes(item.addonId);
                  return hasPlanAccess || hasAddonAccess;
                }).map((item) => {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                        activeTab === item.id 
                          ? 'bg-[#1A1A1A] text-white font-medium shadow-md' 
                          : 'text-[#868E96] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'group-hover:text-[#1A1A1A]'} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="p-6 mt-auto">
                <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-[#E9ECEF]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#E9ECEF] overflow-hidden">
                      <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate">{user?.displayName || user?.name}</p>
                      <p className="text-[9px] text-[#868E96] font-bold uppercase tracking-tight">{(user?.plan || 'Pro').toUpperCase()} MEMBER</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl h-9 text-[10px] font-bold uppercase tracking-widest border-[#E9ECEF]"
                    onClick={() => {
                      logout();
                      setSelectedAccountForLogin(null);
                      setLoginView('select');
                      setIsSidebarOpen(false);
                    }}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-[#E9ECEF] bg-white hidden lg:flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
            <Zap className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Chronos AI</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'tasks', icon: CheckCircle2, label: 'Tasks & Projects' },
            { id: 'schedule', icon: Calendar, label: 'Schedule' },
            { id: 'emails', icon: Mail, label: 'Mail Center', plan: 'pro', addonId: 'advanced_mail' },
            { id: 'focus', icon: Timer, label: 'Focus Timer', plan: 'pro', addonId: 'focus_tools' },
            { id: 'productivity', icon: BarChart3, label: 'Statistics', plan: 'pro', addonId: 'advanced_stats' },
            { id: 'ai', icon: MessageSquare, label: 'Team AI', plan: 'premium', addonId: 'ai_scheduling' },
            { id: 'goals', icon: Target, label: 'Goal Tracking', plan: 'premium', addonId: 'goal_tracker' },
            { id: 'academic', icon: BookOpen, label: 'Academic Hub', plan: 'student', addonId: 'academic_suite' },
            { id: 'teams', icon: ShieldCheck, label: 'Team Sync', plan: 'business', addonId: 'business_sync' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].filter(item => {
            if (!item.plan) return true;
            const currentPlan = user?.plan || 'basic';
            const hasPlanAccess = (PLAN_HIERARCHY[currentPlan] || 0) >= (PLAN_HIERARCHY[item.plan] || 0);
            const hasAddonAccess = item.addonId && user?.purchasedAddons?.includes(item.addonId);
            return hasPlanAccess || hasAddonAccess;
          }).map((item) => {
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  activeTab === item.id 
                    ? 'bg-[#1A1A1A] text-white font-medium shadow-md' 
                    : 'text-[#868E96] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'group-hover:text-[#1A1A1A]'} />
                  <span className="text-sm">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto space-y-4">
          {/* Productivity Card */}
          <div 
            className="bg-[#1A1A1A] rounded-2xl p-5 text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-black/20"
            onClick={() => {
              const nextMode = productivityMode === 'daily' ? 'weekly' : 'daily';
              setProductivityMode(nextMode);
              toast.info(`Tracking ${nextMode} productivity`);
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] opacity-50 uppercase font-bold tracking-[0.2em]">Productivity Statistics</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/10 text-white border-none text-[8px] font-bold uppercase tracking-widest px-2 py-0">
                    {productivityMode}
                  </Badge>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      resetProductivity();
                    }}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Trash2 size={10} className="text-white/50 hover:text-white" />
                  </button>
                </div>
              </div>
              <p className="text-xl font-bold mb-4">{productivity}% {productivityMode === 'daily' ? 'Today' : 'This Week'}</p>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${productivity}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="h-full bg-white" 
                />
              </div>
              <p className="text-[9px] opacity-40 mt-3 font-medium">Click to toggle Daily/Weekly</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
          </div>

          {/* Review Tracker Box */}
          <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-[#E9ECEF] group hover:border-[#1A1A1A] transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#E9ECEF]">
                  <BookOpen size={14} className="text-[#1A1A1A]" />
                </div>
                <p className="text-[10px] text-[#868E96] font-bold uppercase tracking-widest">Total Review</p>
              </div>
              <Badge className="bg-[#1A1A1A] text-white border-none text-[8px] font-bold px-2 py-0">
                Active
              </Badge>
            </div>
            <p className="text-lg font-bold tracking-tight text-[#1A1A1A]">
              {(reviewSeconds / 3600).toFixed(1)}h Total
            </p>
            <p className="text-[9px] text-[#ADB5BD] mt-1">Independent Tracking</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-[#E9ECEF] bg-white/80 backdrop-blur-md px-4 lg:px-10 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center">
            {/* Mobile Logo/Menu Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center shadow-lg shadow-black/10 active:scale-90 transition-transform"
            >
              <Zap className="text-white w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full transition-all ${activeTab === 'emails' ? 'bg-[#F8F9FA] text-[#1A1A1A]' : 'hover:bg-[#F8F9FA] text-[#495057]'}`}
                onClick={() => setActiveTab('emails')}
              >
                <Mail size={20} />
              </Button>
              {emails.some(e => !e.isRead) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="relative" ref={notificationRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full transition-all ${isNotificationsOpen ? 'bg-[#F8F9FA] text-[#1A1A1A]' : 'hover:bg-[#F8F9FA] text-[#495057]'}`}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell size={20} />
              </Button>
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-72 lg:w-80 bg-white rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl border border-[#E9ECEF] overflow-hidden z-50"
                  >
                    <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between bg-[#F8F9FA]/50">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-[#1A1A1A]">Notifications</h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            deleteFinishedTasks();
                            toast.success("Finished tasks deleted immediately");
                          }}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          title="Delete finished tasks immediately"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            const newValue = !user?.autoDeleteFinishedTasks;
                            updateProfile({ autoDeleteFinishedTasks: newValue });
                            toast.success(`Auto-delete ${newValue ? 'enabled' : 'disabled'}`);
                          }}
                          className={`p-2 rounded-lg transition-colors ${user?.autoDeleteFinishedTasks ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
                          title="Auto-delete finished tasks after 3 days"
                        >
                          <Settings size={16} />
                        </button>
                        <Badge className="bg-[#1A1A1A] text-white border-none text-[10px] px-2 py-0.5">
                          {notifications.length} New
                        </Badge>
                      </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center">
                          <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bell size={20} className="text-[#ADB5BD]" />
                          </div>
                          <p className="text-sm font-bold text-[#1A1A1A]">All caught up!</p>
                          <p className="text-xs text-[#868E96] mt-1">No upcoming activities</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-[#F1F3F5]">
                          {notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                setActiveTab(n.link as any);
                                setIsNotificationsOpen(false);
                              }}
                              className="w-full p-5 text-left hover:bg-[#F8F9FA] transition-colors group flex gap-4"
                            >
                              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${
                                n.type === 'overdue' ? 'bg-red-50 border-red-100 text-red-600' :
                                n.type === 'task' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                'bg-orange-50 border-orange-100 text-orange-600'
                              }`}>
                                {n.type === 'overdue' ? <AlertTriangle size={18} /> : 
                                 n.type === 'task' ? <Target size={18} /> : <Clock size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#1A1A1A] truncate group-hover:text-blue-600 transition-colors">
                                  {n.title}
                                </p>
                                <p className="text-xs text-[#868E96] mt-0.5 line-clamp-2">
                                  {n.description}
                                </p>
                                <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mt-2">
                                  {format(n.date, 'h:mm a')}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-4 bg-[#F8F9FA] border-t border-[#F1F3F5] text-center">
                        <button 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#868E96] hover:text-[#1A1A1A] transition-colors"
                        >
                          Close Panel
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div 
              className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-[#E9ECEF] cursor-pointer hover:opacity-80 transition-opacity group"
              onClick={() => setActiveTab('settings')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold group-hover:text-[#1A1A1A] transition-colors">{user?.displayName || user?.name}</p>
                <p className="text-[10px] text-[#868E96] font-bold uppercase tracking-tight">{(user?.plan || 'Pro').toUpperCase()} MEMBER</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#E9ECEF] border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                <img 
                  src={user?.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div 
          ref={scrollContainerRef} 
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto scroll-smooth ${isScrolling ? 'is-scrolling' : 'hide-scrollbar-inactive'}`}
        >
          <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto space-y-10"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-4xl font-bold tracking-tighter">System Console</h3>
                      <p className="text-[#868E96] font-medium mt-1">Configure your Chronos experience</p>
                    </div>
                    <div className="flex bg-[#F1F3F5] p-1 rounded-[2rem] shadow-inner self-start md:self-center">
                      <button 
                        onClick={() => setSettingsSubTab('profile')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all ${settingsSubTab === 'profile' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#868E96] hover:text-[#495057]'}`}
                      >
                        <User size={14} /> Profile
                      </button>
                      <button 
                        onClick={() => setSettingsSubTab('productivity')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all ${settingsSubTab === 'productivity' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#868E96] hover:text-[#495057]'}`}
                      >
                        <Zap size={14} className={settingsSubTab === 'productivity' ? 'text-blue-600' : ''} /> Core Hub
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {settingsSubTab === 'profile' && (
                      <motion.div
                        key="profile-tab"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-10"
                      >
                        <div className="md:col-span-1 space-y-6">
                          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 text-center">
                            <div className="relative w-32 h-32 mx-auto mb-6 group">
                              <div 
                                className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-xl cursor-pointer"
                                onClick={() => setIsZoomOpen(true)}
                              >
                                <img 
                                  src={user?.avatar} 
                                  alt="Profile" 
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Maximize2 className="text-white w-6 h-6" />
                                </div>
                              </div>
                              <button 
                                onClick={() => setIsAvatarSelectOpen(true)}
                                className="absolute bottom-0 right-0 w-10 h-10 bg-[#1A1A1A] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                              >
                                <Camera size={18} />
                              </button>
                            </div>
                            <h4 className="font-bold text-xl">{user?.displayName || user?.name}</h4>
                            <p className="text-sm text-[#868E96] mb-6">{user?.email}</p>
                            
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Current Tier</Label>
                                <Select value={user?.plan || 'basic'} onValueChange={(val: any) => {
                                  if (val === user?.plan) return;
                                  setPendingPlan(val);
                                  setIsPlanConfirmOpen(true);
                                }}>
                                  <SelectTrigger className="rounded-2xl h-16 border-[#E9ECEF] font-bold uppercase text-xs px-6 shadow-sm hover:border-[#1A1A1A] transition-all">
                                    <SelectValue placeholder="SELECT PLAN" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl border-[#E9ECEF] p-1.5 min-w-[260px]">
                                    <SelectItem value="basic" className="uppercase font-bold text-[10px] py-3 px-4 rounded-xl focus:bg-[#F8F9FA] cursor-pointer tracking-wider">
                                      BASIC PLAN — FREE
                                    </SelectItem>
                                    <SelectItem value="student" className="uppercase font-bold text-[10px] py-3 px-4 rounded-xl focus:bg-[#F8F9FA] cursor-pointer tracking-wider">
                                      STUDENT — $5.99 / MONTH
                                    </SelectItem>
                                    <SelectItem value="pro" className="uppercase font-bold text-[10px] py-3 px-4 rounded-xl focus:bg-[#F8F9FA] cursor-pointer tracking-wider">
                                      PRO PLAN — $9.99 / MONTH
                                    </SelectItem>
                                    <SelectItem value="premium" className="uppercase font-bold text-[10px] py-3 px-4 rounded-xl focus:bg-[#F8F9FA] cursor-pointer tracking-wider">
                                      PREMIUM — $21.99 / MONTH
                                    </SelectItem>
                                    <SelectItem value="business" className="uppercase font-bold text-[10px] py-3 px-4 rounded-xl focus:bg-[#F8F9FA] cursor-pointer tracking-wider">
                                      BUSINESS — $28.00 / MONTH
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </Card>

                          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#868E96] px-2">Account Utilities</h4>
                            <div className="space-y-2">
                               <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-xs font-bold text-[#495057] hover:bg-[#F8F9FA]" onClick={() => toast.info("Data export initiated. You will receive a copy via email.")}>
                                  <Download size={14} /> Export My Data
                               </Button>
                               <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-xs font-bold text-[#495057] hover:bg-[#F8F9FA]" onClick={() => {
                                 if (user) {
                                  setAccountToDelete({ email: user.email, name: user.name });
                                  setIsDeleteConfirmOpen(true);
                                 }
                               }}>
                                  <Trash2 size={14} className="text-red-500" />
                                  <span className="text-red-500">Deactivate Account</span>
                               </Button>
                               <Button 
                                variant="ghost" 
                                onClick={() => {
                                  logout();
                                  setSelectedAccountForLogin(null);
                                  setLoginView('select');
                                }}
                                className="w-full justify-start gap-3 rounded-xl text-xs font-bold text-[#868E96] hover:bg-red-50 hover:text-red-500"
                              >
                                <LogOut size={14} /> Log Out
                              </Button>
                            </div>
                          </Card>
                        </div>

                        <div className="md:col-span-2 space-y-8">
                          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10">
                            <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                              <User size={20} className="text-blue-600" />
                              Personal Information
                            </h4>
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-widest text-[#868E96]">First Name</Label>
                                  <Input 
                                    id="firstName" 
                                    value={editFirstName} 
                                    onChange={(e) => setEditFirstName(e.target.value)}
                                    className="rounded-xl h-12 border-[#E9ECEF] focus:ring-blue-500"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Last Name</Label>
                                  <Input 
                                    id="lastName" 
                                    value={editLastName} 
                                    onChange={(e) => setEditLastName(e.target.value)}
                                    className="rounded-xl h-12 border-[#E9ECEF] focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Display Name (Max 12 chars)</Label>
                                <Input 
                                  id="displayName" 
                                  value={editDisplayName} 
                                  onChange={(e) => {
                                    if (e.target.value.length <= 12) {
                                      setEditDisplayName(e.target.value);
                                    }
                                  }}
                                  className="rounded-xl h-12 border-[#E9ECEF] focus:ring-blue-500"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Email Address</Label>
                                <Input 
                                  id="email" 
                                  value={user?.email} 
                                  disabled
                                  className="rounded-xl h-12 border-[#E9ECEF] bg-[#F8F9FA] text-[#ADB5BD]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="contactInfo" className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Contact Information</Label>
                                <Input 
                                  id="contactInfo" 
                                  value={editContactInfo} 
                                  onChange={(e) => setEditContactInfo(e.target.value)}
                                  placeholder="Phone number or other contact"
                                  className="rounded-xl h-12 border-[#E9ECEF] focus:ring-blue-500"
                                />
                              </div>

                              <Button 
                                onClick={() => {
                                  updateProfile({ 
                                    firstName: editFirstName,
                                    lastName: editLastName,
                                    displayName: editDisplayName,
                                    contactInfo: editContactInfo,
                                    name: `${editFirstName} ${editLastName}`.trim() || user?.name
                                  });
                                  toast.success("Profile updated successfully!");
                                }}
                                className="w-full bg-[#1A1A1A] text-white rounded-xl px-6 h-12 font-bold shadow-lg"
                              >
                                Save Profile Changes
                              </Button>
                            </div>
                          </Card>
                        </div>
                      </motion.div>
                    )}

                    {settingsSubTab === 'productivity' && (
                      <motion.div
                        key="productivity-tab"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                      >
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Security Section (Moved here) */}
                            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10 flex flex-col">
                              <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <Shield size={20} className="text-blue-600" />
                                Security & Trust
                              </h4>
                              <div className="space-y-6 flex-1">
                                <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                      <Mail size={18} className="text-[#495057]" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold">Email Verification</p>
                                      <p className="text-[10px] text-[#868E96]">
                                        {user?.isEmailVerified ? 'Cloud sync active' : 'Sync locked'}
                                      </p>
                                    </div>
                                  </div>
                                  {user?.isEmailVerified ? (
                                    <Badge className="bg-green-500/10 text-green-600 border-none px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider">Secured</Badge>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="rounded-xl font-bold h-8 text-[10px] bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                                      onClick={() => handleSendVerificationEmail(user?.email || '', () => {})}
                                    >
                                      Verify
                                    </Button>
                                  )}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                      <ShieldCheck size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold">Two-Step (2SV)</p>
                                      <p className="text-[10px] text-[#868E96]">Extra layer of defense</p>
                                    </div>
                                  </div>
                                  <Switch 
                                    checked={user?.is2SVEnabled || false}
                                    onCheckedChange={() => {
                                      if (!user?.is2SVEnabled) {
                                        setIs2SVSetupOpen(true);
                                      } else {
                                        toggle2SV();
                                      }
                                    }}
                                  />
                                </div>
                                
                                <div className="pt-4 mt-auto">
                                  <Button 
                                    variant="outline"
                                    onClick={() => setIsPasswordChangeOpen(true)}
                                    className="w-full rounded-xl h-12 border-[#E9ECEF] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F8F9FA]"
                                  >
                                    <Lock size={14} /> Update Password
                                  </Button>
                                </div>
                              </div>
                            </Card>

                            {/* Notifications Section (Moved here) */}
                            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10 flex flex-col">
                              <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <Bell size={20} className="text-orange-600" />
                                Alerts Center
                              </h4>
                              <div className="space-y-6 flex-1">
                                <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl border border-orange-100/50">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                      <AlertTriangle size={18} className="text-orange-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold">Overdue Push</p>
                                      <p className="text-[10px] text-[#868E96]">Missed task reminders</p>
                                    </div>
                                  </div>
                                  <Switch 
                                    checked={overdueNotificationsEnabled}
                                    onCheckedChange={setOverdueNotificationsEnabled}
                                  />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl border border-blue-50">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                      <MessageSquare size={18} className="text-blue-500" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold">AI Suggestions</p>
                                      <p className="text-[10px] text-[#868E96]">Weekly focus insights</p>
                                    </div>
                                  </div>
                                  <Switch checked={true} disabled />
                                </div>
                              </div>
                              <div className="mt-8 p-4 bg-orange-50 rounded-2xl">
                                <p className="text-[10px] text-orange-700 font-medium leading-relaxed italic">
                                   Chronos uses high-priority alerts to ensure you never miss a critical deadline or goal target.
                                </p>
                              </div>
                            </Card>
                         </div>

                         {/* Time & Localization */}
                         <Card className="border-none shadow-sm bg-white rounded-[3rem] p-10">
                            <div className="flex items-center justify-between mb-8">
                               <h4 className="text-xl font-bold flex items-center gap-3">
                                <Globe size={20} className="text-blue-600" />
                                Localization Hub
                              </h4>
                              <div className="flex bg-[#F8F9FA] p-1 rounded-xl">
                                {['12h', '24h'].map((f) => (
                                  <button
                                    key={f}
                                    onClick={() => setTimeFormat(f as any)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${timeFormat === f ? 'bg-[#1A1A1A] text-white' : 'text-[#ADB5BD] hover:text-[#1A1A1A]'}`}
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96] px-1">Managed Timezones ({savedTimezones.length}/{tzLimit})</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {savedTimezones.map((tz) => (
                                    <div 
                                      key={tz}
                                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                        timezone === tz ? 'border-[#1A1A1A] bg-[#F8F9FA] shadow-md' : 'border-[#F1F3F5] bg-white hover:border-[#CED4DA]'
                                      }`}
                                      onClick={() => setTimezone(tz)}
                                    >
                                      <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">{tz.split('/').pop()?.replace(/_/g, ' ')}</p>
                                        <p className="text-[10px] text-blue-600 font-black mt-1">
                                          {format(getZonedTime(currentTime, tz), timeFormat === '24h' ? 'HH:mm' : 'hh:mm a')}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {timezone === tz ? (
                                           <div className="w-5 h-5 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                                              <Check size={12} className="text-white" />
                                           </div>
                                        ) : (
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (savedTimezones.length <= 1) return;
                                              removeTimezone(tz);
                                            }}
                                            className="p-1 hover:bg-black/5 rounded-lg text-[#ADB5BD] hover:text-red-500 transition-colors"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {savedTimezones.length < tzLimit && (
                                    <button
                                      onClick={() => {
                                        setTzStep('continent');
                                        setSelCont('');
                                        setSelZone('');
                                        setIsTimezoneDialogOpen(true);
                                      }}
                                      className="p-5 h-full rounded-2xl border-2 border-dashed border-[#CED4DA] text-[#ADB5BD] font-bold text-[10px] uppercase tracking-[0.15em] flex flex-col items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-600 transition-all bg-white"
                                    >
                                      <Plus size={20} />
                                      Add Zone
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                         </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  {/* Focus Section */}
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-1 space-y-6">
                        <h3 className="text-2xl font-bold tracking-tight">Focus Timer</h3>
                        <FocusTimer />
                      </div>

                      <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-2xl font-bold tracking-tight">Current Focus</h3>
                        {inProgressTasks.length > 0 ? (
                          inProgressTasks.slice(0, 1).map(task => (
                            <Card key={task.id} className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
                              <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                  <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] font-bold uppercase tracking-widest">{task.category}</Badge>
                                  <span className="text-[10px] text-[#868E96] font-bold uppercase tracking-widest">
                                    {task.subSteps.filter(s => s.isCompleted).length}/{task.subSteps.length} Steps
                                  </span>
                                </div>
                                <h4 className="font-bold text-xl mb-6 tracking-tight">{task.title}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {task.subSteps.slice(0, 4).map(step => (
                                    <div key={step.id} className="flex items-center gap-4 group">
                                      <button 
                                        onClick={() => toggleSubStep(task.id, step.id)}
                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                                          step.isCompleted ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20' : 'border-[#E9ECEF] hover:border-[#1A1A1A]'
                                        }`}
                                      >
                                        {step.isCompleted && <Plus size={16} className="text-white rotate-45" />}
                                      </button>
                                      <span className={`text-sm font-medium transition-colors ${step.isCompleted ? 'text-[#ADB5BD] line-through' : 'text-[#495057]'}`}>
                                        {step.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <Button 
                                  variant="outline" 
                                  className="w-full mt-8 rounded-2xl border-[#E9ECEF] h-12 font-bold hover:bg-[#F8F9FA] transition-all" 
                                  onClick={() => setActiveTab('tasks')}
                                >
                                  Manage Project
                                </Button>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="p-10 bg-white rounded-[2rem] border-2 border-dashed border-[#E9ECEF] flex flex-col items-center justify-center text-center h-[280px]">
                            <Target size={32} className="text-[#CED4DA] mb-4" />
                            <p className="text-sm font-bold text-[#868696]">No active task</p>
                            <Button variant="link" className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-2" onClick={() => setActiveTab('tasks')}>Start a Task</Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid - Original Size (Full Width 3 Columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden group">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                              <Clock size={24} />
                            </div>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Active</Badge>
                          </div>
                          <p className="text-[#868E96] text-xs font-bold uppercase tracking-widest">Focus Time</p>
                          <p className="text-4xl font-bold mt-2 tracking-tighter">
                            {Math.floor(todayFocusSeconds / 3600)}h {Math.floor((todayFocusSeconds % 3600) / 60)}m
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden group">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                              <Target size={24} />
                            </div>
                            <Badge variant="secondary" className="bg-green-50 text-green-600 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">+12%</Badge>
                          </div>
                          <p className="text-[#868E96] text-xs font-bold uppercase tracking-widest">Tasks Done</p>
                          <p className="text-4xl font-bold mt-2 tracking-tighter">{completedTasksCount}</p>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden group">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                              <AlertCircle size={24} />
                            </div>
                            <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Urgent</Badge>
                          </div>
                          <p className="text-[#868E96] text-xs font-bold uppercase tracking-widest">Deadlines</p>
                          <p className="text-4xl font-bold mt-2 tracking-tighter">{upcomingDeadlines.length}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Today's Schedule */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-bold tracking-tight">Today's Timeline</h3>
                          <p className="text-[10px] font-bold text-[#868E96] uppercase tracking-widest">Filter your day</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <Popover>
                            <PopoverTrigger render={
                              <Button variant="outline" className="text-xs font-bold uppercase tracking-widest border-[#E9ECEF] h-10 px-4 rounded-xl hover:bg-[#F8F9FA]">
                                <Settings size={14} className="mr-2" />
                                Timeline Filters
                              </Button>
                            } />
                            <PopoverContent className="w-64 p-6 rounded-3xl border-none shadow-2xl" align="end">
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-bold tracking-tight">Visibility Checklist</h4>
                                  <p className="text-[10px] text-[#868E96] font-medium uppercase tracking-widest">Toggle task categories</p>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-green-500" />
                                      <Label className="text-xs font-bold">Finished</Label>
                                    </div>
                                    <Switch 
                                      checked={timelineFilters.finished}
                                      onCheckedChange={(checked) => setTimelineFilters(prev => ({ ...prev, finished: checked }))}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                                      <Label className="text-xs font-bold">Pending</Label>
                                    </div>
                                    <Switch 
                                      checked={timelineFilters.pending}
                                      onCheckedChange={(checked) => setTimelineFilters(prev => ({ ...prev, pending: checked }))}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-red-500" />
                                      <Label className="text-xs font-bold">Overdue</Label>
                                    </div>
                                    <Switch 
                                      checked={timelineFilters.overdue}
                                      onCheckedChange={(checked) => setTimelineFilters(prev => ({ ...prev, overdue: checked }))}
                                    />
                                  </div>
                                  
                                  <div className="pt-4 border-t border-[#F1F3F5]">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label className="text-xs font-bold">Time Scope</Label>
                                        <p className="text-[9px] text-[#868E96] font-medium">Only show current window</p>
                                      </div>
                                      <Switch 
                                        checked={timelineFilters.timeScoped}
                                        onCheckedChange={(checked) => setTimelineFilters(prev => ({ ...prev, timeScoped: checked }))}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {(() => {
                          const now = new Date();
                          const currentHour = now.getHours();
                          const startScope = currentHour;
                          const endScope = currentHour + 6;

                          // Combine ScheduleItems and Tasks with deadlines today
                          const timelineItems = [
                            ...schedule.map(item => ({ ...item, isTask: false })),
                            ...tasks
                              .filter(task => task.deadline && isSameDay(new Date(task.deadline), now))
                              .map(task => ({
                                id: task.id,
                                title: task.title,
                                startTime: task.deadline!,
                                endTime: task.deadline!,
                                type: 'task' as const,
                                isTask: true,
                                status: task.status,
                                category: task.category
                              }))
                          ];

                          const filteredItems = timelineItems.filter(item => {
                            const startTime = new Date(item.startTime);
                            const endTime = new Date(item.endTime);
                            const itemStartHour = startTime.getHours();
                            
                            // 1. Time Scope Filter
                            if (timelineFilters.timeScoped) {
                              if (!isSameDay(startTime, now)) return false;
                              if (itemStartHour < startScope || itemStartHour >= endScope) return false;
                            }

                            // 2. Status Filters
                            if (item.isTask) {
                              if (!timelineFilters.finished && item.status === TaskStatus.COMPLETED) return false;
                              if (!timelineFilters.pending && (item.status === TaskStatus.TODO || item.status === TaskStatus.IN_PROGRESS)) return false;
                              if (!timelineFilters.overdue && item.status === TaskStatus.OVERDUE) return false;
                            } else {
                              const isFinished = isBefore(endTime, now);
                              const isPending = isAfter(startTime, now);
                              const isActive = !isFinished && !isPending;

                              if (!timelineFilters.finished && isFinished) return false;
                              if (!timelineFilters.pending && (isPending || isActive)) return false;
                              // Schedule items don't have an "overdue" state in the same way
                            }
                            
                            return true;
                          });

                          if (filteredItems.length === 0) {
                            return (
                              <div className="p-20 border-2 border-dashed border-[#E9ECEF] rounded-[2.5rem] flex flex-col items-center justify-center text-[#868E96] bg-white/50">
                                <Calendar size={64} className="mb-6 opacity-10" />
                                <p className="font-medium text-lg mb-2">No items match your filters</p>
                                <p className="text-sm opacity-60 mb-8">Adjust your filters to see more</p>
                                <Button 
                                  variant="outline" 
                                  className="rounded-2xl border-[#E9ECEF] px-8 h-12 font-bold hover:bg-[#1A1A1A] hover:text-white transition-all"
                                  onClick={() => setTimelineFilters({ finished: true, pending: true, overdue: true, timeScoped: false })}
                                >
                                  Reset Filters
                                </Button>
                              </div>
                            );
                          }

                          return filteredItems
                            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                            .map((item) => {
                              const isFinished = item.isTask 
                                ? item.status === TaskStatus.COMPLETED 
                                : isBefore(new Date(item.endTime), now);
                              const isPending = item.isTask
                                ? item.status === TaskStatus.TODO || item.status === TaskStatus.IN_PROGRESS
                                : isAfter(new Date(item.startTime), now);
                              const isActive = !item.isTask && !isFinished && !isPending;
                              const isOverdue = item.isTask && item.status === TaskStatus.OVERDUE;

                              return (
                                <motion.div 
                                  layout
                                  key={item.id} 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="group"
                                >
                                  <div className={`
                                    flex-1 p-6 rounded-[1.5rem] shadow-sm border-l-[6px] flex items-center justify-between group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300
                                    ${isFinished ? 'bg-[#F8F9FA] border-[#DEE2E6] opacity-60' : 'bg-white border-[#1A1A1A]'}
                                    ${isActive ? 'ring-2 ring-blue-500/20' : ''}
                                    ${isOverdue ? 'border-red-500 bg-red-50/30' : ''}
                                  `}>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className={`font-bold text-lg ${isFinished ? 'text-[#868E96] line-through' : 'text-[#1A1A1A]'}`}>
                                          {item.title}
                                        </h4>
                                        {isActive && (
                                          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        )}
                                        {isOverdue && (
                                          <Badge className="bg-red-100 text-red-600 border-none text-[8px] font-bold uppercase tracking-widest px-1.5 py-0">Overdue</Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 mt-2">
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isFinished ? 'text-[#ADB5BD]' : 'text-blue-600'}`}>
                                          {format(new Date(item.startTime), 'HH:mm')}
                                          {!item.isTask && ` - ${format(new Date(item.endTime), 'HH:mm')}`}
                                        </p>
                                        <Badge className="bg-[#F8F9FA] text-[#868E96] border-none text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                                          {item.isTask ? 'Project' : item.type}
                                        </Badge>
                                        {!item.isTask && item.isAIProposed && (
                                          <Badge className="bg-purple-50 text-purple-600 border-none text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                                            <Zap size={10} /> AI Proposed
                                          </Badge>
                                        )}
                                        {isFinished && (
                                          <Badge className="bg-green-50 text-green-600 border-none text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">Finished</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="rounded-full text-[#CED4DA] hover:text-red-500" 
                                      onClick={() => item.isTask ? deleteTask(item.id) : deleteScheduleItem(item.id)}
                                    >
                                      <Trash2 size={18} />
                                    </Button>
                                  </div>
                                </motion.div>
                              );
                            });
                        })()}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-10">
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold tracking-tight">Quick AI</h3>
                        <Card className="border-none shadow-xl bg-[#1A1A1A] text-white rounded-[2.5rem] overflow-hidden relative">
                          <CardContent className="p-8 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                              <MessageSquare size={24} />
                            </div>
                            <p className="text-sm text-white/60 mb-8 leading-relaxed">"Schedule a 30min break at 4pm" or "Break down my project into steps"</p>
                            <form onSubmit={handleAiSubmit} className="space-y-4">
                              <div className="relative">
                                <Input 
                                  placeholder="Type a command..." 
                                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-2xl h-14 pr-12 focus:bg-white/10 focus:border-white/20 transition-all"
                                  value={aiInput}
                                  onChange={(e) => setAiInput(e.target.value)}
                                  disabled={isAiLoading}
                                />
                                <div className="absolute right-4 top-4">
                                  {isAiLoading ? (
                                    <motion.div 
                                      animate={{ rotate: 360 }}
                                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    >
                                      <Timer size={20} className="text-white/40" />
                                    </motion.div>
                                  ) : (
                                    <ChevronRight size={20} className="text-white/40" />
                                  )}
                                </div>
                              </div>
                            </form>
                          </CardContent>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[80px]" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[80px]" />
                        </Card>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-10"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="text-center lg:text-left">
                      <h3 className="text-3xl lg:text-4xl font-bold tracking-tighter">Projects</h3>
                      <p className="text-[#868E96] font-medium mt-1">Manage your goals and sub-tasks</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                      <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-2xl w-full sm:w-auto justify-center">
                        {(['all', 'daily', 'weekly', 'monthly'] as const).map((mode) => (
                          <button
                            key={mode}
                            className={`flex-1 sm:flex-none rounded-xl px-4 lg:px-6 h-10 font-bold capitalize transition-all text-[10px] lg:text-xs ${
                              taskViewMode === mode 
                                ? 'bg-[#1A1A1A] text-white shadow-lg' 
                                : 'text-[#868E96] hover:bg-white hover:text-[#1A1A1A]'
                            }`}
                            onClick={() => setTaskViewMode(mode)}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                      <Button 
                        onClick={() => setIsCreateTaskOpen(true)}
                        className="bg-[#1A1A1A] text-white rounded-2xl px-8 h-14 font-bold flex items-center gap-3 shadow-xl shadow-black/10 hover:translate-y-[-2px] transition-all relative"
                      >
                        <Plus size={20} />
                        Create New
                        {draftTask.title && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border-2 border-white rounded-full animate-pulse" />
                        )}
                      </Button>
                      <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-[#1A1A1A] p-8 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-3xl font-bold tracking-tighter">New Project</DialogTitle>
                            <DialogDescription className="text-white/60 font-medium">
                              Break down your goals into actionable steps
                            </DialogDescription>
                          </DialogHeader>
                        </div>
                        
                        <ScrollArea className="max-h-[70vh] p-8">
                          <div className="space-y-8">
                            {/* Category 1: Name */}
                            <div className="space-y-3">
                              <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Category 1: Name of the Task</Label>
                              <Input 
                                placeholder="What needs to be done?" 
                                value={draftTask.title || ''}
                                onChange={(e) => setDraftTask({ ...draftTask, title: e.target.value })}
                                className="rounded-2xl h-14 border-[#E9ECEF] text-lg font-bold focus:ring-2 focus:ring-[#1A1A1A]"
                              />
                            </div>

                            {/* Category 2: Subject */}
                            <div className="space-y-3">
                              <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Category 2: Subject / Department</Label>
                              <Input 
                                placeholder="e.g. Mathematics, Marketing, Personal" 
                                value={draftTask.subject || ''}
                                onChange={(e) => setDraftTask({ ...draftTask, subject: e.target.value })}
                                className="rounded-2xl h-12 border-[#E9ECEF] font-medium"
                              />
                            </div>

                            {/* Category 3: Deadline & Reminders */}
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Category 3: Task Deadline</Label>
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-[9px] font-bold uppercase tracking-widest text-[#ADB5BD] mb-1 block">Date</Label>
                                      <Input 
                                        type="date"
                                        value={draftTask.deadline ? draftTask.deadline.split('T')[0] : ''}
                                        onChange={(e) => {
                                          const time = draftTask.deadline ? draftTask.deadline.split('T')[1] || '12:00' : '12:00';
                                          setDraftTask({ ...draftTask, deadline: `${e.target.value}T${time}` });
                                        }}
                                        className="rounded-2xl h-12 border-[#E9ECEF] font-medium"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-[9px] font-bold uppercase tracking-widest text-[#ADB5BD] mb-1 block">Time</Label>
                                      <Input 
                                        type="time"
                                        value={draftTask.deadline ? draftTask.deadline.split('T')[1]?.substring(0, 5) || '12:00' : '12:00'}
                                        onChange={(e) => {
                                          const date = draftTask.deadline ? draftTask.deadline.split('T')[0] || format(new Date(), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
                                          setDraftTask({ ...draftTask, deadline: `${date}T${e.target.value}` });
                                        }}
                                        className="rounded-2xl h-12 border-[#E9ECEF] font-medium"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Reminder Frequency</Label>
                                  <Select 
                                    value={draftTask.reminderFrequency || 'none'} 
                                    onValueChange={(val: any) => setDraftTask({ ...draftTask, reminderFrequency: val })}
                                  >
                                    <SelectTrigger className="rounded-2xl h-12 border-[#E9ECEF]">
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-[#E9ECEF]">
                                      <SelectItem value="none">No Reminders</SelectItem>
                                      <SelectItem value="hourly">Hourly</SelectItem>
                                      <SelectItem value="daily">Daily</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {draftTask.reminderFrequency !== 'none' && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-6 bg-[#F8F9FA] rounded-[2rem] border border-[#E9ECEF] space-y-6"
                                >
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Reminder Window Start</Label>
                                      <Input 
                                        type="time"
                                        value={draftTask.reminderWindow?.start || '09:00'}
                                        onChange={(e) => setDraftTask({ 
                                          ...draftTask, 
                                          reminderWindow: { ...draftTask.reminderWindow!, start: e.target.value, end: draftTask.reminderWindow?.end || '17:00' } 
                                        })}
                                        className="rounded-xl h-10 border-[#E9ECEF]"
                                      />
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Reminder Window End</Label>
                                      <Input 
                                        type="time"
                                        value={draftTask.reminderWindow?.end || '17:00'}
                                        onChange={(e) => setDraftTask({ 
                                          ...draftTask, 
                                          reminderWindow: { ...draftTask.reminderWindow!, end: e.target.value, start: draftTask.reminderWindow?.start || '09:00' } 
                                        })}
                                        className="rounded-xl h-10 border-[#E9ECEF]"
                                      />
                                    </div>
                                  </div>

                                  {draftTask.reminderFrequency === 'hourly' && (
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Reminder Limit (Times)</Label>
                                        <Input 
                                          type="number"
                                          min="1"
                                          value={draftTask.hourlyReminderLimit || 5}
                                          onChange={(e) => setDraftTask({ ...draftTask, hourlyReminderLimit: parseInt(e.target.value) })}
                                          className="rounded-xl h-10 border-[#E9ECEF]"
                                        />
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Interval (Hours)</Label>
                                        <Input 
                                          type="number"
                                          min="1"
                                          value={draftTask.hourlyReminderInterval || 1}
                                          onChange={(e) => setDraftTask({ ...draftTask, hourlyReminderInterval: parseInt(e.target.value) })}
                                          className="rounded-xl h-10 border-[#E9ECEF]"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {draftTask.reminderFrequency === 'daily' && (
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Daily Reminder Time</Label>
                                      <Input 
                                        type="time"
                                        value={draftTask.dailyReminderTime || '10:00'}
                                        onChange={(e) => setDraftTask({ ...draftTask, dailyReminderTime: e.target.value })}
                                        className="rounded-xl h-10 border-[#E9ECEF]"
                                      />
                                    </div>
                                  )}

                                  {draftTask.reminderFrequency === 'weekly' && (
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Weekly Reminder Day</Label>
                                      <Select 
                                        value={draftTask.weeklyReminderDay || 'Monday'} 
                                        onValueChange={(val) => setDraftTask({ ...draftTask, weeklyReminderDay: val })}
                                      >
                                        <SelectTrigger className="rounded-xl h-10 border-[#E9ECEF]">
                                          <SelectValue placeholder="Select day" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </div>

                            {/* Category 4: Requirements */}
                            <div className="space-y-6 p-6 bg-[#F8F9FA] rounded-[2rem] border border-[#E9ECEF]">
                              <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">Category 4: Requirements</Label>
                              
                              <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Process / Steps</Label>
                                <Textarea 
                                  placeholder="Describe the process..." 
                                  value={draftTask.requirements?.process || ''}
                                  onChange={(e) => setDraftTask({ 
                                    ...draftTask, 
                                    requirements: { ...draftTask.requirements!, process: e.target.value } 
                                  })}
                                  className="rounded-2xl min-h-[100px] border-[#E9ECEF] resize-none"
                                />
                              </div>

                              <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Materials Needed</Label>
                                <Textarea 
                                  placeholder="List materials, links, or resources..." 
                                  value={draftTask.requirements?.materials || ''}
                                  onChange={(e) => setDraftTask({ 
                                    ...draftTask, 
                                    requirements: { ...draftTask.requirements!, materials: e.target.value } 
                                  })}
                                  className="rounded-2xl min-h-[100px] border-[#E9ECEF] resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        </ScrollArea>

                        <DialogFooter className="p-8 bg-[#F8F9FA] border-t border-[#E9ECEF]">
                          <Button 
                            variant="ghost" 
                            onClick={() => setIsCreateTaskOpen(false)}
                            className="rounded-2xl px-8 h-14 font-bold text-[#868E96]"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (!draftTask.title) {
                                toast.error("Please enter a task name");
                                return;
                              }
                              const newTask: Task = {
                                id: crypto.randomUUID(),
                                title: draftTask.title!,
                                subject: draftTask.subject,
                                deadline: draftTask.deadline,
                                reminderFrequency: draftTask.reminderFrequency || 'none',
                                reminderWindow: draftTask.reminderWindow || { start: '09:00', end: '17:00' },
                                dailyReminderTime: draftTask.dailyReminderTime,
                                weeklyReminderDay: draftTask.weeklyReminderDay,
                                hourlyReminderLimit: draftTask.hourlyReminderLimit || 5,
                                hourlyReminderInterval: draftTask.hourlyReminderInterval || 1,
                                reminderCount: 0,
                                status: TaskStatus.TODO,
                                priority: 'medium',
                                subSteps: [],
                                requirements: draftTask.requirements,
                                createdAt: new Date().toISOString(),
                                category: 'work'
                              };
                              addTask(newTask);
                              setDraftTask({});
                              setIsCreateTaskOpen(false);
                              toast.success("Project created successfully!");
                            }}
                            className="bg-[#1A1A1A] text-white rounded-2xl px-10 h-14 font-bold shadow-xl shadow-black/10"
                          >
                            Create Project
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
                      <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-[#1A1A1A] p-8 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-3xl font-bold tracking-tighter">Edit Project</DialogTitle>
                            <DialogDescription className="text-white/60 font-medium">
                              Update your project details and requirements
                            </DialogDescription>
                          </DialogHeader>
                        </div>
                        
                        <ScrollArea className="max-h-[70vh] p-8">
                          {editingTask && (
                            <div className="space-y-8">
                              <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Task Name</Label>
                                <Input 
                                  placeholder="What needs to be done?" 
                                  value={editingTask.title}
                                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                  className="rounded-2xl h-14 border-[#E9ECEF] text-lg font-bold focus:ring-2 focus:ring-[#1A1A1A]"
                                />
                              </div>

                              <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Subject / Department</Label>
                                <Input 
                                  placeholder="e.g. Mathematics, Marketing, Personal" 
                                  value={editingTask.subject || ''}
                                  onChange={(e) => setEditingTask({ ...editingTask, subject: e.target.value })}
                                  className="rounded-2xl h-12 border-[#E9ECEF] font-medium"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Task Deadline</Label>
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-[9px] font-bold uppercase tracking-widest text-[#ADB5BD] mb-1 block">Date</Label>
                                      <Input 
                                        type="date"
                                        value={editingTask.deadline ? editingTask.deadline.split('T')[0] : ''}
                                        onChange={(e) => {
                                          const time = editingTask.deadline ? editingTask.deadline.split('T')[1] || '12:00' : '12:00';
                                          setEditingTask({ ...editingTask, deadline: `${e.target.value}T${time}` });
                                        }}
                                        className="rounded-2xl h-12 border-[#E9ECEF] font-medium"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-[9px] font-bold uppercase tracking-widest text-[#ADB5BD] mb-1 block">Time</Label>
                                      <Input 
                                        type="time"
                                        value={editingTask.deadline ? editingTask.deadline.split('T')[1]?.substring(0, 5) || '12:00' : '12:00'}
                                        onChange={(e) => {
                                          const date = editingTask.deadline ? editingTask.deadline.split('T')[0] || format(new Date(), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
                                          setEditingTask({ ...editingTask, deadline: `${date}T${e.target.value}` });
                                        }}
                                        className="rounded-2xl h-12 border-[#E9ECEF] font-medium"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Reminder Frequency</Label>
                                  <Select 
                                    value={editingTask.reminderFrequency || 'none'} 
                                    onValueChange={(val: any) => setEditingTask({ ...editingTask, reminderFrequency: val })}
                                  >
                                    <SelectTrigger className="rounded-2xl h-12 border-[#E9ECEF]">
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-[#E9ECEF]">
                                      <SelectItem value="none">No Reminders</SelectItem>
                                      <SelectItem value="hourly">Hourly</SelectItem>
                                      <SelectItem value="daily">Daily</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {editingTask.reminderFrequency !== 'none' && (
                                <div className="p-6 bg-[#F8F9FA] rounded-[2rem] border border-[#E9ECEF] space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Reminder Window Start</Label>
                                      <Input 
                                        type="time"
                                        value={editingTask.reminderWindow?.start || '09:00'}
                                        onChange={(e) => setEditingTask({ 
                                          ...editingTask, 
                                          reminderWindow: { ...editingTask.reminderWindow!, start: e.target.value, end: editingTask.reminderWindow?.end || '17:00' } 
                                        })}
                                        className="rounded-xl h-10 border-[#E9ECEF]"
                                      />
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Reminder Window End</Label>
                                      <Input 
                                        type="time"
                                        value={editingTask.reminderWindow?.end || '17:00'}
                                        onChange={(e) => setEditingTask({ 
                                          ...editingTask, 
                                          reminderWindow: { ...editingTask.reminderWindow!, end: e.target.value, start: editingTask.reminderWindow?.start || '09:00' } 
                                        })}
                                        className="rounded-xl h-10 border-[#E9ECEF]"
                                      />
                                    </div>
                                  </div>

                                  {editingTask.reminderFrequency === 'hourly' && (
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Reminder Limit (Times)</Label>
                                        <Input 
                                          type="number"
                                          min="1"
                                          value={editingTask.hourlyReminderLimit || 5}
                                          onChange={(e) => setEditingTask({ ...editingTask, hourlyReminderLimit: parseInt(e.target.value) })}
                                          className="rounded-xl h-10 border-[#E9ECEF]"
                                        />
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Interval (Hours)</Label>
                                        <Input 
                                          type="number"
                                          min="1"
                                          value={editingTask.hourlyReminderInterval || 1}
                                          onChange={(e) => setEditingTask({ ...editingTask, hourlyReminderInterval: parseInt(e.target.value) })}
                                          className="rounded-xl h-10 border-[#E9ECEF]"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {editingTask.reminderFrequency === 'daily' && (
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Daily Reminder Time</Label>
                                      <Input 
                                        type="time"
                                        value={editingTask.dailyReminderTime || '10:00'}
                                        onChange={(e) => setEditingTask({ ...editingTask, dailyReminderTime: e.target.value })}
                                        className="rounded-xl h-10 border-[#E9ECEF]"
                                      />
                                    </div>
                                  )}

                                  {editingTask.reminderFrequency === 'weekly' && (
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Weekly Reminder Day</Label>
                                      <Select 
                                        value={editingTask.weeklyReminderDay || 'Monday'} 
                                        onValueChange={(val) => setEditingTask({ ...editingTask, weeklyReminderDay: val })}
                                      >
                                        <SelectTrigger className="rounded-xl h-10 border-[#E9ECEF]">
                                          <SelectValue placeholder="Select day" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="space-y-6 p-6 bg-[#F8F9FA] rounded-[2rem] border border-[#E9ECEF]">
                                <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">Requirements</Label>
                                
                                <div className="space-y-3">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Process / Steps</Label>
                                  <Textarea 
                                    placeholder="Describe the process..." 
                                    value={editingTask.requirements?.process || ''}
                                    onChange={(e) => setEditingTask({ 
                                      ...editingTask, 
                                      requirements: { ...editingTask.requirements!, process: e.target.value } 
                                    })}
                                    className="rounded-2xl min-h-[100px] border-[#E9ECEF] resize-none"
                                  />
                                </div>

                                <div className="space-y-3">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Materials Needed</Label>
                                  <Textarea 
                                    placeholder="List materials, links, or resources..." 
                                    value={editingTask.requirements?.materials || ''}
                                    onChange={(e) => setEditingTask({ 
                                      ...editingTask, 
                                      requirements: { ...editingTask.requirements!, materials: e.target.value } 
                                    })}
                                    className="rounded-2xl min-h-[100px] border-[#E9ECEF] resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </ScrollArea>

                        <DialogFooter className="p-8 bg-[#F8F9FA] border-t border-[#E9ECEF]">
                          <Button 
                            variant="ghost" 
                            onClick={() => setIsEditTaskOpen(false)}
                            className="rounded-2xl px-8 h-14 font-bold text-[#868E96]"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (editingTask) {
                                if (!editingTask.title) {
                                  toast.error("Please enter a task name");
                                  return;
                                }
                                updateTask(editingTask.id, editingTask);
                                setIsEditTaskOpen(false);
                                setEditingTask(null);
                                toast.success("Project updated successfully!");
                              }
                            }}
                            className="bg-[#1A1A1A] text-white rounded-2xl px-10 h-14 font-bold shadow-xl shadow-black/10"
                          >
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <div className="mb-10 flex items-center gap-4">
                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Filter by Status:</Label>
                      <Select 
                        defaultValue="all" 
                        onValueChange={(val) => {
                          const tabElement = document.querySelector(`[data-task-tab="${val}"]`) as HTMLElement;
                          if (tabElement) tabElement.click();
                        }}
                      >
                        <SelectTrigger className="w-full lg:w-64 h-12 rounded-2xl border-[#E9ECEF] bg-white font-bold text-xs uppercase tracking-widest shadow-sm">
                          <SelectValue placeholder="All Tasks" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-[#E9ECEF]">
                          <SelectItem value="all">📁 All Projects</SelectItem>
                          <SelectItem value={TaskStatus.TODO}>📝 To-Do List</SelectItem>
                          <SelectItem value={TaskStatus.IN_PROGRESS}>⚡ In Progress</SelectItem>
                          <SelectItem value={TaskStatus.OVERDUE}>⚠️ Overdue Tasks</SelectItem>
                          <SelectItem value={TaskStatus.COMPLETED}>✅ Finished</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="hidden">
                        {['all', TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.OVERDUE, TaskStatus.COMPLETED].map(status => (
                          <TabsTrigger 
                            key={status} 
                            value={status} 
                            data-task-tab={status}
                          >
                            {status}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {['all', TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.OVERDUE, TaskStatus.COMPLETED].map(status => (
                        <TabsContent key={status} value={status} className="mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {tasks
                              .filter(t => (status === 'all' || t.status === status))
                              .filter(task => {
                                if (!task.deadline) return true;
                                const deadlineDate = new Date(task.deadline);
                                if (taskViewMode === 'all') return true;
                                if (taskViewMode === 'daily') return isSameDay(deadlineDate, new Date());
                                if (taskViewMode === 'weekly') return isSameWeek(deadlineDate, new Date());
                                if (taskViewMode === 'monthly') return isSameMonth(deadlineDate, new Date());
                                return true;
                              })
                            .length === 0 ? (
                            <div className="col-span-full p-32 bg-white rounded-[3rem] border-2 border-dashed border-[#E9ECEF] flex flex-col items-center justify-center text-[#868E96]">
                              <Zap size={64} className="mb-6 opacity-10" />
                              <p className="text-xl font-bold mb-2">No {status === 'all' ? 'projects' : status} tasks yet</p>
                              <p className="opacity-60">
                                {status === 'all' 
                                  ? 'Use the AI Assistant to break down your first goal' 
                                  : `Tasks marked as ${status} will appear here`}
                              </p>
                            </div>
                          ) : (
                            tasks
                              .filter(t => status === 'all' || t.status === status)
                              .filter(task => {
                                if (!task.deadline) return true;
                                const deadlineDate = new Date(task.deadline);
                                if (taskViewMode === 'daily') return isSameDay(deadlineDate, new Date());
                                if (taskViewMode === 'weekly') return isSameWeek(deadlineDate, new Date());
                                if (taskViewMode === 'monthly') return isSameMonth(deadlineDate, new Date());
                                return true;
                              })
                              .map(task => (
                                  <Card key={task.id} className="border-none shadow-sm bg-white rounded-[2.5rem] group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                                    <CardContent className="p-8 flex-1 flex flex-col">
                                      <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                          <Badge className={`border-none text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                                            task.priority === 'high' ? 'bg-red-50 text-red-600' : 
                                            task.priority === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                          }`}>
                                            {task.priority}
                                          </Badge>
                                          {task.subject && (
                                            <Badge variant="outline" className="rounded-lg border-[#E9ECEF] text-[#868E96] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                                              {task.subject}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button 
                                            onClick={() => updateTask(task.id, { priority: task.priority === 'high' ? 'medium' : 'high' })}
                                            className={`p-2 rounded-xl transition-all ${task.priority === 'high' ? 'text-red-600' : 'text-[#CED4DA] hover:text-[#1A1A1A]'}`}
                                          >
                                            <Star size={16} fill={task.priority === 'high' ? 'currentColor' : 'none'} />
                                          </button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-[#CED4DA] hover:text-blue-600 rounded-full h-8 w-8" 
                                            onClick={() => {
                                              setEditingTask(task);
                                              setIsEditTaskOpen(true);
                                            }}
                                          >
                                            <Edit2 size={16} />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="text-[#CED4DA] hover:text-red-500 rounded-full h-8 w-8" onClick={() => deleteTask(task.id)}>
                                            <Trash2 size={16} />
                                          </Button>
                                        </div>
                                      </div>

                                      <div className="mb-4">
                                        <h4 className="font-bold text-xl tracking-tight group-hover:text-blue-600 transition-colors mb-2">{task.title}</h4>
                                        <p className="text-xs text-[#868E96] leading-relaxed line-clamp-2">{task.description || 'No detailed description provided.'}</p>
                                      </div>
                                      
                                      {task.requirements && (
                                        <div className="mb-6 p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-2">
                                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                                            <CheckCircle2 size={10} />
                                            Requirements
                                          </div>
                                          <p className="text-[10px] text-[#868E96] line-clamp-1 italic">
                                            {task.requirements.process}
                                          </p>
                                        </div>
                                      )}
                                      
                                      <div className="mt-auto space-y-4">
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-[#868E96]">
                                            <span>Progress</span>
                                            <span className="text-[#1A1A1A]">{Math.round((task.subSteps.filter(s => s.isCompleted).length / task.subSteps.length) * 100 || 0)}%</span>
                                          </div>
                                          <div className="h-1 bg-[#F1F3F5] rounded-full overflow-hidden">
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${(task.subSteps.filter(s => s.isCompleted).length / task.subSteps.length) * 100 || 0}%` }}
                                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out" 
                                            />
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-[#F1F3F5]">
                                          <div className="flex items-center gap-2 text-[#868E96]">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                              {task.deadline ? format(new Date(task.deadline), 'MMM d') : 'No Date'}
                                            </span>
                                          </div>
                                          <div className="flex -space-x-2">
                                            {[1, 2].map(i => (
                                              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-[#E9ECEF] overflow-hidden shadow-sm">
                                                <img src={`https://picsum.photos/seed/${task.id + i}/24/24`} alt="Member" referrerPolicy="no-referrer" />
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="mt-4">
                                          {task.status === TaskStatus.COMPLETED ? (
                                            <div className="bg-green-50 text-green-600 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-green-100">
                                              <CheckCircle2 size={14} />
                                              Project Completed
                                            </div>
                                          ) : (
                                            <Button
                                              onClick={() => {
                                                const nextStatus = 
                                                  task.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED;
                                                updateTask(task.id, { status: nextStatus });
                                                toast.success(`Project ${nextStatus === TaskStatus.COMPLETED ? 'Finished' : 'Started'}!`);
                                              }}
                                              className={`w-full rounded-xl py-2.5 h-auto text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${
                                                task.status === TaskStatus.OVERDUE ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1A1A1A] hover:bg-black'
                                              }`}
                                            >
                                              {task.status === TaskStatus.TODO ? 'Start Project' : 'Finish Project'}
                                              <ChevronRight size={14} />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                              ))
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </motion.div>
              )}

              {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-3xl lg:text-4xl font-bold tracking-tighter">Schedule</h3>
                    <p className="text-[#868E96] font-medium mt-1">Plan your days and track your time</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                    <div className="flex flex-col items-start lg:items-end">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96] mb-1">View Mode</Label>
                      <div className="bg-white p-1 rounded-xl border border-[#E9ECEF] flex gap-1">
                        <button 
                          onClick={() => setScheduleViewMode('day')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${scheduleViewMode === 'day' ? 'bg-[#1A1A1A] text-white' : 'text-[#868E96] hover:text-[#1A1A1A]'}`}
                        >
                          Day
                        </button>
                        <button 
                          onClick={() => setScheduleViewMode('week')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${scheduleViewMode === 'week' ? 'bg-[#1A1A1A] text-white' : 'text-[#868E96] hover:text-[#1A1A1A]'}`}
                        >
                          Week
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96] mb-1">Clock Style</Label>
                      <div className="bg-white p-1 rounded-xl border border-[#E9ECEF] flex gap-1">
                        <button 
                          onClick={() => setClockType('digital')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${clockType === 'digital' ? 'bg-[#1A1A1A] text-white' : 'text-[#868E96] hover:text-[#1A1A1A]'}`}
                        >
                          Digital
                        </button>
                        <button 
                          onClick={() => setClockType('analog')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${clockType === 'analog' ? 'bg-[#1A1A1A] text-white' : 'text-[#868E96] hover:text-[#1A1A1A]'}`}
                        >
                          Analog
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96] mb-1">Time Format</Label>
                      <div className="bg-white p-1 rounded-xl border border-[#E9ECEF] flex gap-1">
                        <button 
                          onClick={() => setTimeFormat('12h')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${timeFormat === '12h' ? 'bg-[#1A1A1A] text-white' : 'text-[#868E96] hover:text-[#1A1A1A]'}`}
                        >
                          12H
                        </button>
                        <button 
                          onClick={() => setTimeFormat('24h')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${timeFormat === '24h' ? 'bg-[#1A1A1A] text-white' : 'text-[#868E96] hover:text-[#1A1A1A]'}`}
                        >
                          24H
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end w-full sm:w-auto">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96] mb-1">Your Timezone</Label>
                            <button
                              onClick={() => {
                                setTzStep('continent');
                                setSelCont('');
                                setSelZone('');
                                setIsTimezoneDialogOpen(true);
                              }}
                              className="w-full sm:w-[200px] flex items-center justify-between rounded-xl h-10 border border-[#E9ECEF] bg-white px-3 text-xs font-bold hover:border-[#1A1A1A] transition-all"
                            >
                              <span className="truncate">{timezone}</span>
                              <ChevronRight size={14} className="text-[#ADB5BD]" />
                            </button>
                          </div>
                  </div>
                </div>

                {/* Horizontal Upcoming Bar */}
                <div className="bg-white/50 p-2 rounded-[2rem] border border-[#E9ECEF] overflow-hidden">
                  <div className="flex items-center gap-4 px-4 overflow-x-auto no-scrollbar py-2">
                    <div className="shrink-0 flex items-center gap-2 pr-4 border-r border-[#E9ECEF]">
                      <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center text-white">
                        <Calendar size={16} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Upcoming</span>
                    </div>
                    {schedule
                      .filter(item => isAfter(new Date(item.startTime), new Date()))
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .slice(0, 10)
                      .map(item => (
                        <button 
                          key={item.id}
                          onClick={() => setSelectedDate(new Date(item.startTime))}
                          className="shrink-0 flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-[#E9ECEF] hover:border-[#1A1A1A] transition-all group"
                        >
                          <span className="text-[10px] font-bold text-blue-600">{format(new Date(item.startTime), 'MMM d')}</span>
                          <span className="text-xs font-bold truncate max-w-[120px]">{item.title}</span>
                          <ChevronRight size={12} className="text-[#CED4DA] group-hover:text-[#1A1A1A] group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    {schedule.filter(item => isAfter(new Date(item.startTime), new Date())).length === 0 && (
                      <span className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest">No upcoming events scheduled</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Calendar & Clock Column */}
                  <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 flex items-center justify-center">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border-none scale-110"
                      />
                    </Card>

                    <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                      
                      {clockType === 'analog' ? (
                        <AnalogClock time={getZonedTime(currentTime, timezone)} />
                      ) : (
                        <div className="text-center">
                          <div className="flex items-baseline gap-3">
                            <span className="text-6xl font-black tracking-tighter text-[#1A1A1A] tabular-nums">
                              {format(getZonedTime(currentTime, timezone), timeFormat === '24h' ? 'HH:mm' : 'hh:mm')}
                            </span>
                            <span className="text-2xl font-bold text-[#CED4DA] tabular-nums">
                              {format(getZonedTime(currentTime, timezone), 'ss')}
                            </span>
                            {timeFormat === '12h' && (
                              <span className="text-lg font-bold text-[#868E96] uppercase ml-1">
                                {format(getZonedTime(currentTime, timezone), 'a')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Timeline Column */}
                  <div className="lg:col-span-12 space-y-8">
                    <div className="flex items-center justify-between">
                      <h4 className="text-2xl font-bold tracking-tight">
                        {selectedDate ? format(selectedDate, 'MMMM do, yyyy') : 'Select a date'}
                      </h4>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-blue-50 text-blue-600 border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
                          {schedule.filter(item => selectedDate && isSameDay(new Date(item.startTime), selectedDate)).length} Events
                        </Badge>
                        <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
                          <Button 
                            onClick={() => {
                              const now = new Date();
                              const startTime = selectedDate ? set(selectedDate, { hours: now.getHours(), minutes: now.getMinutes() }) : now;
                              setDraftEvent({
                                startTime: startTime.toISOString(),
                                endTime: addHours(startTime, 1).toISOString(),
                                type: 'meeting',
                                locationType: 'Online'
                              });
                              setIsCreateEventOpen(true);
                            }}
                            className="bg-[#1A1A1A] text-white rounded-2xl px-6 h-12 font-bold flex items-center gap-2 shadow-lg"
                          >
                            <Plus size={18} />
                            Add Event
                          </Button>
                          <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                            <div className="bg-[#1A1A1A] p-8 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-3xl font-bold tracking-tighter">New Event</DialogTitle>
                                <DialogDescription className="text-white/60 font-medium">
                                  Schedule your upcoming meeting or activity
                                </DialogDescription>
                              </DialogHeader>
                            </div>
                            
                            <ScrollArea className="max-h-[60vh] p-8">
                              <div className="space-y-8">
                                <div className="space-y-3">
                                  <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Event Title</Label>
                                  <Input 
                                    placeholder="What's happening?" 
                                    value={draftEvent.title || ''}
                                    onChange={(e) => setDraftEvent({ ...draftEvent, title: e.target.value })}
                                    className="rounded-2xl h-14 border-[#E9ECEF] text-lg font-bold focus:ring-2 focus:ring-[#1A1A1A]"
                                  />
                                </div>

                                <div className="space-y-6">
                                  <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Date</Label>
                                    <Input 
                                      type="date"
                                      value={draftEvent.startTime ? format(new Date(draftEvent.startTime), "yyyy-MM-dd") : ''}
                                      onChange={(e) => {
                                        const date = e.target.value;
                                        const currentStart = new Date(draftEvent.startTime || new Date());
                                        const newStart = new Date(`${date}T${format(currentStart, 'HH:mm')}`);
                                        const currentEnd = new Date(draftEvent.endTime || addHours(newStart, 1));
                                        const newEnd = new Date(`${date}T${format(currentEnd, 'HH:mm')}`);
                                        setDraftEvent({ ...draftEvent, startTime: newStart.toISOString(), endTime: newEnd.toISOString() });
                                      }}
                                      className="rounded-2xl h-12 border-[#E9ECEF]"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Start Time</Label>
                                      <Input 
                                        type="time"
                                        value={draftEvent.startTime ? format(new Date(draftEvent.startTime), "HH:mm") : ''}
                                        onChange={(e) => {
                                          const time = e.target.value;
                                          const currentDate = format(new Date(draftEvent.startTime || new Date()), 'yyyy-MM-dd');
                                          setDraftEvent({ ...draftEvent, startTime: new Date(`${currentDate}T${time}`).toISOString() });
                                        }}
                                        className="rounded-2xl h-12 border-[#E9ECEF]"
                                      />
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">End Time</Label>
                                      <Input 
                                        type="time"
                                        value={draftEvent.endTime ? format(new Date(draftEvent.endTime), "HH:mm") : ''}
                                        onChange={(e) => {
                                          const time = e.target.value;
                                          const currentDate = format(new Date(draftEvent.endTime || new Date()), 'yyyy-MM-dd');
                                          setDraftEvent({ ...draftEvent, endTime: new Date(`${currentDate}T${time}`).toISOString() });
                                        }}
                                        className="rounded-2xl h-12 border-[#E9ECEF]"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Location Type</Label>
                                  <div className="grid grid-cols-3 gap-3">
                                    {['Online', 'In-Person', 'Hybrid'].map((type) => (
                                      <button
                                        key={type}
                                        onClick={() => setDraftEvent({ ...draftEvent, locationType: type as any })}
                                        className={`py-3 rounded-2xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                                          draftEvent.locationType === type 
                                            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-lg' 
                                            : 'border-[#E9ECEF] text-[#868E96] hover:border-[#ADB5BD]'
                                        }`}
                                      >
                                        {type === 'Online' && <Video size={14} />}
                                        {type === 'In-Person' && <MapPin size={14} />}
                                        {type === 'Hybrid' && <Globe size={14} />}
                                        {type}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {(draftEvent.locationType === 'In-Person' || draftEvent.locationType === 'Hybrid') && (
                                  <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Location Address</Label>
                                    <div className="relative">
                                      <MapPin className="absolute left-4 top-4 text-[#ADB5BD]" size={18} />
                                      <Input 
                                        placeholder="Enter physical address..." 
                                        value={draftEvent.location || ''}
                                        onChange={(e) => setDraftEvent({ ...draftEvent, location: e.target.value })}
                                        className="rounded-2xl h-12 pl-12 border-[#E9ECEF]"
                                      />
                                    </div>
                                  </div>
                                )}

                                {(draftEvent.locationType === 'Online' || draftEvent.locationType === 'Hybrid') && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Platform</Label>
                                      <Input 
                                        placeholder="e.g. Zoom, Google Meet" 
                                        value={draftEvent.platform || ''}
                                        onChange={(e) => setDraftEvent({ ...draftEvent, platform: e.target.value })}
                                        className="rounded-2xl h-12 border-[#E9ECEF]"
                                      />
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Meeting Link</Label>
                                      <div className="relative">
                                        <LinkIcon className="absolute left-4 top-4 text-[#ADB5BD]" size={18} />
                                        <Input 
                                          placeholder="https://..." 
                                          value={draftEvent.link || ''}
                                          onChange={(e) => setDraftEvent({ ...draftEvent, link: e.target.value })}
                                          className="rounded-2xl h-12 pl-12 border-[#E9ECEF]"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>

                            <DialogFooter className="p-8 bg-[#F8F9FA] border-t border-[#E9ECEF]">
                              <Button 
                                variant="ghost" 
                                onClick={() => setIsCreateEventOpen(false)}
                                className="rounded-2xl px-8 h-14 font-bold text-[#868E96]"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => {
                                  if (!draftEvent.title) {
                                    toast.error("Please enter an event title");
                                    return;
                                  }
                                  const newEvent: ScheduleItem = {
                                    id: crypto.randomUUID(),
                                    title: draftEvent.title!,
                                    startTime: draftEvent.startTime || new Date().toISOString(),
                                    endTime: draftEvent.endTime || addHours(new Date(), 1).toISOString(),
                                    type: 'meeting',
                                    locationType: draftEvent.locationType,
                                    location: draftEvent.location,
                                    platform: draftEvent.platform,
                                    link: draftEvent.link
                                  };
                                  addScheduleItem(newEvent);
                                  setDraftEvent({});
                                  setIsCreateEventOpen(false);
                                  toast.success("Event scheduled successfully!");
                                }}
                                className="bg-[#1A1A1A] text-white rounded-2xl px-10 h-14 font-bold shadow-xl shadow-black/10"
                              >
                                Schedule Event
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
                          <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                            <div className="bg-[#1A1A1A] p-8 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-3xl font-bold tracking-tighter">Edit Event</DialogTitle>
                                <DialogDescription className="text-white/60 font-medium">
                                  Update your event details
                                </DialogDescription>
                              </DialogHeader>
                            </div>
                            
                            <ScrollArea className="max-h-[60vh] p-8">
                              {editingEvent && (
                                <div className="space-y-8">
                                  <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Event Title</Label>
                                    <Input 
                                      placeholder="What's happening?" 
                                      value={editingEvent.title}
                                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                      className="rounded-2xl h-14 border-[#E9ECEF] text-lg font-bold focus:ring-2 focus:ring-[#1A1A1A]"
                                    />
                                  </div>

                                  <div className="space-y-6">
                                    <div className="space-y-3">
                                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Date</Label>
                                      <Input 
                                        type="date"
                                        value={format(new Date(editingEvent.startTime), "yyyy-MM-dd")}
                                        onChange={(e) => {
                                          const date = e.target.value;
                                          const currentStart = new Date(editingEvent.startTime);
                                          const newStart = new Date(`${date}T${format(currentStart, 'HH:mm')}`);
                                          const currentEnd = new Date(editingEvent.endTime);
                                          const newEnd = new Date(`${date}T${format(currentEnd, 'HH:mm')}`);
                                          setEditingEvent({ ...editingEvent, startTime: newStart.toISOString(), endTime: newEnd.toISOString() });
                                        }}
                                        className="rounded-2xl h-12 border-[#E9ECEF]"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Start Time</Label>
                                        <Input 
                                          type="time"
                                          value={format(new Date(editingEvent.startTime), "HH:mm")}
                                          onChange={(e) => {
                                            const time = e.target.value;
                                            const currentDate = format(new Date(editingEvent.startTime), 'yyyy-MM-dd');
                                            setEditingEvent({ ...editingEvent, startTime: new Date(`${currentDate}T${time}`).toISOString() });
                                          }}
                                          className="rounded-2xl h-12 border-[#E9ECEF]"
                                        />
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">End Time</Label>
                                        <Input 
                                          type="time"
                                          value={format(new Date(editingEvent.endTime), "HH:mm")}
                                          onChange={(e) => {
                                            const time = e.target.value;
                                            const currentDate = format(new Date(editingEvent.endTime), 'yyyy-MM-dd');
                                            setEditingEvent({ ...editingEvent, endTime: new Date(`${currentDate}T${time}`).toISOString() });
                                          }}
                                          className="rounded-2xl h-12 border-[#E9ECEF]"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Location Type</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                      {['Online', 'In-Person', 'Hybrid'].map((type) => (
                                        <button
                                          key={type}
                                          onClick={() => setEditingEvent({ ...editingEvent, locationType: type as any })}
                                          className={`py-3 rounded-2xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                                            editingEvent.locationType === type 
                                              ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-lg' 
                                              : 'border-[#E9ECEF] text-[#868E96] hover:border-[#ADB5BD]'
                                          }`}
                                        >
                                          {type === 'Online' && <Video size={14} />}
                                          {type === 'In-Person' && <MapPin size={14} />}
                                          {type === 'Hybrid' && <Globe size={14} />}
                                          {type}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {(editingEvent.locationType === 'In-Person' || editingEvent.locationType === 'Hybrid') && (
                                    <div className="space-y-3">
                                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Location Address</Label>
                                      <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-[#ADB5BD]" size={18} />
                                        <Input 
                                          placeholder="Enter physical address..." 
                                          value={editingEvent.location || ''}
                                          onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                                          className="rounded-2xl h-12 pl-12 border-[#E9ECEF]"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {(editingEvent.locationType === 'Online' || editingEvent.locationType === 'Hybrid') && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Platform</Label>
                                        <Input 
                                          placeholder="e.g. Zoom, Google Meet" 
                                          value={editingEvent.platform || ''}
                                          onChange={(e) => setEditingEvent({ ...editingEvent, platform: e.target.value })}
                                          className="rounded-2xl h-12 border-[#E9ECEF]"
                                        />
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-[#868E96]">Meeting Link</Label>
                                        <div className="relative">
                                          <LinkIcon className="absolute left-4 top-4 text-[#ADB5BD]" size={18} />
                                          <Input 
                                            placeholder="https://..." 
                                            value={editingEvent.link || ''}
                                            onChange={(e) => setEditingEvent({ ...editingEvent, link: e.target.value })}
                                            className="rounded-2xl h-12 pl-12 border-[#E9ECEF]"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </ScrollArea>

                            <DialogFooter className="p-8 bg-[#F8F9FA] border-t border-[#E9ECEF]">
                              <Button 
                                variant="ghost" 
                                onClick={() => setIsEditEventOpen(false)}
                                className="rounded-2xl px-8 h-14 font-bold text-[#868E96]"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => {
                                  if (editingEvent && editingEvent.title) {
                                    updateScheduleItem(editingEvent.id, editingEvent);
                                    setIsEditEventOpen(false);
                                    toast.success("Event updated successfully!");
                                  } else {
                                    toast.error("Please enter an event title");
                                  }
                                }}
                                className="bg-[#1A1A1A] text-white rounded-2xl px-10 h-14 font-bold shadow-xl shadow-black/10"
                              >
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {scheduleViewMode === 'day' ? (
                        <div className="space-y-4">
                          {schedule.filter(item => selectedDate && isSameDay(new Date(item.startTime), selectedDate)).length === 0 ? (
                            <div className="p-32 bg-white rounded-[3rem] border-2 border-dashed border-[#E9ECEF] flex flex-col items-center justify-center text-[#868E96]">
                              <Calendar size={64} className="mb-6 opacity-10" />
                              <p className="text-xl font-bold mb-2">No events for this day</p>
                              <p className="opacity-60">Try asking AI to "Schedule my day" for {selectedDate ? format(selectedDate, 'MMMM do') : 'this date'}</p>
                            </div>
                          ) : (
                            schedule
                              .filter(item => selectedDate && isSameDay(new Date(item.startTime), selectedDate))
                              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                              .map((item) => (
                                <div key={item.id} className="group">
                                  <div className="flex-1 bg-white p-6 rounded-[1.5rem] shadow-sm border-l-[6px] border-[#1A1A1A] flex items-center justify-between group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                                    <div>
                                      <div className="flex items-center gap-3 mb-1">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                          {format(new Date(item.startTime), 'HH:mm')} - {format(new Date(item.endTime), 'HH:mm')}
                                        </p>
                                      </div>
                                      <h4 className="font-bold text-lg">{item.title}</h4>
                                      <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <Badge className="bg-[#F8F9FA] text-[#868E96] border-none text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                                          {item.locationType === 'Online' && <Video size={10} />}
                                          {item.locationType === 'In-Person' && <MapPin size={10} />}
                                          {item.locationType === 'Hybrid' && <Globe size={10} />}
                                          {item.locationType || item.type}
                                        </Badge>
                                        {item.platform && (
                                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                            <Video size={10} /> {item.platform}
                                          </span>
                                        )}
                                        {item.location && (
                                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                                            <MapPin size={10} /> {item.location}
                                          </span>
                                        )}
                                        {item.link && (
                                          <a 
                                            href={item.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                                          >
                                            <LinkIcon size={10} /> Join
                                          </a>
                                        )}
                                        {item.isAIProposed && (
                                          <Badge className="bg-purple-50 text-purple-600 border-none text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                                            <Zap size={10} /> AI Proposed
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="rounded-full text-[#CED4DA] hover:text-blue-600"
                                        onClick={() => {
                                          setEditingEvent(item);
                                          setIsEditEventOpen(true);
                                        }}
                                      >
                                        <Edit2 size={18} />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="rounded-full text-[#CED4DA] hover:text-red-500" onClick={() => deleteScheduleItem(item.id)}>
                                        <Trash2 size={18} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      ) : (
                        <div className="space-y-12">
                          {eachDayOfInterval({
                            start: startOfWeek(selectedDate || new Date()),
                            end: endOfWeek(selectedDate || new Date())
                          }).map((day) => {
                            const dayEvents = schedule.filter(item => isSameDay(new Date(item.startTime), day));
                            return (
                              <div key={day.toISOString()} className="space-y-6">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center ${isSameDay(day, new Date()) ? 'bg-[#1A1A1A] text-white shadow-lg' : 'bg-white border border-[#E9ECEF] text-[#1A1A1A]'}`}>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{format(day, 'EEE')}</span>
                                    <span className="text-lg font-black">{format(day, 'd')}</span>
                                  </div>
                                  <div className="h-[1px] flex-1 bg-[#E9ECEF]" />
                                  <Badge variant="outline" className="rounded-full border-[#E9ECEF] text-[#868E96] font-bold">
                                    {dayEvents.length} Events
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                                  {dayEvents.length === 0 ? (
                                    <p className="text-[#ADB5BD] text-xs font-bold uppercase tracking-widest italic py-4">No events scheduled</p>
                                  ) : (
                                    dayEvents
                                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                      .map((item) => (
                                        <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E9ECEF] hover:shadow-md transition-all group">
                                          <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                              {format(new Date(item.startTime), 'HH:mm')} - {format(new Date(item.endTime), 'HH:mm')}
                                            </p>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 rounded-full text-[#CED4DA] hover:text-blue-600"
                                                onClick={() => {
                                                  setEditingEvent(item);
                                                  setIsEditEventOpen(true);
                                                }}
                                              >
                                                <Edit2 size={12} />
                                              </Button>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-[#CED4DA] hover:text-red-500" onClick={() => deleteScheduleItem(item.id)}>
                                                <Trash2 size={12} />
                                              </Button>
                                            </div>
                                          </div>
                                          <h5 className="font-bold text-sm mb-2">{item.title}</h5>
                                          <Badge className="bg-[#F8F9FA] text-[#868E96] border-none text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
                                            {item.locationType || item.type}
                                          </Badge>
                                        </div>
                                      ))
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
              {activeTab === 'emails' && (
                <PlanGuard plan="pro" label="Email Center" userPlan={user?.plan || 'basic'} userAddons={user?.purchasedAddons} addonId="advanced_mail" onNavigate={setActiveTab} onPurchaseAddon={handlePurchaseAddonAction}>
                  <motion.div
                    key="emails"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-10"
                  >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="text-center lg:text-left">
                      <h3 className="text-3xl lg:text-4xl font-bold tracking-tighter">Emails & Notifications</h3>
                      <p className="text-[#868E96] font-medium mt-1">Manage your communications and alerts</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {!user?.gmailTokens && (
                        <Button 
                          onClick={handleConnectGmail}
                          className="bg-[#1A1A1A] text-white rounded-2xl px-8 h-14 font-bold flex items-center gap-3 shadow-xl shadow-black/10 hover:translate-y-[-2px] transition-all"
                        >
                          <Mail size={20} />
                          Connect Gmail
                        </Button>
                      )}
                      {user?.gmailTokens && (
                        <Button 
                          variant="outline"
                          onClick={() => fetchEmails()}
                          className="rounded-2xl border-[#E9ECEF] px-8 h-14 font-bold hover:bg-[#F8F9FA] transition-all"
                        >
                          Refresh Inbox
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Inbox Column */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Select 
                            value={emailFilter} 
                            onValueChange={(val: any) => setEmailFilter(val)}
                          >
                            <SelectTrigger className="w-48 lg:w-56 h-12 rounded-2xl border-[#E9ECEF] bg-white font-bold text-xs uppercase tracking-widest shadow-sm">
                              <SelectValue placeholder="Inbox" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#E9ECEF]">
                              <SelectItem value="inbox">📥 Regular Inbox</SelectItem>
                              <SelectItem value="important">⭐ Important Mail</SelectItem>
                              <SelectItem value="archived">📁 Archived Messages</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] font-bold uppercase tracking-widest">
                          {emails.filter(e => !e.isRead && !e.isArchived).length} Unread
                        </Badge>
                      </div>
                      <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-0">
                          <div className="divide-y divide-[#F1F3F5]">
                            {emails.filter(e => {
                              if (emailFilter === 'important') return e.isImportant && !e.isArchived;
                              if (emailFilter === 'archived') return e.isArchived;
                              return !e.isArchived;
                            }).length > 0 ? (
                              emails.filter(e => {
                                if (emailFilter === 'important') return e.isImportant && !e.isArchived;
                                if (emailFilter === 'archived') return e.isArchived;
                                return !e.isArchived;
                              }).map((email) => (
                                <div 
                                  key={email.id} 
                                  className={`p-8 hover:bg-[#F8F9FA] transition-all cursor-pointer group relative ${!email.isRead ? 'bg-blue-50/30' : ''}`}
                                  onClick={() => {
                                    setSelectedEmail(email);
                                    markEmailAsRead(email.id);
                                  }}
                                >
                                  {!email.isRead && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />
                                  )}
                                  <div className="flex gap-6">
                                    <div className="shrink-0 w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                                      <img src={email.avatar} alt={email.sender} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="mb-4">
                                        <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-1">
                                          {format(new Date(email.date), 'MMM d, h:mm a')}
                                        </p>
                                        <div className="flex items-center gap-3">
                                          <p className={`text-lg font-bold truncate ${!email.isRead ? 'text-[#1A1A1A]' : 'text-[#495057]'}`}>
                                            {email.sender}
                                          </p>
                                          {email.isImportant && (
                                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                          )}
                                        </div>
                                      </div>
                                      <p className={`text-sm font-bold truncate mb-2 ${!email.isRead ? 'text-[#1A1A1A]' : 'text-[#868E96]'}`}>
                                        {email.subject}
                                      </p>
                                      <p className="text-sm text-[#868E96] line-clamp-2 leading-relaxed">
                                        {email.preview}
                                      </p>
                                    </div>
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleEmailImportant(email.id);
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${email.isImportant ? 'bg-yellow-50 text-yellow-600' : 'hover:bg-gray-100 text-gray-400'}`}
                                      >
                                        <Star size={16} className={email.isImportant ? 'fill-yellow-600' : ''} />
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleEmailRead(email.id);
                                        }}
                                        className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg transition-colors"
                                      >
                                        <Mail size={16} />
                                      </button>
                                      {!email.isArchived && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            archiveEmail(email.id);
                                            toast.success("Email archived");
                                          }}
                                          className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg transition-colors"
                                        >
                                          <Shield size={16} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-20 text-center">
                                <div className="w-20 h-20 bg-[#F8F9FA] rounded-3xl flex items-center justify-center mx-auto mb-6">
                                  <Mail size={32} className="text-[#ADB5BD]" />
                                </div>
                                <h5 className="text-xl font-bold text-[#1A1A1A]">No emails found</h5>
                                <p className="text-[#868E96] mt-2">Try changing your filters or connect your Gmail.</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Notifications Column */}
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold tracking-tight">Notifications</h4>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              deleteFinishedTasks();
                              toast.success("Finished tasks deleted immediately");
                            }}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            title="Delete finished tasks immediately"
                          >
                            <Trash2 size={16} />
                          </button>
                          <Badge className="bg-[#1A1A1A] text-white border-none text-[10px] px-2 py-0.5">
                            {notifications.length} Total
                          </Badge>
                        </div>
                      </div>
                      <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-0">
                          <div className="divide-y divide-[#F1F3F5]">
                            {notifications.length === 0 ? (
                              <div className="p-12 text-center">
                                <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <Bell size={20} className="text-[#ADB5BD]" />
                                </div>
                                <p className="text-sm font-bold text-[#1A1A1A]">All caught up!</p>
                                <p className="text-xs text-[#868E96] mt-1">No upcoming activities</p>
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div
                                  key={n.id}
                                  className="w-full p-6 text-left hover:bg-[#F8F9FA] transition-colors group flex gap-4"
                                >
                                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${
                                    n.type === 'overdue' ? 'bg-red-50 border-red-100 text-red-600' :
                                    n.type === 'task' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                    'bg-orange-50 border-orange-100 text-orange-600'
                                  }`}>
                                    {n.type === 'overdue' ? <AlertTriangle size={18} /> : 
                                     n.type === 'task' ? <Target size={18} /> : <Clock size={18} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#1A1A1A] truncate group-hover:text-blue-600 transition-colors">
                                      {n.title}
                                    </p>
                                    <p className="text-xs text-[#868E96] mt-0.5 line-clamp-2">
                                      {n.description}
                                    </p>
                                    <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mt-2">
                                      {format(n.date, 'h:mm a')}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
                </PlanGuard>
              )}

              {activeTab === 'productivity' && (
                <PlanGuard plan="pro" label="Statistics & Analytics" userPlan={user?.plan || 'basic'} userAddons={user?.purchasedAddons} addonId="advanced_stats" onNavigate={setActiveTab} onPurchaseAddon={handlePurchaseAddonAction}>
                  <motion.div
                    key="productivity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8">
                      <p className="text-[#868E96] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Focus Time Today</p>
                      <p className="text-4xl font-bold tracking-tighter">
                        {Math.floor(todayFocusSeconds / 3600)}h {Math.floor((todayFocusSeconds % 3600) / 60)}m
                      </p>
                    </Card>
                    <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8">
                      <p className="text-[#868E96] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Tasks Completed</p>
                      <p className="text-4xl font-bold tracking-tighter">{completedTasksCount}</p>
                    </Card>
                    <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8">
                      <p className="text-[#868E96] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Review Time Today</p>
                      <p className="text-4xl font-bold tracking-tighter">
                        {(logs.filter(log => log.activity === 'Review Session' && isSameDay(new Date(log.startTime), new Date()))
                          .reduce((acc, log) => acc + (log.endTime ? (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 3600000 : 0), 0) + (reviewSeconds / 3600)).toFixed(1)}h
                      </p>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Tasks Done Today */}
                    <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10">
                      <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <CheckCircle2 className="text-green-600" />
                        Tasks Completed Today
                      </h3>
                      <div className="space-y-6">
                        {tasks.filter(t => t.status === TaskStatus.COMPLETED && t.completedAt && isSameDay(new Date(t.completedAt), new Date())).length === 0 ? (
                          <p className="text-[#868E96] text-sm italic">No tasks completed today yet.</p>
                        ) : (
                          tasks.filter(t => t.status === TaskStatus.COMPLETED && t.completedAt && isSameDay(new Date(t.completedAt), new Date())).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl">
                              <div>
                                <p className="font-bold">{task.title}</p>
                                <p className="text-xs text-[#868E96]">{task.category}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-green-600">Completed</p>
                                <p className="text-[10px] text-[#868E96] font-bold uppercase tracking-widest">
                                  Time: {Math.floor(task.actualTime || 0)}m {Math.round(((task.actualTime || 0) % 1) * 60)}s
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>

                    {/* Remaining Tasks */}
                    <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10">
                      <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <Clock className="text-blue-600" />
                        Remaining Tasks
                      </h3>
                      <div className="space-y-6">
                        {tasks.filter(t => t.status !== TaskStatus.COMPLETED).length === 0 ? (
                          <p className="text-[#868E96] text-sm italic">All tasks caught up!</p>
                        ) : (
                          tasks.filter(t => t.status !== TaskStatus.COMPLETED).slice(0, 5).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl">
                              <div>
                                <p className="font-bold">{task.title}</p>
                                <p className="text-xs text-[#868E96]">{task.status}</p>
                              </div>
                              <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] font-bold uppercase tracking-widest">
                                {task.priority}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Focus History */}
                  <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10">
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                      <BarChart3 className="text-purple-600" />
                      Focus Session History
                    </h3>
                    <div className="space-y-4">
                      {logs.filter(log => log.type === 'productive' && isSameDay(new Date(log.startTime), new Date())).length === 0 ? (
                        <p className="text-[#868E96] text-sm italic">No focus sessions recorded today.</p>
                      ) : (
                        logs.filter(log => log.type === 'productive' && isSameDay(new Date(log.startTime), new Date()))
                          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                          .map(log => (
                            <div key={log.id} className="flex items-center justify-between p-4 border-b border-[#E9ECEF] last:border-0">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                  <Zap size={18} />
                                </div>
                                <div>
                                  <p className="font-bold">{log.activity}</p>
                                  <p className="text-xs text-[#868E96]">{format(new Date(log.startTime), 'p')}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">
                                  {log.endTime ? 
                                    `${Math.round((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 60000)} min` : 
                                    'In progress'}
                                </p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </Card>
                </motion.div>
                </PlanGuard>
              )}
              {activeTab === 'ai' && (
                <PlanGuard plan="premium" label="AI Smart Scheduling" userPlan={user?.plan || 'basic'} userAddons={user?.purchasedAddons} addonId="ai_scheduling" onNavigate={setActiveTab} onPurchaseAddon={handlePurchaseAddonAction}>
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="max-w-3xl mx-auto space-y-8"
                  >
                  <div className="text-center space-y-4 mb-12">
                    <div className="w-20 h-20 bg-[#1A1A1A] rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-black/20">
                      <Zap className="text-white w-10 h-10" />
                    </div>
                    <h3 className="text-4xl font-bold tracking-tighter">How can I help you today?</h3>
                    <p className="text-[#868E96] text-lg font-medium">I can manage your entire workflow through simple commands.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {[
                      { title: "Schedule My Day", desc: "Auto-schedule with 1hr & 30min reminders", icon: Calendar },
                      { title: "Break down a task", desc: "Step-by-step process with material check", icon: Target },
                      { title: "Clear an Event", desc: "Erase specific times or whole day events", icon: Trash2 },
                      { title: "Analyze My Time", desc: "Productivity insights and helpful guides", icon: Timer },
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => setAiInput(item.title)}
                        className="p-6 bg-white rounded-[2rem] border border-[#E9ECEF] text-left hover:border-[#1A1A1A] hover:shadow-xl hover:-translate-y-1 transition-all group"
                      >
                        <div className="p-3 bg-[#F8F9FA] rounded-xl w-fit mb-4 group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                          <item.icon size={20} />
                        </div>
                        <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                        <p className="text-sm text-[#868E96]">{item.desc}</p>
                      </button>
                    ))}
                  </div>

                  <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden p-2">
                    <form onSubmit={handleAiSubmit} className="flex items-center gap-4 p-4">
                      <div className="flex-1 relative">
                        <Input 
                          placeholder="Type your command here..." 
                          className="border-none bg-[#F8F9FA] rounded-[2rem] h-16 px-8 text-lg focus-visible:ring-0 placeholder:text-[#ADB5BD]"
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          disabled={isAiLoading}
                        />
                        {isAiLoading && (
                          <div className="absolute right-6 top-5">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                              <Timer size={24} className="text-[#CED4DA]" />
                            </motion.div>
                          </div>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isAiLoading}
                        className="w-16 h-16 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0 shadow-xl shadow-black/20"
                      >
                        <ChevronRight size={28} />
                      </Button>
                    </form>
                  </Card>
                </motion.div>
                </PlanGuard>
              )}

              {activeTab === 'focus' && (
                <PlanGuard plan="pro" label="Focus Timer" userPlan={user?.plan || 'basic'} userAddons={user?.purchasedAddons} addonId="focus_tools" onNavigate={setActiveTab} onPurchaseAddon={handlePurchaseAddonAction}>
                  <motion.div
                    key="focus"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-4xl mx-auto space-y-10"
                  >
                    <div className="text-center space-y-4 mb-10">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                        <Timer className="text-white" size={32} />
                      </div>
                      <h3 className="text-4xl font-bold tracking-tighter">Focus & Deep Work</h3>
                      <p className="text-[#868E96] font-medium max-w-lg mx-auto">Pomodoro timer with customizable intervals and "Deep Work" ambient sounds.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="md:col-span-1">
                        <FocusTimer />
                      </div>
                      <div className="md:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8">
                          <h4 className="font-bold mb-4 flex items-center gap-2">
                            <Video size={18} className="text-blue-600" />
                            Ambient Sounds
                          </h4>
                          <div className="space-y-3">
                            {['White Noise', 'Rainfall', 'Office Hubbub', 'Coffee Shop', 'Forest Birds'].map(sound => (
                              <button key={sound} className="w-full text-left p-4 rounded-xl bg-[#F8F9FA] hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-sm flex items-center justify-between group">
                                {sound}
                                <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </Card>
                        <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8">
                          <h4 className="font-bold mb-2">Focus Mode Settings</h4>
                          <p className="text-xs text-[#868E96] mb-6">Block distracting notifications while the timer is active.</p>
                          <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
                            <span className="text-sm font-bold">Hard Mode</span>
                            <Switch />
                          </div>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                </PlanGuard>
              )}

              {activeTab === 'goals' && (
                <PlanGuard plan="premium" label="Goal Tracking" userPlan={user?.plan || 'basic'} userAddons={user?.purchasedAddons} addonId="goal_tracker" onNavigate={setActiveTab} onPurchaseAddon={handlePurchaseAddonAction}>
                  <motion.div
                    key="goals"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-4xl mx-auto space-y-10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-4xl font-bold tracking-tighter">Strategic Goals</h3>
                        <p className="text-[#868E96] font-medium mt-1">Connect daily tasks to yearly objectives</p>
                      </div>
                      <Button className="rounded-2xl h-12 px-6 bg-[#1A1A1A] text-white font-bold flex items-center gap-2 shadow-lg">
                        <Plus size={18} /> New Objective
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {goals.length === 0 ? (
                        <div className="md:col-span-3 p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-[#E9ECEF]">
                          <Target size={48} className="text-[#CED4DA] mx-auto mb-6" />
                          <h4 className="text-xl font-bold">Set your first anchor goal</h4>
                          <p className="text-[#868E96] mt-2 max-w-xs mx-auto">Premium users can track long-term progress across multiple quarters.</p>
                        </div>
                      ) : (
                        goals.map(goal => (
                          <Card key={goal.id} className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-purple-50 text-purple-600 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{goal.category}</Badge>
                              <span className="text-xs font-bold text-[#868E96]">{goal.progress}%</span>
                            </div>
                            <h4 className="text-xl font-bold tracking-tight">{goal.title}</h4>
                            <div className="space-y-2">
                              <div className="h-2 bg-[#F8F9FA] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${goal.progress}%` }}
                                  className="h-full bg-purple-600 rounded-full"
                                />
                              </div>
                              <p className="text-[10px] text-[#868E96] font-medium">Target: {format(new Date(goal.targetDate), 'MMM yyyy')}</p>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </motion.div>
                </PlanGuard>
              )}

              {activeTab === 'academic' && (
                <PlanGuard plan="student" label="Academic Hub" userPlan={user?.plan || 'basic'} userAddons={user?.purchasedAddons} addonId="academic_suite" onNavigate={setActiveTab} onPurchaseAddon={handlePurchaseAddonAction}>
                  <motion.div
                    key="academic"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-4xl mx-auto space-y-10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-4xl font-bold tracking-tighter">Academic Hub</h3>
                        <p className="text-[#868E96] font-medium mt-1">Manage your semester, grades, and academic habits</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsGradingSetupOpen(true)}
                          className="rounded-2xl h-12 px-6 font-bold flex items-center gap-2 border-[#E9ECEF]"
                        >
                          <Settings size={18} /> Grading Config
                        </Button>
                        <Button 
                          onClick={() => {
                            setCourseStep(1);
                            setIsAddCourseDialogOpen(true);
                          }}
                          className="rounded-2xl h-12 px-6 bg-[#1A1A1A] text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-black/20 transition-all"
                        >
                          <Plus size={18} /> Add Course
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10 md:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xl font-bold flex items-center gap-3">
                            <BookOpen size={20} className="text-blue-600" />
                            Current Enrollment
                          </h4>
                          <Badge className="bg-blue-50 text-blue-600 border-none px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                            {semesterTimeline.mode === 'calendar' 
                              ? `${semesterTimeline.startDate && isValid(new Date(semesterTimeline.startDate)) ? format(new Date(semesterTimeline.startDate), 'MMM') : '...'} - ${semesterTimeline.endDate && isValid(new Date(semesterTimeline.endDate)) ? format(new Date(semesterTimeline.endDate), 'MMM yyyy') : '...'}`
                              : `${semesterTimeline.durationMonths || 0} Months Duration`
                            }
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {courses.length === 0 ? (
                            <div className="py-12 text-center bg-[#F8F9FA] rounded-[2rem] border-2 border-dashed border-[#E9ECEF]">
                              <p className="text-sm text-[#868E96] font-medium">No courses enrolled yet. Start your semester setup.</p>
                            </div>
                          ) : (
                            courses.map(course => {
                              const isPassing = gradingConfig.format === 'alphabetical'
                                ? (GRADE_VALS[course.grade] || 0) >= (GRADE_VALS[gradingConfig.passingGrade as string] || 0)
                                : gradingConfig.isLowerBetter 
                                  ? parseFloat(course.grade) <= parseFloat(gradingConfig.passingGrade as string)
                                  : parseFloat(course.grade) >= parseFloat(gradingConfig.passingGrade as string);

                              return (
                                <div key={course.id} className="flex items-center justify-between p-6 bg-[#F8F9FA] rounded-3xl group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
                                  <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border ${isPassing ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                      {course.grade}
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-[#868E96] uppercase tracking-widest mb-1">{course.code}</p>
                                      <p className="font-bold text-lg">{course.name}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <Badge variant="outline" className="rounded-lg text-[9px] font-bold opacity-60">
                                          {course.credits} Credits
                                        </Badge>
                                        {isPassing ? (
                                          <Badge className="bg-green-500/10 text-green-600 border-none text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Check size={10} /> PASS
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-red-500/10 text-red-600 border-none text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <AlertCircle size={10} /> FAIL
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-bold text-[#868E96] uppercase tracking-widest">Standing</span>
                                    <span className="text-sm font-black">{course.percentage}%</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </Card>

                      <div className="space-y-8">
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10">
                          <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <Star size={20} className="text-orange-500" />
                            GPA Tracker
                          </h4>
                          <div className="text-center py-6 space-y-4">
                            <p className="text-7xl font-black tracking-tighter text-[#1A1A1A]">{calculatedGPA}</p>
                            <p className="text-xs font-bold text-[#868E96] uppercase tracking-widest">Cumulative Standing</p>
                            <div className="pt-8">
                              <Button 
                                variant="outline" 
                                onClick={() => setIsAnalyzeGradesDialogOpen(true)}
                                className="w-full rounded-2xl h-14 font-bold border-[#E9ECEF] hover:bg-[#F8F9FA] transition-all"
                              >
                                Analyze Grade Impacts
                              </Button>
                            </div>
                          </div>
                        </Card>

                        <Card className="border-none shadow-sm bg-[#1A1A1A] text-white rounded-[2.5rem] p-10 overflow-hidden relative group">
                          <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-bold">Academic Health</h4>
                              <Zap size={20} className="text-yellow-400" />
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span>Consistency Score</span>
                                <span>{academicStats.consistencyScore}%</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${academicStats.consistencyScore}%` }}
                                  className="h-full bg-yellow-400 rounded-full"
                                />
                              </div>
                              <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                Your consistency is calculated based on study-to-break ratios and session frequency.
                              </p>
                            </div>
                          </div>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 blur-3xl -mr-16 -mt-16 group-hover:bg-yellow-400/20 transition-all duration-700" />
                        </Card>
                      </div>
                    </div>

                    {/* Statistics Dashboard */}
                    <div className="space-y-8">
                       <h3 className="text-2xl font-bold tracking-tight px-4">Academic Performance & Analytics</h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                          <Card className="p-8 bg-white rounded-[2rem] border-none shadow-sm space-y-4">
                            <p className="text-[10px] font-bold text-[#868E96] uppercase tracking-widest">Focus Time</p>
                            <div className="flex items-end gap-2">
                              <span className="text-4xl font-black">{academicStats.focusTime}</span>
                              <span className="text-xs font-bold text-[#868E96] pb-1.5">Sessions</span>
                            </div>
                            <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 w-full" />
                            </div>
                          </Card>
                          
                          <Card className="p-8 bg-white rounded-[2rem] border-none shadow-sm space-y-4">
                             <p className="text-[10px] font-bold text-[#868E96] uppercase tracking-widest">Review Time</p>
                             <div className="flex items-end gap-2">
                                <span className="text-4xl font-black">{academicStats.reviewTime}</span>
                                <span className="text-xs font-bold text-[#868E96] pb-1.5">Sessions</span>
                             </div>
                             <div className="h-1 bg-purple-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-600 w-full" />
                             </div>
                          </Card>
                          
                          <Card className="p-8 bg-white rounded-[2rem] border-none shadow-sm space-y-4">
                             <p className="text-[10px] font-bold text-[#868E96] uppercase tracking-widest">Break Time</p>
                             <div className="flex items-end gap-2">
                                <span className="text-4xl font-black">{academicStats.breakTime}</span>
                                <span className="text-xs font-bold text-[#868E96] pb-1.5">Sessions</span>
                             </div>
                             <div className="h-1 bg-orange-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-600 w-full" />
                             </div>
                          </Card>

                          <Card className="p-8 bg-white rounded-[2rem] border-none shadow-sm space-y-6 md:col-span-3 lg:col-span-1">
                             <p className="text-[10px] font-bold text-[#868E96] uppercase tracking-widest">Course Standing Bar</p>
                             <div className="space-y-4">
                               <div className="flex items-center justify-between text-xs font-bold">
                                  <span>Academic Stability</span>
                                  <span className="text-blue-600">{academicStats.performance}%</span>
                               </div>
                               <div className="h-4 bg-[#F8F9FA] rounded-xl overflow-hidden p-1 shadow-inner border border-[#E9ECEF]">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${academicStats.performance}%` }}
                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg"
                                  />
                               </div>
                               <p className="text-[9px] text-[#868E96] font-bold leading-tight uppercase tracking-tighter">
                                  Maintaining "Good Grades" based on your threshold.
                               </p>
                             </div>
                          </Card>
                       </div>
                    </div>
                  </motion.div>
                </PlanGuard>
              )}

              {activeTab === 'teams' && (
                <PlanGuard plan="business" label="Team Sync" userPlan={user?.plan || 'basic'} userAddons={user?.purchasedAddons} addonId="business_sync" onNavigate={setActiveTab} onPurchaseAddon={handlePurchaseAddonAction}>
                  <motion.div
                    key="teams"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-4xl mx-auto space-y-10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-4xl font-bold tracking-tighter">Business Hub</h3>
                        <p className="text-[#868E96] font-medium mt-1">Manage team availability and billable logs</p>
                      </div>
                      <Button className="rounded-2xl h-12 px-6 bg-[#1A1A1A] text-white font-bold flex items-center gap-2 shadow-lg">
                        <Upload size={18} /> Export Invoices
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 col-span-1 lg:col-span-2 space-y-8">
                        <h4 className="text-xl font-bold flex items-center gap-3">
                          <BarChart3 size={20} className="text-blue-600" />
                          Billable Hours History
                        </h4>
                        <div className="space-y-4">
                          {billableHours.length === 0 ? (
                            <div className="text-center py-10">
                              <p className="text-sm text-[#868E96] italic">No billable sessions tracked this period.</p>
                            </div>
                          ) : (
                            billableHours.map(log => (
                              <div key={log.id} className="flex items-center justify-between p-5 bg-[#F8F9FA] rounded-3xl">
                                <div className="flex items-center gap-4">
                                  <div className={`w-3 h-3 rounded-full ${log.isBilled ? 'bg-green-500' : 'bg-orange-500'}`} />
                                  <div>
                                    <p className="font-bold">{log.projectName}</p>
                                    <p className="text-xs text-[#868E96] font-medium">{format(new Date(log.date), 'MMM d, yyyy')}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-lg">{log.hours}h</p>
                                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">${(log.hours * log.rate).toFixed(2)} Total</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>

                      <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 space-y-6 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                          <Clock size={32} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl">Meeting Audit</h4>
                          <p className="text-xs text-[#868E96] mt-2">Team time spent in meetings this week:</p>
                        </div>
                        <p className="text-5xl font-black mb-2 tracking-tight">24.5h</p>
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Approx. Cost: $3,200</p>
                      </Card>
                    </div>
                  </motion.div>
                </PlanGuard>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
        </div>
      )}
      {/* Timezone Selection Dialog */}
      <Dialog open={isTimezoneDialogOpen} onOpenChange={setIsTimezoneDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight uppercase">
              {tzStep === 'continent' ? 'Select Continent' : tzStep === 'zone' ? 'Select City/Zone' : 'Confirm Selection'}
            </DialogTitle>
            <DialogDescription>
              {tzStep === 'continent' ? 'Browse timezones by region' : tzStep === 'zone' ? `Showing locations in ${selCont}` : 'Review current time in selected zone'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {tzStep === 'continent' && (
              <div className="grid grid-cols-2 gap-3">
                {CONTINENTS.map(cont => (
                  <Button 
                    key={cont}
                    variant="outline"
                    onClick={() => {
                      setSelCont(cont);
                      setTzStep('zone');
                    }}
                    className="h-14 rounded-2xl font-bold border-[#E9ECEF] hover:border-blue-600 hover:bg-blue-50 transition-all"
                  >
                    {cont}
                  </Button>
                ))}
              </div>
            )}

            {tzStep === 'zone' && (
              <div className="space-y-4">
                 <Select value={selZone} onValueChange={(val) => {
                   setSelZone(val);
                   setTzStep('confirm');
                 }}>
                  <SelectTrigger className="h-14 rounded-2xl border-[#E9ECEF] font-bold">
                    <SelectValue placeholder="Search location..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] rounded-2xl">
                    {ALL_TIMEZONES.filter(tz => tz.startsWith(selCont)).map(tz => (
                      <SelectItem key={tz} value={tz} className="py-3 font-medium">
                        {tz.split('/').slice(1).join(' — ').replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                 </Select>
                 <Button variant="ghost" className="w-full rounded-xl" onClick={() => setTzStep('continent')}>
                   Back to continents
                 </Button>
              </div>
            )}

            {tzStep === 'confirm' && (
              <div className="space-y-6">
                <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 text-center">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Current time in {selZone.split('/').pop()?.replace(/_/g, ' ')}</p>
                  <p className="text-5xl font-black tracking-tighter mb-2">
                    {format(getZonedTime(currentTime, selZone), 'hh:mm a')}
                  </p>
                  <p className="text-xs font-bold text-[#868E96]">
                    {format(getZonedTime(currentTime, selZone), 'EEEE, MMMM do')}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    className="h-14 bg-[#1A1A1A] text-white rounded-2xl font-bold"
                    onClick={() => {
                      if (!savedTimezones.includes(selZone)) {
                        addTimezone(selZone);
                      }
                      setTimezone(selZone);
                      setIsTimezoneDialogOpen(false);
                      toast.success(`Active timezone updated to ${selZone.split('/').pop()?.replace(/_/g, ' ')}`);
                    }}
                  >
                    Confirm & Apply
                  </Button>
                  <Button variant="ghost" className="rounded-xl" onClick={() => setTzStep('zone')}>
                    Choose different location
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-none shadow-none" showCloseButton={false}>
          <div className="relative aspect-square w-full">
            <img 
              src={user?.avatar} 
              alt="Profile Zoom" 
              className="w-full h-full object-cover rounded-[3rem]"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Selection Dialog */}
      <Dialog open={isAvatarSelectOpen} onOpenChange={setIsAvatarSelectOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Change Profile Picture</DialogTitle>
            <DialogDescription>Select a new avatar from our collection</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-6">
            {PREDEFINED_AVATARS.map((avatar, i) => (
              <button
                key={i}
                onClick={() => {
                  updateProfile({ avatar, uploadedAvatar: null });
                  setIsAvatarSelectOpen(false);
                  toast.success("Profile picture updated!");
                }}
                className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 active:scale-95 ${
                  user?.avatar === avatar && !user?.uploadedAvatar ? 'border-blue-600 shadow-lg' : 'border-transparent'
                }`}
              >
                <img src={avatar} alt={`Avatar ${i+1}`} className="w-full h-full object-cover" />
                {user?.avatar === avatar && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <Check size={24} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-[#ADB5BD] font-bold uppercase tracking-widest px-2">Storage</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarFileUpload} 
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full rounded-2xl h-14 font-bold flex items-center justify-center gap-2 border-dashed border-2 border-[#E9ECEF] hover:border-[#1A1A1A] hover:bg-[#F8F9FA]"
            >
              <Upload size={18} />
              Upload from Storage
            </Button>
            {user?.uploadedAvatar && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                  <img src={user.uploadedAvatar} alt="Uploaded" className="w-full h-full object-cover" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-sm text-blue-900">Current Upload</p>
                  <p className="text-xs text-blue-600">Replaces previous upload</p>
                </div>
                <Button 
                  onClick={() => updateProfile({ avatar: user.uploadedAvatar as string })}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-bold text-xs"
                >
                  Use This
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAvatarSelectOpen(false)} className="rounded-xl">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Plan Confirmation Dialog */}
      <Dialog open={isPlanConfirmOpen} onOpenChange={setIsPlanConfirmOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight uppercase">Confirm Plan Change</DialogTitle>
            <DialogDescription className="text-base">
              Are you willing to pay the amount currently being asked by the application for the <span className="font-bold uppercase">{pendingPlan}</span> plan?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
              <p className="text-sm font-bold uppercase tracking-widest text-[#868E96] mb-2">Selected Plan</p>
              <p className="text-xl font-bold uppercase tracking-tight">
                {pendingPlan} — {
                  pendingPlan === 'basic' ? 'FREE' : 
                  pendingPlan === 'student' ? '$5.99 / MONTH' : 
                  pendingPlan === 'pro' ? '$9.99 / MONTH' : 
                  pendingPlan === 'premium' ? '$21.99 / MONTH' : '$28.00 / SEAT'
                }
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#868E96] px-2">Plan Features</p>
              <ul className="space-y-3 bg-[#F8F9FA]/50 p-4 rounded-2xl border border-[#F1F3F5]">
                {(
                  pendingPlan === 'basic' ? ['Standard Tasks', 'My Day Planner', 'Basic Calendar Sync (View-only)', 'Max 3 Projects'] :
                  pendingPlan === 'pro' ? ['Everything in Basic', 'Unlimited Projects & Tags', 'Pomodoro & Focus Timer', 'Advanced Statistics', 'Priority Support', '2-Way Calendar Sync'] :
                  pendingPlan === 'premium' ? ['Everything in Pro', 'AI Smart Scheduling', 'Workflow Automation', 'Goal Tracking', 'Advanced Analytics (Heatmaps)'] :
                  pendingPlan === 'student' ? ['Everything in Pro', 'Academic Hub', 'Course & Grade Tracker', 'Study Collaboration', 'Basic AI Assistant'] :
                  ['Everything in Premium', 'Shared Timelines', 'Billable Hours Tracker', 'Meeting Audit', 'Team Dashboard', 'Volume Licensing']
                ).map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-semibold text-[#495057]">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} className="text-blue-500" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPlanConfirmOpen(false);
                setPendingPlan(null);
              }} 
              className="rounded-xl h-12 px-6 font-bold"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (pendingPlan) {
                  setEditPlan(pendingPlan);
                  updateProfile({ plan: pendingPlan });
                  toast.success(`Plan updated to ${pendingPlan.toUpperCase()}`);
                }
                setIsPlanConfirmOpen(false);
                setPendingPlan(null);
              }} 
              className="bg-[#1A1A1A] text-white rounded-xl h-12 px-8 font-bold"
            >
              Yes, I am willing to pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Change Password</DialogTitle>
            <DialogDescription>Enter your current and new password to proceed</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Current Password</Label>
              <Input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl h-12 border-[#E9ECEF]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">New Password</Label>
              <Input 
                type="password" 
                value={newPasswordForm} 
                onChange={(e) => setNewPasswordForm(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl h-12 border-[#E9ECEF]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Confirm New Password</Label>
              <Input 
                type="password" 
                value={confirmNewPassword} 
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl h-12 border-[#E9ECEF]"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsPasswordChangeOpen(false)} className="rounded-xl h-12">Cancel</Button>
            <Button 
              disabled={!currentPassword || !newPasswordForm || newPasswordForm !== confirmNewPassword}
              onClick={() => {
                const res = changePassword(currentPassword, newPasswordForm);
                if (res.success) {
                  setIsPasswordChangeOpen(false);
                  setCurrentPassword('');
                  setNewPasswordForm('');
                  setConfirmNewPassword('');
                } else {
                  toast.error(res.message);
                }
              }}
              className="bg-[#1A1A1A] text-white rounded-xl h-12 px-8 font-bold flex-1"
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2SV Setup Dialog */}
      <Dialog open={is2SVSetupOpen} onOpenChange={setIs2SVSetupOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Setup Two-Step Verification</DialogTitle>
            <DialogDescription>Add an extra layer of security to your account</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-blue-900">Highly Recommended</p>
                  <p className="text-xs text-blue-700">Protects your data even if your password is stolen</p>
                </div>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                By enabling 2SV, you will be required to enter a security code every time you log in from a new device or periodic check.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Confirm Password to Enable</Label>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="rounded-xl h-12 border-[#E9ECEF]"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIs2SVSetupOpen(false)} className="rounded-xl h-12">Maybe Later</Button>
            <Button 
              disabled={confirmPassword !== user?.password}
              onClick={() => {
                toggle2SV();
                setIs2SVSetupOpen(false);
                setConfirmPassword('');
              }}
              className="bg-[#1A1A1A] text-white rounded-xl h-12 px-8 font-bold flex-1"
            >
              Enable 2SV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Recover Password</DialogTitle>
            <DialogDescription>We'll help you get back into your account</DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            {resetStep === 'input_email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Confirm Email Address</Label>
                  <Input 
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="rounded-xl h-12 border-[#E9ECEF]"
                  />
                </div>
                <Button onClick={handleForgotPassword} className="w-full h-12 bg-[#1A1A1A] text-white rounded-xl font-bold shadow-lg">
                  Confirm Account
                </Button>
              </div>
            )}
            {resetStep === 'input_new_password' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">New Secure Password</Label>
                  <Input 
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-xl h-12 border-[#E9ECEF]"
                  />
                </div>
                <Button onClick={handleResetPassword} className="w-full h-12 bg-[#1A1A1A] text-white rounded-xl font-bold">
                  Reset Password & Login
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setIsForgotPasswordOpen(false);
              setResetStep('input_email');
            }} className="w-full h-12 font-bold text-[#868E96]">
              Cancel Recovery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Verification Modal */}
      <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 text-center">
          <DialogHeader>
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg">
              <Mail size={24} />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Confirm Verification</DialogTitle>
            <DialogDescription>
              Verify your email address now to secure your account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Button onClick={handleConfirmVerification} className="w-full h-12 bg-[#1A1A1A] text-white rounded-xl font-bold shadow-xl">
              Confirm Email Address
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Recovery Confirmation */}
      <Dialog open={isRecoveryConfirmOpen} onOpenChange={setIsRecoveryConfirmOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Account Recovery</DialogTitle>
            <DialogDescription>
              An account with this email already exists on another device. Would you like to recover it?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-blue-900">Existing Account Found</p>
                <p className="text-xs text-blue-600">{recoveryEmail}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsRecoveryConfirmOpen(false)} 
              className="rounded-xl h-12 flex-1 font-bold"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const recovered = recoverAccount(recoveryEmail);
                if (recovered) {
                  setIsRecoveryConfirmOpen(false);
                  setNewEmail('');
                  setNewName('');
                  setNewPassword('');
                  setLoginView('select');
                }
              }} 
              className="bg-[#1A1A1A] text-white rounded-xl h-12 flex-1 font-bold shadow-lg"
            >
              Recover Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Course Dialog */}
      <Dialog open={isAddCourseDialogOpen} onOpenChange={setIsAddCourseDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
               <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Step {courseStep} of 3</Badge>
               <span className="text-xs font-bold text-[#868E96] uppercase tracking-widest">Academic Enrollment</span>
            </div>
            <DialogTitle className="text-4xl font-black tracking-tight uppercase">
              {courseStep === 1 ? 'Semester Timeline' : courseStep === 2 ? 'Term Volume' : `Course Details (${iterativeCourseIndex + 1}/${semesterTimeline.plannedCourseCount})`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCourseSequence} className="space-y-10 py-10">
            {courseStep === 1 && (
              <div className="space-y-8">
                 <div className="p-8 bg-[#F8F9FA] rounded-[2rem] space-y-6">
                    <p className="text-sm font-bold text-[#1A1A1A]">How would you like to define your semester duration?</p>
                    <RadioGroup 
                      value={semesterTimeline.mode} 
                      onValueChange={(val: any) => setSemesterTimeline({...semesterTimeline, mode: val})}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${semesterTimeline.mode === 'calendar' ? 'border-blue-600 bg-blue-50' : 'border-[#E9ECEF] bg-white'}`}>
                        <RadioGroupItem value="calendar" id="calendar" className="sr-only" />
                        <Label htmlFor="calendar" className="flex items-center gap-3 cursor-pointer">
                          <Calendar size={18} />
                          <span className="font-bold">Calendar Dates</span>
                        </Label>
                      </div>
                      <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${semesterTimeline.mode === 'months' ? 'border-blue-600 bg-blue-50' : 'border-[#E9ECEF] bg-white'}`}>
                        <RadioGroupItem value="months" id="months" className="sr-only" />
                        <Label htmlFor="months" className="flex items-center gap-3 cursor-pointer">
                          <Clock size={18} />
                          <span className="font-bold">Month Based</span>
                        </Label>
                      </div>
                    </RadioGroup>
                 </div>

                 {semesterTimeline.mode === 'calendar' ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Start Date</Label>
                        <Input 
                          type="date" 
                          value={semesterTimeline.startDate || ''} 
                          onChange={(e) => setSemesterTimeline({...semesterTimeline, startDate: e.target.value})}
                          className="rounded-2xl h-14 border-[#E9ECEF] font-bold" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">End Date</Label>
                        <Input 
                          type="date" 
                          value={semesterTimeline.endDate || ''} 
                          onChange={(e) => setSemesterTimeline({...semesterTimeline, endDate: e.target.value})}
                          className="rounded-2xl h-14 border-[#E9ECEF] font-bold" 
                        />
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-2 pb-6">
                      <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Number of Months</Label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 4"
                        value={semesterTimeline.durationMonths}
                        onChange={(e) => setSemesterTimeline({...semesterTimeline, durationMonths: parseInt(e.target.value)})}
                        className="rounded-2xl h-14 border-[#E9ECEF] font-bold" 
                      />
                      <p className="text-[10px] text-[#868E96] font-medium italic">Calculates from the start of the current month to the end of month {new Date().getMonth() + (semesterTimeline.durationMonths || 1)}.</p>
                   </div>
                 )}
              </div>
            )}

            {courseStep === 2 && (
              <div className="space-y-6 py-4">
                 <div className="p-10 bg-blue-600 rounded-[2.5rem] text-white text-center space-y-4">
                    <BookOpen size={48} className="mx-auto opacity-50" />
                    <h4 className="text-2xl font-bold">Planned Semester Volume</h4>
                    <p className="text-blue-100 text-sm max-w-xs mx-auto">How many courses or subjects are you enrolled in for this semester?</p>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Courses in Semester</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 5"
                      value={semesterTimeline.plannedCourseCount}
                      onChange={(e) => setSemesterTimeline({...semesterTimeline, plannedCourseCount: parseInt(e.target.value)})}
                      className="rounded-2xl h-16 text-2xl text-center font-black border-[#E9ECEF]" 
                    />
                 </div>
              </div>
            )}

            {courseStep === 3 && (
              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Course Name / Program</Label>
                      <Input 
                        placeholder="e.g. Computer Science 101"
                        className="rounded-2xl h-14 border-[#E9ECEF] font-bold"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Course Code</Label>
                      <Input 
                        placeholder="e.g. CS101"
                        className="rounded-2xl h-14 border-[#E9ECEF] font-bold"
                        value={newCourse.code}
                        onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Unit Value (Credits)</Label>
                      <Input 
                        type="number"
                        className="rounded-2xl h-14 border-[#E9ECEF] font-bold"
                        value={newCourse.credits}
                        onChange={(e) => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-[#868E96]">Passing Threshold (%)</Label>
                      <Input 
                        type="number"
                        className="rounded-2xl h-14 border-[#E9ECEF] font-bold"
                        value={newCourse.passingThreshold}
                        onChange={(e) => setNewCourse({...newCourse, passingThreshold: parseInt(e.target.value)})}
                      />
                    </div>
                 </div>

                 <div className="p-8 bg-[#F8F9FA] rounded-[2rem] space-y-6">
                    <div className="flex items-center justify-between">
                       <Label className="text-sm font-bold">Grade Weights</Label>
                       <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${!newCourse.isAlphabetical ? 'text-blue-600' : 'text-[#868E96]'}`}>%</span>
                         <Switch 
                           checked={newCourse.isAlphabetical} 
                           onCheckedChange={(checked) => setNewCourse({...newCourse, isAlphabetical: checked})}
                         />
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${newCourse.isAlphabetical ? 'text-blue-600' : 'text-[#868E96]'}`}>A-F</span>
                       </div>
                    </div>
                    
                    {newCourse.isAlphabetical ? (
                       <div className="space-y-4">
                          <Select value={newCourse.grade} onValueChange={(val) => setNewCourse({...newCourse, grade: val})}>
                            <SelectTrigger className="rounded-2xl h-14 border-[#E9ECEF] bg-white font-bold">
                              <SelectValue placeholder="Current Standing" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(GRADE_VALS).map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-[#868E96] font-bold uppercase tracking-widest text-center">
                            Equivalent Percentage: {gradingConfig.mappings?.[newCourse.grade || 'A'] || 95}%
                          </p>
                       </div>
                    ) : (
                      <div className="space-y-2">
                        <Input 
                          type="number"
                          placeholder="Grade Percentage (e.g. 95)"
                          className="rounded-2xl h-14 border-[#E9ECEF] bg-white font-bold"
                          value={newCourse.percentage}
                          onChange={(e) => setNewCourse({...newCourse, percentage: parseInt(e.target.value), grade: e.target.value})}
                        />
                      </div>
                    )}
                 </div>
              </div>
            )}

            <DialogFooter className="gap-4">
              {courseStep > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setCourseStep(courseStep - 1)} 
                  className="rounded-2xl h-14 px-8 font-bold text-[#868E96]"
                >
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1 rounded-2xl h-14 bg-[#1A1A1A] text-white font-black shadow-2xl shadow-black/20 hover:translate-y-[-2px] transition-all">
                {courseStep === 3 ? (iterativeCourseIndex < (semesterTimeline.plannedCourseCount || 1) - 1 ? 'Next Course' : 'Finish Enrollment') : 'Continue Setup'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grading Setup Dialog */}
      {/* Grading Setup Dialog - Progressive Wizard */}
      <Dialog open={isGradingSetupOpen} onOpenChange={(open) => {
        setIsGradingSetupOpen(open);
        if (open) setGradingStep(1);
      }}>
        <DialogContent className="max-w-3xl w-[95vw] min-h-[500px] max-h-[85vh] rounded-[2rem] md:rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden flex flex-col bg-white text-[#1A1A1A]">
          {/* Progress Header */}
          <div className="bg-[#1A1A1A] p-6 md:p-8 text-white relative flex flex-col items-center text-center shrink-0">
             <div className="flex gap-2 mb-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1 rounded-full transition-all duration-500 ${gradingStep >= s ? 'w-8 bg-blue-500' : 'w-4 bg-white/20'}`} />
                ))}
             </div>
             <Badge className="bg-white/10 text-blue-400 border-none px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px] mb-2">Step {gradingStep} of 3</Badge>
             <DialogTitle className="text-2xl font-black tracking-tight uppercase leading-tight">
                {gradingStep === 1 && "Format & Direction"}
                {gradingStep === 2 && "Score Thresholds"}
                {gradingStep === 3 && "Weight Matrix"}
             </DialogTitle>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 min-h-0 bg-white">
            <AnimatePresence mode="wait">
              {gradingStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ADB5BD]">Selection System</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'alphabetical', label: 'Alphabetical', sub: 'A thru F System', icon: <BookOpen size={20} /> },
                        { id: 'numerical', label: 'Numerical', sub: '100 thru 0 System', icon: <Target size={20} /> }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => {
                            const isAlpha = mode.id === 'alphabetical';
                            setGradingConfig({
                              ...gradingConfig, 
                              format: mode.id as any,
                              highestGrade: isAlpha ? 'A' : '100',
                              lowestGrade: isAlpha ? 'F' : '0',
                              passingGrade: isAlpha ? 'C' : '60',
                              mappings: isAlpha ? (gradingConfig.mappings || { 'A': 100, 'B': 85, 'C': 75, 'D': 65, 'F': 50 }) : undefined
                            });
                          }}
                          className={`text-left p-6 rounded-[2rem] border-2 transition-all group relative overflow-hidden flex flex-col gap-4 ${
                            gradingConfig.format === mode.id 
                              ? 'border-[#1A1A1A] bg-[#F8F9FA] shadow-xl' 
                              : 'border-[#F1F3F5] hover:border-[#CED4DA] bg-white'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${gradingConfig.format === mode.id ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {mode.icon}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#1A1A1A] tracking-tight">{mode.label}</p>
                            <p className="text-[10px] text-[#868E96] font-bold uppercase tracking-widest leading-none mt-1">{mode.sub}</p>
                          </div>
                          {gradingConfig.format === mode.id && <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#1A1A1A]">Inverse Scoring</p>
                      <p className="text-xs text-blue-600 font-medium">Is a lower numerical value better? (e.g. Golf or Rank 1)</p>
                    </div>
                    <Switch 
                      checked={gradingConfig.isLowerBetter} 
                      onCheckedChange={(checked) => setGradingConfig({...gradingConfig, isLowerBetter: checked})}
                      className="data-[state=checked]:bg-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </motion.div>
              )}

              {gradingStep === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 gap-6">
                     {[
                       { label: 'Maximum Attainable Score', value: gradingConfig.highestGrade, key: 'highestGrade', placeholder: 'e.g. A+ or 100', desc: 'The peak of your grading curve.' },
                       { label: 'Passing Benchmark', value: gradingConfig.passingGrade, key: 'passingGrade', placeholder: 'e.g. C or 60', desc: 'The minimum required to clear a course.' },
                       { label: 'Floor Score', value: gradingConfig.lowestGrade, key: 'lowestGrade', placeholder: 'e.g. F or 0', desc: 'The absolute lowest possible entry.' }
                     ].map((item) => (
                       <div key={item.key} className="p-6 bg-[#F8F9FA] rounded-[2rem] space-y-4 border border-transparent focus-within:border-blue-100 transition-all">
                          <div>
                            <Label className="text-sm font-bold text-[#1A1A1A]">{item.label}</Label>
                            <p className="text-[10px] text-[#868E96] font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
                          </div>
                          <Input 
                            value={item.value}
                            placeholder={item.placeholder}
                            onChange={(e) => setGradingConfig({...gradingConfig, [item.key]: e.target.value})}
                            className="bg-white rounded-xl h-14 border-none shadow-sm font-black text-xl px-6 text-[#1A1A1A]"
                          />
                       </div>
                     ))}
                  </div>
                </motion.div>
              )}

              {gradingStep === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                   {gradingConfig.format === 'alphabetical' ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 flex items-start gap-3">
                         <AlertCircle size={18} className="shrink-0 mt-0.5" />
                         <p className="text-[10px] font-bold uppercase leading-relaxed tracking-wider">Define how letter grades translate to percentage weights for GPA calculation.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(gradingConfig.mappings || { 'A+': 100, 'A': 95, 'A-': 90, 'B+': 85, 'B': 80, 'B-': 75, 'C+': 70, 'C': 65, 'C-': 60, 'D+': 55, 'D': 50, 'F': 0 }).map(([grade, val], idx) => (
                          <div key={grade} className="bg-[#F8F9FA] p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-blue-100 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm border border-gray-100">
                                {grade}
                              </div>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  value={val}
                                  onChange={(e) => {
                                    const v = parseInt(e.target.value) || 0;
                                    const newMappings = { ...gradingConfig.mappings, [grade]: v };
                                    setGradingConfig({ ...gradingConfig, mappings: newMappings });
                                  }}
                                  className="w-12 bg-transparent font-black text-[#1A1A1A] focus:outline-none text-right"
                                />
                                <span className="text-[10px] font-black text-[#ADB5BD]">%</span>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button className="h-14 border-2 border-dashed border-[#CED4DA] rounded-2xl flex items-center justify-center gap-3 text-[#ADB5BD] hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all">
                          <Plus size={18} />
                          <span className="text-xs font-bold uppercase tracking-widest">Add Literal</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] bg-[#F8F9FA] rounded-[3rem] border-2 border-dashed border-[#E9ECEF] flex flex-col items-center justify-center text-center p-10">
                       <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
                          <Zap size={32} className="text-blue-500" />
                       </div>
                       <h5 className="text-xl font-bold text-[#1A1A1A]">Standardized Numerical Entry</h5>
                       <p className="text-xs text-[#868E96] max-w-[240px] mt-2 font-medium">Since you're using a numerical system, weights are calculated based on raw percentage values.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wizard Footer */}
          <div className="p-6 md:p-8 bg-white border-t border-[#F1F3F5] flex items-center justify-between shrink-0">
            <Button 
              variant="outline" 
              onClick={() => gradingStep > 1 ? setGradingStep(gradingStep - 1) : setIsGradingSetupOpen(false)}
              className="px-8 rounded-xl font-bold h-12"
            >
              {gradingStep === 1 ? "Exit" : "Back"}
            </Button>
            
            {gradingStep < 3 ? (
              <Button 
                onClick={() => setGradingStep(gradingStep + 1)}
                className="px-10 bg-[#1A1A1A] text-white rounded-xl font-bold h-12 gap-2"
              >
                Continue Setup <ChevronRight size={16} />
              </Button>
            ) : (
              <Button 
                onClick={() => setIsGradingSetupOpen(false)}
                className="px-10 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold h-12 gap-2"
              >
                <Check size={18} /> Complete Logic
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analyze Grades Dialog */}
      <Dialog open={isAnalyzeGradesDialogOpen} onOpenChange={setIsAnalyzeGradesDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold tracking-tight">GRADE ANALYTICS</DialogTitle>
            <DialogDescription>
              A breakdown of your subject performance and its impact on your GPA.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-blue-50 border-none rounded-3xl text-center">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">GPA</p>
                <p className="text-4xl font-black text-[#1A1A1A]">{calculatedGPA}</p>
              </Card>
              <Card className="p-6 bg-purple-50 border-none rounded-3xl text-center">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Courses</p>
                <p className="text-4xl font-black text-[#1A1A1A]">{courses.length}</p>
              </Card>
              <Card className="p-6 bg-orange-50 border-none rounded-3xl text-center">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Total Credits</p>
                <p className="text-4xl font-black text-[#1A1A1A]">{courses.reduce((acc, c) => acc + c.credits, 0)}</p>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#868E96]">Subject Contributions</h4>
              {courses.length === 0 ? (
                <p className="text-center py-10 text-[#868E96] italic bg-[#F8F9FA] rounded-[2rem]">No courses added yet.</p>
              ) : (
                <div className="space-y-3">
                  {courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-5 bg-white border border-[#E9ECEF] rounded-3xl hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl flex items-center justify-center font-black text-xl text-blue-600">
                          {course.grade}
                        </div>
                        <div>
                          <p className="font-bold text-lg leading-tight">{course.name}</p>
                          <p className="text-xs text-[#868E96] font-medium">{course.code} • {course.credits} Credits</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1A1A1A]">
                          {gradingConfig.format === 'alphabetical' 
                            ? (gradingConfig.mappings?.[course.grade] !== undefined 
                                ? (gradingConfig.mappings[course.grade] / 25).toFixed(1) 
                                : (GRADE_VALS[course.grade] || 0).toFixed(1))
                            : parseFloat(course.grade).toFixed(1)
                          } Pts
                        </p>
                        <p className="text-[10px] text-[#868E96] font-bold uppercase tracking-widest">Value</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-[#1A1A1A] text-white rounded-[2rem]">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Target size={18} />
                Semester Overview
              </h4>
              <p className="text-sm text-gray-400">
                Based on your {courses.length} courses, you are maintaining a {calculatedGPA} GPA.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsAnalyzeGradesDialogOpen(false)} className="rounded-2xl h-12 px-10 bg-[#1A1A1A] text-white font-bold w-full">
              Close Analytics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
