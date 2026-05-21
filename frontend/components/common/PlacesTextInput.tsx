import { googleMapsLinkForPlace, isMobile } from "@/common/utils";
import { useEffect, useState } from "react";
import GooglePlacesTextInput, { Place } from "react-native-google-places-textinput";
import { Link, LinkText } from "../ui/link";
import { useGlobalContext } from "@/common/GlobalContext";
import { useSession } from "@/common/ctx";
import { baseUrl } from "@/common/http-utils";
import { VStack } from "../ui/vstack";


type PlacesTextInputProps = {
  value: string;
  handleSelect: (place: Place, sessionToken?: string | null | undefined) => void;
  handleSelectError: (error: Error) => void;
  readOnly?: boolean;
  placeId?: string;
  fetchDetails?: boolean;
  hideClearButton?: boolean;
}

// handleHomePlaceSelect(place: Place, sessionToken?: string | null | undefined): void {
export const PlacesTextInput: React.FC<PlacesTextInputProps> = ({
  value,
  handleSelect,
  handleSelectError,
  placeId,
  readOnly=false,
  fetchDetails=true,
  hideClearButton=false,
  }) => {

  const [needsProxy, setNeedsProxy] = useState(!isMobile());
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const context = useGlobalContext();
  const session = useSession();

  const proxyUrl = baseUrl() + '/auth/places-details-proxy'
  const proxyHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.jwt_token}`,
  }

  const ensureMapsApiKey = async () => {
    if (googleMapsApiKey === '') {
      try {
        const updatedKey = await context.getGoogleMapsAPIKey(session, '');
        if (updatedKey) {
          setGoogleMapsApiKey(updatedKey);
        }
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
      }
    }
  }

  useEffect(() => {
    ensureMapsApiKey();
  });

  if (placeId && readOnly) {
    return (
      <Link isExternal={true} href={googleMapsLinkForPlace(placeId)}>
        <LinkText>{value}</LinkText>
      </Link>
    );
  }
  return (
    <VStack>
        {needsProxy ? (
      <GooglePlacesTextInput
        value={value}
        readOnly={readOnly}
        // onTextChange={updateStartLocationText}
        apiKey={googleMapsApiKey}
        onPlaceSelect={handleSelect}
        showClearButton={!readOnly && !hideClearButton}
        minCharsToFetch={2}
        detailsProxyUrl={proxyUrl}
        detailsProxyHeaders={proxyHeaders}
        onError={handleSelectError}
        fetchDetails={true}
        languageCode="en"
        // scrollEnabled={false}
        // minCharsToFetch={2}
        nestedScrollEnabled={true}
      />
    ) : (
      <GooglePlacesTextInput
        value={value}
        readOnly={readOnly}
        // onTextChange={updateStartLocationText}
        apiKey={googleMapsApiKey}
        onPlaceSelect={handleSelect}
        showClearButton={!readOnly}
        minCharsToFetch={2}
        // detailsProxyUrl={proxyUrl}
        // detailsProxyHeaders={proxyHeaders}
        onError={handleSelectError}
        fetchDetails={true}
        languageCode="en"
        // scrollEnabled={false}
        // minCharsToFetch={2}
        nestedScrollEnabled={true}
      />
    )}
    </VStack>
  );
}