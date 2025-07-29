
// export function getAllTileData(data) {
//     if (!data.tileUnitData) return;
// }

//   if (data.tileUnitData) {
//     Object.values(data.tileUnitData).forEach((tileData: any) => {
//       if (tileData.planets) {
//         Object.entries(tileData.planets).forEach(
//           ([planetName, planetData]: [string, any]) => {
//             if (planetData.entities) {
//               const attachments: string[] = [];
//               Object.entries(planetData.entities).forEach(
//                 ([_faction, entities]) => {
//                   if (Array.isArray(entities)) {
//                     entities.forEach((entity: any) => {
//                       if (entity.entityType === "attachment") {
//                         attachments.push(entity.entityId);
//                       }
//                     });
//                   }
//                 }
//               );
//               if (attachments.length > 0) {
//                 planetAttachments[planetName] = attachments;
//               }
//             }
//           }
//         );
//       }
//     });
//   }






// type MapStore = {
//   mapTiles: Record<number, MapTile>,
//   mapTileIds: number[],
//   getMapTile: (id: number) => MapTile,
//   addMapTile: (newMapTile: MapTile) => void,
//   updateMapTile: (id: number, updates: Partial<MapTile>) => void
// }

// export const useMapStore = create<MapStore>((set, get) => ({

//   mapTiles: {},
//   mapTileIds: [],

//   getMapTile: (id: number) => get().mapTiles[id],
//   addMapTile: (newMapTile: MapTile) => set((state: { mapTiles: any; mapTileIds: any }) => ({
//     mapTiles: {
//       ...state.mapTiles,
//       [newMapTile.position]: newMapTile
//     },
//     mapTileIds: [...state.mapTileIds, newMapTile.position]
//   })),
//   updateMapTile: (id: number, updates: any) => set((state) => ({
//     mapTiles: {
//       ...state.mapTiles,
//       [id]: { ...state.mapTiles[id], ...updates }
//     }
//   })),
// }))




// type ObjectiveStore = {
//   factions: string[],
//   active: string,
//   nextUp: string,
//   strategyCards: string[],
//   cardPool: {
//     action: number,
//     agenda: number,
//     secret: number,
//     relic: number,
//     cultural: number,
//     industrial: number, 
//     hazardous: number,

//   }
//   objectives: Record<number, Objective>,
//   objectiveIds: number[],
//   getMapTile: (id: number) => MapTile,
//   addMapTile: (newMapTile: MapTile) => void,
//   updateMapTile: (id: number, updates: Partial<MapTile>) => void
// }

// export const useSettingsStore = create((set, get) => ({

//   leftSidebarVisible: false,
//   rightSidebarVisible: false,
//   zoomLevel: 100, 
//   showTechLayer: false,
//   showPDSLayer: false,
//   showControlLayer: false,
//   showControlTokens: false,
//   showExhaustedPlanets: false,

//   getMapTile: (id: number) => get().mapTiles[id],
//   addMapTile: (newMapTile: MapTile) => set((state: { mapTiles: any; mapTileIds: any }) => ({
//     mapTiles: {
//       ...state.mapTiles,
//       [newMapTile.id]: newMapTile
//     },
//     mapTileIds: [...state.mapTileIds, newMapTile.id]
//   })),
//   updateMapTile: (id: number, updates: any) => set((state) => ({
//     mapTiles: {
//       ...state.mapTiles,
//       [id]: { ...state.mapTiles[id], ...updates }
//     }
//   })),
// }))

