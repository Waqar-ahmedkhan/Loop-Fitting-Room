'use strict';

const offcutPieces = [
  ['winged-skull', 'Winged Skull Tee', 48, 'Washed charcoal', '#555452'],
  ['heavy-black', 'Heavy Blank Tee — Black', 38, 'Black', '#202020'],
  ['heavy-white', 'Heavy Blank Tee — White', 38, 'White', '#f2f1ee'],
  ['longsleeve', 'Offcut Longsleeve', 55, 'Washed charcoal', '#555452'],
  ['rose-chain', 'Rose & Chain Tee', 52, 'Black', '#202020'],
  ['varsity', 'Varsity Jacket', 240, 'Burgundy / cream', '#76252c'],
  ['no-restocks', 'No Restocks Longsleeve', 58, 'White', '#f2f1ee'],
  ['arch-hoodie', 'Arch Logo Hoodie', 95, 'Black', '#202020'],
  ['barbed-heart', 'Barbed Heart Tee', 48, 'Washed charcoal', '#555452'],
  ['zip-hoodie', 'Black Zip Hoodie', 98, 'Black', '#202020'],
];

window.LOOPS_PRODUCTS = offcutPieces.map(([id, name, price, colorName, color], index) => ({
  id: `offcut-${id}`,
  name,
  price,
  currency: 'EUR',
  collection: 'offcut',
  category:
    id.includes('hoodie') || id === 'varsity' ? 'layers' : id.includes('longsleeve') || id === 'no-restocks' ? 'longsleeves' : 'tees',
  code: String(index + 1).padStart(3, '0'),
  color,
  colors: [[colorName, color]],
  description: 'From the Offcut collection. Explore the original artwork and silhouette in the showroom.',
  imageGarment: true,
}));
