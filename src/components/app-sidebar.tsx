import React from "react";
import { LayoutDashboard, Brain, HardDrive, Settings, LogOut, Dog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Sessions", icon: HardDrive, path: "/sessions" },
    { label: "Memory Bank", icon: Brain, path: "/memory" },
  ];
  return (
    <Sidebar className="border-r-2 border-primary bg-white">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-none border-2 border-primary bg-secondary shadow-hard-sm">
            <Dog className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-display font-black tracking-tight">DELTA</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.path}
                  className={cn(
                    "mb-2 h-12 rounded-none border-2 border-transparent px-4 font-bold transition-all hover:bg-accent",
                    location.pathname === item.path && "border-primary bg-accent shadow-hard-sm translate-x-[-2px] translate-y-[-2px]"
                  )}
                >
                  <Link to={item.path}>
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t-2 border-primary">
        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground hover:text-primary cursor-pointer transition-colors">
          <Settings className="h-4 w-4" />
          <span>System Config</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}