//register user functional pentru utilizatorii noi
/* "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(email, password, name);
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-sm w-full mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
    >
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
        Create an Account
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g. john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Sign Up"
        )}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}*/
"use client";

import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();

  return (
    <div className="max-w-sm w-full mx-auto mt-16 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">
        Registration Disabled
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Account creation is currently restricted.  
        Only administrators can create new users at this time.
      </p>

      <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm p-4 rounded-lg mb-6">
        <p>
          If you need access, please contact our support team for assistance.
        </p>
      </div>

      <button
        onClick={() => router.push("/contact")}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
      >
        <Mail className="w-4 h-4" />
        Contact Support
      </button>

      <p className="text-xs text-gray-400 mt-4">
        — Registration temporarily disabled by administration —
      </p>
    </div>
  );
}
