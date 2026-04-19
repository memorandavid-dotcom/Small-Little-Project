import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  Settings2, 
  CheckCircle2, 
  BookOpen,
  ListPlus,
  Trash2,
  Plus,
  ArrowRight,
  ChevronDown,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useChronosStore } from '../hooks/useChronosStore';
import { TaskStatus, TimerStep } from '../types';

export function FocusTimer() {
  const { 
    addLog, tasks,
    workTime, setWorkTime,
    breakTime, setBreakTime,
    reviewWorkTime, setReviewWorkTime,
    timeLeft, setTimeLeft,
    isTimerActive, setIsTimerActive,
    timerMode, setTimerMode,
    isTrackingEnabled, setIsTrackingEnabled,
    productiveSeconds, setProductiveSeconds,
    activeTaskId, setActiveTaskId,
    reviewSubject, setReviewSubject,
    reviewFocus, setReviewFocus,
    workSubject, setWorkSubject,
    workActivity, setWorkActivity,
    workDetails, setWorkDetails,
    timerPlan, setTimerPlan, currentPlanStepIndex, startPlan, cancelPlan
  } = useChronosStore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [isPlanningMode, setIsPlanningMode] = useState(false);
  const [planSteps, setPlanSteps] = useState<TimerStep[]>([]);
  
  const [newStepType, setNewStepType] = useState<'work' | 'break' | 'review'>('work');
  const [newStepDuration, setNewStepDuration] = useState(25);
  const [newStepLabel, setNewStepLabel] = useState('');

  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);

  const toggleTimer = () => {
    if (!isTrackingEnabled) {
      setIsTrackingEnabled(true);
      setIsTimerActive(true);
      toast.success("Tracking started");
    } else {
      setIsTimerActive(!isTimerActive);
    }
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setIsTrackingEnabled(false);
    if (timerMode === 'work') setTimeLeft(workTime * 60);
    else if (timerMode === 'break') setTimeLeft(breakTime * 60);
    else setTimeLeft(reviewWorkTime * 60);
    
    if (timerMode === 'work') setProductiveSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSettings = () => {
    if (timerMode === 'work') setTimeLeft(workTime * 60);
    else if (timerMode === 'break') setTimeLeft(breakTime * 60);
    else setTimeLeft(reviewWorkTime * 60);
    
    setShowSettings(false);
    toast.success("Timer settings updated");
  };

  const addStepToPlan = () => {
    const newStep: TimerStep = {
      id: crypto.randomUUID(),
      type: newStepType,
      duration: newStepDuration,
      label: newStepLabel
    };
    setPlanSteps([...planSteps, newStep]);
    setNewStepLabel('');
    // Default next type based on previous
    if (newStepType === 'work') setNewStepType('break');
    else if (newStepType === 'break') setNewStepType('work');
  };

  const removeStep = (id: string) => {
    setPlanSteps(planSteps.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button 
                variant={timerMode === 'work' ? 'default' : 'ghost'} 
                size="sm" 
                disabled={currentPlanStepIndex !== -1}
                className={`rounded-xl text-[10px] font-bold uppercase tracking-widest ${timerMode === 'work' ? 'bg-[#1A1A1A]' : ''}`}
                onClick={() => { setTimerMode('work'); setTimeLeft(workTime * 60); setIsTimerActive(false); setIsTrackingEnabled(false); }}
              >
                Work
              </Button>
              <Button 
                variant={timerMode === 'break' ? 'default' : 'ghost'} 
                size="sm" 
                disabled={currentPlanStepIndex !== -1}
                className={`rounded-xl text-[10px] font-bold uppercase tracking-widest ${timerMode === 'break' ? 'bg-[#1A1A1A]' : ''}`}
                onClick={() => { setTimerMode('break'); setTimeLeft(breakTime * 60); setIsTimerActive(false); setIsTrackingEnabled(false); }}
              >
                Break
              </Button>
              <Button 
                variant={timerMode === 'review' ? 'default' : 'ghost'} 
                size="sm" 
                disabled={currentPlanStepIndex !== -1}
                className={`rounded-xl text-[10px] font-bold uppercase tracking-widest ${timerMode === 'review' ? 'bg-[#1A1A1A]' : ''}`}
                onClick={() => { setTimerMode('review'); setTimeLeft(reviewWorkTime * 60); setIsTimerActive(false); setIsTrackingEnabled(false); }}
              >
                Review
              </Button>
              <Button 
                variant={isPlanningMode ? 'default' : 'ghost'} 
                size="sm" 
                disabled={currentPlanStepIndex !== -1}
                className={`rounded-xl text-[10px] font-bold uppercase tracking-widest ${isPlanningMode ? 'bg-blue-600 text-white' : 'text-blue-600'}`}
                onClick={() => {
                  setIsPlanningMode(!isPlanningMode);
                  setShowSettings(false);
                }}
              >
                <ListPlus size={14} className="mr-1" />
                Plan
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-[#CED4DA] hover:text-[#1A1A1A]"
                onClick={() => {
                  setShowSettings(!showSettings);
                  setIsPlanningMode(false);
                }}
              >
                <Settings2 size={18} />
              </Button>
            </div>
          </div>
          
          {isPlanningMode ? (
            <div className="space-y-6 py-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A]">Sequence Planner</p>
                <Button variant="ghost" size="sm" onClick={() => setIsPlanningMode(false)} className="h-7 text-[10px] uppercase font-bold text-[#868E96]">Cancel</Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#F8F9FA] rounded-[1.5rem] border border-[#E9ECEF] space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Type</Label>
                      <select 
                        value={newStepType} 
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setNewStepType(val);
                          if (val === 'work') setNewStepDuration(25);
                          else if (val === 'break') setNewStepDuration(5);
                          else setNewStepDuration(15);
                        }}
                        className="w-full rounded-xl border-[#E9ECEF] bg-white h-9 px-3 text-xs font-bold uppercase tracking-widest focus:outline-none"
                      >
                        <option value="work">Work Block</option>
                        <option value="break">Short Break</option>
                        <option value="review">Review Block</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Duration (Min)</Label>
                      <Input 
                        type="number" 
                        value={newStepDuration} 
                        onChange={(e) => setNewStepDuration(parseInt(e.target.value) || 1)}
                        className="rounded-xl border-[#E9ECEF] h-9 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Objective (Optional)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="What's next?" 
                        value={newStepLabel} 
                        onChange={(e) => setNewStepLabel(e.target.value)}
                        className="rounded-xl border-[#E9ECEF] h-9 text-xs"
                      />
                      <Button onClick={addStepToPlan} size="icon" className="h-9 w-9 shrink-0 bg-[#1A1A1A] text-white rounded-xl">
                        <Plus size={18} />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96] px-2 flex justify-between">
                    Upcoming Path
                    <span>{planSteps.length} Steps</span>
                  </Label>
                  <ScrollArea className="h-[120px] rounded-2xl bg-[#F8F9FA]/50 border border-dashed border-[#E9ECEF] p-3">
                    <div className="space-y-2">
                      {planSteps.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 pt-6">
                          <ListPlus size={24} className="mb-2" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">No steps added yet</p>
                        </div>
                      ) : (
                        planSteps.map((step, idx) => (
                          <div key={step.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-[#E9ECEF] group">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                              step.type === 'work' ? 'bg-[#1A1A1A]' : step.type === 'break' ? 'bg-[#40C057]' : 'bg-[#FA5252]'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-widest truncate">{step.type}</p>
                              <p className="text-[10px] text-[#868E96] truncate">{step.duration} min {step.label && `• ${step.label}`}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)} className="w-6 h-6 rounded-lg text-[#CED4DA] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="pt-2">
                  <Button 
                    disabled={planSteps.length === 0}
                    onClick={() => {
                      startPlan(planSteps);
                      setIsPlanningMode(false);
                      setPlanSteps([]);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 gap-2"
                  >
                    <PlayCircle size={18} />
                    Execute Focus Plan
                  </Button>
                </div>
              </div>
            </div>
          ) : showSettings ? (
            <div className="space-y-6 py-2">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-[1.5rem] border border-[#E9ECEF] shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#1A1A1A] text-white rounded-xl shadow-md">
                      <Timer size={16} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-widest">Work Instance</h5>
                      <p className="text-[10px] text-[#868E96]">Deep focus duration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="number" 
                      value={workTime} 
                      onChange={(e) => setWorkTime(parseInt(e.target.value) || 1)}
                      className="rounded-xl border-[#E9ECEF] h-10 text-sm font-bold w-full"
                    />
                    <span className="text-[10px] font-bold uppercase text-[#ADB5BD] shrink-0">Minutes</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-[1.5rem] border border-[#E9ECEF] shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#40C057] text-white rounded-xl shadow-md">
                      <RotateCcw size={16} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-widest">Break Instance</h5>
                      <p className="text-[10px] text-[#868E96]">Recovery time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="number" 
                      value={breakTime} 
                      onChange={(e) => setBreakTime(parseInt(e.target.value) || 1)}
                      className="rounded-xl border-[#E9ECEF] h-10 text-sm font-bold w-full"
                    />
                    <span className="text-[10px] font-bold uppercase text-[#ADB5BD] shrink-0">Minutes</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-[1.5rem] border border-[#E9ECEF] shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#FA5252] text-white rounded-xl shadow-md">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-widest">Review Instance</h5>
                      <p className="text-[10px] text-[#868E96]">Post-focus analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="number" 
                      value={reviewWorkTime} 
                      onChange={(e) => setReviewWorkTime(parseInt(e.target.value) || 1)}
                      className="rounded-xl border-[#E9ECEF] h-10 text-sm font-bold w-full"
                    />
                    <span className="text-[10px] font-bold uppercase text-[#ADB5BD] shrink-0">Minutes</span>
                  </div>
                </div>
              </div>

              {timerMode === 'work' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Subject</Label>
                      <Input 
                        placeholder="e.g. Math" 
                        value={workSubject} 
                        onChange={(e) => setWorkSubject(e.target.value)}
                        className="rounded-xl border-[#E9ECEF] h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Activity</Label>
                      <Input 
                        placeholder="e.g. Homework" 
                        value={workActivity} 
                        onChange={(e) => setWorkActivity(e.target.value)}
                        className="rounded-xl border-[#E9ECEF] h-9 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Key Details</Label>
                    <Input 
                      placeholder="e.g. Chapter 5 problems" 
                      value={workDetails} 
                      onChange={(e) => setWorkDetails(e.target.value)}
                      className="rounded-xl border-[#E9ECEF] h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Focus Task (Optional)</Label>
                    <select 
                      value={activeTaskId || ''} 
                      onChange={(e) => setActiveTaskId(e.target.value || null)}
                      className="w-full rounded-xl border-[#E9ECEF] bg-white h-9 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">No specific task</option>
                      {inProgressTasks.map(task => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {timerMode === 'review' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Subject</Label>
                    <Input 
                      placeholder="e.g. Math" 
                      value={reviewSubject} 
                      onChange={(e) => setReviewSubject(e.target.value)}
                      className="rounded-xl border-[#E9ECEF] h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Focus Area</Label>
                    <Input 
                      placeholder="e.g. Calculus" 
                      value={reviewFocus} 
                      onChange={(e) => setReviewFocus(e.target.value)}
                      className="rounded-xl border-[#E9ECEF] h-9 text-xs"
                    />
                  </div>
                </div>
              )}

              <Button onClick={handleSaveSettings} className="w-full bg-[#1A1A1A] text-white rounded-xl h-12 font-bold text-xs uppercase tracking-widest">
                Save Timer Settings
              </Button>
            </div>
          ) : (
            <div className="text-center py-2">
              {currentPlanStepIndex !== -1 && (
                <div className="flex flex-col items-center gap-2 mb-6 p-4 bg-blue-50 rounded-[1.5rem] border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600 text-white border-none py-0.5 px-2 rounded-full font-bold text-[9px]">ACTIVE PLAN</Badge>
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                      Step {currentPlanStepIndex + 1} of {timerPlan.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full">
                    {timerPlan.map((step, idx) => (
                      <div 
                        key={step.id} 
                        className={`flex-1 h-1 rounded-full ${
                          idx < currentPlanStepIndex ? 'bg-blue-600' : idx === currentPlanStepIndex ? 'bg-blue-400 animate-pulse' : 'bg-blue-100'
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="flex justify-between w-full mt-1">
                    <p className="text-[9px] font-bold uppercase tracking-tight text-blue-800">
                      {timerPlan[currentPlanStepIndex].label || timerPlan[currentPlanStepIndex].type.toUpperCase()}
                    </p>
                    <button onClick={cancelPlan} className="text-[9px] font-bold uppercase tracking-tight text-red-500 hover:text-red-700">Cancel Plan</button>
                  </div>
                </div>
              )}

              {timerMode === 'work' && (
                <div className="mb-2">
                  {workSubject && (
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      Working on: {workSubject} - {workActivity}
                    </p>
                  )}
                  {activeTaskId && !workSubject && (
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      Focusing on: {tasks.find(t => t.id === activeTaskId)?.title}
                    </p>
                  )}
                </div>
              )}
              {timerMode === 'review' && reviewSubject && (
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">
                  Reviewing: {reviewSubject} {reviewFocus && `(${reviewFocus})`}
                </p>
              )}
              <p className="text-5xl font-bold tracking-tighter tabular-nums mb-4">
                {formatTime(timeLeft)}
              </p>
              
              {timerMode === 'work' && productiveSeconds > 0 && (
                <div className="flex items-center justify-center gap-1.5 mb-4 text-[#40C057] bg-[#EBFBEE] w-fit mx-auto px-3 py-1 rounded-full">
                  <CheckCircle2 size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Productive: {Math.floor(productiveSeconds / 60)}m {productiveSeconds % 60}s
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button 
                  onClick={toggleTimer} 
                  className={`w-12 h-12 rounded-full shadow-lg transition-all ${isTimerActive && isTrackingEnabled ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#1A1A1A] hover:bg-black'}`}
                >
                  {isTimerActive && isTrackingEnabled ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={resetTimer} className="rounded-full text-[#CED4DA] hover:text-[#1A1A1A]">
                  <RotateCcw size={20} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
