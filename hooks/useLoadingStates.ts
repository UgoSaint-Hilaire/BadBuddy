import { useState, useEffect } from "react";
import { useLocation } from "./useLocation";
import { useGetLocationsQuery } from "./apis/LocationApi";
import { useUsers } from "./useUsers";
import { LoadingState } from "../types/loadingState";

export const useLoadingStates = (): LoadingState => {
  const [state, setState] = useState<LoadingState>({
    isLoading: true,
    status: {
      location: false,
      cardinalPoints: false,
      users: false,
      equipments: false,
      filteredEquipments: false,
    },
    error: null,
  });

  const { currentLocation, locationStatus, cardinalPoints } = useLocation();
  const { data: equipmentsData, isLoading: equipmentsLoading } = useGetLocationsQuery(cardinalPoints!, {
    skip: !cardinalPoints,
  });
  const { users, loading: usersLoading } = useUsers();

  useEffect(() => {
    const newStatus = {
      location: locationStatus === "success" && !!currentLocation,
      cardinalPoints: !!cardinalPoints,
      users: !usersLoading && !!users?.length,
      equipments: !equipmentsLoading && !!equipmentsData,
      filteredEquipments: !!equipmentsData?.results?.length,
    };

    const isComplete = Object.values(newStatus).every((status) => status);

    setState({
      isLoading: !isComplete,
      status: newStatus,
      error: locationStatus === "error" ? "Erreur de localisation" : null,
    });
  }, [locationStatus, currentLocation, cardinalPoints, users, equipmentsData, equipmentsLoading, usersLoading]);

  return state;
};
