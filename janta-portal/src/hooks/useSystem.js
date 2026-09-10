import { useEffect, useRef, useState } from "react";

export function useSystem() {
    const [systemData, setSystemData] = useState({ system: null });
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null); //Interval time for refreshes

    useEffect(() => {
        async function fetchSystem() {
            try {
                const res = await fetch("/api/system", {
                    credentials: "include",
                    cache: "no-store",
                });

                if (!res.ok) {
                    console.error("Failed to fetch system, status:", res.status);
                    setSystemData({ system: null });
                    return;
                }

                const data = await res.json();
                setSystemData(data);
            } catch (err) {
                console.error("Failed to fetch system", err);
                setSystemData({ system: null });
            } finally {
                setLoading(false);
            }
        }

        fetchSystem();
        intervalRef.current = setInterval(fetchSystem, 600000); // Call every 10 minutes
        return () => clearInterval(intervalRef.current);
    }, []);
    return { ...systemData, loading };
}