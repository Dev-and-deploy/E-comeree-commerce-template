"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../store/slices/authSlice.js";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (!result.error) router.push("/");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 border rounded-lg bg-white shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required className="w-full border rounded px-3 py-2 text-sm"
              value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required className="w-full border rounded px-3 py-2 text-sm"
              value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-accent font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
}
