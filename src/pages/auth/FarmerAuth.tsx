import { Tractor } from "lucide-react";
import RoleAuthForm from "@/components/auth/RoleAuthForm";
import FarmerSignupExtras, {
  validateFarmerExtras,
  farmerExtrasToMetadata,
} from "@/components/auth/FarmerSignupExtras";

const FarmerAuth = () => (
  <RoleAuthForm
    role="farmer"
    title="Farmer Login"
    description="Sign in or create your farmer account."
    icon={Tractor}
    renderExtraFields={(p) => <FarmerSignupExtras {...p} />}
    validateExtras={validateFarmerExtras}
    extrasToMetadata={farmerExtrasToMetadata}
  />
);

export default FarmerAuth;