import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export function useDbUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded) return;

      if (!isSignedIn || !clerkUser) {
        setDbUser(null);
        setIsLoading(false);
        syncedRef.current = null;
        return;
      }

      const email = clerkUser.primaryEmailAddress?.emailAddress;
      if (!email) {
        setIsLoading(false);
        return;
      }

      // Don't re-sync the same email twice
      if (syncedRef.current === email) return;
      syncedRef.current = email;

      try {
        const name = clerkUser.fullName || clerkUser.firstName || 'User';
        // Short temp mobile that fits varchar(15): "t" + 10 digits = 11 chars
        const shortMobile = 't' + Math.random().toString().slice(2, 12);

        // Step 1: Try to find existing user
        const { data: existing } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (existing) {
          setDbUser(existing as User);
          return;
        }

        // Step 2: User not found — insert them
        const { data: created, error: insertError } = await supabase
          .from('users')
          .insert({ name, email, mobile: shortMobile, role: 'USER' })
          .select()
          .maybeSingle();

        if (created) {
          setDbUser(created as User);
        } else if (insertError) {
          // Could be a race condition (another tab inserted first) — try select again
          if (insertError.code === '23505') {
            const { data: retry } = await supabase
              .from('users')
              .select('*')
              .eq('email', email)
              .maybeSingle();
            if (retry) setDbUser(retry as User);
          } else {
            console.error('useDbUser: Insert error:', insertError.message);
          }
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
