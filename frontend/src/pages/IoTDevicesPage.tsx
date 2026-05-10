import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getIoTDevices } from "@/services/iotDevicesService";
import type { IoTDeviceRow, IoTDeviceType, IoTDeviceStatus } from "@/types/iotDevices";

type SortKey = "id" | "type" | "zone" | "status";
type SortDir = "asc" | "desc";

const DEVICE_TYPES: IoTDeviceType[] = ["sensor", "gate", "signage", "camera"];


function StatusBadge({ status }: { status: IoTDeviceStatus }) {
  const config: Record<string, { variant: "success" | "destructive" | "secondary" | "outline"; label: string }> = {
    online:    { variant: "success",     label: "Online" },
    offline:   { variant: "destructive", label: "Offline" },
    installed: { variant: "secondary",   label: "Installed" },
    error:     { variant: "destructive", label: "Error" },
  };
  const key = (status as string).toLowerCase();
  const { variant, label } = config[key] ?? { variant: "outline", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

function typeLabel(t: IoTDeviceType): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function IoTDevicesPage() {
  const [devices, setDevices] = useState<IoTDeviceRow[]>([]);
  const [typeFilter, setTypeFilter] = useState<IoTDeviceType | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getIoTDevices().then(setDevices);
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = devices;
    if (typeFilter !== "all") {
      list = list.filter((d) => d.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.zone.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv)
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [devices, typeFilter, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

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
              IoT Devices
            </h1>
            <p className="text-sm text-muted-foreground">
              Gate, Sensors, Signage, Camera – sort and filter
            </p>

          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Search by ID, type, zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-2">
            <span className="flex items-center text-sm text-muted-foreground">
              Filter by type:
            </span>
            <div className="flex gap-1">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
                className={typeFilter === "all" ? "bg-[#003087] hover:bg-[#003087]/90" : ""}
              >
                All
              </Button>
              {DEVICE_TYPES.map((t) => (
                <Button
                  key={t}
                  variant={typeFilter === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(t)}
                  className={
                    typeFilter === t ? "bg-[#003087] hover:bg-[#003087]/90" : ""
                  }
                >
                  {typeLabel(t)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium"
                    onClick={() => toggleSort("id")}
                  >
                    Device ID
                    <SortIcon column="id" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium"
                    onClick={() => toggleSort("type")}
                  >
                    Type
                    <SortIcon column="type" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium"
                    onClick={() => toggleSort("zone")}
                  >
                    Zone
                    <SortIcon column="zone" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium"
                    onClick={() => toggleSort("status")}
                  >
                    Status
                    <SortIcon column="status" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No devices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSorted.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.id}</TableCell>
                    <TableCell>{typeLabel(row.type)}</TableCell>
                    <TableCell>{row.zone}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
