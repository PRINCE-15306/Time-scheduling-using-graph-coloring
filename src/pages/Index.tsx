import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingWizard from '@/components/OnboardingWizard';
import ConflictGraph from '@/components/ConflictGraph';
import TimetableView from '@/components/TimetableView';
import { solveGreedy, improveColoring } from '@/lib/solver';
import { Calendar, Users, BookOpen, MapPin, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTimetableData } from '@/hooks/useTimetableData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface StateData {
  subjects: Array<{ id: string; name: string }>;
  teachers: Array<{ id: string; name: string }>;
  groups: Array<{ id: string; name: string }>;
  rooms: Array<{ id: string; name: string }>;
  sections: Array<{
    id: string;
    name: string;
    subjectId: string;
    teacherId: string;
    groupId: string;
    roomId: string;
  }>;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [solveResult, setSolveResult] = useState<any>(null);
  const [isImproving, setIsImproving] = useState(false);

  const { data, loading, addSubject, addTeacher, addGroup, addRoom, addSection, removeSubject, removeTeacher, removeGroup, removeRoom, removeSection } = useTimetableData(user?.id);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const handleSolve = async (opts = { improve: false }) => {
    if (data.sections.length === 0) {
      return;
    }

    setIsImproving(true);
    
    setTimeout(() => {
      const res = solveGreedy(data.sections);
      if (opts.improve) {
        const improved = improveColoring(res.colorOf, res.graph, 600);
        res.colorOf = improved.colorOf;
        res.colorsCount = improved.colorsCount;
      }
      setSolveResult(res);
      setIsImproving(false);
    }, 300);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  const hasData = data.sections.length > 0;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Timetable Scheduler
                </h1>
                <p className="text-sm text-muted-foreground">
                  with Graph Coloring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{data.teachers.length} Teachers</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{data.subjects.length} Subjects</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{data.rooms.length} Rooms</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!hasData && (
          <div className="mb-8 p-8 rounded-2xl bg-gradient-primary text-primary-foreground animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Welcome to TimeWeaver!
                </h2>
                <p className="text-primary-foreground/90 mb-4">
                  Create an optimized timetable in minutes. Start by adding your
                  subjects, teachers, student groups, and rooms below.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="px-3 py-1 rounded-lg bg-white/10">
                    ✓ Conflict Detection
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-white/10">
                    ✓ AI-Powered Optimization
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-white/10">
                    ✓ Visual Timeline
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-white/10">
                    ✓ PDF Export
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 animate-slide-up">
            <OnboardingWizard
              data={data}
              addSubject={addSubject}
              addTeacher={addTeacher}
              addGroup={addGroup}
              addRoom={addRoom}
              addSection={addSection}
              removeSubject={removeSubject}
              removeTeacher={removeTeacher}
              removeGroup={removeGroup}
              removeRoom={removeRoom}
              removeSection={removeSection}
              onSolve={handleSolve}
              isImproving={isImproving}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <ConflictGraph sections={data.sections} solveResult={solveResult} />
            <TimetableView
              sections={data.sections}
              solveResult={solveResult}
              state={data}
              addSection={addSection}
              removeSection={removeSection}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
