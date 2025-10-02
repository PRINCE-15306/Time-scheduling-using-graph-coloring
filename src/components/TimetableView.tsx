import React from 'react';
import { Calendar, Download, Clock, AlertCircle } from 'lucide-react';
import { exportToPDF } from '@/lib/export';

interface TimetableViewProps {
  sections: any[];
  solveResult: any;
  state: any;
}

export default function TimetableView({ sections, solveResult, state }: TimetableViewProps) {
  if (!solveResult) {
    return (
      <div className="card-elevated p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Schedule Generated Yet</h3>
        <p className="text-muted-foreground text-sm">
          Create sections and click "Generate Schedule" to view your timetable
        </p>
      </div>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = 6;
  const timeSlots = [
    '8:00 - 9:00',
    '9:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '1:00 - 2:00',
    '2:00 - 3:00',
  ];

  // Generate cells
  const cells: Array<{ day: string; period: number }> = [];
  for (let d = 0; d < days.length; d++) {
    for (let p = 1; p <= periods; p++) {
      cells.push({ day: days[d], period: p });
    }
  }

  const colorToCell: Record<number, { day: string; period: number }> = {};
  for (let c = 0; c < solveResult.colorsCount; c++) {
    colorToCell[c] = cells[c % cells.length];
  }

  const grid: Record<string, any[]> = {};
  sections.forEach((s) => {
    const c = solveResult.colorOf[s.id];
    const mapped = colorToCell[c];
    if (!mapped) return;
    const key = `${mapped.day}_${mapped.period}`;
    grid[key] = grid[key] || [];
    grid[key].push(s);
  });

  const colors = [
    'bg-primary/10 border-primary/30 text-primary',
    'bg-secondary/10 border-secondary/30 text-secondary',
    'bg-success/10 border-success/30 text-success',
    'bg-accent/10 border-accent/30 text-accent',
    'bg-orange-500/10 border-orange-500/30 text-orange-600',
    'bg-pink-500/10 border-pink-500/30 text-pink-600',
    'bg-cyan-500/10 border-cyan-500/30 text-cyan-600',
    'bg-yellow-500/10 border-yellow-500/30 text-yellow-600',
  ];

  const getSubjectName = (id: string) => {
    return state.subjects.find((s: any) => s.id === id)?.name || 'Unknown';
  };

  const getTeacherName = (id: string) => {
    return state.teachers.find((t: any) => t.id === id)?.name || 'Unknown';
  };

  const getRoomName = (id: string) => {
    return state.rooms.find((r: any) => r.id === id)?.name || 'Unknown';
  };

  return (
    <div className="card-elevated p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Weekly Timetable</h3>
            <p className="text-xs text-muted-foreground">
              {solveResult.colorsCount} time slots allocated
            </p>
          </div>
        </div>

        <button
          onClick={() => exportToPDF(sections, solveResult, state)}
          className="btn-ghost"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-3 text-left border border-border font-semibold text-sm min-w-[120px]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Time</span>
                </div>
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  className="p-3 text-center border border-border font-semibold text-sm min-w-[160px]"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: periods }).map((_, pIdx) => (
              <tr key={pIdx} className="hover:bg-muted/20 transition-colors">
                <td className="p-3 border border-border font-medium text-sm text-muted-foreground align-top bg-muted/30">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      Period {pIdx + 1}
                    </span>
                    <span className="text-xs">{timeSlots[pIdx]}</span>
                  </div>
                </td>
                {days.map((d) => {
                  const key = `${d}_${pIdx + 1}`;
                  const items = grid[key] || [];
                  return (
                    <td key={d} className="p-2 border border-border align-top">
                      {items.length > 0 ? (
                        <div className="space-y-2">
                          {items.map((item) => {
                            const colorIdx = solveResult.colorOf[item.id] % colors.length;
                            return (
                              <div
                                key={item.id}
                                className={`p-3 rounded-lg border-l-4 ${colors[colorIdx]} hover:scale-105 transition-transform cursor-pointer`}
                              >
                                <div className="font-semibold text-sm mb-1">
                                  {getSubjectName(item.subjectId)}
                                </div>
                                <div className="text-xs opacity-80 space-y-0.5">
                                  <div>👤 {getTeacherName(item.teacherId)}</div>
                                  <div>📍 {getRoomName(item.roomId)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-full min-h-[80px] flex items-center justify-center text-muted-foreground/30 text-xs">
                          Free
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {solveResult.colorsCount > 30 && (
        <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-sm text-accent">
            <strong>Note:</strong> Your schedule requires {solveResult.colorsCount} time
            slots, which exceeds the 30 slots available in a standard week. Consider
            reducing conflicts or adding more resources.
          </p>
        </div>
      )}
    </div>
  );
}
