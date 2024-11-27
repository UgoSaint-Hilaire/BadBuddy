import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SportsFacilitiesResponse } from "../types/locationResponse";
import { CardinalPoints } from "../types/cardinalPoints";

export const locationApi = createApi({
  reducerPath: "locationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://equipements.sports.gouv.fr/",
  }),
  endpoints: (builder) => ({
    getLocations: builder.query<SportsFacilitiesResponse, CardinalPoints>({
      query: (args) => ({
        url: "api/explore/v2.1/catalog/datasets/data-es/records?refine=equip_type_name%3A%22Salle%20multisports%20(gymnase)%22&refine=equip_aps_nom%3A%22Badminton%2C%20Jeu%20de%20volant%22",
        params: {
          where: `
          equip_x >= ${args.west.longitude} AND 
          equip_x <= ${args.east.longitude} AND
          equip_y >= ${args.south.latitude} AND
          equip_y <= ${args.north.latitude} AND 
          inst_actif = "True" 
          `,
          limit: "100",
        },
      }),
    }),
  }),
});

export const { useGetLocationsQuery } = locationApi;
