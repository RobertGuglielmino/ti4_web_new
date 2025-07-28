import {
  PlayerDataResponse,
  PlayerData,
  Objectives,
  LawInPlay,
  StrategyCard,
  CardPoolData,
  TileUnitData,
} from "./types";
import {
  calculateTilePositions,
  TilePosition,
} from "../mapgen/tilePositioning";
import { optimizeFactionColors, RGBColor } from "../utils/colorOptimization";
import { getColorValues } from "../lookup/colors";
import { colors } from "./colors";
import { tileAdjacencies } from "./tileAdjacencies";
import { getAllEntityPlacementsForTile } from "@/utils/unitPositioning";

export type EnhancedPlayerData = {
  playerData: PlayerData[];
  tileUnitData: Record<string, any>;
  tilePositions: string[];
  statTilePositions: Record<string, string[]>;
  calculatedTilePositions: TilePosition[];
  systemIdToPosition: Record<string, string>;
  factionToColor: Record<string, string>;
  factionControlByTile: Record<string, string>,
  factionAdjacencyByTile: Record<string, (string | null)[]>,
  colorToFaction: Record<string, string>;
  optimizedColors: Record<string, RGBColor>;
  planetAttachments: Record<string, string[]>;
  allExhaustedPlanets: string[];
  objectives: Objectives;
  lawsInPlay: LawInPlay[];
  strategyCards: StrategyCard[];
  vpsToWin: number;
  cardPool: CardPoolData;
  versionSchema?: number;
  ringCount: number;
  gameRound: number;
  gameName: string;
  gameCustomName?: string;
};

export function enhancePlayerData(
  data: PlayerDataResponse
): EnhancedPlayerData {
  const calculatedTilePositions = data.tilePositions
    ? calculateTilePositions(data.tilePositions, data.ringCount)
    : [];

  const systemIdToPosition: Record<string, string> = {};
  if (data.tilePositions) {
    data.tilePositions.forEach((entry: string) => {
      const [position, systemId] = entry.split(":");
      systemIdToPosition[systemId] = position;
    });
  }

  /*
    factionControlByTile: {"101": "Yin",}
    factionAdjacencyByTile: {"101": ["Yin", "None", "Xxcha", null, null, null]}
  */
 
  // {calculatedTilePositions.map((tile, index) => {
    

  const factionControlByTile: Record<string, string> = {};
  calculatedTilePositions.forEach(tile => {
    const position = systemIdToPosition[tile.systemId];
    if (!position && data?.tileUnitData) return;

    const tileData: TileUnitData = (data.tileUnitData as any)[position];
    const allEntityPlacements = getAllEntityPlacementsForTile(tile.systemId, tileData);
    
    // Check if all planets are controlled by the same faction
    if (tileData.planets) {
      const controllingFactions = Object.values(tileData.planets)
        .map((planet) => planet.controlledBy)
        .filter(Boolean);

      if (controllingFactions.length > 0) {
        const uniqueFactions = [...new Set(controllingFactions)];
        if (uniqueFactions.length === 1) {
          factionControlByTile[tile.ringPosition] = uniqueFactions[0];
          return;
        }
      }
    }

    // Check if there are units from a single faction (excluding command counters)
    const factionUnits = Object.values(allEntityPlacements)
      .filter((placement) => placement.entityType === "unit")
      .map((placement) => placement.faction);

    if (factionUnits.length > 0) {
      const uniqueFactionUnits = [...new Set(factionUnits)];
      if (uniqueFactionUnits.length === 1) {
        factionControlByTile[tile.ringPosition] = uniqueFactionUnits[0];
        return;
      }
    }
    
    factionControlByTile[tile.ringPosition] = "NONE";
  });
    

  const factionAdjacencyByTile: Record<string, (string | null)[]> = {};
  Object.entries(factionControlByTile).forEach(([ringPosition, _]) => {
    const adjacencies = tileAdjacencies[ringPosition];

    if (!adjacencies) return "";

    factionAdjacencyByTile[ringPosition] = adjacencies.map(tileCode => {
      if (!tileCode || !factionControlByTile[tileCode]) return null;
      
      return factionControlByTile[tileCode];
    });
  });
  // playerdataresponse.tileUnitData.val.space.name to color
  // tileAdjacencies[tile]foreach ,  adjTile[0] < ringCount && adjTile in tileUnitData 

  const factionToColor =
    data.playerData?.reduce(
      (acc, player) => {
        acc[player.faction] = player.color;
        return acc;
      },
      {} as Record<string, string>
    ) || {};

  const colorToFaction =
    data.playerData?.reduce(
      (acc, player) => {
        acc[player.color] = player.faction;
        return acc;
      },
      {} as Record<string, string>
    ) || {};

  const planetAttachments: Record<string, string[]> = {};
  if (data.tileUnitData) {
    Object.values(data.tileUnitData).forEach((tileData: any) => {
      if (tileData.planets) {
        Object.entries(tileData.planets).forEach(
          ([planetName, planetData]: [string, any]) => {
            if (planetData.entities) {
              const attachments: string[] = [];
              Object.entries(planetData.entities).forEach(
                ([_faction, entities]) => {
                  if (Array.isArray(entities)) {
                    entities.forEach((entity: any) => {
                      if (entity.entityType === "attachment") {
                        attachments.push(entity.entityId);
                      }
                    });
                  }
                }
              );
              if (attachments.length > 0) {
                planetAttachments[planetName] = attachments;
              }
            }
          }
        );
      }
    });
  }

  // Calculate optimized colors for faction overlays
  const optimizedColors: Record<string, RGBColor> = (() => {
    // Get unique colors that are actually in use by factions
    const colorsInUse = new Set(Object.values(factionToColor));

    // Transform only the colors that are actually being used
    const transformedColors = colors
      .filter((color) => colorsInUse.has(color.name))
      .map((color) => {
        // Use getColorValues to handle both primaryColor and primaryColorRef
        const primaryColorValues = getColorValues(
          (color as any).primaryColorRef,
          color.primaryColor
        );

        if (!primaryColorValues) return null;

        return {
          alias: color.name,
          primaryColor: primaryColorValues as RGBColor,
        };
      })
      .filter(
        (color): color is { alias: string; primaryColor: RGBColor } =>
          color !== null
      );

    return optimizeFactionColors(transformedColors);
  })();

  // Collect all exhausted planets from all players
  const allExhaustedPlanets: string[] = (() => {
    if (!data.playerData) return [];

    const exhaustedPlanetsSet = new Set<string>();
    data.playerData.forEach((player) => {
      if (player.exhaustedPlanets) {
        player.exhaustedPlanets.forEach((planetId) => {
          exhaustedPlanetsSet.add(planetId);
        });
      }
    });

    return Array.from(exhaustedPlanetsSet);
  })();

  return {
    ...data,
    // extra computed properties
    factionControlByTile,
    factionAdjacencyByTile,
    calculatedTilePositions,
    systemIdToPosition,
    factionToColor,
    colorToFaction,
    optimizedColors,
    planetAttachments,
    allExhaustedPlanets,
  };
}
