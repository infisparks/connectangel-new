"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeOff, Eye, Chrome } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaselib";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // --- Fetch the user's role from your 'users' table ---
        const { data: userProfile, error: profileError } = await supabase
          .from('users') // Assuming your user roles are stored in a table named 'users'
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile/role:", profileError.message);
          // If profile data is missing or inaccessible, default to home page but show a warning
          setSuccess("Logged in, but could not determine role. Redirecting to home.");
          router.push('/home');
          return;
        }

        setSuccess("Logged in successfully! Redirecting...");

        // --- Role-based redirection ---
        if (userProfile && userProfile.role === 'admin') {
          router.push('/admin/approvals'); // Redirect admin to admin approvals page
        } else {
          router.push('/home'); // Redirect all other users (startup, incubation, investor, mentor) to home page
        }
      }
    } catch (err: any) {
      console.error("Login error:", err.message);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex md:mt-20 mt-10 bg-[#000A18] items-center justify-center p-4">
      <div className="lg:grid lg:grid-cols-2 max-w-6xl mx-auto rounded-[33px] overflow-hidden shadow-2xl bg-gray-950">
        {/* Left Column: Image */}
        <div className="relative h-[600px] lg:h-auto lg:min-h-[700px] w-full hidden lg:block">
          <Image
            src="/img/login.png"
            alt="Abstract purple background"
            fill
            objectFit="cover"
            className="rounded-l-[33px]"
          />
        </div>

        {/* Right Column: Login Form */}
        <div className="flex flex-col items-center justify-center p-8 lg:p-12 w-full text-white">
          <div className="mx-auto w-full max-w-md space-y-8">
            {error && <div className="text-red-500 text-center">{error}</div>}
            {success && <div className="text-green-500 text-center">{success}</div>}

            <form onSubmit={handleLogin}>
              <div className="space-y-3 text-center">
                <h1 className="text-4xl font-bold">Sign In</h1>
                <p className="text-gray-400 text-lg">
                  Access your account to continue enjoying uninterrupted video and personalized experience
                </p>
              </div>
              <div className="space-y-5 mt-8">
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter email or mobile number"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                />
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg pr-10 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:bg-transparent hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-lg bg-[#8B00FF] text-white font-semibold hover:bg-[#6A0DAD] transition-colors"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="text-center text-gray-400 text-sm relative my-6">
              <span className="relative z-10 bg-gray-950 px-4">Or Login With</span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-lg bg-transparent text-white border-gray-700 hover:bg-gray-800 transition-colors"
                onClick={() => alert("Google login not implemented yet!")}
              >
                <Chrome className="mr-2 h-5 w-5" />
                Google
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-lg bg-transparent text-white border-gray-700 hover:bg-gray-800 transition-colors"
                onClick={() => alert("Apple login not implemented yet!")}
              >
                <Image
                  src="/placeholder.svg?height=20&width=20"
                  alt="Apple Logo"
                  width={20}
                  height={20}
                  className="mr-2 filter invert"
                />
                Apple
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="underline text-purple-400 hover:text-purple-300">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}