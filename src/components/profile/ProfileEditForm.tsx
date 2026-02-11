import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileEditFormProps {
  userId: string;
  profile: {
    full_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  };
  onSaved: () => void;
}

export const ProfileEditForm = ({ userId, profile, onSaved }: ProfileEditFormProps) => {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl.split("?")[0],
      })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      onSaved();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Avatar" />
            ) : null}
            <AvatarFallback className="bg-primary/10">
              <User className="w-8 h-8 text-primary" />
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB</p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save Changes
      </Button>
    </div>
  );
};
