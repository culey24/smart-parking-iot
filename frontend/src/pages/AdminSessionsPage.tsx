import { useEffect, useState, useMemo } from "react";
import { Search, Filter, RefreshCw, XCircle, CheckCircle, Clock, Car, Bike, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getParkingHistory } from "@/services/parkingService";
import type { ParkingRecord } from "@/types/api";

type StatusFilter = "ALL" | "ACTIVE" | "COMPLETED" | "CANCELLED";
type TypeFilter = "ALL" | "REGISTERED" | "TEMPORARY";
type RoleFilter = "ALL" | "LEARNER" | "FACULTY" | "VISITOR" | "ADMIN" | "OPERATOR";
type VehicleFilter = "ALL" | "CAR" | "MOTORBIKE" | "BICYCLE";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(start: string, end: string | null): string {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function VehicleIcon({ type }: { type: string }) {
  if (type === "CAR") return <Car className="h-3.5 w-3.5" />;
  if (type === "MOTORBIKE") return <Bike className="h-3.5 w-3.5" />;
  return <Bike className="h-3.5 w-3.5" />;
}

export function AdminSessionsPage() {
  const [sessions, setSessions] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>("ALL");
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getParkingHistory();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = sessions;
    const q = search.toLowerCase().trim();

    if (q) {
      result = result.filter(s =>
        s.plateNumber.toLowerCase().includes(q) ||
        s.subjectID.toLowerCase().includes(q) ||
        (s.sessionId && s.sessionId.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(s => s.sessionStatus === statusFilter);
    }
    if (typeFilter !== "ALL") {
      result = result.filter(s => s.type === typeFilter);
    }
    if (roleFilter !== "ALL") {
      result = result.filter(s => s.userRole === roleFilter);
    }
    if (vehicleFilter !== "ALL") {
      result = result.filter(s => s.vehicleType === vehicleFilter);
    }
    if (showOnlyActive) {
      result = result.filter(s => s.sessionStatus === "ACTIVE");
    }

    return result;
  }, [sessions, search, statusFilter, typeFilter, roleFilter, vehicleFilter, showOnlyActive]);

  const stats = useMemo(() => ({
    total: sessions.length,
    active: sessions.filter(s => s.sessionStatus === "ACTIVE").length,
    completed: sessions.filter(s => s.sessionStatus === "COMPLETED").length,
    registered: sessions.filter(s => s.type === "REGISTERED" && s.sessionStatus === "ACTIVE").length,
    visitor: sessions.filter(s => s.type === "TEMPORARY" && s.sessionStatus === "ACTIVE").length,
  }), [sessions]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setRoleFilter("ALL");
    setVehicleFilter("ALL");
    setShowOnlyActive(false);
  };

  const hasFilters = search || statusFilter !== "ALL" || typeFilter !== "ALL" ||
    roleFilter !== "ALL" || vehicleFilter !== "ALL" || showOnlyActive;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003087]">Sessions</h1>
          <p className="text-sm text-slate-500">Admin view — all parking sessions</p>
        </div>
        <Button onClick={load} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total Sessions", value: stats.total, color: "text-slate-700" },
          { label: "Active Now", value: stats.active, color: "text-green-600" },
          { label: "Completed", value: stats.completed, color: "text-blue-600" },
          { label: "Registered Parked", value: stats.registered, color: "text-indigo-600" },
          { label: "Visitors Parked", value: stats.visitor, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Filters</span>
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-[11px] text-slate-400 hover:text-red-500 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Plate, subject ID, session ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Status */}
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Type */}
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as TypeFilter)}>
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="User Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="REGISTERED">Registered</SelectItem>
              <SelectItem value="TEMPORARY">Visitor</SelectItem>
            </SelectContent>
          </Select>

          {/* Role */}
          <Select value={roleFilter} onValueChange={v => setRoleFilter(v as RoleFilter)}>
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="LEARNER">Learner</SelectItem>
              <SelectItem value="FACULTY">Faculty</SelectItem>
              <SelectItem value="VISITOR">Visitor</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="OPERATOR">Operator</SelectItem>
            </SelectContent>
          </Select>

          {/* Vehicle */}
          <Select value={vehicleFilter} onValueChange={v => setVehicleFilter(v as VehicleFilter)}>
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Vehicles</SelectItem>
              <SelectItem value="CAR">Car</SelectItem>
              <SelectItem value="MOTORBIKE">Motorbike</SelectItem>
              <SelectItem value="BICYCLE">Bicycle</SelectItem>
            </SelectContent>
          </Select>

          {/* Active toggle */}
          <Button
            variant={showOnlyActive ? "default" : "outline"}
            size="sm"
            className={`h-8 text-xs ${showOnlyActive ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={() => setShowOnlyActive(v => !v)}
          >
            <Clock className="h-3.5 w-3.5 mr-1" />
            Active Only
          </Button>
        </div>

        <p className="text-[11px] text-slate-400">
          Showing <span className="font-bold text-slate-600">{filtered.length}</span> of {sessions.length} sessions
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plate</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entry</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exit</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fee</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-slate-400">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-slate-400">
                  No sessions found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(s => (
                <TableRow key={s.sessionId} className="hover:bg-slate-50 text-xs">
                  <TableCell className="font-mono font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                        {s.sessionId.slice(0, 8)}
                      </span>
                      {s.plateNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.type === "REGISTERED" ? "default" : "secondary"}
                      className={`text-[10px] font-bold ${s.type === "REGISTERED" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {s.type === "REGISTERED" ? "REG" : "VIS"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-bold ${
                      s.userRole === "LEARNER" ? "text-green-700 border-green-300" :
                      s.userRole === "FACULTY" ? "text-indigo-700 border-indigo-300" :
                      s.userRole === "VISITOR" ? "text-amber-700 border-amber-300" :
                      "text-slate-700 border-slate-300"
                    }`}>
                      {s.userRole}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <VehicleIcon type={s.vehicleType} />
                      {s.vehicleType}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{formatDateTime(s.startTime)}</TableCell>
                  <TableCell className="text-slate-500">
                    {s.endTime ? formatDateTime(s.endTime) : <span className="text-slate-300">—</span>}
                  </TableCell>
                  <TableCell>
                    {s.sessionStatus === "ACTIVE" ? (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(s.startTime, null)}
                      </span>
                    ) : (
                      <span className="text-slate-500">{formatDuration(s.startTime, s.endTime)}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono font-bold">
                    {s.fee > 0 ? new Intl.NumberFormat("vi-VN").format(s.fee) + "đ" : <span className="text-slate-300">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-bold ${
                      s.paymentStatus === "PAID" ? "text-green-700 border-green-300" :
                      s.paymentStatus === "PENDING" ? "text-amber-700 border-amber-300" :
                      s.paymentStatus === "UNPAID" && s.sessionStatus === "COMPLETED" ? "text-red-700 border-red-300" :
                      "text-slate-500 border-slate-300"
                    }`}>
                      {s.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.sessionStatus === "ACTIVE" ? (
                      <span className="flex items-center gap-1 text-green-600 font-bold text-[10px]">
                        <CheckCircle className="h-3 w-3" /> ACTIVE
                      </span>
                    ) : s.sessionStatus === "COMPLETED" ? (
                      <span className="flex items-center gap-1 text-blue-600 font-bold text-[10px]">
                        <CheckCircle className="h-3 w-3" /> DONE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 font-bold text-[10px]">
                        <XCircle className="h-3 w-3" /> CANCELLED
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-400">{s.subjectID}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
