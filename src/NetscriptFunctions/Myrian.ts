import { Bus, Myrian as IMyrian, DeviceType, Component, Reducer } from "@nsdefs";
import { InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import {
  NewBus,
  NewCache,
  NewISocket,
  NewLock,
  NewOSocket,
  NewReducer,
  myrian as myrian,
  myrianSize,
  resetMyrian,
} from "../Myrian/Helper";
import {
  adjacent,
  adjacentCoord2D,
  vulnsMap,
  findDevice,
  inMyrianBounds,
  inventoryMatches,
  isDeviceContainer,
  isDeviceBus,
  removeDevice,
} from "../Myrian/Myrian";
import {
  deviceCost,
  emissionCost,
  getNextISocketRequest,
  installLvlCost,
  installSpeed,
  isocketSpeed,
  moveLvlCost,
  moveSpeed,
  reduceLvlCost,
  reduceSpeed,
  tierCost,
  transferLvlCost,
  transferSpeed,
  upgradeMaxContentCost,
} from "../Myrian/formulas/formulas";
import { recipes } from "../Myrian/formulas/recipes";
import { componentTiers } from "../Myrian/formulas/components";

export function NetscriptMyrian(): InternalAPI<IMyrian> {
  return {
    DEUBG_RESET: () => resetMyrian,
    DEBUG_GIVE_VULNS: (ctx) => (_amount) => {
      const amount = helpers.number(ctx, "amount", _amount);
      myrian.vulns += amount;
    },
    getDevice: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "id", _id);
      const device = findDevice(id);
      if (!device) return;
      return JSON.parse(JSON.stringify(device));
    },
    getDevices: (__ctx) => () => JSON.parse(JSON.stringify(myrian.devices)),
    getVulns: () => () => myrian.vulns,
    moveBus:
      (ctx) =>
      async (_bus, _coord): Promise<boolean> => {
        const busID = helpers.string(ctx, "bus", _bus);
        const [x, y] = helpers.coord2d(ctx, "coord", _coord);

        const bus = findDevice(busID, DeviceType.Bus) as Bus;
        if (!bus) {
          helpers.log(ctx, () => `bus does not exist`);
          return Promise.resolve(false);
        }

        if (!adjacentCoord2D(bus, [x, y])) {
          helpers.log(ctx, () => `bus ${busID} is not adjacent to [${x}, ${y}]`);
          return Promise.resolve(false);
        }
        if (!inMyrianBounds(x, y)) {
          helpers.log(ctx, () => `[${x}, ${y}] is out of bounds`);
          return Promise.resolve(false);
        }

        if (findDevice([x, y])) {
          helpers.log(ctx, () => `[${x}, ${y}] is occupied`);
          return Promise.resolve(false);
        }

        if (bus.isBusy) {
          helpers.log(ctx, () => `bus ${busID} is busy`);
          return Promise.resolve(false);
        }

        bus.isBusy = true;
        return helpers
          .netscriptDelay(ctx, moveSpeed(bus.moveLvl), true)
          .then(() => {
            bus.isBusy = false;
            if (findDevice([x, y])) {
              helpers.log(ctx, () => `[${x}, ${y}] is occupied`);
              return Promise.resolve(false);
            }
            bus.x = x;
            bus.y = y;
            return Promise.resolve(true);
          })
          .finally(() => {
            bus.isBusy = false;
          });
      },
    transfer:
      (ctx) =>
      async (_from, _to, _input, _output): Promise<boolean> => {
        const fromID = helpers.deviceID(ctx, "from", _from);
        const toID = helpers.deviceID(ctx, "to", _to);
        const input = _input as Component[];
        const output = (_output ?? []) as Component[];

        const fromDevice = findDevice(fromID);
        if (!fromDevice) {
          helpers.log(ctx, () => `device ${fromID} not found`);
          return Promise.resolve(false);
        }

        if (!isDeviceContainer(fromDevice)) {
          helpers.log(ctx, () => `device ${fromID} is not a container`);
          return Promise.resolve(false);
        }

        const toDevice = findDevice(toID);
        if (!toDevice) {
          helpers.log(ctx, () => `device ${toID} not found`);
          return Promise.resolve(false);
        }

        if (!isDeviceContainer(toDevice)) {
          helpers.log(ctx, () => `device ${toID} is not a container`);
          return Promise.resolve(false);
        }

        if (!adjacent(fromDevice, toDevice)) {
          helpers.log(ctx, () => "entities are not adjacent");
          return Promise.resolve(false);
        }

        if (!isDeviceBus(fromDevice) && !isDeviceBus(toDevice)) {
          helpers.log(ctx, () => "neither device is a bus");
          return Promise.resolve(false);
        }

        const fromFinalSize = fromDevice.content.length - input.length + output.length;
        const toFinalSize = toDevice.content.length - output.length + input.length;
        if (fromFinalSize > fromDevice.maxContent || toFinalSize > toDevice.maxContent) {
          helpers.log(ctx, () => "not enough space in one of the containers");
          return Promise.resolve(false);
        }

        const fromHas = input.every((item) => fromDevice.content.includes(item));
        const toHas = output.every((item) => toDevice.content.includes(item));
        if (!fromHas || !toHas) {
          helpers.log(ctx, () => "one of the entities does not have the items");
          return Promise.resolve(false);
        }

        if (fromDevice.isBusy || toDevice.isBusy) {
          helpers.log(ctx, () => "one of the entities is busy");
          return Promise.resolve(false);
        }

        const bus = [fromDevice, toDevice].find((e) => e.type === DeviceType.Bus) as Bus;
        const container = [fromDevice, toDevice].find((e) => e.type !== DeviceType.Bus)!;
        fromDevice.isBusy = true;
        toDevice.isBusy = true;

        return helpers
          .netscriptDelay(ctx, transferSpeed(bus.transferLvl), true)
          .then(() => {
            toDevice.content = toDevice.content.filter((item) => !output.includes(item));
            toDevice.content.push(...input);

            fromDevice.content = fromDevice.content.filter((item) => !input.includes(item));
            fromDevice.content.push(...output);

            switch (container.type) {
              case DeviceType.ISocket: {
                const cooldown = isocketSpeed(container.emissionLvl);
                container.cooldownUntil = Date.now() + cooldown;
                setTimeout(() => {
                  container.content = new Array(container.maxContent).fill(container.emitting);
                }, cooldown);
                break;
              }

              case DeviceType.OSocket: {
                if (inventoryMatches(container.currentRequest, container.content)) {
                  const gain = container.content.map((i) => vulnsMap[i]).reduce((a, b) => a + b, 0);
                  myrian.vulns += gain;
                  myrian.totalVulns += gain;
                  container.content = [];
                  const request = getNextISocketRequest(container.tier);
                  container.currentRequest = request;
                  container.maxContent = request.length;
                }
                break;
              }
            }
            return Promise.resolve(true);
          })
          .finally(() => {
            fromDevice.isBusy = false;
            toDevice.isBusy = false;
          });
      },
    reduce:
      (ctx) =>
      async (_busID, _reducerID): Promise<boolean> => {
        const busID = helpers.deviceID(ctx, "bus", _busID);
        const reducerID = helpers.deviceID(ctx, "reducer", _reducerID);

        const bus = findDevice(busID, DeviceType.Bus) as Bus;
        if (!bus) {
          helpers.log(ctx, () => `bus ${busID} not found`);
          return Promise.resolve(false);
        }

        const reducer = findDevice(reducerID, DeviceType.Reducer) as Reducer;
        if (!reducer) {
          helpers.log(ctx, () => `reducer ${reducerID} not found`);
          return Promise.resolve(false);
        }

        if (!adjacent(bus, reducer)) {
          helpers.log(ctx, () => "entites are not adjacent");
          return Promise.resolve(false);
        }

        const recipe = recipes[reducer.tier].find((r) => inventoryMatches(r.input, reducer.content));

        if (!recipe) {
          helpers.log(ctx, () => "reducer content matches no recipe");
          return Promise.resolve(false);
        }

        if (bus.isBusy || reducer.isBusy) {
          helpers.log(ctx, () => "bus or reducer is busy");
          return Promise.resolve(false);
        }

        bus.isBusy = true;
        reducer.isBusy = true;
        return helpers
          .netscriptDelay(ctx, reduceSpeed(bus.reduceLvl), true)
          .then(() => {
            reducer.content = [recipe.output];
            return Promise.resolve(true);
          })
          .finally(() => {
            bus.isBusy = false;
            reducer.isBusy = false;
          });
      },
    upgradeMaxContent: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "id", _id);
      const container = findDevice(id);
      if (!container) {
        helpers.log(ctx, () => `device ${id} not found`);
        return false;
      }

      if (!isDeviceContainer(container)) {
        helpers.log(ctx, () => `device ${id} is not a container`);
        return false;
      }

      const cost = upgradeMaxContentCost(container.type, container.maxContent);
      if (myrian.vulns < cost) {
        helpers.log(ctx, () => `not enough vulns to upgrade container`);
        return false;
      }

      myrian.vulns -= cost;
      container.maxContent++;

      return true;
    },

    getUpgradeMaxContentCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "id", _id);
      const container = findDevice(id);
      if (!container) {
        helpers.log(ctx, () => `container ${id} not found`);
        return -1;
      }

      if (!isDeviceContainer(container)) {
        helpers.log(ctx, () => `device ${id} is not a container`);
        return -1;
      }

      return upgradeMaxContentCost(container.type, container.maxContent);
    },

    getDeviceCost: (ctx) => (_type) => {
      const type = helpers.string(ctx, "type", _type);
      return deviceCost(type as DeviceType);
    },

    installDevice: (ctx) => async (_bus, _name, _coord, _deviceType) => {
      const busID = helpers.deviceID(ctx, "bus", _bus);
      const name = helpers.string(ctx, "name", _name);
      const [x, y] = helpers.coord2d(ctx, "coord", _coord);
      const deviceType = helpers.string(ctx, "deviceType", _deviceType) as DeviceType;

      const bus = findDevice(busID, DeviceType.Bus) as Bus;
      if (!bus) {
        helpers.log(ctx, () => `bus ${busID} not found`);
        return Promise.resolve(false);
      }

      if (findDevice(name)) {
        helpers.log(ctx, () => `device ${name} already exists`);
        return Promise.resolve(false);
      }

      const placedDevice = findDevice([x, y]);
      if (placedDevice) {
        helpers.log(ctx, () => `location [${x}, ${y}] is occupied`);
        return Promise.resolve(false);
      }

      if (bus.isBusy) {
        helpers.log(ctx, () => `bus ${busID} is busy`);
        return Promise.resolve(false);
      }

      const cost = deviceCost(deviceType);
      if (myrian.vulns < cost) {
        helpers.log(ctx, () => `not enough vulns to install device`);
        return Promise.resolve(false);
      }

      myrian.vulns -= cost;

      if (deviceType === DeviceType.ISocket && y !== 0) {
        helpers.log(ctx, () => `ISocket must be placed on the top row`);
        return Promise.resolve(false);
      }

      if (deviceType === DeviceType.OSocket && y !== myrianSize - 1) {
        helpers.log(ctx, () => `OSocket must be placed on the bottom row`);
        return Promise.resolve(false);
      }

      bus.isBusy = true;
      const lockName = `lock-${busID}`;
      const lock = NewLock(lockName, x, y);
      lock.isBusy = true;
      return helpers
        .netscriptDelay(ctx, installSpeed(bus.installLvl), true)
        .then(() => {
          bus.isBusy = false;
          removeDevice(lockName);
          switch (deviceType) {
            case DeviceType.Bus: {
              NewBus(name, x, y);
              break;
            }
            case DeviceType.ISocket: {
              NewISocket(name, x, y, componentTiers[0][Math.floor(Math.random() * componentTiers[0].length)]);
              break;
            }
            case DeviceType.OSocket: {
              NewOSocket(name, x, y);
              break;
            }
            case DeviceType.Reducer: {
              NewReducer(name, x, y);
              break;
            }
            case DeviceType.Cache: {
              NewCache(name, x, y);
            }
          }
          return Promise.resolve(true);
        })
        .finally(() => {
          bus.isBusy = false;
        });
    },
    uninstallDevice: (ctx) => async (_bus, _coord) => {
      const busID = helpers.string(ctx, "bus", _bus);
      const [x, y] = helpers.coord2d(ctx, "coord", _coord);

      const bus = findDevice(busID, DeviceType.Bus) as Bus;
      if (!bus) {
        helpers.log(ctx, () => `bus ${busID} not found`);
        return Promise.resolve(false);
      }

      const placedDevice = findDevice([x, y]);
      if (!placedDevice) {
        helpers.log(ctx, () => `location [${x}, ${y}] is empty`);
        return Promise.resolve(false);
      }

      if (bus.isBusy || placedDevice.isBusy) {
        helpers.log(ctx, () => `bus or device is busy`);
        return Promise.resolve(false);
      }

      bus.isBusy = true;
      placedDevice.isBusy = true;
      return helpers
        .netscriptDelay(ctx, installSpeed(bus.installLvl), true)
        .then(() => {
          bus.isBusy = false;
          placedDevice.isBusy = false;
          removeDevice([x, y]);
          return Promise.resolve(true);
        })
        .finally(() => {
          bus.isBusy = false;
          placedDevice.isBusy = false;
        });
    },
    getUpgradeTierCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!("tier" in device)) return -1;
      return tierCost(device.type, device.tier);
    },
    upgradeTier: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!("tier" in device)) return false;
      const cost = tierCost(device.type, device.tier);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.tier++;
      return true;
    },
    getUpgradeEmissionLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!("emissionLvl" in device)) return -1;
      return emissionCost(device.type, device.emissionLvl);
    },
    upgradeEmissionLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!("emissionLvl" in device)) return false;
      const cost = emissionCost(device.type, device.emissionLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.emissionLvl++;
      return true;
    },
    getUpgradeMoveLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!("moveLvl" in device)) return -1;
      return moveLvlCost(device.type, device.moveLvl);
    },
    upgradeMoveLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!("moveLvl" in device)) return false;
      const cost = moveLvlCost(device.type, device.moveLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.moveLvl++;
      return true;
    },
    getUpgradeTransferLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!("transferLvl" in device)) return -1;
      return transferLvlCost(device.type, device.transferLvl);
    },
    upgradeTransferLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!("transferLvl" in device)) return false;
      const cost = transferLvlCost(device.type, device.transferLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.transferLvl++;
      return true;
    },
    getUpgradeReduceLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!("reduceLvl" in device)) return -1;
      return reduceLvlCost(device.type, device.reduceLvl);
    },
    upgradeReduceLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!("reduceLvl" in device)) return false;
      const cost = reduceLvlCost(device.type, device.reduceLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.reduceLvl++;
      return true;
    },
    getUpgradeInstallLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!("installLvl" in device)) return -1;
      return installLvlCost(device.type, device.installLvl);
    },
    upgradeInstallLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!("installLvl" in device)) return false;
      const cost = installLvlCost(device.type, device.installLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.installLvl++;
      return true;
    },
  };
}
