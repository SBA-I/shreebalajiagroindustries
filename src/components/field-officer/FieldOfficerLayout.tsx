import { SidebarProvider } from "@/components/ui/sidebar";
import { FieldOfficerSidebar } from "./FieldOfficerSidebar";

interface FieldOfficerLayoutProps {
  children: React.ReactNode;
}

const FieldOfficerLayout = ({ children }: FieldOfficerLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <FieldOfficerSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default FieldOfficerLayout;
