import { ResetPasswordScreen } from "@/components/dashboard/Auth/reset-password-screen";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token = "", email = "" } = await searchParams;

  return <ResetPasswordScreen token={token} email={email} />;
}