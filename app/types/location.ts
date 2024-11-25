// types/sportsFacilities.types.ts

// Interface pour les coordonnées géographiques
interface Coordinates {
  lon: number;
  lat: number;
}

// Interface pour les résultats individuels
interface SportsFacility {
  inst_numero: string;
  inst_nom: string;
  inst_adresse: string;
  inst_cp: string;
  inst_com_code: string;
  inst_com_nom: string;
  new_code: string;
  new_name: string;
  inst_actif: string;
  inst_etat: string;
  inst_date_creation: string;
  inst_date_etat: string;
  inst_date_valid: string;
  inst_acc_handi_bool: string;
  inst_enqu_date: string;
  inst_obs: null | string;
  inst_trans_bool: string;
  inst_part_bool: string;
  inst_part_type: null | string;
  inst_part_type_filter: null | string;
  inst_acc_handi_type: string; // Format: "["Handicap moteur"]"
  inst_trans_type: null | string;
  inst_siret: null | string;
  inst_uai: null | string;
  inst_hs_bool: null | string;
  equip_numero: string;
  equip_nom: string;
  equip_type_code: string;
  equip_type_name: string;
  equip_type_famille: string;
  coordonnees: Coordinates;
  equip_etat: string;
  equip_x: number;
  equip_y: number;
  equip_eclair: string;
  equip_acc_libre: string;
  equip_conf_bool: string;
  equip_ouv_public_bool: string;
  equip_loc_bool: string;
  equip_saison: string;
  equip_douche: string;
  equip_sanit: string;
  equip_dsp: string;
  equip_pmr_acc: string;
  equip_pmr_aire: string;
  equip_pmr_chem: string;
  equip_pmr_douche: null | string;
  equip_pmr_sanit: string;
  equip_pmr_trib: null | string;
  equip_pmr_vest: string;
  equip_pshs_aire: string;
  equip_pshs_chem: string;
  equip_pshs_sanit: string;
  equip_pshs_sign: string;
  equip_pshs_trib: null | string;
  equip_pshs_vest: string;
  equip_homo_date: null | string;
  equip_travaux_date: null | string;
  equip_erp_cat: null | string;
  equip_haut: number;
  equip_larg: number;
  equip_long: number;
  equip_surf: string;
  equip_piste_nb: number;
  equip_trib_nb: number;
  equip_vest_ens: number;
  equip_vest_sport: number;
  equip_sae_couloir: null | string;
  equip_sae_haut: null | string;
  equip_sae_surf: null | string;
  equip_bassin_long: null | string;
  equip_bassin_larg: null | string;
  equip_bassin_surf: null | string;
  equip_bassin_min: null | string;
  equip_bassin_max: null | string;
  equip_piste_long: null | string;
  equip_url: null | string;
  equip_service_date: null | string;
  equip_prop_nom: null | string;
  equip_obs: null | string;
  equip_conf_type: null | string;
  equip_erp_type: null | string;
  equip_loc_type: string; // Format: "["Local de rangement"]"
  equip_travaux_type: null | string;
  equip_energie: null | string;
  equip_utilisateur: string; // Format: "["Clubs sportifs, comités, ligues, fédérations", "Autre - association(s) et groupes divers"]"
  equip_pasdetir: null | string;
  equip_sol: string;
  equip_nature: string;
  equip_service_periode: string;
  equip_homo_periode: null | string;
  equip_travaux_periode: null | string;
  equip_prop_type: string;
  equip_propsec_type: null | string;
  equip_gest_type: string;
  equip_cogest_type: null | string;
  equip_pdesi_pdipr: null | string;
  equip_rnb: null | string;
  equip_aps_code: string; // Format: "["2901"]"
  equip_aps_nom: string[]; // Format: ["Football / Football en salle (Futsal)"]
  equip_aps_json: string; // Format: JSON string contenant des détails d'activité
  epci_code: string;
  epci_nom: string;
  code_bdv: string;
  lib_bdv: string;
  arr_code: string;
  arr_name: string;
  dep_code: string;
  dep_code_filled: string;
  dep_nom: string;
  aca_nom: string;
  reg_code: string;
  reg_nom: string;
  dens_niveau: number;
  dens_lib: string;
  zrr_simp: string;
  categorie: string;
}

// Interface pour la réponse complète de l'API
interface SportsFacilitiesResponse {
  total_count: number;
  results: SportsFacility[];
}

// Export des types
export type { Coordinates, SportsFacility, SportsFacilitiesResponse };
