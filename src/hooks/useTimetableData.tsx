import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Entity {
  id: string;
  name: string;
  user_id?: string;
}

interface Section {
  id: string;
  name: string;
  subject_id: string;
  teacher_id: string;
  group_id: string;
  room_id: string;
  user_id?: string;
}

interface TimetableData {
  subjects: Entity[];
  teachers: Entity[];
  groups: Entity[];
  rooms: Entity[];
  sections: Section[];
}

export const useTimetableData = (userId: string | null) => {
  const [data, setData] = useState<TimetableData>({
    subjects: [],
    teachers: [],
    groups: [],
    rooms: [],
    sections: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchAllData();
  }, [userId]);

  const fetchAllData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [subjectsRes, teachersRes, groupsRes, roomsRes, sectionsRes] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', userId),
        supabase.from('teachers').select('*').eq('user_id', userId),
        supabase.from('groups').select('*').eq('user_id', userId),
        supabase.from('rooms').select('*').eq('user_id', userId),
        supabase.from('sections').select('*').eq('user_id', userId),
      ]);

      setData({
        subjects: subjectsRes.data || [],
        teachers: teachersRes.data || [],
        groups: groupsRes.data || [],
        rooms: roomsRes.data || [],
        sections: sectionsRes.data?.map(s => ({
          id: s.id,
          name: s.name,
          subject_id: s.subject_id,
          teacher_id: s.teacher_id,
          group_id: s.group_id,
          room_id: s.room_id,
        })) || [],
      });
    } catch (error: any) {
      toast.error('Failed to load data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSubject = async (name: string) => {
    if (!userId) return null;
    const { data: newItem, error } = await supabase
      .from('subjects')
      .insert([{ name, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to add subject');
      return null;
    }
    
    setData(prev => ({ ...prev, subjects: [...prev.subjects, newItem] }));
    toast.success('Subject added');
    return newItem;
  };

  const addTeacher = async (name: string) => {
    if (!userId) return null;
    const { data: newItem, error } = await supabase
      .from('teachers')
      .insert([{ name, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to add teacher');
      return null;
    }
    
    setData(prev => ({ ...prev, teachers: [...prev.teachers, newItem] }));
    toast.success('Teacher added');
    return newItem;
  };

  const addGroup = async (name: string) => {
    if (!userId) return null;
    const { data: newItem, error } = await supabase
      .from('groups')
      .insert([{ name, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to add group');
      return null;
    }
    
    setData(prev => ({ ...prev, groups: [...prev.groups, newItem] }));
    toast.success('Group added');
    return newItem;
  };

  const addRoom = async (name: string) => {
    if (!userId) return null;
    const { data: newItem, error } = await supabase
      .from('rooms')
      .insert([{ name, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to add room');
      return null;
    }
    
    setData(prev => ({ ...prev, rooms: [...prev.rooms, newItem] }));
    toast.success('Room added');
    return newItem;
  };

  const addSection = async (section: Omit<Section, 'id' | 'user_id'>) => {
    if (!userId) return null;
    const { data: newItem, error } = await supabase
      .from('sections')
      .insert([{ ...section, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to add section');
      return null;
    }
    
    const mappedSection = {
      id: newItem.id,
      name: newItem.name,
      subject_id: newItem.subject_id,
      teacher_id: newItem.teacher_id,
      group_id: newItem.group_id,
      room_id: newItem.room_id,
    };
    
    setData(prev => ({ ...prev, sections: [...prev.sections, mappedSection] }));
    toast.success('Section added');
    return mappedSection;
  };

  const removeSubject = async (id: string) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete subject');
      return;
    }
    setData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s.id !== id) }));
    toast.success('Subject removed');
  };

  const removeTeacher = async (id: string) => {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete teacher');
      return;
    }
    setData(prev => ({ ...prev, teachers: prev.teachers.filter(t => t.id !== id) }));
    toast.success('Teacher removed');
  };

  const removeGroup = async (id: string) => {
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete group');
      return;
    }
    setData(prev => ({ ...prev, groups: prev.groups.filter(g => g.id !== id) }));
    toast.success('Group removed');
  };

  const removeRoom = async (id: string) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete room');
      return;
    }
    setData(prev => ({ ...prev, rooms: prev.rooms.filter(r => r.id !== id) }));
    toast.success('Room removed');
  };

  const removeSection = async (id: string) => {
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete section');
      return;
    }
    setData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
    toast.success('Section removed');
  };

  return {
    data,
    loading,
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
    refetch: fetchAllData,
  };
};
