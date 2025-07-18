import { Modal, Stack, Switch, Text, Divider } from "@mantine/core";
import { useSettings } from "../../context/SettingsContext";

type SettingsModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const {
    settings,
    toggleOverlays,
    toggleAlwaysShowControlTokens,
    toggleLeftPanelCollapsed,
    toggleRightPanelCollapsed,
    toggleShowExhaustedPlanets,
  } = useSettings();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Settings"
      size="md"
      centered
      zIndex={2000}
    >
      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb="xs">
            Map Display
          </Text>
          <Stack gap="sm">
            <Switch
              checked={settings.overlaysEnabled}
              onChange={toggleOverlays}
              size="sm"
              label="Show Overlays"
              description="Show ownership color overlays on the map"
            />
            <Switch
              checked={settings.alwaysShowControlTokens}
              onChange={toggleAlwaysShowControlTokens}
              size="sm"
              label="Always Show Control Tokens"
              description="When off, control tokens are only shown on planets with no units"
            />
            <Switch
              checked={settings.showExhaustedPlanets}
              onChange={toggleShowExhaustedPlanets}
              size="sm"
              label="Show Planets as Exhausted"
              description="When off, exhausted planets won't be greyed out on the map"
            />
          </Stack>
        </div>

        <Divider />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Interface
          </Text>
          <Stack gap="sm">
            <Switch
              checked={settings.isLeftPanelCollapsed}
              onChange={toggleLeftPanelCollapsed}
              size="sm"
              label="Collapse Left Panel"
              description="Hide the objectives and laws panel on the left side of the map"
            />
            <Switch
              checked={settings.isRightPanelCollapsed}
              onChange={toggleRightPanelCollapsed}
              size="sm"
              label="Collapse Right Panel"
              description="Hide the player cards panel on the right side of the map"
            />
          </Stack>
        </div>
      </Stack>
    </Modal>
  );
}
