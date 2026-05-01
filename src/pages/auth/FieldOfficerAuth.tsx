import { MapPin } from "lucide-react";
import RoleAuthForm from "@/components/auth/RoleAuthForm";
import FieldOfficerSignupExtras, {
  validateOfficerExtras,
  officerExtrasToMetadata,
} from "@/components/auth/FieldOfficerSignupExtras";

const FieldOfficerAuth = () => (
  <RoleAuthForm
    role="field_officer"
    title="Field Officer Portal"
    description="Sign in or register as a Balaji field representative."
    icon={MapPin}
    renderExtraFields={(p) => <FieldOfficerSignupExtras {...p} />}
    validateExtras={validateOfficerExtras}
    extrasToMetadata={officerExtrasToMetadata}
  />
);

export default FieldOfficerAuth;