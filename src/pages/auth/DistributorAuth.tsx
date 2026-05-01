import { Briefcase } from "lucide-react";
import RoleAuthForm from "@/components/auth/RoleAuthForm";

const DistributorAuth = () => (
  <RoleAuthForm
    role="distributor"
    title="Distributor Portal"
    description="Sign in or apply for a B2B distributor account."
    icon={Briefcase}
  />
);

export default DistributorAuth;