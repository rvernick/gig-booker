import { Place } from "react-native-google-places-textinput";

export interface CoSLocation {
  id: number;
  displayName: string;
  formattedAddress: string;
  placeId: string;
  types: string[];
  coordinates: PRPoint;
}

export interface PRPoint {
  type: string; //'Point',
  coordinates: number[];   // [longitude, latitude] }
}

export const prLocationFrom = (place: Place): CoSLocation | null => {
  if (!place) return null;
  return {
    id: 0,
    displayName: place.details?.displayName.text,
    formattedAddress: place.details?.formattedAddress,
    placeId: place.placeId,
    types: place.types,
    coordinates: { type: 'Point', coordinates: [place.details?.location.longitude, place.details?.location.latitude] },
  }
}

/**
 Based on Place from Google places text input: https://github.com/amitpdev/react-native-google-places-textinput/blob/main/src/GooglePlacesTextInput.tsx
 Includes google id information

 {
   "details":{
      "displayName":{
         "languageCode":"en",
         "text":"Ritual Coffee Roasters"
      },
      "formattedAddress":"1026 Valencia St, San Francisco, CA 94110, USA",
      "id":"ChIJm8vaiT5-j4ARU2MyuxNCc2s",
      "location":{
         "latitude":37.7564253,
         "longitude":-122.4214111
      }
   },
   "place":"places/ChIJm8vaiT5-j4ARU2MyuxNCc2s",
   "placeId":"ChIJm8vaiT5-j4ARU2MyuxNCc2s",
   "structuredFormat":{
      "mainText":{
         "matches":[
            "Array"
         ],
         "text":"Ritual Coffee Roasters"
      },
      "secondaryText":{
         "text":"Valencia Street, San Francisco, CA, USA"
      }
   },
   "text":{
      "matches":[
         [
            "Object"
         ]
      ],
      "text":"Ritual Coffee Roasters, Valencia Street, San Francisco, CA, USA"
   },
   "types":[
      "coffee_shop",
      "food",
      "food_store",
      "cafe",
      "point_of_interest",
      "store",
      "establishment"
   ]
}
 */
