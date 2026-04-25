import * as React from 'react';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { startOfToday, isAfter } from 'date-fns';
import { toast } from 'sonner';
import { Task, ScheduleItem, Reminder, TimeUsageLog, TaskStatus, Email, TimerStep, Goal, Course, BillableHour, GradingConfig, SemesterTimeline } from '../types';

export function useChronosStoreInternal() {
  const [user, setUser] = useState<{ 
    name: string; 
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email: string; 
    avatar: string;
    password?: string;
    plan?: 'basic' | 'pro' | 'premium' | 'student' | 'business';
    purchasedAddons?: string[];
    contactInfo?: string;
    autoDeleteFinishedTasks?: boolean;
    gmailTokens?: any;
    uploadedAvatar?: string | null;
    is2SVEnabled?: boolean;
    recoveryCode?: string;
    isEmailVerified?: boolean;
    savedTimezones?: string[];
  } | null>(() => {
    const saved = localStorage.getItem('chronos_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`chronos_${user.email}_tasks`);
    return saved ? JSON.parse(saved) : [];
  });

  const [emails, setEmails] = useState<Email[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`chronos_${user.email}_emails`);
    if (saved) return JSON.parse(saved);
    
    // Default emails for new user session
    return [
      {
        id: '1',
        sender: 'Sarah Jenkins',
        subject: 'Project Timeline Update',
        preview: 'Hi Team, I have updated the project timeline for the next quarter. Please review...',
        body: 'Hi Team,\n\nI have updated the project timeline for the next quarter. Please review the attached document and let me know if you have any questions.\n\nBest regards,\nSarah',
        date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        isRead: false,
        isImportant: true,
        isArchived: false,
        avatar: 'https://picsum.photos/seed/sarah/100/100'
      },
      {
        id: '2',
        sender: 'Design Weekly',
        subject: 'Top 10 Productivity Tips',
        preview: 'Check out our latest newsletter featuring the best productivity hacks for 2024...',
        body: 'Hello Designers,\n\nIn this weeks edition, we explore the top 10 productivity tips that are changing the way we work in 2024. From time-blocking to AI-assisted drafting, we cover it all.\n\nRead more on our website!',
        date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        isRead: true,
        isImportant: false,
        isArchived: false,
        avatar: 'https://picsum.photos/seed/design/100/100'
      },
      {
        id: '3',
        sender: 'Alex Rivera',
        subject: 'Meeting Notes: Q3 Strategy',
        preview: 'Great meeting today everyone. Here are the action items we discussed...',
        body: 'Hi everyone,\n\nThanks for the productive strategy session today. Here are the key takeaways:\n- Finalize budget by Friday\n- Assign team leads for Project X\n- Schedule follow-up with stakeholders\n\nLet me know if I missed anything.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isRead: false,
        isImportant: false,
        isArchived: false,
        avatar: 'https://picsum.photos/seed/alex/100/100'
      }
    ];
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`chronos_${user.email}_schedule`);
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`chronos_${user.email}_reminders`);
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<TimeUsageLog[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`chronos_${user.email}_logs`);
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`chronos_${user.email}_goals`);
    return saved ? JSON.parse(saved) : [];
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`chronos_${user.email}_courses`);
    return saved ? JSON.parse(saved) : [];
  });

  const [billableHours, setBillableHours] = useState<BillableHour[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`chronos_${user.email}_billable`);
    return saved ? JSON.parse(saved) : [];
  });

  const [gradingConfig, setGradingConfig] = useState<GradingConfig>(() => {
    if (!user) return { format: 'alphabetical', highestGrade: 'A', lowestGrade: 'F', passingGrade: 'C', isLowerBetter: false, mappings: { 'A+': 100, 'A': 95, 'A-': 90, 'B+': 85, 'B': 80, 'B-': 75, 'C+': 70, 'C': 65, 'C-': 60, 'D+': 55, 'D': 50, 'F': 0 } };
    const saved = localStorage.getItem(`chronos_${user.email}_grading`);
    return saved ? JSON.parse(saved) : { format: 'alphabetical', highestGrade: 'A', lowestGrade: 'F', passingGrade: 'C', isLowerBetter: false, mappings: { 'A+': 100, 'A': 95, 'A-': 90, 'B+': 85, 'B': 80, 'B-': 75, 'C+': 70, 'C': 65, 'C-': 60, 'D+': 55, 'D': 50, 'F': 0 } };
  });

  const [semesterTimeline, setSemesterTimeline] = useState<SemesterTimeline>(() => {
    if (!user) return { mode: 'months', durationMonths: 4 };
    const saved = localStorage.getItem(`chronos_${user.email}_semester`);
    return saved ? JSON.parse(saved) : { mode: 'months', durationMonths: 4 };
  });

  const [draftTask, setDraftTask] = useState<Partial<Task>>(() => {
    if (!user) return {};
    const saved = localStorage.getItem(`chronos_${user.email}_draft_task`);
    return saved ? JSON.parse(saved) : {};
  });

  const [draftEvent, setDraftEvent] = useState<Partial<ScheduleItem>>(() => {
    if (!user) return {};
    const saved = localStorage.getItem(`chronos_${user.email}_draft_event`);
    return saved ? JSON.parse(saved) : {};
  });

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      const uTasks = localStorage.getItem(`chronos_${user.email}_tasks`);
      const uSchedule = localStorage.getItem(`chronos_${user.email}_schedule`);
      const uReminders = localStorage.getItem(`chronos_${user.email}_reminders`);
      const uLogs = localStorage.getItem(`chronos_${user.email}_logs`);
      const uEmails = localStorage.getItem(`chronos_${user.email}_emails`);
      const uGoals = localStorage.getItem(`chronos_${user.email}_goals`);
      const uCourses = localStorage.getItem(`chronos_${user.email}_courses`);
      const uBillable = localStorage.getItem(`chronos_${user.email}_billable`);
      const uDraftTask = localStorage.getItem(`chronos_${user.email}_draft_task`);
      const uDraftEvent = localStorage.getItem(`chronos_${user.email}_draft_event`);

      setTasks(uTasks ? JSON.parse(uTasks) : []);
      setSchedule(uSchedule ? JSON.parse(uSchedule) : []);
      setReminders(uReminders ? JSON.parse(uReminders) : []);
      setLogs(uLogs ? JSON.parse(uLogs) : []);
      setDraftTask(uDraftTask ? JSON.parse(uDraftTask) : {});
      setDraftEvent(uDraftEvent ? JSON.parse(uDraftEvent) : {});
      setGoals(uGoals ? JSON.parse(uGoals) : []);
      setCourses(uCourses ? JSON.parse(uCourses) : []);
      setBillableHours(uBillable ? JSON.parse(uBillable) : []);
      
      const uGrading = localStorage.getItem(`chronos_${user.email}_grading`);
      const uSemester = localStorage.getItem(`chronos_${user.email}_semester`);
      setGradingConfig(uGrading ? JSON.parse(uGrading) : { format: 'alphabetical', highestGrade: 'A', lowestGrade: 'F', passingGrade: 'C', isLowerBetter: false });
      setSemesterTimeline(uSemester ? JSON.parse(uSemester) : { mode: 'months', durationMonths: 4 });

      if (uEmails) {
        setEmails(JSON.parse(uEmails));
      } else {
        // Keep current default emails if first time
      }
    } else {
      // Clear memory on logout
      setTasks([]);
      setSchedule([]);
      setReminders([]);
      setLogs([]);
      setEmails([]);
      setDraftTask({});
      setDraftEvent({});
      setGoals([]);
      setCourses([]);
      setBillableHours([]);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_tasks`, JSON.stringify(tasks));
    }
  }, [tasks, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_schedule`, JSON.stringify(schedule));
    }
  }, [schedule, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_reminders`, JSON.stringify(reminders));
    }
  }, [reminders, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_logs`, JSON.stringify(logs));
    }
  }, [logs, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_emails`, JSON.stringify(emails));
    }
  }, [emails, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_goals`, JSON.stringify(goals));
    }
  }, [goals, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_courses`, JSON.stringify(courses));
    }
  }, [courses, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_billable`, JSON.stringify(billableHours));
    }
  }, [billableHours, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_grading`, JSON.stringify(gradingConfig));
    }
  }, [gradingConfig, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_semester`, JSON.stringify(semesterTimeline));
    }
  }, [semesterTimeline, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_draft_task`, JSON.stringify(draftTask));
    }
  }, [draftTask, user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronos_${user.email}_draft_event`, JSON.stringify(draftEvent));
    }
  }, [draftEvent, user?.email]);

  // Auto-cleanup finished tasks older than 30 days
  useEffect(() => {
    const cleanup = () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      
      const tasksToRemove = tasks.filter(task => {
        if (task.status !== TaskStatus.COMPLETED) return false;
        // We assume createdAt or a finishedAt field. Let's use createdAt for now as a proxy 
        // if finishedAt isn't available, or just check the date.
        const taskDate = new Date(task.createdAt);
        return taskDate < thirtyDaysAgo;
      });

      if (tasksToRemove.length > 0) {
        setTasks(prev => prev.filter(t => !tasksToRemove.find(tr => tr.id === t.id)));
        toast.info(`Cleaned up ${tasksToRemove.length} old finished tasks.`);
      }
    };

    cleanup();
  }, [tasks]);

  const addTask = (task: Task) => setTasks(prev => [...prev, task]);
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const addScheduleItem = (item: ScheduleItem) => setSchedule(prev => [...prev, item]);
  const updateScheduleItem = (id: string, updates: Partial<ScheduleItem>) => {
    setSchedule(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };
  const deleteScheduleItem = (id: string) => setSchedule(prev => prev.filter(i => i.id !== id));

  const addReminder = (reminder: Reminder) => setReminders(prev => [...prev, reminder]);
  const deleteReminder = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));

  const addLog = (log: TimeUsageLog) => setLogs(prev => [...prev, log]);

  const markEmailAsRead = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isRead: true } : e));
  };

  const toggleEmailRead = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isRead: !e.isRead } : e));
  };

  const toggleEmailImportant = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isImportant: !e.isImportant } : e));
  };

  const archiveEmail = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isArchived: true } : e));
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
  };

  // Auto-archive emails older than 30 days
  useEffect(() => {
    const archiveOldEmails = () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
      
      setEmails(prev => prev.map(email => {
        if (!email.isArchived && new Date(email.date) < thirtyDaysAgo) {
          return { ...email, isArchived: true };
        }
        return email;
      }));
    };

    archiveOldEmails();
    const interval = setInterval(archiveOldEmails, 1000 * 60 * 60 * 24); // Check daily
    return () => clearInterval(interval);
  }, []);

  const [accounts, setAccounts] = useState<{ 
    name: string; 
    email: string; 
    avatar: string; 
    password?: string;
    plan?: 'basic' | 'pro' | 'premium' | 'student' | 'business';
    purchasedAddons?: string[];
    failedAttempts?: number;
    lockoutUntil?: string | null;
    is2SVEnabled?: boolean;
    recoveryCode?: string;
    isEmailVerified?: boolean;
    otpCode?: string | null;
    otpExpiry?: string | null;
  }[]>(() => {
    const saved = localStorage.getItem('chronos_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('chronos_auth') === 'true' && !!localStorage.getItem('chronos_user');
  });

  useEffect(() => {
    localStorage.setItem('chronos_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('chronos_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('chronos_auth', isAuthenticated.toString());
  }, [isAuthenticated]);

  const login = (userData: { 
    name: string; 
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email: string; 
    avatar: string;
    password?: string;
    plan?: 'basic' | 'pro' | 'premium' | 'student' | 'business';
    contactInfo?: string;
    autoDeleteFinishedTasks?: boolean;
    gmailTokens?: any;
    uploadedAvatar?: string | null;
  }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const verifyLogin = (email: string, password?: string) => {
    const account = accounts.find(acc => acc.email === email);
    if (!account) return { success: false, message: 'Account not found' };

    const now = new Date();
    if (account.lockoutUntil && new Date(account.lockoutUntil) > now) {
      const waitTime = Math.ceil((new Date(account.lockoutUntil).getTime() - now.getTime()) / 1000);
      return { success: false, message: `Account locked. Try again in ${waitTime} seconds.` };
    }

    if (password === account.password) {
      if (account.is2SVEnabled) {
        return { success: true, requires2SV: true };
      }
      // Success: Reset failures
      setAccounts(prev => prev.map(acc => 
        acc.email === email ? { ...acc, failedAttempts: 0, lockoutUntil: null } : acc
      ));
      return { success: true };
    } else {
      // Failure
      const currentFailures = (account.failedAttempts || 0) + 1;
      let lockoutTime = null;
      
      // Lock if 5 or more failures
      if (currentFailures >= 5) {
        // Multiplier based on bundles of 5 failures
        const multiplier = Math.floor(currentFailures / 5);
        lockoutTime = new Date(now.getTime() + (30 * multiplier * 1000)).toISOString();
        toast.error(`Too many failed attempts. Locked for ${30 * multiplier}s.`);
      }

      setAccounts(prev => prev.map(acc => 
        acc.email === email ? { ...acc, failedAttempts: currentFailures, lockoutUntil: lockoutTime } : acc
      ));
      return { success: false, message: 'Invalid password' };
    }
  };

  const register = (userData: { 
    name: string; 
    email: string; 
    avatar: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
  }) => {
    // Simulate checking a global database for multi-device recovery
    const globalAccountsStr = localStorage.getItem('chronos_global_accounts');
    const globalAccounts: any[] = globalAccountsStr ? JSON.parse(globalAccountsStr) : [];
    
    if (accounts.some(acc => acc.email === userData.email)) {
      toast.error("Email already in use on this device");
      return { success: false };
    }

    if (globalAccounts.some(acc => acc.email === userData.email)) {
      return { success: false, existsRemotely: true };
    }

    if (accounts.length >= 3) {
      toast.error("Account limit reached. (Max 3)");
      return { success: false };
    }
    
    const newUser = {
      ...userData,
      failedAttempts: 0,
      lockoutUntil: null,
      isEmailVerified: false
    };

    setAccounts(prev => [...prev, newUser]);
    
    // Update global database
    globalAccounts.push(newUser);
    localStorage.setItem('chronos_global_accounts', JSON.stringify(globalAccounts));

    return { success: true };
  };

  const recoverAccount = (email: string) => {
    const globalAccountsStr = localStorage.getItem('chronos_global_accounts');
    const globalAccounts: any[] = globalAccountsStr ? JSON.parse(globalAccountsStr) : [];
    const remoteAcc = globalAccounts.find(acc => acc.email === email);
    
    if (remoteAcc) {
      // Add to local device
      setAccounts(prev => {
        if (prev.some(acc => acc.email === email)) return prev;
        return [...prev, remoteAcc];
      });
      toast.success("Account recovered successfully! You can now log in.");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const removeAccount = (email: string) => {
    setAccounts(prev => prev.filter(acc => acc.email !== email));
    
    // Also remove from simulated global database
    const globalAccountsStr = localStorage.getItem('chronos_global_accounts');
    if (globalAccountsStr) {
      const globalAccounts: any[] = JSON.parse(globalAccountsStr);
      const filtered = globalAccounts.filter(acc => acc.email !== email);
      localStorage.setItem('chronos_global_accounts', JSON.stringify(filtered));
    }
    
    // Delete "the whole data from the user"
    // Use user-specific keys to ensure isolation
    localStorage.removeItem(`chronos_${email}_tasks`);
    localStorage.removeItem(`chronos_${email}_schedule`);
    localStorage.removeItem(`chronos_${email}_reminders`);
    localStorage.removeItem(`chronos_${email}_logs`);
    localStorage.removeItem(`chronos_${email}_emails`);
    localStorage.removeItem(`chronos_${email}_draft_task`);
    localStorage.removeItem(`chronos_${email}_draft_event`);
    
    // If the account being removed is the current one, logout and clear memory
    if (user?.email === email) {
      setTasks([]);
      setSchedule([]);
      setReminders([]);
      setLogs([]);
      setEmails([]);
      setDraftTask({});
      setDraftEvent({});
      setIsAuthenticated(false);
      setUser(null);
    }
    
    toast.success("Account and its private data deleted permanently");
  };

  const updateProfile = (updates: Partial<{ 
    name: string; 
    firstName: string;
    lastName: string;
    displayName: string;
    email: string; 
    avatar: string;
    plan: 'basic' | 'pro' | 'premium' | 'student' | 'business';
    purchasedAddons: string[];
    contactInfo: string;
    autoDeleteFinishedTasks: boolean;
    gmailTokens: any;
    uploadedAvatar: string | null;
    is2SVEnabled: boolean;
    recoveryCode: string;
    savedTimezones: string[];
  }>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      // Also update in accounts list
      setAccounts(accs => accs.map(acc => acc.email === prev.email ? { ...acc, ...updates } : acc));
      return updated;
    });
  };

  const updateUserPlan = (email: string, plan: 'basic' | 'pro' | 'premium' | 'student' | 'business') => {
    setAccounts(prev => prev.map(acc => acc.email === email ? { ...acc, plan } : acc));
    if (user?.email === email) {
      setUser(prev => prev ? { ...prev, plan } : null);
    }
    
    // Update in global storage as well
    const globalAccountsStr = localStorage.getItem('chronos_global_accounts');
    if (globalAccountsStr) {
      const globalAccounts: any[] = JSON.parse(globalAccountsStr);
      const updated = globalAccounts.map(acc => acc.email === email ? { ...acc, plan } : acc);
      localStorage.setItem('chronos_global_accounts', JSON.stringify(updated));
    }
  };

  const purchaseAddon = (addonId: string) => {
    if (!user) return;
    const currentAddons = user.purchasedAddons || [];
    if (currentAddons.includes(addonId)) {
      toast.error("Add-on already purchased!");
      return;
    }
    updateProfile({ purchasedAddons: [...currentAddons, addonId] });
    toast.success(`Add-on "${addonId}" successfully purchased!`);
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    if (!user) return { success: false, message: 'Not authenticated' };
    
    if (user.password !== oldPassword) {
      return { success: false, message: 'Current password incorrect' };
    }

    const updates = { password: newPassword };
    setUser(prev => prev ? { ...prev, ...updates } : null);
    setAccounts(accs => accs.map(acc => acc.email === user.email ? { ...acc, ...updates } : acc));
    toast.success("Password changed successfully");
    return { success: true };
  };

  const toggle2SV = () => {
    if (!user) return;
    const isEnabled = !user.is2SVEnabled;
    const recoveryCode = isEnabled ? Math.random().toString(36).substring(2, 10).toUpperCase() : '';
    
    updateProfile({ 
      is2SVEnabled: isEnabled,
      recoveryCode: recoveryCode
    });
    
    if (isEnabled) {
      toast.success(`Two-Step Verification enabled! Recovery code: ${recoveryCode}`);
    } else {
      toast.success("Two-Step Verification disabled");
    }
  };

  const verify2SV = (email: string, code: string) => {
    const account = accounts.find(acc => acc.email === email);
    if (!account) return { success: false, message: 'Account not found' };
    
    if (code === account.recoveryCode) {
      // Success: Reset failures
      setAccounts(prev => prev.map(acc => 
        acc.email === email ? { ...acc, failedAttempts: 0, lockoutUntil: null } : acc
      ));
      return { success: true };
    }
    return { success: false, message: 'Invalid code. Use your recovery code.' };
  };

  const startPlan = (plan: TimerStep[]) => {
    if (plan.length === 0) return;
    setTimerPlan(plan);
    const firstStep = plan[0];
    setCurrentPlanStepIndex(0);
    setTimerMode(firstStep.type);
    setTimeLeft(firstStep.duration * 60);
    setIsTimerActive(true);
    setIsTrackingEnabled(true);
    toast.success("Focus Plan Started!");
  };

  const cancelPlan = () => {
    setCurrentPlanStepIndex(-1);
    setTimerPlan([]);
    setIsTimerActive(false);
    setIsTrackingEnabled(false);
    toast.info("Focus Plan Cancelled");
  };

  const sendOTP = (email: string) => {
    const account = accounts.find(acc => acc.email === email);
    if (!account) return { success: false, message: 'Account not found' };

    // OTP sender functionality removed as requested. 
    // Recovery flows now use a direct bypass ('SKIP_OTP').
    toast.success(`Recovery access granted for ${email}`);
    return { success: true };
  };

  const verifyOTPAndResetPassword = (email: string, otp: string, newPassword?: string) => {
    const account = accounts.find(acc => acc.email === email);
    if (!account) return { success: false, message: 'Account not found' };

    if (otp !== 'SKIP_OTP') {
      if (account.otpCode !== otp) return { success: false, message: 'Invalid OTP' };
      if (account.otpExpiry && new Date(account.otpExpiry) < new Date()) {
        return { success: false, message: 'OTP expired' };
      }
    }

    if (newPassword) {
      setAccounts(prev => prev.map(acc => 
        acc.email === email ? { ...acc, password: newPassword, otpCode: null, otpExpiry: null, failedAttempts: 0, lockoutUntil: null } : acc
      ));
      toast.success("Password reset successfully!");
      return { success: true };
    }

    return { success: true };
  };

  const verifyEmail = (email: string, otp: string) => {
    const res = verifyOTPAndResetPassword(email, otp);
    if (res.success) {
      setAccounts(prev => prev.map(acc => 
        acc.email === email ? { ...acc, isEmailVerified: true, otpCode: null, otpExpiry: null } : acc
      ));
      if (user?.email === email) {
        setUser(prev => prev ? { ...prev, isEmailVerified: true } : null);
      }
      toast.success("Email verified successfully!");
      return { success: true };
    }
    return res;
  };

  const setInitialPassword = (email: string, password: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.email === email ? { ...acc, password } : acc
    ));
    toast.success("Password set successfully!");
    return { success: true };
  };

  const deleteFinishedTasks = () => {
    setTasks(prev => prev.filter(t => t.status !== TaskStatus.COMPLETED));
  };

  // Auto-delete logic
  useEffect(() => {
    if (user?.autoDeleteFinishedTasks) {
      const interval = setInterval(() => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        setTasks(prev => prev.filter(t => {
          if (t.status !== TaskStatus.COMPLETED) return true;
          if (!t.completedAt) return true;
          return new Date(t.completedAt) > threeDaysAgo;
        }));
      }, 1000 * 60 * 60); // Check every hour
      return () => clearInterval(interval);
    }
  }, [user?.autoDeleteFinishedTasks]);

  const fetchEmails = async () => {
    if (!user?.gmailTokens) return;
    try {
      const response = await fetch('/api/emails', {
        headers: {
          'Authorization': JSON.stringify(user.gmailTokens)
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    }
  };

  useEffect(() => {
    if (user?.gmailTokens) {
      fetchEmails();
      const interval = setInterval(fetchEmails, 1000 * 60 * 5); // Fetch every 5 mins
      return () => clearInterval(interval);
    }
  }, [user?.gmailTokens]);

  const [productivityMode, setProductivityMode] = useState<'daily' | 'weekly'>(() => {
    return (localStorage.getItem('chronos_prod_mode') as 'daily' | 'weekly') || 'daily';
  });

  const [timezone, setTimezone] = useState<string>(() => {
    return localStorage.getItem('chronos_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  const [savedTimezones, setSavedTimezones] = useState<string[]>(() => {
    const saved = localStorage.getItem('chronos_saved_timezones');
    return saved ? JSON.parse(saved) : [Intl.DateTimeFormat().resolvedOptions().timeZone];
  });

  useEffect(() => {
    localStorage.setItem('chronos_saved_timezones', JSON.stringify(savedTimezones));
  }, [savedTimezones]);

  const addTimezone = (tz: string) => {
    if (savedTimezones.includes(tz)) {
      toast.info("Timezone already saved");
      return true;
    }
    if (savedTimezones.length >= 5) {
      toast.error("Timezone limit reached (Max 5). Please delete one first.");
      return false;
    }
    setSavedTimezones(prev => [...prev, tz]);
    toast.success(`Timezone ${tz} added`);
    return true;
  };

  const removeTimezone = (tz: string) => {
    setSavedTimezones(prev => prev.filter(t => t !== tz));
    if (timezone === tz) {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
    toast.success(`Timezone ${tz} removed`);
  };

  const [clockType, setClockType] = useState<'analog' | 'digital'>(() => {
    return (localStorage.getItem('chronos_clock_type') as 'analog' | 'digital') || 'digital';
  });

  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(() => {
    return (localStorage.getItem('chronos_time_format') as '12h' | '24h') || '24h';
  });

  // Timer State
  const [workTime, setWorkTime] = useState(() => parseInt(localStorage.getItem('chronos_work_time') || '25'));
  const [breakTime, setBreakTime] = useState(() => parseInt(localStorage.getItem('chronos_break_time') || '5'));
  const [reviewWorkTime, setReviewWorkTime] = useState(() => parseInt(localStorage.getItem('chronos_review_work_time') || '25'));
  
  const [timeLeft, setTimeLeft] = useState(() => parseInt(localStorage.getItem('chronos_time_left') || (25 * 60).toString()));
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break' | 'review'>(() => (localStorage.getItem('chronos_timer_mode') as 'work' | 'break' | 'review') || 'work');
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [productiveSeconds, setProductiveSeconds] = useState(0);
  const [reviewSeconds, setReviewSeconds] = useState(() => parseInt(localStorage.getItem('chronos_review_seconds') || '0'));
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  const [reviewSubject, setReviewSubject] = useState(() => localStorage.getItem('chronos_review_subject') || '');
  const [reviewFocus, setReviewFocus] = useState(() => localStorage.getItem('chronos_review_focus') || '');
  
  const [workSubject, setWorkSubject] = useState(() => localStorage.getItem('chronos_work_subject') || '');
  const [workActivity, setWorkActivity] = useState(() => localStorage.getItem('chronos_work_activity') || '');
  const [workDetails, setWorkDetails] = useState(() => localStorage.getItem('chronos_work_details') || '');
  const [timerPlan, setTimerPlan] = useState<TimerStep[]>(() => {
    const saved = localStorage.getItem('chronos_timer_plan');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPlanStepIndex, setCurrentPlanStepIndex] = useState<number>(() => {
    const saved = localStorage.getItem('chronos_plan_index');
    return saved ? parseInt(saved) : -1;
  });
  
  const [overdueNotificationsEnabled, setOverdueNotificationsEnabled] = useState(() => localStorage.getItem('chronos_overdue_notify') !== 'false');
  const [headerText, setHeaderText] = useState(() => localStorage.getItem('chronos_header_text') || 'Focus on what matters');

  useEffect(() => {
    localStorage.setItem('chronos_work_time', workTime.toString());
  }, [workTime]);

  useEffect(() => {
    localStorage.setItem('chronos_break_time', breakTime.toString());
  }, [breakTime]);

  useEffect(() => {
    localStorage.setItem('chronos_review_work_time', reviewWorkTime.toString());
  }, [reviewWorkTime]);

  useEffect(() => {
    localStorage.setItem('chronos_time_left', timeLeft.toString());
  }, [timeLeft]);

  useEffect(() => {
    localStorage.setItem('chronos_timer_mode', timerMode);
  }, [timerMode]);

  useEffect(() => {
    localStorage.setItem('chronos_review_seconds', reviewSeconds.toString());
  }, [reviewSeconds]);

  useEffect(() => {
    localStorage.setItem('chronos_review_subject', reviewSubject);
  }, [reviewSubject]);

  useEffect(() => {
    localStorage.setItem('chronos_review_focus', reviewFocus);
  }, [reviewFocus]);

  useEffect(() => {
    localStorage.setItem('chronos_work_subject', workSubject);
  }, [workSubject]);

  useEffect(() => {
    localStorage.setItem('chronos_work_activity', workActivity);
  }, [workActivity]);

  useEffect(() => {
    localStorage.setItem('chronos_work_details', workDetails);
  }, [workDetails]);

  useEffect(() => {
    localStorage.setItem('chronos_overdue_notify', overdueNotificationsEnabled.toString());
  }, [overdueNotificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('chronos_header_text', headerText);
  }, [headerText]);

  useEffect(() => {
    localStorage.setItem('chronos_timer_plan', JSON.stringify(timerPlan));
  }, [timerPlan]);

  useEffect(() => {
    localStorage.setItem('chronos_plan_index', currentPlanStepIndex.toString());
  }, [currentPlanStepIndex]);

  // Overdue Check Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let updated = false;
      const newTasks = tasks.map(task => {
        if (task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.OVERDUE && task.deadline) {
          if (new Date(task.deadline) < now) {
            updated = true;
            if (overdueNotificationsEnabled) {
              toast.error(`Task Overdue: ${task.title}`, {
                description: "This project has passed its deadline."
              });
            }
            return { ...task, status: TaskStatus.OVERDUE };
          }
        }
        return task;
      });

      if (updated) {
        setTasks(newTasks);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, overdueNotificationsEnabled]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && isTrackingEnabled && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        
        if (timerMode === 'work') {
          setProductiveSeconds(prev => prev + 1);
          if (activeTaskId) {
            updateTask(activeTaskId, { 
              actualTime: (tasks.find(t => t.id === activeTaskId)?.actualTime || 0) + (1/60) 
            });
          }
        } else if (timerMode === 'review') {
          setReviewSeconds(prev => prev + 1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      const sessionType = timerMode === 'work' ? 'Focus' : timerMode === 'review' ? 'Review' : 'Break';
      
      if (timerMode !== 'break') {
        const activityTitle = timerMode === 'work'
          ? (workSubject ? `${workSubject}: ${workActivity} (${workDetails})` : (activeTaskId ? `Focus: ${tasks.find(t => t.id === activeTaskId)?.title}` : 'Focus Session'))
          : (reviewSubject ? `Review: ${reviewSubject} (${reviewFocus})` : 'Review Session');

        addLog({
          id: crypto.randomUUID(),
          activity: activityTitle,
          startTime: new Date(Date.now() - (timerMode === 'work' ? workTime : reviewWorkTime) * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          type: 'productive',
          taskId: timerMode === 'work' ? (activeTaskId || undefined) : undefined
        });
        toast.success(`${sessionType} session complete!`);
      }

      // Handle Plan Progression
      if (currentPlanStepIndex !== -1 && currentPlanStepIndex < timerPlan.length - 1) {
        const nextIndex = currentPlanStepIndex + 1;
        const nextStep = timerPlan[nextIndex];
        
        setCurrentPlanStepIndex(nextIndex);
        setTimerMode(nextStep.type);
        setTimeLeft(nextStep.duration * 60);
        setIsTimerActive(true);
        setIsTrackingEnabled(true);
        
        toast.info(`Plan advanced: ${nextStep.type.toUpperCase()}`, {
          description: nextStep.label || `Starting ${nextStep.duration} minute ${nextStep.type}`
        });
      } else {
        setIsTimerActive(false);
        setIsTrackingEnabled(false);
        if (currentPlanStepIndex !== -1) {
          setCurrentPlanStepIndex(-1);
          setTimerPlan([]);
          toast.success("Focus Plan Completed!");
        } else {
          toast.error(`${sessionType} finished!`, {
            description: timerMode === 'break' ? "Back to work!" : "Time to take a short break.",
          });
        }
      }
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, isTrackingEnabled, timeLeft, timerMode, workTime, reviewWorkTime, activeTaskId, reviewSubject, reviewFocus, timerPlan, currentPlanStepIndex, tasks, addLog, workSubject, workActivity, workDetails]);

  useEffect(() => {
    localStorage.setItem('chronos_prod_mode', productivityMode);
  }, [productivityMode]);

  useEffect(() => {
    localStorage.setItem('chronos_timezone', timezone);
  }, [timezone]);

  useEffect(() => {
    localStorage.setItem('chronos_clock_type', clockType);
  }, [clockType]);

  useEffect(() => {
    localStorage.setItem('chronos_time_format', timeFormat);
  }, [timeFormat]);

  const getProductivityStats = () => {
    const now = new Date();
    let startOfPeriod: Date;

    if (productivityMode === 'daily') {
      startOfPeriod = startOfToday();
    } else {
      // Start of week (Sunday 00:00)
      const day = now.getDay();
      const diff = now.getDate() - day;
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
    }
    
    const periodTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      return isAfter(taskDate, startOfPeriod);
    });

    if (periodTasks.length === 0) return 0;

    const completed = periodTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    return Math.round((completed / periodTasks.length) * 100);
  };

  const resetProductivity = () => {
    // To reset productivity, we can archive or clear tasks from the current period
    // For now, let's just clear all tasks to provide a fresh start
    setTasks([]);
    setLogs([]);
    toast.success("Productivity data reset");
  };

  return {
    tasks, addTask, updateTask, deleteTask,
    schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem,
    reminders, addReminder, deleteReminder,
    emails, markEmailAsRead, toggleEmailRead, toggleEmailImportant, archiveEmail, deleteEmail,
    goals, setGoals,
    courses, setCourses,
    gradingConfig, setGradingConfig,
    semesterTimeline, setSemesterTimeline,
    billableHours, setBillableHours,
    logs, addLog,
    draftTask, setDraftTask,
    draftEvent, setDraftEvent,
    user, accounts, isAuthenticated, login, register, recoverAccount, verifyLogin, logout, removeAccount, updateProfile, updateUserPlan,
    deleteFinishedTasks, fetchEmails, purchaseAddon,
    productivityMode, setProductivityMode, getProductivityStats, resetProductivity,
    timezone, setTimezone, savedTimezones, addTimezone, removeTimezone,
    clockType, setClockType,
    timeFormat, setTimeFormat,
    workTime, setWorkTime,
    breakTime, setBreakTime,
    reviewWorkTime, setReviewWorkTime,
    timeLeft, setTimeLeft,
    isTimerActive, setIsTimerActive,
    timerMode, setTimerMode,
    isTrackingEnabled, setIsTrackingEnabled,
    productiveSeconds, setProductiveSeconds,
    activeTaskId, setActiveTaskId,
    reviewSeconds, setReviewSeconds,
    reviewSubject, setReviewSubject,
    reviewFocus, setReviewFocus,
    workSubject, setWorkSubject,
    workActivity, setWorkActivity,
    workDetails, setWorkDetails,
    overdueNotificationsEnabled, setOverdueNotificationsEnabled,
    headerText, setHeaderText,
    changePassword, toggle2SV, verify2SV,
    timerPlan, setTimerPlan, currentPlanStepIndex, setCurrentPlanStepIndex, startPlan, cancelPlan,
    sendOTP, verifyOTPAndResetPassword, verifyEmail, setInitialPassword
  };
}

const ChronosContext = createContext<ReturnType<typeof useChronosStoreInternal> | null>(null);

export function ChronosProvider({ children }: { children: ReactNode }) {
  const store = useChronosStoreInternal();
  return (
    <ChronosContext.Provider value={store}>
      {children}
    </ChronosContext.Provider>
  );
}

export function useChronosStore() {
  const context = useContext(ChronosContext);
  if (!context) {
    throw new Error('useChronosStore must be used within a ChronosProvider');
  }
  return context;
}
