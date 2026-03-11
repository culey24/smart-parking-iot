import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeft, Settings, LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "@/config/navigationConfig";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = user ? getNavItemsForRole(user.role) : [];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <span className="font-semibold text-[#003087]">
              Smart Parking
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#003087] hover:bg-[#003087]/10 hover:text-[#003087]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;

            const link = (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    "hover:bg-[#003087]/10 hover:text-[#003087]",
                    isActive
                      ? "bg-[#003087]/15 text-[#003087]"
                      : "text-sidebar-foreground"
                  )
                }
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  style={{ color: "inherit" }}
                />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );

            const parent = collapsed ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.path} className="space-y-0.5">
                {link}
                {hasChildren && (
                  <div className="ml-4 space-y-0.5 border-l-2 border-[#003087]/20 pl-3">
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon;
                      const childLink = (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                              "hover:bg-[#003087]/10 hover:text-[#003087]",
                              isActive
                                ? "font-medium text-[#003087]"
                                : "text-muted-foreground"
                            )
                          }
                        >
                          <ChildIcon className="h-4 w-4 shrink-0" />
                          <span>{child.label}</span>
                        </NavLink>
                      );
                      return childLink;
                    })}
                  </div>
                )}
              </div>
            );

            return parent;
          })}
        </nav>

        {/* User summary - dưới cùng Sidebar */}
        {user && (
          <div
            className={cn(
              "border-t p-3",
              collapsed ? "flex justify-center" : "space-y-2"
            )}
          >
            {collapsed ? (
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003087]/15 text-[#003087] font-semibold">
                      {user.name.charAt(0)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="space-y-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-[#003087]">{user.role}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-[#003087]/10 hover:text-[#003087]"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003087]/15 text-[#003087] text-sm font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-medium text-[#003087]">{user.role}</p>
                <div className="flex gap-1 pt-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 hover:bg-[#003087]/10 hover:text-[#003087]"
                        onClick={() => navigate("/settings")}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Settings</TooltipContent>
                  </Tooltip>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex-1 gap-1.5 text-xs hover:bg-[#003087]/10 hover:text-[#003087]"
                    onClick={logout}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
