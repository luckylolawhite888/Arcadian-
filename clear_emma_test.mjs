import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://psjlllkngrgwvmddwznj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzamxsbGtuZ3Jnd3ZtZGR3em5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTkyOTQyMCwiZXhwIjoyMDM1NTA1NDIwfQ.dQ2lCCPxp49wBv5Q6OAM1B7Gz-J4LH_XCiV08K4MS7M'
);

const { error } = await supabase.from('conversations').delete().neq('id', 0);
if (error) console.error('Error:', error.message);
else console.log('Cleared all conversations');
