import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile } from "@/services/userProfileService";
import type { UserProfileRecord } from "@/types/api";

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);

  useEffect(() => {
    getUserProfile().then(setProfile);
  }, []);

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#003087]">Personal Information</h1>
      <p className="text-sm text-muted-foreground">
        Read-only data from HCMUT_DATACORE
      </p>

      <Card>
        <CardHeader>
          <CardTitle>HCMUT Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Student ID / Staff ID (MSSV/MSCB)
              </label>
              <p className="rounded-md border bg-muted/50 px-3 py-2 font-medium">
                {profile.mssvMscb}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="rounded-md border bg-muted/50 px-3 py-2 font-medium">
                {profile.fullName}
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="rounded-md border bg-muted/50 px-3 py-2 font-medium">
                {profile.email}
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Faculty
              </label>
              <p className="rounded-md border bg-muted/50 px-3 py-2 font-medium">
                {profile.faculty}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Country
              </label>
              <p className="rounded-md border bg-muted/50 px-3 py-2 font-medium">
                {profile.country}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Province / City
              </label>
              <p className="rounded-md border bg-muted/50 px-3 py-2 font-medium">
                {profile.province}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Timezone
              </label>
              <p className="rounded-md border bg-muted/50 px-3 py-2 font-medium">
                {profile.timezone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
