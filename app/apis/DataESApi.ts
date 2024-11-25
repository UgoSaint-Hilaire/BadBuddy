import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Coordinates, SportsFacilitiesResponse } from "../types/dataES";

export const dataApi = createApi({
  reducerPath: "dataApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      "https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records",
  }),
  endpoints: (builder) => ({
    getLocations: builder.query<SportsFacilitiesResponse, "">({
      query: () => ({
        url: "/",
      }),
    }),
  }),
});

export const { useGetLocationsQuery } = dataApi;
