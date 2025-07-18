import { Box, Text, Group } from "@mantine/core";
import { Shimmer } from "../Shimmer";
import { getGradientClasses } from "../gradientClasses";
import { CircularFactionIcon } from "../../shared/CircularFactionIcon";
import { PlayerData } from "../../../data/types";
import styles from "./CompactObjective.module.css";

type Props = {
  objectiveKey: string;
  name: string;
  pointValue: number;
  color: "orange" | "blue" | "gray";
  revealed?: boolean;
  onClick?: () => void;
  scoredFactions?: string[];
  playerData?: PlayerData[];
  multiScoring?: boolean;
};

export function CompactObjective({
  name,
  pointValue,
  color,
  revealed = true,
  onClick,
  scoredFactions = [],
  playerData = [],
  multiScoring = false,
}: Props) {
  const gradientClasses = getGradientClasses(color);
  const isClickable = revealed && color !== "gray";

  const renderFactionIcons = () => {
    if (!revealed || !playerData || playerData.length === 0) return null;

    if (multiScoring) {
      // For multiscoring objectives, show only the scored factions
      return (
        <Group gap={2} className={styles.factionIcons}>
          {scoredFactions.map((faction, index) => (
            <CircularFactionIcon
              key={`${faction}-${index}`}
              faction={faction}
              size={20}
            />
          ))}
        </Group>
      );
    } else {
      // For non-multiscoring objectives, show consistent slots for all factions
      // Sort faction names alphabetically for consistent ordering
      const sortedFactions = [...playerData]
        .sort((a, b) => a.faction.localeCompare(b.faction))
        .map((p) => p.faction);

      return (
        <Group gap={2} className={styles.factionIcons}>
          {sortedFactions.map((faction) => {
            const hasScored = scoredFactions.includes(faction);
            return (
              <Box
                key={faction}
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {hasScored ? (
                  <CircularFactionIcon faction={faction} size={20} />
                ) : (
                  // Empty slot placeholder
                  <Box
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Group>
      );
    }
  };

  return (
    <Box
      className={`${styles.objectiveCard} ${styles[color]} ${!revealed ? styles.unrevealed : ""} ${color === "gray" ? styles.nonClickable : ""}`}
      onClick={isClickable ? onClick : undefined}
    >
      <Shimmer color={color} py={2} px={6} className={gradientClasses.border}>
        <Box className={styles.contentContainer}>
          <Text size="xs" fw={700} c="white" className={styles.textContainer}>
            <Text
              span
              size="xs"
              fw={600}
              c={`${color}.4`}
              className={styles.scoreText}
            >
              ({pointValue}){" "}
            </Text>
            {revealed ? name : "UNREVEALED"}
          </Text>

          {renderFactionIcons()}
        </Box>
      </Shimmer>
    </Box>
  );
}
