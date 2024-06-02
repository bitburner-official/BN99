import React from "react";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { styled } from "@mui/system";
import { Dispenser, Entity, EntityType, Item } from "@nsdefs";

import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import OutboxIcon from "@mui/icons-material/Outbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { Tooltip, Typography } from "@mui/material";

export const cellSize = 48;

const defaultIconStyle = {
  width: cellSize + "px",
  height: cellSize + "px",
  color: "white",
};

const colorRed = "red";
const colorBlue = "#1E90FF";
const colorGreen = "#7CFC00";

const itemColorMap: Record<Item, string> = {
  [Item.BasicR]: colorRed,
  [Item.BasicB]: colorBlue,
  [Item.BasicG]: colorGreen,
  [Item.ComplexR]: colorRed,
  [Item.ComplexB]: colorBlue,
  [Item.ComplexG]: colorGreen,
};

const BotIcon = styled(SmartToyIcon)(defaultIconStyle);
const DispenserIcon = styled(OutboxIcon)((props: { dispenser: Dispenser; col: string }) => ({
  ...defaultIconStyle,
  color: new Date().getTime() > props.dispenser.cooldownUntil ? props.col : "gray",
}));

const DockIcon = styled(MoveToInboxIcon)({
  ...defaultIconStyle,
});

const CrafterIcon = styled(PrecisionManufacturingIcon)({
  ...defaultIconStyle,
});

const ChestIcon = styled(CheckBoxOutlineBlankIcon)({
  ...defaultIconStyle,
});

interface ITooltipContentProps {
  entity: Entity;
  content: React.ReactElement;
}
const TooltipContent = ({ entity, content }: ITooltipContentProps): React.ReactElement => {
  return (
    <>
      <Typography>{entity.type}</Typography>
      {content}
    </>
  );
};

const TooltipInventory = ({ entity }: { entity: Entity }): React.ReactElement => {
  return (
    <Typography component="span">
      {entity.inventory.map((item) => (
        <span key={item} style={{ color: itemColorMap[item] }}>
          {item}
        </span>
      ))}
    </Typography>
  );
};

export const EntityIcon = ({ entity }: { entity: Entity }): React.ReactElement => {
  switch (entity.type) {
    case EntityType.Chest: {
      return (
        <Tooltip title={<TooltipContent entity={entity} content={<TooltipInventory entity={entity} />} />}>
          <ChestIcon />
        </Tooltip>
      );
    }
    case EntityType.Bot: {
      return (
        <Tooltip
          title={
            <Typography>
              {entity.name}
              <br /> <TooltipInventory entity={entity} />
            </Typography>
          }
        >
          <BotIcon />
        </Tooltip>
      );
    }
    case EntityType.Dispenser: {
      return (
        <Tooltip
          title={
            <>
              <TooltipContent entity={entity} content={<Typography>{`dispensing: ${entity.dispensing}`}</Typography>} />
              <TooltipInventory entity={entity} />
            </>
          }
        >
          <DispenserIcon dispenser={entity} col={itemColorMap[entity.dispensing]} />
        </Tooltip>
      );
      break;
    }
    case EntityType.Dock: {
      return (
        <Tooltip
          title={
            <TooltipContent
              entity={entity}
              content={<Typography>{`requesting: ${entity.currentRequest}`}</Typography>}
            />
          }
        >
          <DockIcon sx={{ color: itemColorMap[entity.currentRequest[0] ?? Item.BasicR] }} />
        </Tooltip>
      );
    }
    case EntityType.Crafter: {
      return (
        <Tooltip
          title={
            <TooltipContent
              entity={entity}
              content={
                <>
                  <Typography>{`input: ${entity.recipe.input}, output: ${entity.recipe.output}`}</Typography>
                  <TooltipInventory entity={entity} />
                </>
              }
            />
          }
        >
          <CrafterIcon />
        </Tooltip>
      );
      break;
    }
  }
  return <></>;
};
