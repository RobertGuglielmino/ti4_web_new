import { Box } from "@mantine/core";
import { PlanetDetailsCard } from "../PlayerArea/PlanetDetailsCard";
import { useSettingsStore, useStore } from "@/utils/dataManagement";

type TooltipPlanet = {
  systemId: string;
  planetId: string;
  coords: { x: number; y: number };
};

type Props = {
  tooltipPlanet: TooltipPlanet | null;
  planetAttachments: Record<string, string[]>;
};

export function MapPlanetDetailsCard({
  tooltipPlanet,
  planetAttachments,
}: Props) {
  if (!tooltipPlanet || !tooltipPlanet.planetId) return null;

  
  const zoom = useSettingsStore((state) => state.zoomLevel);
  const mapPadding = useStore((state) => state.mapPadding);

  const scaledX = tooltipPlanet.coords.x * zoom;
  const scaledY = tooltipPlanet.coords.y * zoom;

  const planetAttachmentIds = planetAttachments[tooltipPlanet.planetId] || [];

  return (
    <Box
      key="planet-tooltip"
      style={{
        position: "absolute",
        left: `${scaledX + mapPadding}px`,
        top: `${scaledY + mapPadding - 25}px`,
        zIndex: 10000000,
        pointerEvents: "none",
        transform: "translate(-50%, -100%)",
      }}
    >
      <PlanetDetailsCard
        planetId={tooltipPlanet.planetId}
        attachments={planetAttachmentIds}
      />
    </Box>
  );
}
