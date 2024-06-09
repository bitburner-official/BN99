import React from "react";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { styled } from "@mui/system";
import { ISocket, Device, DeviceType, Component } from "@nsdefs";

import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import OutboxIcon from "@mui/icons-material/Outbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import BlockIcon from "@mui/icons-material/Block";
import { Tooltip, Typography } from "@mui/material";
import { isDeviceContainer } from "../Myrian";

export const cellSize = 48;

const defaultIconStyle = {
  width: cellSize + "px",
  height: cellSize + "px",
  color: "white",
};

const ColorR = "red";
const ColorG = "#7CFC00";
const ColorB = "#1E90FF";
const ColorY = "yellow";
const ColorC = "cyan";
const ColorM = "magenta";
const ColorW = "whte";

const itemColorMap: Record<Component, string> = {
  // tier 0
  [Component.R0]: ColorR,
  [Component.G0]: ColorG,
  [Component.B0]: ColorB,

  // tier 1
  [Component.R1]: ColorR,
  [Component.G1]: ColorG,
  [Component.B1]: ColorB,

  [Component.Y1]: ColorY,
  [Component.C1]: ColorC,
  [Component.M1]: ColorM,

  // tier 2
  [Component.R2]: ColorR,
  [Component.G2]: ColorG,
  [Component.B2]: ColorB,

  [Component.Y2]: ColorY,
  [Component.C2]: ColorC,
  [Component.M2]: ColorM,

  [Component.W2]: ColorW,

  // tier 3
  [Component.R3]: ColorR,
  [Component.G3]: ColorG,
  [Component.B3]: ColorB,

  [Component.Y3]: ColorY,
  [Component.C3]: ColorC,
  [Component.M3]: ColorM,

  [Component.W3]: ColorW,

  // tier 4
  [Component.R4]: ColorR,
  [Component.G4]: ColorG,
  [Component.B4]: ColorB,

  [Component.Y4]: ColorY,
  [Component.C4]: ColorC,
  [Component.M4]: ColorM,

  [Component.W4]: ColorW,

  // tier 5
  [Component.R5]: ColorR,
  [Component.G5]: ColorG,
  [Component.B5]: ColorB,

  [Component.Y5]: ColorY,
  [Component.C5]: ColorC,
  [Component.M5]: ColorM,

  [Component.W5]: ColorW,

  // tier 6
  [Component.Y6]: ColorY,
  [Component.C6]: ColorC,
  [Component.M6]: ColorM,

  [Component.W6]: ColorW,

  // tier 7
  [Component.W7]: ColorW,
};

const LockIcon = styled(BlockIcon)(defaultIconStyle);
const BusIcon = styled(DirectionsBusIcon)(defaultIconStyle);
const ISocketIcon = styled(OutboxIcon)((props: { dispenser: ISocket; col: string }) => ({
  ...defaultIconStyle,
  color: new Date().getTime() > props.dispenser.cooldownUntil ? props.col : "gray",
}));

const OSocketIcon = styled(MoveToInboxIcon)(defaultIconStyle);

const ReducerIcon = styled(MergeTypeIcon)(defaultIconStyle);

const CacheIcon = styled(CheckBoxOutlineBlankIcon)(defaultIconStyle);

interface ITooltipContentProps {
  device: Device;
  content: React.ReactElement;
}
const TooltipContent = ({ device, content }: ITooltipContentProps): React.ReactElement => {
  return (
    <>
      <Typography>
        {device.name} ({device.type})
      </Typography>
      {content}
    </>
  );
};

const TooltipInventory = ({ device }: { device: Device }): React.ReactElement => {
  if (!isDeviceContainer(device)) return <></>;
  return (
    <Typography component="span">
      {device.content.map((item) => (
        <span key={item} style={{ color: itemColorMap[item] }}>
          {item}
        </span>
      ))}
    </Typography>
  );
};

export const DeviceIcon = ({ device }: { device: Device }): React.ReactElement => {
  switch (device.type) {
    case DeviceType.Lock: {
      return <LockIcon />;
    }
    case DeviceType.Cache: {
      return (
        <Tooltip title={<TooltipContent device={device} content={<TooltipInventory device={device} />} />}>
          <CacheIcon />
        </Tooltip>
      );
    }
    case DeviceType.Bus: {
      return (
        <Tooltip
          title={
            <Typography>
              {device.name}
              <br /> <TooltipInventory device={device} />
            </Typography>
          }
        >
          <BusIcon />
        </Tooltip>
      );
    }
    case DeviceType.ISocket: {
      return (
        <Tooltip
          title={
            <>
              <TooltipContent device={device} content={<Typography>{`dispensing: ${device.emitting}`}</Typography>} />
              <TooltipInventory device={device} />
            </>
          }
        >
          <ISocketIcon dispenser={device} col={itemColorMap[device.emitting]} />
        </Tooltip>
      );
      break;
    }
    case DeviceType.OSocket: {
      return (
        <Tooltip
          title={
            <TooltipContent
              device={device}
              content={<Typography>{`requesting: ${device.currentRequest}`}</Typography>}
            />
          }
        >
          <OSocketIcon sx={{ color: itemColorMap[device.currentRequest[0] ?? Component.R0] }} />
        </Tooltip>
      );
    }
    case DeviceType.Reducer: {
      return (
        <Tooltip
          title={
            <TooltipContent
              device={device}
              content={
                <>
                  <Typography>Tier: {device.tier}</Typography>
                  <TooltipInventory device={device} />
                </>
              }
            />
          }
        >
          <ReducerIcon />
        </Tooltip>
      );
      break;
    }
  }
  return <></>;
};
