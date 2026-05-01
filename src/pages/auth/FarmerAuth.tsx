import { Tractor } from "lucide-react";
import RoleAuthForm from "@/components/auth/RoleAuthForm";

const FarmerAuth = () => (
  <RoleAuthForm
    role="farmer"
    title="Farmer Login"
    description="Sign in or create your farmer account."
    icon={Tractor}
  />
);

export default FarmerAuth;