<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [NS](./bitburner.ns.md) &gt; [getHackingMultipliers](./bitburner.ns.gethackingmultipliers.md)

## NS.getHackingMultipliers() method

Get hacking related multipliers.

**Signature:**

```typescript
getHackingMultipliers(): HackingMultipliers;
```
**Returns:**

[HackingMultipliers](./bitburner.hackingmultipliers.md)

Object containing the Player’s hacking related multipliers.

## Remarks

RAM cost: 0.25 GB

Returns an object containing the Player’s hacking related multipliers. These multipliers are returned in fractional forms, not percentages (e.g. 1.5 instead of 150%).

## Example


```js
const mults = ns.getHackingMultipliers();
ns.tprint(`chance: ${mults.chance}`);
ns.tprint(`growth: ${mults.growth}`);
```

