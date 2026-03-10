import {
  LayoutDashboard,
  MapPin,
  Users,
  Target,
  ShoppingCart,
  LogOut,
  User,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
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
import logoImg from "@/assets/logo-sbai.png";

const menuItems = [
  { title: "Dashboard", url: "/field-officer", icon: LayoutDashboard },
  { title: "Dealer Visits", url: "/field-officer/visits", icon: MapPin },
  { title: "Farmer Meetings", url: "/field-officer/meetings", icon: Users },
  { title: "Order Booking", url: "/field-officer/orders", icon: ShoppingCart },
  { title: "Sales Targets", url: "/field-officer/targets", icon: Target },
  { title: "Profile", url: "/field-officer/profile", icon: User },
];

export function FieldOfficerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/field-officer"
      ? location.pathname === "/field-officer"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2">
          <img src={logoImg} alt="SBAI" className="h-7 w-7 object-contain shrink-0" />
          {!collapsed && (
            <Link to="/" className="font-heading text-sm font-bold text-primary leading-tight">
              Shree Balaji Agro
            </Link>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Field Officer Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/field-officer"}
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
