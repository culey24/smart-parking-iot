import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import type {
  PricingPolicyConfig,
  AudiencePricingConfig,
  PricingUnit,
  PaymentCycle,
  SpecialTimeSlot,
} from "@/types/pricingPolicy";

const PRICING_UNITS: { value: PricingUnit; label: string }[] = [
  { value: "per_trip", label: "Per trip" },
  { value: "per_hour", label: "Per hour" },
];

const PAYMENT_CYCLES: { value: PaymentCycle; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "semester", label: "Semester" },
];

const TABS = [
  { value: "learner", label: "Learners (Students / Research)" },
  { value: "facultyStaff", label: "Faculty / Staff" },
  { value: "visitor", label: "Visitors" },
] as const;

const defaultSpecialSlot: SpecialTimeSlot = {
  startTime: "00:00",
  endTime: "23:59",
  discountPercent: 0,
  label: "",
};

function AudienceConfigForm({
  config,
  onChange,
}: {
  config: AudiencePricingConfig;
  onChange: (c: AudiencePricingConfig) => void;
}) {
  const addSlot = () => {
    onChange({
      ...config,
      specialSlots: [...config.specialSlots, { ...defaultSpecialSlot }],
    });
  };

  const updateSlot = (i: number, s: Partial<SpecialTimeSlot>) => {
    const next = [...config.specialSlots];
    next[i] = { ...next[i], ...s };
    onChange({ ...config, specialSlots: next });
  };

  const removeSlot = (i: number) => {
    onChange({
      ...config,
      specialSlots: config.specialSlots.filter((_, j) => j !== i),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="font-medium text-[#003087]">Unit price (VND)</label>
          <Input
            type="number"
            min={0}
            value={config.unitPriceVnd}
            onChange={(e) =>
              onChange({
                ...config,
                unitPriceVnd: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="font-medium text-[#003087]">Pricing unit</label>
          <select
            value={config.pricingUnit}
            onChange={(e) =>
              onChange({
                ...config,
                pricingUnit: e.target.value as PricingUnit,
              })
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003087]"
          >
            {PRICING_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium text-[#003087]">Payment cycle</label>
        <select
          value={config.paymentCycle}
          onChange={(e) =>
            onChange({
              ...config,
              paymentCycle: e.target.value as PaymentCycle,
            })
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003087]"
        >
          {PAYMENT_CYCLES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="font-medium text-[#003087]">
            Special time slots (discount / free)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSlot}
            className="gap-1 border-[#003087]/30 text-[#003087] hover:bg-[#003087]/10"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {config.specialSlots.map((slot, i) => (
            <Card key={i} className="border-[#003087]/20">
              <CardContent className="flex flex-wrap items-end gap-3 p-3">
                <Input
                  placeholder="Label"
                  value={slot.label}
                  onChange={(e) => updateSlot(i, { label: e.target.value })}
                  className="w-32"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(i, { startTime: e.target.value })}
                    className="w-28"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(i, { endTime: e.target.value })}
                    className="w-28"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Discount %"
                    value={slot.discountPercent}
                    onChange={(e) =>
                      updateSlot(i, {
                        discountPercent: Math.min(
                          100,
                          Math.max(0, Number(e.target.value) || 0)
                        ),
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    % (0 = free)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSlot(i)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PricingPolicyPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<PricingPolicyConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    getPricingPolicy().then(setConfig);
  }, []);

  const updateAudience = (
    key: keyof PricingPolicyConfig,
    value: AudiencePricingConfig
  ) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
  };

  async function handleSaveAndApply() {
    if (!config) return;
    setSaving(true);
    setConfirmOpen(false);
    try {
      await savePricingPolicy(config, user?.name ?? "Unknown");
    } finally {
      setSaving(false);
    }
  }

  if (!config) return null;

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
              Flexible fees by audience – Finance Office
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

      <Tabs defaultValue="learner" className="w-full">
        <TabsList className="bg-[#003087]/10">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="data-[state=active]:bg-[#003087] data-[state=active]:text-white"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="learner">
          <Card className="border-[#003087]/20">
            <CardHeader>
              <CardTitle className="text-[#003087]">Learners</CardTitle>
              <p className="text-sm text-muted-foreground">
                Students, research students – unit price, cycle, special slots
              </p>
            </CardHeader>
            <CardContent>
              <AudienceConfigForm
                config={config.learner}
                onChange={(c) => updateAudience("learner", c)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="facultyStaff">
          <Card className="border-[#003087]/20">
            <CardHeader>
              <CardTitle className="text-[#003087]">Faculty / Staff</CardTitle>
              <p className="text-sm text-muted-foreground">
                Lecturers, staff – unit price, cycle, special slots
              </p>
            </CardHeader>
            <CardContent>
              <AudienceConfigForm
                config={config.facultyStaff}
                onChange={(c) => updateAudience("facultyStaff", c)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="visitor">
          <Card className="border-[#003087]/20">
            <CardHeader>
              <CardTitle className="text-[#003087]">Visitors</CardTitle>
              <p className="text-sm text-muted-foreground">
                External visitors – unit price, cycle, special slots
              </p>
            </CardHeader>
            <CardContent>
              <AudienceConfigForm
                config={config.visitor}
                onChange={(c) => updateAudience("visitor", c)}
              />
            </CardContent>
          </Card>
        </TabsContent>
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
