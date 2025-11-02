/**
 * Simple 3D bin-packing–style optimization algorithm
 * Calculates how efficiently pallets fill a container.
 */

export interface ContainerDims {
  length: number;
  width: number;
  height: number;
  maxWeight: number;
}

export interface PalletDims {
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
}

export interface OptimizationResult {
  totalWeight: number;
  usedVolume: number;
  utilizationPercent: number;
  overweight: boolean;
  remainingVolume: number;
  placements: {
    palletIndex: number;
    position: [number, number, number];
  }[];
}

/**
 * Basic heuristic: sequential placement, layer by layer.
 * Not a true 3D bin packing algorithm — but efficient enough for prototype.
 */
export function optimizeLoad(
  container: ContainerDims,
  pallets: PalletDims[]
): OptimizationResult {
  const containerVolume = container.length * container.width * container.height;
  let usedVolume = 0;
  let totalWeight = 0;
  const placements: { palletIndex: number; position: [number, number, number] }[] = [];

  let x = 0, y = 0, z = 0;
  let rowHeight = 0;

  pallets.forEach((pallet, index) => {
    for (let i = 0; i < pallet.quantity; i++) {
      if (x + pallet.length > container.length) {
        x = 0;
        y += rowHeight;
        rowHeight = 0;
      }

      if (y + pallet.width > container.width) {
        y = 0;
        z += pallet.height;
      }

      if (z + pallet.height > container.height) {
        break; // container full
      }

      placements.push({ palletIndex: index, position: [x, y, z] });
      usedVolume += pallet.length * pallet.width * pallet.height;
      totalWeight += pallet.weight;

      rowHeight = Math.max(rowHeight, pallet.width);
      x += pallet.length;
    }
  });

  const utilizationPercent = (usedVolume / containerVolume) * 100;
  const overweight = totalWeight > container.maxWeight;
  const remainingVolume = containerVolume - usedVolume;

  return {
    totalWeight,
    usedVolume,
    utilizationPercent: Number(utilizationPercent.toFixed(2)),
    overweight,
    remainingVolume,
    placements,
  };
}
