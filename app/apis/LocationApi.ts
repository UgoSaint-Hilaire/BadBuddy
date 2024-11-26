import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Coordinates, SportsFacilitiesResponse } from "../types/location";
import { UserInformations } from "../types/userInformations";
import { SearchParams } from "../types/searchParams";

export const locationApi = createApi({
  reducerPath: "locationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://equipements.sports.gouv.fr/",
  }),
  endpoints: (builder) => ({
    getAllLocations: builder.query<SportsFacilitiesResponse, UserInformations>({
      query: (args) => ({
        url: "/api/explore/v2.1/catalog/datasets/data-es/records?refine=equip_type_name%3A%22Salle%20multisports%20(gymnase)%22&refine=equip_aps_nom%3A%22Badminton%2C%20Jeu%20de%20volant%22",
        params: {
          where: `equip_x >= ${args.lon}`,
        },
      }),
    }),
  }),
});

export const { useGetAllLocationsQuery } = locationApi;
