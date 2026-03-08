import { useState } from "react";
import DistributorLayout from "@/components/distributor/DistributorLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Building2, MapPin, Phone, Mail, Shield, Save } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "Rajesh Patel",
    email: "rajesh.patel@example.com",
    phone: "+91 98765 43210",
    company: "Patel Agro Distributors",
    gst: "24AABCP1234F1ZP",
    address: "Plot 15, GIDC Industrial Area, Ahmedabad, Gujarat – 380015",
    territory: "Gujarat – Ahmedabad, Gandhinagar, Mehsana",
    bio: "Experienced agricultural distributor with 10+ years in crop protection product distribution across western Gujarat.",
  });

  const [activeTab, setActiveTab] = useState<"personal" | "business" | "security">("personal");

  const handleSave = () => {
    toast.success("Profile updated successfully!");
  };

  return (
    <DistributorLayout title="Profile" subtitle="Manage your account settings">
      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {[
          { id: "personal" as const, label: "Personal Info", icon: User },
          { id: "business" as const, label: "Business Details", icon: Building2 },
          { id: "security" as const, label: "Security", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "personal" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-heading text-xl font-bold text-primary">RP</span>
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">{profile.name}</p>
                <p className="text-sm text-muted-foreground">Distributor</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="pl-10" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Bio</label>
                <Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      )}

      {activeTab === "business" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">GST Number</label>
              <Input value={profile.gst} onChange={(e) => setProfile({ ...profile, gst: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea rows={2} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Assigned Territory</label>
              <Input value={profile.territory} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Territory assignments are managed by admin.</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      )}

      {activeTab === "security" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <h3 className="font-heading font-semibold text-foreground">Change Password</h3>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Current Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm New Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
          <Button onClick={() => toast.success("Password updated!")} className="gap-2">
            <Shield className="h-4 w-4" /> Update Password
          </Button>

          <div className="bg-card rounded-xl border border-destructive/20 p-6 shadow-card">
            <h3 className="font-heading font-semibold text-destructive mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">Deactivating your account will disable access to the distributor portal.</p>
            <Button variant="destructive" size="sm">Deactivate Account</Button>
          </div>
        </div>
      )}
    </DistributorLayout>
  );
};

export default Profile;
