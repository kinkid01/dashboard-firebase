"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase/config";
import { getDoc, setDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";

const page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      if (user.emailVerified) {
        // Retrieve user data from local storage
        const registrationData = localStorage.getItem("registrationData");

        const {
          firstName = "",
          lastName = "",
          gender = "",
        } = registrationData ? JSON.parse(registrationData) : {};

        // check if user data exists in firestore
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (!userDoc.exists()) {
          // save user data to firestore after email verification

          await setDoc(
            doc(firestore, "users", user.uid),

            {
              firstName,
              lastName,
              gender,
              email: user.email,
            }
          );
        }
        router.push("/dashboard");
      } else {
        setError("Please verify your email before logging in");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown Error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Section - Image */}
      <div className="lg:w-1/2 h-1/2 lg:h-full bg-gray-100">
        <Image
          src="/lizard.jpeg"
          alt="Sign Up"
          className=" object-cover "
          height={600}
          width={856}
        />
      </div>

      {/* Right Section - Form */}
      <div className="lg:w-1/2 h-1/2 lg:h-full flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <p className="mt-3 flex gap-3">
            Don't have an account?
            <Link href="/register" className="text-blue-400">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
