import { Bot, Factory as IFactory, EntityType, Item, Crafter } from "@nsdefs";
import { InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { NewBot, factory, factorySize, resetFactory } from "../Factory/Helper";
import { adjacent, bitsMap, findEntity, isEntityContainer } from "../Factory/Factory";
import { botPrice, upgradeMaxInventoryCost } from "../Factory/formulas/formulas";

export function NetscriptFactory(): InternalAPI<IFactory> {
  return {
    getBits: () => () => factory.bits,
    getBotPrice: () => () => {
      const botCount = factory.entities.reduce((acc, e) => (e.type === EntityType.Bot ? acc + 1 : acc), 0);
      return botPrice(botCount);
    },
    purchaseBot: (ctx) => (_name, _coord) => {
      const name = helpers.string(ctx, "name", _name);
      const [x, y] = helpers.coord2d(ctx, "coord", _coord);
      const another = factory.entities.find((e): e is Bot => e.type === EntityType.Bot && e.name === name);
      if (another) {
        helpers.log(ctx, () => `bot "${name}" already exists`);
        return false;
      }

      const location = factory.entities.find((e) => e.x === x && e.y === y);
      if (location) {
        helpers.log(ctx, () => `location [${x}, ${y}] is occupied`);
        return false;
      }

      const botCount = factory.entities.reduce((acc, e) => (e.type === EntityType.Bot ? acc + 1 : acc), 0);
      const price = botPrice(botCount);
      if (factory.bits < price) {
        helpers.log(ctx, () => `not enough bits to purchase bot`);
        return false;
      }

      factory.bits -= price;
      NewBot(name, x, y);
      return false;
    },
    moveBot:
      (ctx) =>
      async (_name, _coord): Promise<boolean> => {
        const name = helpers.string(ctx, "name", _name);
        const [x, y] = helpers.coord2d(ctx, "coord", _coord);

        const bot = factory.entities.find((e) => e.type === EntityType.Bot && e.name === name);
        if (!bot) return Promise.resolve(false);
        const dist = Math.abs(bot.x - x) + Math.abs(bot.y - y);
        if (dist !== 1 || x < 0 || x > factorySize || y < 0 || y > factorySize) return Promise.resolve(false);
        if (factory.entities.find((e) => e.x === x && e.y === y)) return Promise.resolve(false);
        return helpers.netscriptDelay(ctx, 50).then(function () {
          bot.x = x;
          bot.y = y;
          return Promise.resolve(true);
        });
      },
    getEntity: (ctx) => (_id) => {
      const id = helpers.entityID(ctx, "id", _id);
      return findEntity(id);
    },
    entities: (__ctx) => () => JSON.parse(JSON.stringify(factory.entities)),

    transfer:
      (ctx) =>
      async (_from, _to, _pickup, _drop): Promise<boolean> => {
        const botID = helpers.entityID(ctx, "from", _from);
        const containerID = helpers.entityID(ctx, "to", _to);
        const pickup = _pickup as Item[];
        const drop = (_drop ?? []) as Item[];

        const bot = findEntity(botID, EntityType.Bot) as Bot;
        if (!bot) {
          helpers.log(ctx, () => `bot ${botID} not found`);
          return Promise.resolve(false);
        }

        const container = findEntity(containerID);
        if (!container) {
          helpers.log(ctx, () => `container ${containerID} not found`);
          return Promise.resolve(false);
        }

        if (!isEntityContainer(container)) {
          helpers.log(ctx, () => `entity ${containerID} is not a container`);
          return Promise.resolve(false);
        }

        if (!adjacent(bot, container)) {
          helpers.log(ctx, () => "bot is not adjacent to container");
          return Promise.resolve(false);
        }

        const botFinalSize = bot.inventory.length + pickup.length - drop.length;
        const containerFinalSize = container.inventory.length + drop.length - pickup.length;
        if (botFinalSize > bot.maxInventory || containerFinalSize > container.maxInventory) {
          helpers.log(ctx, () => "not enough space in bot or container");
          return Promise.resolve(false);
        }

        const containerHasItems = pickup.every((item) => container.inventory.includes(item));
        const botHasItems = drop.every((item) => bot.inventory.includes(item));
        if (!containerHasItems || !botHasItems) {
          helpers.log(ctx, () => "container or bot does not have items");
          return Promise.resolve(false);
        }

        container.inventory = container.inventory.filter((item) => !pickup.includes(item));
        container.inventory.push(...drop);

        bot.inventory = bot.inventory.filter((item) => !drop.includes(item));
        bot.inventory.push(...pickup);

        switch (container.type) {
          case EntityType.Dispenser: {
            container.cooldownUntil = Date.now() + container.cooldown;
            setTimeout(() => {
              if (container.inventory.length < container.maxInventory) {
                container.inventory = new Array(container.maxInventory).fill(container.dispensing);
              }
            }, container.cooldown);
            break;
          }

          case EntityType.Dock: {
            if (
              container.inventory.every((item) => container.currentRequest.includes(item)) &&
              container.currentRequest.every((item) => container.inventory.includes(item))
            ) {
              factory.bits += container.inventory.map((i) => bitsMap[i]).reduce((a, b) => a + b, 0);
              container.inventory = [];
              const newRequest = new Array(container.potentialRequestCount)
                .fill(null)
                .map(() => container.potentialRequest[Math.floor(Math.random() * container.potentialRequest.length)]);
              container.currentRequest = newRequest;
              container.maxInventory = newRequest.length;
            }
            break;
          }
        }

        return Promise.resolve(true);
      },
    craft:
      (ctx) =>
      async (_botID, _crafterID): Promise<boolean> => {
        const botID = helpers.entityID(ctx, "bot", _botID);
        const crafterID = helpers.entityID(ctx, "crafter", _crafterID);

        const bot = findEntity(botID, EntityType.Bot) as Bot;
        if (!bot) {
          helpers.log(ctx, () => `bot ${botID} not found`);
          return Promise.resolve(false);
        }

        const crafter = findEntity(crafterID, EntityType.Crafter) as Crafter;
        if (!crafter) {
          helpers.log(ctx, () => `crafter ${crafterID} not found`);
          return Promise.resolve(false);
        }

        if (!adjacent(bot, crafter)) {
          helpers.log(ctx, () => "bot is not adjacent to crafter");
          return Promise.resolve(false);
        }

        if (
          !crafter.recipe.input.every((item) => crafter.inventory.includes(item)) &&
          crafter.inventory.every((item) => crafter.recipe.input.includes(item))
        ) {
          helpers.log(ctx, () => "crafter is missing ingredients");
          return Promise.resolve(false);
        }

        return helpers.netscriptDelay(ctx, 5000).then(function () {
          crafter.inventory = [...crafter.recipe.output];
          return Promise.resolve(true);
        });
      },
    upgradeMaxInventory: (ctx) => (_id) => {
      const id = helpers.entityID(ctx, "id", _id);
      const container = findEntity(id);
      if (!container) {
        helpers.log(ctx, () => `container ${id} not found`);
        return false;
      }

      if (!isEntityContainer(container)) {
        helpers.log(ctx, () => `entity ${id} is not a container`);
        return false;
      }

      const cost = upgradeMaxInventoryCost(container.type, container.maxInventory);
      if (factory.bits < cost) {
        helpers.log(ctx, () => `not enough bits to upgrade container`);
        return false;
      }

      factory.bits -= cost;
      container.maxInventory++;

      return true;
    },

    getUpgradeMaxInventoryCost: (ctx) => (_id) => {
      const id = helpers.entityID(ctx, "id", _id);
      const container = findEntity(id);
      if (!container) {
        helpers.log(ctx, () => `container ${id} not found`);
        return -1;
      }

      if (!isEntityContainer(container)) {
        helpers.log(ctx, () => `entity ${id} is not a container`);
        return -1;
      }

      return upgradeMaxInventoryCost(container.type, container.maxInventory);
    },
    reset: () => resetFactory,
  };
}
