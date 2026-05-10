import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export function LoginPage() {
  const [cardId, setCardId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(cardId, password);
      navigate("/", { replace: true });
    } catch {
      setError("Invalid card ID or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-[#003087]/20">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[#003087]">
            Smart Parking IoT
          </CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="cardId" className="text-sm font-medium">
                Card ID
              </label>
              <Input
                id="cardId"
                type="text"
                placeholder="Enter school card ID"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                required
                className="focus-visible:ring-[#003087]"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-[#003087]"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#003087] hover:bg-[#003087]/90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo Card IDs: 100001 (Admin), 100002, 100003 (Operator), 100004-100020 (User)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}