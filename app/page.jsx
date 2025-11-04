"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { Loader2, KeyRound } from "lucide-react";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasskeyDialog, setShowPasskeyDialog] = useState(false);
  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  const handlePasskeySuccess = () => {
    setShowPasskeyDialog(false);
    if (authToken) {
      Cookies.set("adminToken", authToken, {
        expires: 7,
        path: "/",
      });
    }
    router.push("/dashboard");
  };

  const handlePasskeyVerification = (passkey) => {
    setIsVerifyingPasskey(true);
    if (passkey === process.env.NEXT_PUBLIC_PASSKEY) {
      toast({
        title: "Passkey verified",
        description: "Authentication successful!",
      });
      handlePasskeySuccess();
    } else {
      toast({
        title: "Verification failed",
        description: "Invalid passkey",
        variant: "destructive",
      });
    }

    setIsVerifyingPasskey(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "api/admin/user/login",
        {
          email,
          password,
        }
      );
      console.log(response);

      if (response.status !== 200) {
        return toast({
          title: "Login Failed",
          description: response.data._message,
          variant: "destructive",
        });
      }
      if (!response.data._status) {
        toast({
          title: "Login failed",
          description: response.data._message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login successful",
        description: "Please verify your passkey to continue.",
      });

      // Store the token and show passkey dialog
      setAuthToken(response.data._token);
      setShowPasskeyDialog(true);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.response.data._message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <Card className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 border-border/50 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4 animate-in zoom-in duration-300 delay-100">
            <svg
              className="w-8 h-8 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Admin Panel
          </CardTitle>
          <CardDescription className="text-base">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 animate-in slide-in-from-left duration-300 delay-200">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>
            <div className="space-y-2 animate-in slide-in-from-left duration-300 delay-300">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>
            <Button
              type="submit"
              className="w-full animate-in slide-in-from-bottom duration-300 delay-400 transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg animate-in fade-in duration-300 delay-500">
            <p className="text-sm text-muted-foreground text-center mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs font-mono text-center">
              jewellerywalaonline@gmail.com / 123456
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Passkey Dialog */}
      <Dialog open={showPasskeyDialog} onOpenChange={setShowPasskeyDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Enter Passkey
            </DialogTitle>
            <DialogDescription className="text-center">
              Please enter your passkey to complete the authentication process.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handlePasskeyVerification(formData.get("passkey"));
            }}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="passkey">Passkey</Label>
              <Input
                id="passkey"
                name="passkey"
                type="password"
                placeholder="Enter your passkey"
                required
                autoFocus
                disabled={isVerifyingPasskey}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifyingPasskey}
            >
              {isVerifyingPasskey ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Passkey"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
