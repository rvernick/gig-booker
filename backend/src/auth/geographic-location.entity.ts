import * as typeorm from 'typeorm';

@typeorm.Entity()
export class GeographicLocation {
  constructor() {}

  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column({
    type: 'varchar',
    name: 'display_name',
    nullable: false,
  })
  displayName: string;

  @typeorm.Column({
    type: 'varchar',
    name: 'formatted_address',
    nullable: false,
  })
  formattedAddress: string;

  // @Column({
  //   type: 'varchar',
  //   name: 'place',
  //   nullable: false,
  // })
  // place: string;

  @typeorm.Column({
    type: 'varchar',
    name: 'place_id',
    nullable: false,
  })
  placeId: string;

  @typeorm.Column('simple-array')
  types: string[];

  @typeorm.Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326, // Common SRID for WGS84 (latitude/longitude)
    name: 'coordinates',
    nullable: false,
  })
  coordinates: typeorm.Point; // { type: 'Point', coordinates: [longitude, latitude] }
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
