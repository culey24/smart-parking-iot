import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getPermissionsUsers,
  updateUserRole,
} from "@/services/permissionsService";
import { ASSIGNABLE_ROLES } from "@/types/roles";
import type { PermissionsUser } from "@/types/permissions";
import type { UserRole } from "@/types/roles";

function roleLabel(r: UserRole): string {
  const labels: Record<UserRole, string> = {
    LEARNER: "Learner",
    FACULTY: "Faculty",
    OPERATOR: "Operator",
    ADMIN: "Admin",
    IT_TEAM: "IT Team",
  FINANCE: "Finance",
  SUPER: "Super",
  };
  return labels[r];
}

function RoleSelector({
  user,
  onUpdate,
}: {
  user: PermissionsUser;
  onUpdate: (userId: string, role: UserRole) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (role: UserRole) => {
    updateUserRole(user.id, role).then(() => {
      onUpdate(user.id, role);
      setOpen(false);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-[120px] justify-between gap-2"
        >
          {roleLabel(user.role)}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-2">
        <div className="space-y-1">
          {ASSIGNABLE_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleSelect(role)}
              className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
                user.role === role ? "bg-[#003087]/10 text-[#003087]" : ""
              }`}
            >
              {roleLabel(role)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PermissionsPage() {
  const [users, setUsers] = useState<PermissionsUser[]>([]);

  useEffect(() => {
    getPermissionsUsers().then(setUsers);
  }, []);

  const handleRoleUpdate = (userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
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
              User Management & Permissions
            </h1>
            <p className="text-sm text-muted-foreground">
              HCMUT_DATACORE accounts – assign Operator, Admin, IT Team
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>MSSV / MSCB</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead className="w-[140px]">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {user.mssvMscb}
                </TableCell>
                <TableCell>{user.faculty}</TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell>{user.province}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {user.timezone}
                </TableCell>
                <TableCell>
                  <RoleSelector user={user} onUpdate={handleRoleUpdate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
