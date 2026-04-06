import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, Car, CreditCard, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  lookupByLicensePlate,
  disableLinkedCard,
} from "@/services/cardProcessingService";
import type { CardLookupResult } from "@/types/cardProcessing";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CardProcessingPage() {
  const [licensePlate, setLicensePlate] = useState("");
  const [result, setResult] = useState<CardLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setSuccessMessage("");
    setDisabled(false);

    if (!licensePlate.trim()) return;

    setLoading(true);
    try {
      const data = await lookupByLicensePlate(licensePlate);
      if (data) {
        setResult(data);
      } else {
        setError("No active session found for this license plate.");
      }
    } catch {
      setError("Failed to lookup. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisableCard() {
    if (!result || result.linkedCard.status === "Disabled") return;

    setLoading(true);
    setError("");
    try {
      await disableLinkedCard(result.licensePlate);
      setResult((prev) =>
        prev
          ? {
              ...prev,
              linkedCard: { ...prev.linkedCard, status: "Disabled" },
            }
          : null
      );
      setDisabled(true);
      setSuccessMessage(
        "The physical card has been disabled. Please guide the user to contact parking operators to obtain a new card."
      );
    } catch {
      setError("Failed to disable card. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/monitoring">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#003087]">{`Card Processing`}</h1>
          <p className="text-sm text-muted-foreground">
            Handle lost card reports – lookup by license plate only
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Demo:</span>
          {["59A1-12345", "30A-12345", "51B-67890"].map((plate) => (
            <Button
              key={plate}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setLicensePlate(plate);
                setError("");
                setResult(null);
              }}
            >
              {plate}
            </Button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Enter license plate (e.g. 59A1-12345)"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="bg-[#003087] hover:bg-[#003087]/90"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {successMessage && (
          <div className="rounded-lg border border-green-500/50 bg-green-50 p-4 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="h-5 w-5 text-[#003087]" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle type</span>
                  <span className="font-medium">{result.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License plate</span>
                  <span className="font-medium">{result.licensePlate}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Parking Session</CardTitle>
                <CardDescription>Entry details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry time</span>
                  <span className="font-medium">
                    {formatDateTime(result.session.entryTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Plate photo at entry</span>
                  <div className="flex h-16 w-24 items-center justify-center rounded border bg-muted/50">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-5 w-5 text-[#003087]" />
                  Linked Card Information
                </CardTitle>
                <CardDescription>Last 4 digits only (security)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Card mockup */}
                <div className="flex justify-center">
                  <div className="relative w-64 overflow-hidden rounded-xl border-2 border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 p-6 shadow-lg">
                    <div className="absolute right-4 top-4">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/80" title="RFID chip" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Smart Parking</p>
                    <p className="mt-2 font-mono text-lg font-bold tracking-[0.3em] text-slate-700">
                      ****{result.linkedCard.lastFourDigits}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Card ID</p>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge
                        variant={
                          result.linkedCard.status === "Active" ? "success" : "danger"
                        }
                        className="text-xs"
                      >
                        {result.linkedCard.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400">HCMUT</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Card ID (last 4)</span>
                    <span className="font-mono font-medium">****{result.linkedCard.lastFourDigits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        result.linkedCard.status === "Active" ? "success" : "danger"
                      }
                    >
                      {result.linkedCard.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.linkedCard.status === "Active" && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDisableCard}
                disabled={loading || disabled}
              >
                Disable Linked Card
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
