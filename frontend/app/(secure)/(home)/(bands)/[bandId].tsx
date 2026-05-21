import { BandDetails } from "@/components/bands/BandDetails";
import { useLocalSearchParams } from "expo-router";

export default function BandScreen() {
  const { bandId } = useLocalSearchParams<{ bandId?: string }>();
  const parsed = Number(bandId ?? "0");
  return <BandDetails bandId={Number.isFinite(parsed) ? parsed : 0} />;
}

