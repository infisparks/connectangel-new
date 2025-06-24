// src/lib/supabaselib.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cvcmjtyamlwgkcmsiemd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y21qdHlhbWx3Z2tjbXNpZW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTQyNTEsImV4cCI6MjA2NTQ3MDI1MX0.HyRKMdofXJjlbnsagmQscBBTSr0aJBkxaSzAkPoyA2k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);