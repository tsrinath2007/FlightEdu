import BoardingClient from "./BoardingClient";

interface BoardingPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardingPage({ params }: BoardingPageProps) {
  const resolvedParams = await params;
  return <BoardingClient id={resolvedParams?.id || ""} />;
}
