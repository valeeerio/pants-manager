export const STATUS_MAP: Record<string, string> = {
  TODO: "Da iniziare",
  IN_PROGRESS: "In lavorazione",
  WAITING_CUSTOMER: "In attesa cliente",
  COMPLETED: "Pronto",
  CANCELLED: "Annullato",
};

export const TYPE_MAP: Record<string, string> = {
  HEM: "Orlo pantalone",
  WAIST_TIGHTENING: "Stringere vita",
  LEG_SHORTENING: "Accorciare gamba",
  LEG_WIDENING: "Allargare pantalone",
  ZIP_REPLACEMENT: "Sostituzione zip",
  REPAIR: "Riparazione",
  CUSTOM: "Su misura",
  OTHER: "Altro",
};

export const MATERIAL_CATEGORY_MAP: Record<string, string> = {
  FABRIC: "Stoffa",
  ZIP: "Zip",
  THREAD: "Filo",
  ACCESSORY: "Accessorio",
  OTHER: "Altro",
};

export const MATERIAL_UNIT_MAP: Record<string, string> = {
  METER: "Metri",
  PIECE: "Pezzi",
  SPOOL: "Rocchetti",
  ROLL: "Rotoli",
  GRAM: "Grammi",
};
