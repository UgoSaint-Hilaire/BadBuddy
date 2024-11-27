import { FlatList } from "react-native";
import { Text, View } from "@/components/Themed";

type LocationResult = {
  inst_nom: string;
  inst_adresse: string;
};

type LocationResultsProps = {
  isSuccess: boolean;
  isLoading: boolean;
  data: {
    total_count: number;
    results: LocationResult[];
  };
};

export const LocationResults: React.FC<LocationResultsProps> = ({
  isSuccess,
  isLoading,
  data,
}) => {
  if (!isSuccess) return null;

  return (
    <View>
      <Text style={{ fontWeight: "500", textAlign: "center" }}>
        Nombre de résultats : {data.total_count}
      </Text>
      <FlatList
        data={data.results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={{ textAlign: "center" }}>
            {item.inst_nom}
            {"\n"}
            {item.inst_adresse}
          </Text>
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshing={isLoading}
        onRefresh={() => {}}
      />
    </View>
  );
};
