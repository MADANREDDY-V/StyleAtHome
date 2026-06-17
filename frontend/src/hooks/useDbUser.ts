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
        console.warn('useDbUser: No email on Clerk user');
        setIsLoading(false);
        return;
      }

      // Don't re-sync if we already synced this email
      if (syncedRef.current === email) return;
      syncedRef.current = email;

      try {
        const name = clerkUser.fullName || clerkUser.firstName || 'User';
        const shortMobile = 't' + Math.random().toString().slice(2, 12);

        // Use upsert: creates if not exists, returns existing if found
        // onConflict on email means: if email already exists, do nothing (just return the row)
        const { data, error } = await supabase
          .from('users')
          .upsert(
            {
              name,
              email,
              mobile: shortMobile,
              role: 'USER',
            },
            { onConflict: 'email', ignoreDuplicates: true }
          )
          .select()
          .single();

        if (data) {
          setDbUser(data as User);
        } else if (error) {
          console.error('useDbUser: Upsert failed:', error.message);
          // Fallback: try a plain select in case upsert returned no data but user exists
          const { data: fallbackData } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          
          if (fallbackData) {
            setDbUser(fallbackData as User);
          } else {
            console.error('useDbUser: Could not find or create user for', email);
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
