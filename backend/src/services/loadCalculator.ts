export function calculateLoadPlan(container: any, pallets: any[]) {
  const containerVolume = container.length * container.width * container.height;
  let usedVolume = 0;
  let totalWeight = 0;
  let placedPallets = 0;

  for (const pallet of pallets) {
    const palletVolume = pallet.length * pallet.width * pallet.height;
    const totalPalletVolume = palletVolume * pallet.quantity;
    const totalPalletWeight = pallet.weight * pallet.quantity;

    if (
      usedVolume + totalPalletVolume <= containerVolume &&
      totalWeight + totalPalletWeight <= container.maxWeight
    ) {
      usedVolume += totalPalletVolume;
      totalWeight += totalPalletWeight;
      placedPallets += pallet.quantity;
    } else {
      break;
    }
  }

  const utilization = (usedVolume / containerVolume) * 100;

  return {
    placedPallets,
    totalWeight,
    usedVolume,
    utilization: utilization.toFixed(2) + '%',
  };
}
