import { Box } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import classes from "./PanelToggleButton.module.css";
import { useSettingsStore } from "@/utils/dataManagement";

type PanelToggleButtonProps = {
  onClick: () => void;
  position: "left" | "right";
  style?: React.CSSProperties;
  className?: string;
};

export function PanelToggleButton({
  onClick,
  position,
  style,
  className,
}: PanelToggleButtonProps) {

  const leftSidebarVisible = useSettingsStore((state) => state.leftSidebarVisible);
  const rightSidebarVisible = useSettingsStore((state) => state.rightSidebarVisible);

  const getToggleIcon = () => {
    if (position === "left") {
      return !leftSidebarVisible ? (
        <IconChevronRight size={16} className={classes.toggleIcon} />
      ) : (
        <IconChevronLeft size={16} className={classes.toggleIcon} />
      );
    } else {
      return !rightSidebarVisible ? (
        <IconChevronLeft size={16} className={classes.toggleIcon} />
      ) : (
        <IconChevronRight size={16} className={classes.toggleIcon} />
      );
    }
  };

  const baseClass =
    position === "left" ? classes.leftPanelToggle : classes.rightPanelToggle;

  return (
    <Box
      className={`${baseClass} ${!rightSidebarVisible ? classes.collapsed : ""} ${className || ""}`}
      onClick={onClick}
      style={style}
    >
      {getToggleIcon()}
    </Box>
  );
}
