"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../firebase/config";
import { getDoc, setDoc, doc } from "firebase/firestore";
import type { User } from "firebase/auth";

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (!userDoc.exists()) {
            const registrationData = localStorage.getItem("registrationData");
            const {
              firstName = "",
              lastName = "",
              gender = "",
            } = registrationData ? JSON.parse(registrationData) : {};

            await setDoc(doc(firestore, "users", user.uid), {
              firstName,
              lastName,
              gender,
              email: user.email,
            });

            // Clear regData from local storage
            localStorage.removeItem("registrationData");
          }
          setUser(user);
          router.push("/dashbord");
        } else {
          setUser(null);
          router.push("/login");
        }
      } else {
        setUser(null);
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unSubscribe();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {user ? "Redirecting to dashboard..." : "Redirecting to login..."}
    </div>
  );
};

export default HomePage;
