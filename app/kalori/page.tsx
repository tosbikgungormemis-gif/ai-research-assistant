import type { Metadata } from "next";
import KaloriApp from "@/components/KaloriApp";

export const metadata: Metadata = {
  title: "Kalori | Fotoğraftan kalori hesapla",
  description: "Yemeğinin fotoğrafını çek, yapay zekâ kalorisini ve besin değerlerini hesaplasın.",
};

export default function KaloriPage() {
  return <KaloriApp />;
}
