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
        const mobile = clerkUser.primaryPhoneNumber?.phoneNumber || 'N/A';
        const name = clerkUser.fullName || clerkUser.firstName || 'User';

        // Check if user exists
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (data) {
          setDbUser(data as User);
        } else if (error?.code === 'PGRST116') {
          // User not found, insert
          const { data: newData, error: insertError } = await supabase
            .from('users')
            .insert({
              name,
              email,
              mobile: mobile !== 'N/A' ? mobile : `tmp-${clerkUser.id}`, // Mobile is required & unique in schema
              firebase_uid: clerkUser.id, // Reusing this field for clerk id
              role: 'USER',
              email_verified: true
            })
            .select()
            .single();

          if (!insertError && newData) {
            setDbUser(newData as User);
          }
        }
      } catch (err) {
        console.error("Error syncing user:", err);
      } finally {
        setIsLoading(false);
      }
    }

    syncUser();
  }, [clerkUser, isLoaded, isSignedIn]);

  return { dbUser, isLoading: isLoading || !isLoaded };
}
