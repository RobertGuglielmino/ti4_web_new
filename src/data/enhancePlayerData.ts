import {
  PlayerDataResponse,
  TileUnitData,
  EnhancedPlayerData,
} from "./types";
import {
  calculateSingleTilePosition,
  calculateTilePositions,
} from "../mapgen/tilePositioning";
import { optimizeFactionColors, RGBColor } from "../utils/colorOptimization";
import { getColorValues } from "../lookup/colors";
import { colors } from "./colors";
import { tileAdjacencies } from "./tileAdjacencies";
import { getAllEntityPlacementsForTile } from "@/utils/unitPositioning";
import { MapTile, Planet } from "@/types/global";

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
  calculatedTilePositions.forEach((tile) => {
    const position = systemIdToPosition[tile.systemId];
    if (!position && data?.tileUnitData) return;

    const tileData: TileUnitData = (data.tileUnitData as any)[position];
    const allEntityPlacements = getAllEntityPlacementsForTile(
      tile.systemId,
      tileData
    );

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

    factionAdjacencyByTile[ringPosition] = adjacencies.map((tileCode) => {
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


  // Generate hexagon points for flat-top hexagon
  function generateHexagonPoints(cx: number, cy: number, radius: number) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = i * 60 * (Math.PI / 180); // Start at 0° for flat-top orientation
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }

  // Generate line segments for each side of the hexagon
  function generateHexagonSides(points: { x: number; y: number }[]) {
    const sides = [];
    for (let i = 0; i < 6; i++) {
      const nextI = (i + 1) % 6;
      sides.push({
        x1: points[i].x,
        y1: points[i].y,
        x2: points[nextI].x,
        y2: points[nextI].y,
      });
    }
    return sides;
  }

  function parseMapTiles(): MapTile[] {
    let mapTiles: MapTile[] = [];

    if (!data.tileUnitData) return [];
    Object.entries(data.tileUnitData).forEach(([position, tileData]) => {
      const coordinates = calculateSingleTilePosition(position, data.ringCount);

      // the id printed on the cardboard
      const [_, systemId] = data.tilePositions.filter(pos => pos.split(":")[0] === position).slice(-2);

      const radius = 172.5; // Width = 345px
      // const height = Math.sqrt(3) * radius; // ~298.7px
      const cx = coordinates.x + 172.5;
      const cy = coordinates.y + 149.5;
      const points = generateHexagonPoints(cx, cy, radius);

      let newMapTile: MapTile = {
        position: position,
        systemId: systemId, 
        planets: [],
        space: [],
        anomaly: tileData.anomaly,
        wormholes: [], //
        commandCounters: tileData.ccs,
        productionCapacity: 0, //
        tokens: [],
        controller: "",
        properties: {
          x: coordinates.x,
          y: coordinates.y,
          hexOutline: {
            points: points,
            sides: generateHexagonSides(points),
          },
          width: 0,
          height: 0,
        },
      };

      Object.entries(tileData.planets).forEach(
        ([planetName, planetData]: [string, any]) => {
          let newPlanet: Planet = {
            name: planetName,
            baseResources: 0,
            baseInfluence: 0,
            totalResources: 0,
            totalInfluence: 0,
            type: "",
            hasTechSpecialty: false,
            techSpecialty: "",
            attachments: [],
            tokens: [],
            units: [],
            controller: planetData.controlledBy,
            properties: {
              x: 0,
              y: 0,
            },
          };

          Object.entries(planetData.entities).forEach(([faction, entities]) => {
            entities.forEach((entity) => {
              if (entity.entityType === "unit") {
                newPlanet.units.push({
                  type: entity.entityType,
                  amount: entity.count,
                  amountSustained: entity.sustained ?? 0,
                  owner: faction,
                  color: "",
                });
              }

              if (entity.entityType === "attachment")
                newPlanet.attachments.push(entity.entityId);
            });
          });

          newMapTile.planets.push(newPlanet);
        }
      );

      Object.entries(tileData.space).forEach(
        ([faction, entities]: [string, any]) => {
          entities.forEach((entity) => {
            if (entity.entityType === "unit") {
              newMapTile.space.push({
                type: entity.entityType,
                amount: entity.count,
                amountSustained: entity.sustained ?? 0,
                owner: faction,
                color: "",
              });
            }

            if (entity.entityType === "token")
              newMapTile.tokens.push(entity.entityId);
          });
        }
      );

      const uniquePlanetFactions = [
        ...new Set(newMapTile.planets.map((planet) => planet.controller)),
      ];
      const uniqueFactions = [
        ...new Set(newMapTile.space.map((unit) => unit.owner)),
      ];

      // Check planets, then check space area, otherwise no one faction has control
      if (uniquePlanetFactions.length === 1) {
        newMapTile.controller = uniquePlanetFactions[0];
      } else if (uniqueFactions.length === 1) {
        newMapTile.controller = uniqueFactions[0];
      } else {
        newMapTile.controller = "";
      }

      mapTiles.push(newMapTile);
    });

    return mapTiles;
  }

  const planetAttachments: never[] = [];
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

  const mapTiles = parseMapTiles();


  return {
    ...data,
    mapTiles,
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
