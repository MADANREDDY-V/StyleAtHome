import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export function useDbUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasAttempted = useRef(false);

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded) return;
      
      if (!isSignedIn || !clerkUser) {
        setDbUser(null);
        setIsLoading(false);
        hasAttempted.current = false;
        return;
      }

      // Prevent infinite retry loops
      if (hasAttempted.current) return;
      hasAttempted.current = true;

      try {
        const email = clerkUser.primaryEmailAddress?.emailAddress;
        
        if (!email) {
          console.warn('useDbUser: No email found on Clerk user');
          setIsLoading(false);
          return;
        }

        const name = clerkUser.fullName || clerkUser.firstName || 'User';
        // Generate a short mobile placeholder that fits varchar(15): "t" + 10 random digits
        const shortMobile = 't' + Math.random().toString().slice(2, 12);

        // Check if user exists
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (data) {
          setDbUser(data as User);
        } else if (!data && (!error || error.code === 'PGRST116')) {
          // User not found — create them
          const { data: newData, error: insertError } = await supabase
            .from('users')
            .insert({
              name,
              email,
              mobile: shortMobile,
              role: 'USER',
            })
            .select()
            .single();

          if (insertError) {
            console.error('useDbUser: Insert failed:', insertError.message);
          } else if (newData) {
            setDbUser(newData as User);
          }
        } else if (error) {
          console.error('useDbUser: Query error:', error.message);
        }
      } catch (err) {
        console.error('useDbUser: Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    syncUser();
  }, [clerkUser, isLoaded, isSignedIn]);

  return { dbUser, isLoading: isLoading || !isLoaded };
}
