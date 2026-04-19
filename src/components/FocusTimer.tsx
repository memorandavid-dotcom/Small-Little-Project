import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, AlertTriangle, Settings2, CheckCircle2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useChronosStore } from '../hooks/useChronosStore';
import { TaskStatus } from '../types';

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
    workDetails, setWorkDetails
  } = useChronosStore();
  
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button 
                variant={timerMode === 'work' ? 'default' : 'ghost'} 
                size="sm" 
                className={`rounded-xl text-[10px] font-bold uppercase tracking-widest ${timerMode === 'work' ? 'bg-[#1A1A1A]' : ''}`}
                onClick={() => { setTimerMode('work'); setTimeLeft(workTime * 60); setIsTimerActive(false); setIsTrackingEnabled(false); }}
              >
                Work
              </Button>
              <Button 
                variant={timerMode === 'break' ? 'default' : 'ghost'} 
                size="sm" 
                className={`rounded-xl text-[10px] font-bold uppercase tracking-widest ${timerMode === 'break' ? 'bg-[#1A1A1A]' : ''}`}
                onClick={() => { setTimerMode('break'); setTimeLeft(breakTime * 60); setIsTimerActive(false); setIsTrackingEnabled(false); }}
              >
                Break
              </Button>
              <Button 
                variant={timerMode === 'review' ? 'default' : 'ghost'} 
                size="sm" 
                className={`rounded-xl text-[10px] font-bold uppercase tracking-widest ${timerMode === 'review' ? 'bg-[#1A1A1A]' : ''}`}
                onClick={() => { setTimerMode('review'); setTimeLeft(reviewWorkTime * 60); setIsTimerActive(false); setIsTrackingEnabled(false); }}
              >
                Review
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 mr-2">
                <Label htmlFor="tracking-switch" className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Track</Label>
                <Switch 
                  id="tracking-switch"
                  checked={isTrackingEnabled}
                  onCheckedChange={(checked) => {
                    setIsTrackingEnabled(checked);
                    if (checked) setIsTimerActive(true);
                    else setIsTimerActive(false);
                  }}
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-[#CED4DA] hover:text-[#1A1A1A]"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings2 size={18} />
              </Button>
            </div>
          </div>
          
          {showSettings ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Work</Label>
                  <Input 
                    type="number" 
                    value={workTime} 
                    onChange={(e) => setWorkTime(parseInt(e.target.value) || 1)}
                    className="rounded-xl border-[#E9ECEF] h-9 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Break</Label>
                  <Input 
                    type="number" 
                    value={breakTime} 
                    onChange={(e) => setBreakTime(parseInt(e.target.value) || 1)}
                    className="rounded-xl border-[#E9ECEF] h-9 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#868E96]">Review</Label>
                  <Input 
                    type="number" 
                    value={reviewWorkTime} 
                    onChange={(e) => setReviewWorkTime(parseInt(e.target.value) || 1)}
                    className="rounded-xl border-[#E9ECEF] h-9 text-xs"
                  />
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

              <Button onClick={handleSaveSettings} className="w-full bg-[#1A1A1A] text-white rounded-xl h-10 font-bold text-xs uppercase tracking-widest">
                Save Settings
              </Button>
            </div>
          ) : (
            <div className="text-center py-2">
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
