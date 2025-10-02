import React, { useState } from 'react';
import { Plus, Trash2, BookOpen, Users, UsersRound, MapPin, Sparkles, Play, Loader2 } from 'lucide-react';

interface EntityListProps {
  title: string;
  items: Array<{ id: string; name: string }>;
  onAdd: (name: string) => Promise<any>;
  onRemove: (id: string) => Promise<void>;
  placeholder: string;
  icon: React.ReactNode;
}

function EntityList({ title, items, onAdd, onRemove, placeholder, icon }: EntityListProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!value.trim()) return;
    setLoading(true);
    await onAdd(value);
    setValue('');
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleAdd();
    }
  };

  return (
    <div className="card-elevated p-5 animate-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-semibold text-card-foreground">{title}</h3>
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
          {items.length}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          onClick={handleAdd}
          className="btn-primary px-3"
          disabled={!value.trim() || loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
            >
              <span className="text-sm text-card-foreground">{item.name}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-3">No items yet</p>
      )}
    </div>
  );
}

interface OnboardingWizardProps {
  data: any;
  addSubject: (name: string) => Promise<any>;
  addTeacher: (name: string) => Promise<any>;
  addGroup: (name: string) => Promise<any>;
  addRoom: (name: string) => Promise<any>;
  addSection: (section: any) => Promise<any>;
  removeSubject: (id: string) => Promise<void>;
  removeTeacher: (id: string) => Promise<void>;
  removeGroup: (id: string) => Promise<void>;
  removeRoom: (id: string) => Promise<void>;
  removeSection: (id: string) => Promise<void>;
  onSolve: (opts: { improve: boolean }) => void;
  isImproving: boolean;
}

export default function OnboardingWizard({
  data,
  addSubject,
  addTeacher,
  addGroup,
  addRoom,
  addSection,
  removeSubject,
  removeTeacher,
  removeGroup,
  removeRoom,
  removeSection,
  onSolve,
  isImproving,
}: OnboardingWizardProps) {
  const [form, setForm] = useState({
    subject: '',
    teacher: '',
    group: '',
    room: '',
    tag: '',
  });
  const [sectionLoading, setSectionLoading] = useState(false);

  const addNewSection = async () => {
    if (!form.subject || !form.teacher || !form.group || !form.room) {
      return;
    }

    setSectionLoading(true);
    await addSection({
      name: form.tag || `Section ${data.sections.length + 1}`,
      subject_id: form.subject,
      teacher_id: form.teacher,
      group_id: form.group,
      room_id: form.room,
    });
    setForm({ subject: '', teacher: '', group: '', room: '', tag: '' });
    setSectionLoading(false);
  };

  const canSolve = data.sections.length > 0;

  return (
    <div className="space-y-4">
      <EntityList
        title="Subjects"
        items={data.subjects}
        placeholder="e.g., Mathematics"
        onAdd={addSubject}
        onRemove={removeSubject}
        icon={<BookOpen className="w-4 h-4 text-primary" />}
      />

      <EntityList
        title="Teachers"
        items={data.teachers}
        placeholder="e.g., Prof. Smith"
        onAdd={addTeacher}
        onRemove={removeTeacher}
        icon={<Users className="w-4 h-4 text-secondary" />}
      />

      <EntityList
        title="Student Groups"
        items={data.groups}
        placeholder="e.g., CS-101"
        onAdd={addGroup}
        onRemove={removeGroup}
        icon={<UsersRound className="w-4 h-4 text-accent" />}
      />

      <EntityList
        title="Rooms"
        items={data.rooms}
        placeholder="e.g., Room 201"
        onAdd={addRoom}
        onRemove={removeRoom}
        icon={<MapPin className="w-4 h-4 text-success" />}
      />

      {/* Section Creation */}
      <div className="card-elevated p-5 animate-scale-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-semibold">Create Section</h3>
        </div>

        <div className="space-y-3">
          <select
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className="input-field"
            disabled={data.subjects.length === 0 || sectionLoading}
          >
            <option value="">— Select Subject —</option>
            {data.subjects.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={form.teacher}
            onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
            className="input-field"
            disabled={data.teachers.length === 0 || sectionLoading}
          >
            <option value="">— Select Teacher —</option>
            {data.teachers.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={form.group}
            onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
            className="input-field"
            disabled={data.groups.length === 0 || sectionLoading}
          >
            <option value="">— Select Student Group —</option>
            {data.groups.map((g: any) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={form.room}
            onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
            className="input-field"
            disabled={data.rooms.length === 0 || sectionLoading}
          >
            <option value="">— Select Room —</option>
            {data.rooms.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <input
            value={form.tag}
            onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
            placeholder="Section name (optional)"
            className="input-field"
            disabled={sectionLoading}
          />

          <button 
            onClick={addNewSection} 
            className="btn-secondary w-full"
            disabled={!form.subject || !form.teacher || !form.group || !form.room || sectionLoading}
          >
            {sectionLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </>
            )}
          </button>
        </div>

        {data.sections.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Sections Created:</p>
            <div className="flex flex-wrap gap-2">
              {data.sections.map((sec: any) => {
                const subject = data.subjects.find((s: any) => s.id === sec.subject_id);
                const teacher = data.teachers.find((t: any) => t.id === sec.teacher_id);
                const group = data.groups.find((g: any) => g.id === sec.group_id);
                const room = data.rooms.find((r: any) => r.id === sec.room_id);

                return (
                  <div
                    key={sec.id}
                    className="section-chip group flex items-center gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs">{sec.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {subject?.name} • {teacher?.name}
                      </div>
                    </div>
                    <button
                      onClick={() => removeSection(sec.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Solve Buttons */}
      <div className="card-elevated p-5 space-y-3">
        <button
          onClick={() => onSolve({ improve: false })}
          disabled={!canSolve || isImproving}
          className="btn-primary w-full"
        >
          {isImproving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Generate Schedule
            </>
          )}
        </button>

        <button
          onClick={() => onSolve({ improve: true })}
          disabled={!canSolve || isImproving}
          className="btn-success w-full"
        >
          {isImproving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Optimize Schedule
            </>
          )}
        </button>

        {!canSolve && (
          <p className="text-xs text-muted-foreground text-center">
            Add sections to generate a schedule
          </p>
        )}
      </div>
    </div>
  );
}
