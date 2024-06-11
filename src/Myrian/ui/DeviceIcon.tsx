import React from "react";
import { Device, DeviceType } from "@nsdefs";

import { BusIcon } from "./BusIcon";
import { ReducerIcon } from "./Reducer";
import { LockIcon } from "./LockIcon";
import { CacheIcon } from "./CacheIcon";
import { BatteryIcon } from "./BatteryIcon";
import { OSocketIcon } from "./OSocketIcon";
import { ISocketIcon } from "./ISocketIcon";

interface IDeviceIconProps {
  device: Device;
}

export const DeviceIcon = ({ device }: IDeviceIconProps): React.ReactElement => {
  switch (device.type) {
    case DeviceType.ISocket:
      return <ISocketIcon socket={device} />;
    case DeviceType.OSocket:
      return <OSocketIcon socket={device} />;
    case DeviceType.Bus:
      return <BusIcon bus={device} />;
    case DeviceType.Reducer:
      return <ReducerIcon reducer={device} />;
    case DeviceType.Lock:
      return <LockIcon lock={device} />;
    case DeviceType.Cache:
      return <CacheIcon cache={device} />;
    case DeviceType.Battery:
      return <BatteryIcon battery={device} />;
  }
};
