import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gyifrckhjkmfnpolvtdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aWZyY2toamttZm5wb2x2dGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0NzU0MDEsImV4cCI6MjA0OTA1MTQwMX0.-5SDZ7tkBqk1sdKIMFMavIRp8tZBDCTQ82E1NL1Cyng';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type SankeyData = {
  id: string;
  user_id: string;
  name: string;
  nodes: string[];
  links: {
    source: number;
    target: number;
    value: number;
  }[];
  created_at: string;
};