import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/store";
import { setCredentials } from "@/store/slices/authSlice";
import { useLoginMutation } from "@/store/api/authApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginMutation({ email, password }).unwrap();
      const { user } = res.data;

      const role = user.role.toUpperCase();
      if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
        setError("Access denied. Admin credentials required.");
        return;
      }

      // Tokens are in HTTP-only cookies set by the server.
      // We only store the user profile in state (no tokens).
      dispatch(setCredentials({ user: user as any }));
      navigate("/admin");
    } catch (err: any) {
      setError(err?.data?.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Sign in to manage your store</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
