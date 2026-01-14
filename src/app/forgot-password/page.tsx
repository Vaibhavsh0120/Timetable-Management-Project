"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { Mail, ArrowRight, ArrowLeft, Calendar, CheckCircle2 } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      setEmailSent(true)
      toast({
        title: "Email Sent",
        description: "Please check your email for password reset instructions.",
      })
    } catch (error: any) {
      console.error("Error sending reset email:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-3">
            <ThemeToggle />
          </div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border bg-card mb-4">
              <CheckCircle2 className="w-7 h-7 text-foreground" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Check your email</h1>
            <p className="text-muted-foreground">We&apos;ve sent password reset instructions to</p>
            <p className="text-foreground font-semibold mt-1">{email}</p>
          </div>

          <div className="rounded-2xl border bg-card p-8 space-y-6">
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full h-11"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Reset
              </Button>
              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full h-11">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-3">
          <ThemeToggle />
        </div>
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border bg-card mb-4">
            <Calendar className="w-7 h-7 text-foreground" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Forgot password?</h1>
          <p className="text-muted-foreground">No worries, we&apos;ll send you reset instructions</p>
        </div>

        {/* Reset Password Card */}
        <div className="rounded-2xl border bg-card p-8 space-y-6">
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the email address associated with your account
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Send Reset Link
                  <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className="pt-4 border-t">
            <Link href="/login" className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
