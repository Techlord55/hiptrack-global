"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!auth) return; // avoid server execution

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/admin");
      setChecking(false);
    });

    return () => unsub();
  }, [router]);

  if (checking) return <p>Loading…</p>;

  return children;
}
