import { Plus, Trash2, Clock, Calendar, ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  UserRole,
  CalculationType
} from "@/types/pricingPolicy";

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "MOTORBIKE", label: "Motorbike" },
  { value: "CAR", label: "Car" },
  { value: "BICYCLE", label: "Bicycle" },
];

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "LEARNER", label: "Learner" },
  { value: "FACULTY", label: "Faculty / Staff" },
  { value: "VISITOR", label: "Visitor" },
];

const DAYS = [
  { value: 1, label: "M" },
  { value: 2, label: "T" },
  { value: 3, label: "W" },
  { value: 4, label: "T" },
  { value: 5, label: "F" },
  { value: 6, label: "S" },
  { value: 0, label: "S" },
];

function SpecialRuleItem({ 
  rule, 
  index,
  onUpdate, 
  onDelete 
}: { 
  rule: any; 
  index: number;
  onUpdate: (r: any) => void; 
  onDelete: () => void 
}) {
  const isDefault = index === 0;

  const toggleDay = (day: number) => {
    const newDays = rule.daysOfWeek.includes(day)
      ? rule.daysOfWeek.filter((d: number) => d !== day)
      : [...rule.daysOfWeek, day];
    onUpdate({ ...rule, daysOfWeek: newDays });
  };

  return (
    <div className={`group relative p-5 border rounded-2xl space-y-4 transition-all shadow-sm ${
      isDefault 
        ? "bg-[#003087]/[0.03] border-[#003087]/30 ring-1 ring-[#003087]/10" 
        : "bg-white border-[#003087]/10 hover:border-[#003087]/30"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDefault ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#003087] text-white rounded-full text-[10px] font-black uppercase tracking-wider">
              Default Rate
            </div>
          ) : (
            <Input
              className="h-8 w-full bg-transparent border-none font-black text-[#003087] p-0 focus-visible:ring-0 text-base"
              value={rule.name}
              placeholder="Rule Name (e.g. Night)"
              onChange={(e) => onUpdate({ ...rule, name: e.target.value })}
            />
          )}
        </div>
        {!isDefault && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDelete}
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#003087]/60 flex items-center gap-1 uppercase tracking-tighter">
            <Clock className="h-3 w-3" /> Time Interval
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={0}
              max={23}
              value={rule.startHour}
              disabled={isDefault}
              onChange={(e) => onUpdate({ ...rule, startHour: Number(e.target.value) })}
              className="h-9 text-center font-bold border-[#003087]/10 disabled:opacity-50"
            />
            <span className="text-[#003087]/30 font-bold">→</span>
            <Input
              type="number"
              min={0}
              max={23}
              value={rule.endHour}
              disabled={isDefault}
              onChange={(e) => onUpdate({ ...rule, endHour: Number(e.target.value) })}
              className="h-9 text-center font-bold border-[#003087]/10 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#003087]/60 flex items-center gap-1 uppercase tracking-tighter">
             Rate (VND)
          </label>
          <Input
            type="number"
            min={0}
            value={rule.rate}
            onChange={(e) => onUpdate({ ...rule, rate: Number(e.target.value) })}
            className="h-9 font-black text-[#003087] border-[#003087]/20 focus:border-[#003087] focus:ring-[#003087]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-[#003087]/60 flex items-center gap-1 uppercase tracking-tighter">
          <Calendar className="h-3 w-3" /> Applied Days
        </label>
        <div className="flex gap-1">
          {DAYS.map((day) => (
            <button
              key={day.value}
              disabled={isDefault}
              onClick={() => toggleDay(day.value)}
              className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                rule.daysOfWeek.includes(day.value) || isDefault
                  ? "bg-[#003087] text-white shadow-sm"
                  : "bg-white text-[#003087] border border-[#003087]/10 hover:border-[#003087]/40"
              } ${isDefault ? "cursor-default" : ""}`}
            >
              {day.label}
            </button>
          ))}
          {!isDefault && (
            <button 
              onClick={() => onUpdate({ ...rule, daysOfWeek: [] })}
              className={`px-3 h-8 rounded-lg text-[10px] font-black transition-all ${
                rule.daysOfWeek.length === 0
                  ? "bg-[#003087] text-white shadow-sm"
                  : "bg-white text-[#003087] border border-[#003087]/10 hover:border-[#003087]/40"
              }`}
            >
              ALL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VehicleConfigForm({
  policy,
  onChange,
}: {
  policy: PricingPolicy;
  onChange: (p: PricingPolicy) => void;
}) {
  const addRule = () => {
    const newRules = [
      ...(policy.specialRules || []),
      { name: "Special Rule", startHour: 18, endHour: 6, daysOfWeek: [], rate: policy.specialRules?.[0]?.rate || 0 }
    ];
    onChange({ ...policy, specialRules: newRules });
  };

  const updateRule = (index: number, updatedRule: any) => {
    const newRules = [...(policy.specialRules || [])];
    newRules[index] = updatedRule;
    onChange({ ...policy, specialRules: newRules });
  };

  const deleteRule = (index: number) => {
    const newRules = policy.specialRules.filter((_, i) => i !== index);
    onChange({ ...policy, specialRules: newRules });
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-8 sm:grid-cols-2 p-6 bg-[#003087]/[0.02] rounded-3xl border border-[#003087]/10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#003087] rounded-full" />
            <label className="text-sm font-black text-[#003087] uppercase tracking-wider">Calculation Type</label>
          </div>
          <select
            value={policy.calculationType}
            onChange={(e) => onChange({ ...policy, calculationType: e.target.value as any })}
            className="flex h-12 w-full rounded-2xl border border-[#003087]/20 bg-white px-4 py-2 text-base font-bold text-[#003087] focus:outline-none focus:ring-4 focus:ring-[#003087]/10 transition-all cursor-pointer"
          >
            <option value="HOURLY">Hourly Duration Based</option>
            <option value="PER_TURN">Per Turn Flat Fee</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#003087] rounded-full" />
            <label className="text-sm font-black text-[#003087] uppercase tracking-wider">
              {policy.calculationType === "HOURLY" ? "Billing Cycle (Minutes)" : "Discount applied"}
            </label>
          </div>
          {policy.calculationType === "HOURLY" ? (
            <Input
              type="number"
              min={1}
              value={policy.billingIntervalMinutes || 60}
              onChange={(e) => onChange({ ...policy, billingIntervalMinutes: Number(e.target.value) })}
              className="h-12 rounded-2xl border-[#003087]/20 focus:border-[#003087] focus:ring-4 focus:ring-[#003087]/10 font-bold text-[#003087] text-lg px-5 transition-all"
            />
          ) : (
            <div className="h-12 flex items-center px-5 bg-[#003087]/5 rounded-2xl text-[#003087]/40 font-bold italic text-sm">
              Not applicable for flat fees.
            </div>
          )}
        </div>

        {policy.userRole === "FACULTY" && (
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#003087] rounded-full" />
              <label className="text-sm font-black text-[#003087] uppercase tracking-wider">Faculty Discount (%)</label>
            </div>
            <Input
              type="number"
              min={0}
              max={100}
              value={policy.discountPercent || 0}
              onChange={(e) => onChange({ ...policy, discountPercent: Number(e.target.value) })}
              className="h-12 rounded-2xl border-[#003087]/20 focus:border-[#003087] focus:ring-4 focus:ring-[#003087]/10 font-bold text-[#003087] text-lg px-5 transition-all"
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#003087]/10 pb-4">
          <div>
            <h3 className="text-xl font-black text-[#003087] tracking-tight">
              Pricing Intervals
            </h3>
            <p className="text-sm text-[#003087]/50 font-medium">Define custom rates for different times and days.</p>
          </div>
          <Button 
            onClick={addRule} 
            size="sm" 
            className="bg-[#003087] hover:bg-[#003087]/90 gap-2 rounded-2xl px-5 h-10 shadow-lg shadow-[#003087]/20 font-bold"
          >
            <Plus className="h-4 w-4" /> Add Rate Interval
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {(policy.specialRules || []).map((rule, idx) => (
            <SpecialRuleItem
              key={idx}
              index={idx}
              rule={rule}
              onUpdate={(updated) => updateRule(idx, updated)}
              onDelete={() => deleteRule(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PricingPolicyPage() {
  const [config, setConfig] = useState<PricingPolicyConfig>([]);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>("LEARNER");

  useEffect(() => {
    getPricingPolicy().then((data) => {
      const fullConfig: PricingPolicy[] = [];
      USER_ROLES.forEach(role => {
        VEHICLE_TYPES.forEach(vt => {
          const existing = data.find(p => p.userRole === role.value && p.vehicleType === vt.value);
          
          // Ensure at least one rule exists (the default)
          const finalPolicy: PricingPolicy = existing || {
            userRole: role.value,
            vehicleType: vt.value,
            calculationType: role.value === "VISITOR" ? "PER_TURN" : "HOURLY",
            billingIntervalMinutes: 60,
            specialRules: [],
            discountPercent: 0,
          };

          if (!finalPolicy.specialRules || finalPolicy.specialRules.length === 0) {
            finalPolicy.specialRules = [
              { name: "Default", startHour: 0, endHour: 23, daysOfWeek: [], rate: 0 }
            ];
          }

          fullConfig.push(finalPolicy);
        });
      });
      setConfig(fullConfig);
    });
  }, []);

  const updatePolicy = (updated: PricingPolicy) => {
    setConfig(prev => prev.map(p => 
      (p.userRole === updated.userRole && p.vehicleType === updated.vehicleType) ? updated : p
    ));
  };

  async function handleSaveAndApply() {
    setSaving(true);
    setConfirmOpen(false);
    try {
      for (const policy of config) {
        await savePricingPolicy(policy);
      }
      const freshData = await getPricingPolicy();
      setConfig(prev => prev.map(p => {
        const fresh = freshData.find(f => f.userRole === p.userRole && f.vehicleType === p.vehicleType);
        if (fresh) {
          if (!fresh.specialRules || fresh.specialRules.length === 0) {
             fresh.specialRules = [{ name: "Default", startHour: 0, endHour: 23, daysOfWeek: [], rate: 0 }];
          }
          return fresh;
        }
        return p;
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (config.length === 0) return null;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" asChild className="rounded-2xl hover:bg-[#003087]/10 w-12 h-12">
            <Link to="/pricing-policy">
              <ArrowLeft className="h-6 w-6 text-[#003087]" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black text-[#003087] tracking-tight">
              Pricing Engine
            </h1>
            <p className="text-sm text-[#003087]/50 font-bold flex items-center gap-2 mt-1 uppercase tracking-widest">
              Smart-Parking IoT Suite <span className="w-1.5 h-1.5 rounded-full bg-[#003087]/20" /> Billing v2.0
            </p>
          </div>
        </div>
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={saving}
          className="gap-2 bg-[#003087] hover:bg-[#003087]/90 shadow-2xl shadow-[#003087]/30 font-black px-8 h-14 rounded-2xl text-lg transition-all active:scale-95"
        >
          <Save className="h-5 w-5" />
          {saving ? "Deploying..." : "Push Policies"}
        </Button>
      </div>

      <div className="space-y-8">
        <div className="flex gap-3 p-2 bg-white border border-[#003087]/10 rounded-[2.5rem] shadow-sm overflow-x-auto no-scrollbar">
          {USER_ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => setActiveRole(role.value)}
              className={`px-10 py-3.5 rounded-[2rem] text-sm font-black transition-all whitespace-nowrap ${
                activeRole === role.value
                  ? "bg-[#003087] text-white shadow-xl scale-105"
                  : "text-[#003087] hover:bg-[#003087]/5"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        <Tabs defaultValue="MOTORBIKE" className="w-full">
          <TabsList className="bg-white border border-[#003087]/10 p-2 h-auto rounded-[2rem] shadow-sm flex flex-wrap gap-2">
            {VEHICLE_TYPES.map((vt) => (
              <TabsTrigger
                key={vt.value}
                value={vt.value}
                className="data-[state=active]:bg-[#003087] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-[1.5rem] px-12 py-3.5 font-black text-[#003087] border border-transparent data-[state=active]:border-[#003087]/20 transition-all"
              >
                {vt.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {VEHICLE_TYPES.map((vt) => {
            const policy = config.find(p => p.userRole === activeRole && p.vehicleType === vt.value);
            if (!policy) return null;
            
            return (
              <TabsContent key={`${activeRole}-${vt.value}`} value={vt.value} className="mt-8 focus-visible:outline-none">
                <Card className="border-[#003087]/10 shadow-2xl shadow-[#003087]/10 rounded-[3rem] overflow-hidden bg-white">
                  <div className="bg-gradient-to-br from-[#003087] via-[#003087] to-[#0047cc] text-white p-10">
                    <div className="flex items-center gap-4 text-white/50 text-xs font-black uppercase tracking-[0.2em] mb-2">
                      <span>Configuration Panel</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <CardTitle className="text-4xl font-black flex items-center gap-4">
                      <span className="opacity-60">{USER_ROLES.find(r => r.value === activeRole)?.label}</span>
                      <span className="text-white/30 text-2xl font-light">/</span>
                      <span className="text-white uppercase">{vt.label}</span>
                    </CardTitle>
                    <p className="text-white/60 font-bold mt-2 text-sm max-w-xl">
                      {activeRole === "VISITOR" 
                        ? "Transactional pricing models designed for high-frequency visitor turnover." 
                        : "Fixed-interval subscription billing optimized for campus community members."}
                    </p>
                  </div>
                  <CardContent className="p-10">
                    <VehicleConfigForm
                      policy={policy}
                      onChange={(updated) => updatePolicy(updated)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-[#003087]/10 sm:max-w-md rounded-[3rem] p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-[#003087] tracking-tight">
              Confirm Push
            </DialogTitle>
            <DialogDescription className="font-bold text-[#003087]/40 mt-3 text-base">
              You are deploying these pricing tiers to the production IoT gateway. 
              Changes are instantaneous.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3 flex flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="border-[#003087]/20 rounded-[1.5rem] font-black h-14 px-10 hover:bg-[#003087]/5 text-[#003087] border-2"
            >
              Back to Lab
            </Button>
            <Button
              onClick={handleSaveAndApply}
              disabled={saving}
              className="bg-[#003087] hover:bg-[#003087]/90 rounded-[1.5rem] font-black h-14 px-10 shadow-xl shadow-[#003087]/30 transition-all active:scale-95"
            >
              {saving ? "Deploying..." : "Confirm & Push"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
