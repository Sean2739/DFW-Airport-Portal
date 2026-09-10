"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const initialFetchDone = useRef(false);

    const fetchSession = useCallback(async (isInitialLoad) => {
        if (isInitialLoad) setLoading(true);
        try {
            const sessionRes = await fetch("/api/session", { credentials: "include" });
            if (!sessionRes.ok) {
                setSession(null);
                setUser(null);
                return;
            }

            const sessionData = await sessionRes.json();
            if (!sessionData?.authenticated) {
                setSession(null);
                setUser(null);
                return;
            }
            setSession(sessionData);

            const userRes = await fetch(`/api/user`, { credentials: "include" });
            if (!userRes.ok) {
                setUser(null);
                return;
            }

            const userData = await userRes.json();
            setUser(userData);
        } catch (err) {
            console.error("Failed to fetch user or session: ", err);
            setSession(null);
            setUser(null);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchSession(true);
            return;
        }
        fetchSession(false);
    }, [pathname, fetchSession]);

    useEffect(() => {
        if (loading) return;
        if (!session?.forcePasswordReset) return;
        if (pathname === "/reset-password") return;
        router.replace("/reset-password");
    }, [loading, session, pathname, router]);

    const refetch = useCallback(() => fetchSession(false), [fetchSession]);

    const value = {
        session,
        user,
        loading,
        refetch,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) {
        throw new Error("useSession must be used within SessionProvider");
    }
    return ctx;
}
