"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient, Session } from "@supabase/supabase-js";

type SupabaseContextType = {
    supabase: SupabaseClient;
    session: Session | null;
    user: any | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
};

const Context = createContext<SupabaseContextType | undefined>(undefined);

export default function SupabaseProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [supabase] = useState(() =>
        createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    );

    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setSession(session);
            setIsLoading(false);
        };

        initializeAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        supabase,
        session,
        user: session?.user ?? null,
        isLoading,
        signOut,
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useSupabase = () => {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error("useSupabase must be used within a SupabaseProvider");
    }
    return context;
};