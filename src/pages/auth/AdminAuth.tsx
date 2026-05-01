import { Shield } from "lucide-react";
import RoleAuthForm from "@/components/auth/RoleAuthForm";

const AdminAuth = () => (
  <RoleAuthForm
    role="admin"
    title="Admin Portal"
    description="Internal staff sign-in. Accounts are provisioned manually."
    icon={Shield}
    allowSignup={false}
    showGoogle={false}
  />
);

export default AdminAuth;