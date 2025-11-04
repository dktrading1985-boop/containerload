import { Request, Response } from "express";
import prisma from "../prisma/client";
import { z } from "zod";

const quickSchema = z.object({
  container: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  item: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  quantity: z.number().int().positive(),
  containerType: z.string().optional(),
  save: z.boolean().optional()
});

export const runCalculation = async (req: Request, res: Response) => {
  try {
    const data = quickSchema.parse(req.body);
    const cL = data.container.length, cW = data.container.width, cH = data.container.height;
    const iL = data.item.length, iW = data.item.width, iH = data.item.height;

    const perRow = Math.floor(cL / iL);
    const perCol = Math.floor(cW / iW);
    const perLayer = Math.max(0, perRow * perCol);
    const layersPossible = Math.floor(cH / iH);

    let itemsPlaced = 0;
    if (perLayer > 0 && layersPossible > 0) {
      const totalPossible = perLayer * layersPossible;
      itemsPlaced = Math.min(totalPossible, data.quantity);
    }

    const containerVolume = cL * cW * cH;
    const itemVolume = iL * iW * iH;
    const utilization = containerVolume > 0 ? (itemsPlaced * itemVolume) / containerVolume : 0;

    const result = {
      itemsPlaced,
      perLayer,
      layersPossible,
      utilization: Number((utilization * 100).toFixed(2)),
      containerType: data.containerType || "custom",
      calculations: {
        container: data.container,
        item: data.item,
        quantity: data.quantity
      }
    };

    if ((req as any).userId && data.save) {
      const userId = (req as any).userId as string;
      await prisma.calculation.create({
        data: {
          containerType: result.containerType,
          itemName: "quick_item",
          itemDims: JSON.stringify({ length: iL, width: iW, height: iH }),
          quantity: data.quantity,
          utilization: result.utilization,
          userId
        }
      });
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Invalid request" });
  }
};
