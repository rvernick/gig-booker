import { VenueDetails } from "@/components/venues/VenueDetails";
import { useLocalSearchParams } from "expo-router";

export default function VenueScreen() {
  const { venueId } = useLocalSearchParams<{ venueId?: string }>();
  const parsed = Number(venueId ?? "0");
  return <VenueDetails venueId={Number.isFinite(parsed) ? parsed : 0} />;
}
