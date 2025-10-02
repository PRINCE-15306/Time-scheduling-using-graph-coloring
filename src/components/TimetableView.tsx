import React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Calendar, Download, Clock, AlertCircle } from 'lucide-react';
import { exportToPDF } from '@/lib/export';

interface TimetableViewProps {
  sections: any[];
  solveResult: any;
  state: any;
  addSection: (section: any) => Promise<any>;
  removeSection: (id: string) => Promise<void>;
}

export default function TimetableView({ sections, solveResult, state, addSection, removeSection }: TimetableViewProps) {
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
    'Break',
    '11:00 - 12:00',
    '1:00 - 2:00',
    '2:00 - 4:00',
  ];

  // Generate cells
  const cells: Array<{ day: string; period: number }> = [];
  for (let d = 0; d < days.length; d++) {
    for (let p = 1; p <= periods; p++) {
      // Skip period 3 (Break) for scheduling
      if (p === 3) continue;
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
    // Prevent scheduling in Break (period 3)
    if (mapped.period === 3) return;
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

  // Use correct keys for section fields
  const getSubjectName = (id: string) => {
    return state.subjects.find((s: any) => s.id === id)?.name || 'Unknown';
  };
  const getTeacherName = (id: string) => {
    return state.teachers.find((t: any) => t.id === id)?.name || 'Unknown';
  };
  const getRoomName = (id: string) => {
    return state.rooms.find((r: any) => r.id === id)?.name || 'Unknown';
  };

  // Drag-and-drop types
  const SECTION_TYPE = 'SECTION';

  // Drag source for a section
  function DraggableSection({ item, colorIdx }: any) {
    const [{ isDragging }, drag] = useDrag({
      type: SECTION_TYPE,
      item: { ...item },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    return (
      <div
        ref={drag}
        className={`p-3 rounded-lg border-l-4 ${colors[colorIdx]} hover:scale-105 transition-transform cursor-move relative opacity-${isDragging ? 50 : 100}`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <div className="font-semibold text-sm mb-1">
          {getSubjectName(item.subject_id)}
        </div>
        <div className="text-xs opacity-80 space-y-0.5">
          <div>👤 {getTeacherName(item.teacher_id)}</div>
          <div>📍 {getRoomName(item.room_id)}</div>
        </div>
      </div>
    );
  }

  // Drop target for a cell
  function DroppableCell({ day, period, children, onDropSection }: any) {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: SECTION_TYPE,
      drop: (draggedSection) => onDropSection(draggedSection, day, period),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });
    return (
      <td
        ref={drop}
        className={`p-2 border border-border align-top ${isOver && canDrop ? 'bg-primary/10' : ''}`}
      >
        {children}
      </td>
    );
  }

  // Handler for duplicating a section
  const handleDuplicateSection = async (section: any) => {
    // Duplicate the section in the same slot (user can drag after)
    const newSection = {
      name: section.name + ' (Copy)',
      subject_id: section.subject_id,
      teacher_id: section.teacher_id,
      group_id: section.group_id,
      room_id: section.room_id,
    };
    await addSection(newSection);
  };

  // Handler for dropping a section
  const handleDropSection = (section: any, day: string, period: number) => {
    // TODO: Implement actual move logic (update section's slot in state)
    alert(`Move section ${section.id} to ${day} period ${period}`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
                        {pIdx === 2 ? 'Break' : `Period ${pIdx + 1}`}
                      </span>
                      <span className="text-xs">{timeSlots[pIdx]}</span>
                    </div>
                  </td>
                  {days.map((d) => {
                    const key = `${d}_${pIdx + 1}`;
                    // For Break, always show empty
                    if (pIdx === 2) {
                      return (
                        <td key={d} className="p-2 border border-border align-top text-center text-muted-foreground/30 text-xs">
                          Break
                        </td>
                      );
                    }
                    const items = grid[key] || [];
                    return (
                      <DroppableCell key={d} day={d} period={pIdx + 1} onDropSection={handleDropSection}>
                        {items.length > 0 ? (
                          <div className="space-y-2">
                            {items.map((item) => {
                              const colorIdx = solveResult.colorOf[item.id] % colors.length;
                              return (
                                <DraggableSection
                                  key={item.id}
                                  item={item}
                                  colorIdx={colorIdx}
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full min-h-[80px] flex items-center justify-center text-muted-foreground/30 text-xs">
                            Free
                          </div>
                        )}
                      </DroppableCell>
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
    </DndProvider>
  );
}
