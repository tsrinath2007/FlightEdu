import CockpitClient from "./CockpitClient";

interface CockpitPageProps {
  params: Promise<{ id: string }>;
}

export default async function CockpitPage({ params }: CockpitPageProps) {
  const resolvedParams = await params;
  return <CockpitClient id={resolvedParams?.id || ""} />;
}
