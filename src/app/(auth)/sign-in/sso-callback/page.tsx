import SSOCallbackClient from "./SSOCallbackClient";

type Props = {
  searchParams: Promise<{
    anonUserId?: string;
  }>;
};

export default async function SSOCallback({ searchParams }: Props) {
  const anonUserId = (await searchParams)?.anonUserId;
  return <SSOCallbackClient anonUserId={anonUserId ?? null} />;
}
