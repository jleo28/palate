export const STATION_ORDER = [
  "Grill",
  "Main Line",
  "Global Kitchen",
  "Plant Based",
  "Salad Bar",
  "Deli",
  "Breakfast Bar",
  "Fruit & Dairy",
];

export function stationRank(station: string): number {
  const i = STATION_ORDER.indexOf(station);
  return i === -1 ? STATION_ORDER.length : i;
}
