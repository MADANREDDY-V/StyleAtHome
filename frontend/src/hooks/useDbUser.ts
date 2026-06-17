import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export function useDbUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded) return;
      
      if (!isSignedIn || !clerkUser) {
        setDbUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const email = clerkUser.primaryEmailAddress?.emailAddress;
        
        if (!email) {
          console.warn('useDbUser: No email found on Clerk user');
          setIsLoading(false);
          return;
        }

        const mobile = clerkUser.primaryPhoneNumber?.phoneNumber || '';
        const name = clerkUser.fullName || clerkUser.firstName || 'User';

        // Check if user exists
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle(); // Use maybeSingle instead of single to avoid throwing on no results

        if (data) {
          setDbUser(data as User);
        } else if (!data && (!error || error.code === 'PGRST116')) {
          // User not found — create them
          const insertPayload: Record<string, any> = {
            name,
            email,
            mobile: mobile || `tmp-${Date.now()}`,
            role: 'USER',
          };

          // Only set optional columns if they exist in the schema
          try {
            const { data: newData, error: insertError } = await supabase
              .from('users')
              .insert(insertPayload)
              .select()
              .single();

            if (insertError) {
              // If mobile unique constraint fails, try with a different temp value
              if (insertError.message?.includes('unique') || insertError.code === '23505') {
                const { data: retryData, error: retryError } = await supabase
                  .from('users')
                  .insert({ ...insertPayload, mobile: `tmp-${crypto.randomUUID().split('-')[0]}` })
                  .select()
                  .single();
                
                if (!retryError && retryData) {
                  setDbUser(retryData as User);
                } else {
                  console.error('useDbUser: Retry insert failed:', retryError?.message);
                }
              } else {
                console.error('useDbUser: Insert failed:', insertError.message);
              }
            } else if (newData) {
              setDbUser(newData as User);
            }
          } catch (insertErr) {
            console.error('useDbUser: Insert exception:', insertErr);
          }
        } else if (error) {
          console.error('useDbUser: Query error:', error.message, error.code);
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
