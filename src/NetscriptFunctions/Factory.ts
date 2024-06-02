import { Bot, Factory as IFactory, EntityType, Item, Crafter } from "@nsdefs";
import { InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { NewBot, factory, factorySize } from "../Factory/Helper";
import { adjacent, bitsMap, findBot, findEntityAt } from "../Factory/Factory";
import { botPrice } from "../Factory/formulas/formulas";

export function NetscriptFactory(): InternalAPI<IFactory> {
  return {
    getBits: () => () => factory.bits,
    getBotPrice: () => () => {
      const botCount = factory.entities.reduce((acc, e) => (e.type === EntityType.Bot ? acc + 1 : acc), 0);
      return botPrice(botCount);
    },
    purchaseBot: (ctx) => (_name, _x, _y) => {
      const name = helpers.string(ctx, "name", _name);
      const x = helpers.number(ctx, "x", _x);
      const y = helpers.number(ctx, "y", _y);
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
      async (_name, _x, _y): Promise<boolean> => {
        const name = helpers.string(ctx, "name", _name);
        const x = helpers.number(ctx, "x", _x);
        const y = helpers.number(ctx, "y", _y);

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
    getBot:
      (ctx) =>
      (_name): Bot | undefined => {
        const name = helpers.string(ctx, "name", _name);
        const bot = factory.entities.find((e): e is Bot => e.type === EntityType.Bot && e.name === name);
        if (!bot) return;
        return JSON.parse(JSON.stringify(bot));
      },
    entityAt: (ctx) => (_x, _y) => {
      const x = helpers.number(ctx, "x", _x);
      const y = helpers.number(ctx, "y", _y);
      return factory.entities.find((e) => e.x === x && e.y === y);
    },
    entities: (__ctx) => () => JSON.parse(JSON.stringify(factory.entities)),

    transfer:
      (ctx) =>
      async (_name, _x, _y, _pickup, _drop): Promise<boolean> => {
        const name = helpers.string(ctx, "name", _name);
        const x = helpers.number(ctx, "x", _x);
        const y = helpers.number(ctx, "y", _y);
        const pickup = _pickup as Item[];
        const drop = _drop as Item[];

        const bot = findBot(name);
        if (!bot) {
          helpers.log(ctx, () => `bot "${name}" not found`);
          return Promise.resolve(false);
        }
        const container = findEntityAt(x, y);
        if (!container) {
          helpers.log(ctx, () => `container not found at [${x}, ${y}]`);
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
                container.inventory.push(container.dispensing);
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
            }
            break;
          }
        }

        return Promise.resolve(true);
      },
    craft:
      (ctx) =>
      async (_name, _x, _y): Promise<boolean> => {
        const name = helpers.string(ctx, "name", _name);
        const x = helpers.number(ctx, "x", _x);
        const y = helpers.number(ctx, "y", _y);
        const bot = findBot(name);
        if (!bot) {
          helpers.log(ctx, () => `bot "${name}" not found`);
          return Promise.resolve(false);
        }
        const crafter = findEntityAt<Crafter>(x, y, EntityType.Crafter);
        if (!crafter) {
          helpers.log(ctx, () => `crafter not found at [${x}, ${y}]`);
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
  };
}
