import { useEffect, useState } from "react";
import { ProviderLayout } from "@/components/layout/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Save, Building } from "lucide-react";

interface ProviderProfile {
  business_name: string;
  business_description: string;
  business_phone: string;
  business_email: string;
  business_address: string;
}

const OwnerSettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewProvider, setIsNewProvider] = useState(false);
  const [profile, setProfile] = useState<ProviderProfile>({
    business_name: "",
    business_description: "",
    business_phone: "",
    business_email: "",
    business_address: "",
  });

  useEffect(() => {
    if (user) {
      fetchProviderProfile();
    }
  }, [user]);

  const fetchProviderProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (data) {
        setProfile({
          business_name: data.business_name || "",
          business_description: data.business_description || "",
          business_phone: data.business_phone || "",
          business_email: data.business_email || "",
          business_address: data.business_address || "",
        });
        setIsNewProvider(false);
      } else {
        setIsNewProvider(true);
        // Pre-fill email from user
        setProfile(prev => ({
          ...prev,
          business_email: user?.email || "",
        }));
      }
    } catch (error) {
      console.error('Error fetching provider profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.business_name.trim()) {
      toast({
        title: "Error",
        description: "Business name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (isNewProvider) {
        // Create new provider profile
        const { error } = await supabase
          .from('providers')
          .insert({
            user_id: user?.id,
            ...profile,
          });

        if (error) throw error;

        // Add provider role
        await supabase
          .from('user_roles')
          .insert({
            user_id: user?.id,
            role: 'provider',
          });

        toast({
          title: "Success",
          description: "Your provider profile has been created!",
        });
        setIsNewProvider(false);
      } else {
        // Update existing profile
        const { error } = await supabase
          .from('providers')
          .update(profile)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your profile has been updated!",
        });
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {isNewProvider ? "Set Up Your Business" : "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {isNewProvider 
              ? "Complete your business profile to start listing services" 
              : "Manage your business profile and preferences"
            }
          </p>
        </div>

        {/* Business Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>Your public business information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={profile.business_name}
                onChange={(e) => setProfile(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_description">Description</Label>
              <Textarea
                id="business_description"
                value={profile.business_description}
                onChange={(e) => setProfile(prev => ({ ...prev, business_description: e.target.value }))}
                placeholder="Tell customers about your business..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_phone">Phone Number</Label>
                <Input
                  id="business_phone"
                  value={profile.business_phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, business_phone: e.target.value }))}
                  placeholder="+254 700 000 000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_email">Email</Label>
                <Input
                  id="business_email"
                  type="email"
                  value={profile.business_email}
                  onChange={(e) => setProfile(prev => ({ ...prev, business_email: e.target.value }))}
                  placeholder="business@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address">Business Address</Label>
              <Textarea
                id="business_address"
                value={profile.business_address}
                onChange={(e) => setProfile(prev => ({ ...prev, business_address: e.target.value }))}
                placeholder="Enter your business address"
                rows={2}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isNewProvider ? "Create Profile" : "Save Changes"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  );
};

export default OwnerSettingsPage;
