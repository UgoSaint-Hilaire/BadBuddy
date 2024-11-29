export interface LoadingState {
  isLoading: boolean;
  status: {
    location: boolean;
    cardinalPoints: boolean;
    users: boolean;
    equipments: boolean;
    filteredEquipments: boolean;
  };
  error: string | null;
}
