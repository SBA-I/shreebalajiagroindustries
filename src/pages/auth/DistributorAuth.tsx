import { Briefcase } from "lucide-react";
import RoleAuthForm from "@/components/auth/RoleAuthForm";
import DealerSignupExtras, {
  validateDealerExtras,
  dealerExtrasToMetadata,
} from "@/components/auth/DealerSignupExtras";

const DistributorAuth = () => (
  <RoleAuthForm
    role="distributor"
    title="Distributor Portal"
    description="Sign in or apply for a B2B distributor account. Approval required."
    icon={Briefcase}
    renderExtraFields={(p) => <DealerSignupExtras {...p} />}
    validateExtras={validateDealerExtras}
    extrasToMetadata={dealerExtrasToMetadata}
  />
);

export default DistributorAuth;