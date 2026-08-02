import { CheckinFlow } from "@/components/checkin/CheckinFlow";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { token } = await params;
  return <CheckinFlow token={token} />;
}
