import { Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SmtpSettingsForm } from "@/components/dashboard/Settings/smtp-settings-form";
import { StripeSettingsForm } from "@/components/dashboard/Settings/stripe-settings-form";
import { getSmtpSettings, getStripeSettings } from "@/lib/actions/settings/actions";

export default async function SettingsPage() {
  const [smtp, stripe] = await Promise.all([getSmtpSettings(), getStripeSettings()]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4 rounded-lg bg-primary p-6 text-primary-foreground">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Application Settings</h1>
          <p className="text-primary-foreground/80">
            Configure SMTP email and Stripe payment settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="smtp" className="flex-col">
        <TabsList>
          <TabsTrigger value="smtp">SMTP Settings</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="mt-4">
          <SmtpSettingsForm settings={smtp} />
        </TabsContent>

        <TabsContent value="stripe" className="mt-4">
          <StripeSettingsForm settings={stripe} />
        </TabsContent>
      </Tabs>
    </div>
  );
}