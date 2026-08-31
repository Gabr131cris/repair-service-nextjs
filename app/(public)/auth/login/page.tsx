"use client";
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center bg-gradient-to-b from-blue-50/70 to-white px-4 py-12">
      <LoginForm />
    </div>
  );
}
