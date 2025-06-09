interface Props {
  params: Promise<{ chatId: string }>;
}

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: Props) {
  //util check to ensure no random chatId page is visited

  // todo: prefetch chat.getOne and messages.getMany

  const { chatId } = await params;

  return <div>{chatId}</div>;
}
