import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { SankeyData } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface SankeyState {
  diagrams: SankeyData[];
  currentDiagram: SankeyData | null;
  loading: boolean;
  fetchDiagrams: () => Promise<void>;
  saveDiagram: (data: Omit<SankeyData, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  setCurrentDiagram: (diagram: SankeyData | null) => void;
}

export const useSankeyStore = create<SankeyState>((set, get) => ({
  diagrams: [],
  currentDiagram: null,
  loading: false,
  fetchDiagrams: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('sankey_diagrams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ diagrams: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching diagrams:', error);
      set({ loading: false });
    }
  },
  saveDiagram: async (data) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw new Error('User must be authenticated to save diagrams');
    }

    try {
      // First, check if we already have a diagram with this name
      const { data: existingData, error: fetchError } = await supabase
        .from('sankey_diagrams')
        .select('id')
        .eq('name', data.name)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw fetchError;
      }

      let savedData;
      if (existingData) {
        // Update existing diagram
        const { data: updatedData, error: updateError } = await supabase
          .from('sankey_diagrams')
          .update({
            ...data,
            user_id: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (updateError) throw updateError;
        savedData = updatedData;
      } else {
        // Insert new diagram
        const { data: insertedData, error: insertError } = await supabase
          .from('sankey_diagrams')
          .insert([{
            ...data,
            user_id: user.id
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        savedData = insertedData;
      }

      const { diagrams } = get();
      const newDiagrams = diagrams.filter(d => d.id !== savedData.id);
      set({ diagrams: [savedData, ...newDiagrams] });
      return savedData;
    } catch (error) {
      console.error('Error saving diagram:', error);
      throw error;
    }
  },
  setCurrentDiagram: (diagram) => set({ currentDiagram: diagram }),
}));