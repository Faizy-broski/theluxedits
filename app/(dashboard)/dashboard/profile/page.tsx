import { ShieldCheck, Mail } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/dashboard/Profile/profile-form";
import { PasswordForm } from "@/components/dashboard/Profile/password-form";
import { getCurrentUser } from "@/lib/actions/profile/actions";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4 rounded-lg bg-primary p-6 text-primary-foreground">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/25 text-2xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="mb-1 flex items-center gap-1 text-primary-foreground/80">
            <Mail className="h-3.5 w-3.5" />
            {user.email}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            {user.role}
          </span>
        </div>
      </div>

      <Tabs defaultValue="profile" className="flex-col">
        <TabsList>
          <TabsTrigger value="profile">Edit Profile</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileForm user={user} />
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <PasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}