import LivreurProfileClient from "./LivreurProfileClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LivreurProfilePage({ params }: Props) {
  const { id } = await params;
  return <LivreurProfileClient id={id} />;
}
