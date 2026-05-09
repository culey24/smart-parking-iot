import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPricingPolicy,
  savePricingPolicy,
} from "@/services/pricingPolicyService";
import type {
  PricingPolicy,
  PricingPolicyConfig,
  VehicleType,
  PolicyStatus,
} from "@/types/pricingPolicy";

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "MOTORBIKE", label: "Motorbike" },
  { value: "CAR", label: "Car" },
  { value: "BICYCLE", label: "Bicycle" },
];

function VehicleConfigForm({
  policy,
  onChange,
}: {
  policy: PricingPolicy;
  onChange: (p: PricingPolicy) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="font-medium text-[#003087]">Day Rate (VND)</label>
          <Input
            type="number"
            min={0}
            value={policy.dayRate || 0}
            onChange={(e) =>
              onChange({
                ...policy,
                dayRate: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="font-medium text-[#003087]">Night / Sunday Rate (VND)</label>
          <Input
            type="number"
            min={0}
            value={policy.nightOrSundayRate || 0}
            onChange={(e) =>
              onChange({
                ...policy,
                nightOrSundayRate: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium text-[#003087]">Status</label>
        <select
          value={policy.status || "ACTIVE"}
          onChange={(e) =>
            onChange({
              ...policy,
              status: e.target.value as PolicyStatus,
            })
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003087]"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>
    </div>
  );
}

export function PricingPolicyPage() {
  const [config, setConfig] = useState<PricingPolicyConfig>([]);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    // Initialize with default vehicle types in case the backend returns empty
    getPricingPolicy().then((data) => {
      const initialConfig = VEHICLE_TYPES.map((vt) => {
        const existing = data.find((p) => p.vehicleType === vt.value);
        return (
          existing || {
            vehicleType: vt.value,
            dayRate: 0,
            nightOrSundayRate: 0,
            status: "ACTIVE" as PolicyStatus,
          }
        );
      });
      setConfig(initialConfig);
    });
  }, []);

  const updatePolicy = (index: number, updated: PricingPolicy) => {
    const newConfig = [...config];
    newConfig[index] = updated;
    setConfig(newConfig);
  };

  async function handleSaveAndApply() {
    setSaving(true);
    setConfirmOpen(false);
    try {
      // Save all policies
      for (const policy of config) {
        await savePricingPolicy(policy);
      }
      // Re-fetch to confirm
      const freshData = await getPricingPolicy();
      const newConfig = VEHICLE_TYPES.map((vt) => {
        const existing = freshData.find((p) => p.vehicleType === vt.value);
        return (
          existing || {
            vehicleType: vt.value,
            dayRate: 0,
            nightOrSundayRate: 0,
            status: "ACTIVE" as PolicyStatus,
          }
        );
      });
      setConfig(newConfig);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (config.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/pricing-policy">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#003087]">
              Pricing Policy Configuration
            </h1>
            <p className="text-sm text-muted-foreground">
              Flexible fees by vehicle type – Finance Office
            </p>
          </div>
        </div>
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={saving}
          className="gap-2 bg-[#003087] hover:bg-[#003087]/90"
        >
          <Save className="h-4 w-4" />
          Save and Apply
        </Button>
      </div>

      <Tabs defaultValue="MOTORBIKE" className="w-full">
        <TabsList className="bg-[#003087]/10">
          {VEHICLE_TYPES.map((vt) => (
            <TabsTrigger
              key={vt.value}
              value={vt.value}
              className="data-[state=active]:bg-[#003087] data-[state=active]:text-white"
            >
              {vt.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {VEHICLE_TYPES.map((vt, index) => {
          const policy = config.find(p => p.vehicleType === vt.value);
          if (!policy) return null;
          
          return (
            <TabsContent key={vt.value} value={vt.value}>
              <Card className="border-[#003087]/20">
                <CardHeader>
                  <CardTitle className="text-[#003087]">{vt.label} Pricing</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure day and night/Sunday rates for {vt.label.toLowerCase()}s.
                  </p>
                </CardHeader>
                <CardContent>
                  <VehicleConfigForm
                    policy={policy}
                    onChange={(updated) => updatePolicy(index, updated)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-[#003087]/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#003087]">
              Confirm save and apply
            </DialogTitle>
            <DialogDescription>
              Save the pricing policy and apply it to the system. This change
              will be recorded in the audit log for reconciliation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="border-[#003087]/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAndApply}
              disabled={saving}
              className="bg-[#003087] hover:bg-[#003087]/90"
            >
              {saving ? "Saving..." : "Save and Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
