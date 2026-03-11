import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSystemConfig,
  saveSystemConfig,
} from "@/services/systemConfigService";
import type { SystemConfig } from "@/types/systemConfig";

export function SystemConfigPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getSystemConfig().then(setConfig);
  }, []);

  const update = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
    setSuccess(false);
  };

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setSuccess(false);
    try {
      await saveSystemConfig(config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
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
            <Link to="/admin-dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#003087]">
              System Configuration
            </h1>
            <p className="text-sm text-muted-foreground">
              Parameters controlling Smart Parking logic
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-[#003087] hover:bg-[#003087]/90"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save configuration"}
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-green-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="font-medium">Configuration saved successfully.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#003087]">Operations</CardTitle>
            <p className="text-sm text-muted-foreground">
              Occupancy, IoT timeout, and sync settings
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Occupancy alerts</label>
                <p className="text-sm text-muted-foreground">
                  Notify when lot is nearly full
                </p>
              </div>
              <Switch
                checked={config.enableOccupancyAlerts}
                onCheckedChange={(v) => update("enableOccupancyAlerts", v)}
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium">Occupancy threshold (%)</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={config.occupancyThresholdPercent}
                onChange={(e) =>
                  update(
                    "occupancyThresholdPercent",
                    Math.min(100, Math.max(0, Number(e.target.value) || 0))
                  )
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">IoT timeout monitoring</label>
                <p className="text-sm text-muted-foreground">
                  Alert when devices stop responding
                </p>
              </div>
              <Switch
                checked={config.enableIotTimeoutMonitoring}
                onCheckedChange={(v) => update("enableIotTimeoutMonitoring", v)}
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium">IoT device timeout (seconds)</label>
              <Input
                type="number"
                min={5}
                max={300}
                value={config.iotDeviceTimeoutSeconds}
                onChange={(e) =>
                  update(
                    "iotDeviceTimeoutSeconds",
                    Math.min(300, Math.max(5, Number(e.target.value) || 5))
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium">Data sync interval (seconds)</label>
              <Input
                type="number"
                min={10}
                max={600}
                value={config.syncIntervalSeconds}
                onChange={(e) =>
                  update(
                    "syncIntervalSeconds",
                    Math.min(600, Math.max(10, Number(e.target.value) || 10))
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#003087]">Notifications</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hotline and alert email settings
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium">Support hotline</label>
              <Input
                type="text"
                placeholder="028-3865-1234"
                value={config.hotlineSupport}
                onChange={(e) => update("hotlineSupport", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Email alerts</label>
                <p className="text-sm text-muted-foreground">
                  Send system error alerts by email
                </p>
              </div>
              <Switch
                checked={config.enableEmailAlerts}
                onCheckedChange={(v) => update("enableEmailAlerts", v)}
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium">Alert recipient email</label>
              <Input
                type="email"
                placeholder="parking-alerts@hcmut.edu.vn"
                value={config.alertEmail}
                onChange={(e) => update("alertEmail", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
