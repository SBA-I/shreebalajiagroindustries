import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  User,
  MessageSquare,
  LogOut,
  Leaf,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", url: "/distributor", icon: LayoutDashboard },
  { title: "Orders", url: "/distributor/orders", icon: ShoppingCart },
  { title: "Inventory", url: "/distributor/inventory", icon: Package },
  { title: "Messages", url: "/distributor/messages", icon: MessageSquare },
  { title: "Profile", url: "/distributor/profile", icon: User },
];

export function DistributorSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/distributor"
      ? location.pathname === "/distributor"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {/* Logo area */}
        <div className="p-4 flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && (
            <Link to="/" className="font-heading text-sm font-bold text-primary leading-tight">
              Shree Balaji Agro
            </Link>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Distributor Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/distributor"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Back to Website</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
