interface Props {
  params: Promise<{ chatId: string }>;
}

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: Props) {
  const { chatId } = await params;

  return <div>{chatId}</div>;
}
