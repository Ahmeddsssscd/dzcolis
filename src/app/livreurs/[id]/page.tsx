import LivreurProfileClient from "./LivreurProfileClient";

interface Props {
  params: { id: string };
}

export default function LivreurProfilePage({ params }: Props) {
  return <LivreurProfileClient id={params.id} />;
}
