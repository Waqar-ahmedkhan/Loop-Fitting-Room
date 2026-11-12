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

const archivePieces = [
  {
    id: '01-washed-charcoal',
    name: 'Washed Charcoal Hoodie',
    price: 138,
    category: 'man',
    code: '001',
    color: '#34393a',
    colors: [
      ['Washed charcoal', '#34393a'],
      ['Smokestone', '#767b78'],
      ['Black', '#191c1c'],
    ],
    description:
      'An oversized everyday layer with softly structured sleeves, an archival silhouette and washed charcoal finishing. Made to be worn on repeat.',
  },
  {
    id: '02-pink-stripe',
    name: 'Candy Stripe Knit',
    price: 118,
    category: 'woman',
    code: '002',
    color: '#efadc5',
    colors: [
      ['Candy stripe', '#efadc5'],
      ['Off white', '#ede8df'],
      ['Dust rose', '#ba667e'],
    ],
    description: 'A vintage-inspired striped sweater. Easy proportions, soft contrast and an unmistakable 2000s attitude.',
  },
  {
    id: '03-silver-tech',
    name: 'Liquid Silver Jacket',
    price: 226,
    category: 'man',
    code: '003',
    color: '#a6aeb1',
    colors: [
      ['Liquid silver', '#a6aeb1'],
      ['Graphite', '#43494d'],
    ],
    description: 'Technical shine and graphic piping in one sculptural outer layer. Inspired by early-2000s futurewear.',
  },
  {
    id: '04-burgundy-archive',
    name: 'Archive Burgundy',
    price: 115,
    category: 'woman',
    code: '004',
    color: '#762f40',
    colors: [
      ['Burgundy', '#762f40'],
      ['Black cherry', '#421f28'],
    ],
    description: 'Deep burgundy color, relaxed shape and subtle archival graphics. A piece to wear beyond the season.',
  },
  {
    id: '05-harness-tee',
    name: 'Harness Tee',
    price: 95,
    category: 'man',
    code: '005',
    color: '#eae7dd',
    colors: [
      ['Bone / red', '#eae7dd'],
      ['Black', '#2c2b2c'],
    ],
    description: 'A reinterpretation of the everyday tee. Sculptural red linework, oversized volume and a clean cotton finish.',
  },
  {
    id: '06-flame-hoodie',
    name: 'Midnight Flame Hoodie',
    price: 155,
    category: 'man',
    code: '006',
    color: '#28292a',
    colors: [
      ['Washed black', '#28292a'],
      ['Ash', '#9a9d9b'],
    ],
    description: 'A heavyweight archive-inspired silhouette finished with tonal flame artwork and generous proportions.',
  },
  {
    id: '07-halftone-acid',
    name: 'Halftone Acid Tee',
    price: 86,
    category: 'woman',
    code: '007',
    color: '#469bad',
    colors: [
      ['Acid blue', '#469bad'],
      ['Marine', '#253d57'],
      ['Lime', '#d6eb72'],
    ],
    description: 'An electric halftone graphic tee with subtle acid-wash variation and contrast trims. A true focal piece.',
  },
  {
    id: '08-stone-graphics',
    name: 'Stone Archive Knit',
    price: 129,
    category: 'woman',
    code: '008',
    color: '#b4a99a',
    colors: [
      ['Stone', '#b4a99a'],
      ['Dust grey', '#777c79'],
    ],
    description: 'Soft mineral tones meet loose architectural red linework. A contemporary reading of archival knitwear.',
  },
  {
    id: '09-white-basic',
    name: 'Essential Blanc Tee',
    price: 58,
    category: 'woman',
    code: '009',
    color: '#edeae2',
    colors: [
      ['Off white', '#edeae2'],
      ['Cool blue', '#a3b0c5'],
    ],
    description: 'A blank canvas with vintage proportions, comfortable shoulders and an understated archive insignia.',
  },
  {
    id: '10-sage-archive',
    name: 'Sage Archive Hoodie',
    price: 142,
    category: 'man',
    code: '010',
    color: '#859984',
    colors: [
      ['Sage', '#859984'],
      ['Forest', '#3d5146'],
    ],
    description: 'Desaturated sage cotton, oversized form and refined tonal detailing. Quiet, durable, always in rotation.',
  },
];

window.LOOPS_PRODUCTS.push(
  ...archivePieces.map((product, index) => ({
    ...product,
    currency: 'USD',
    collection: 'loops',
    category: product.name.includes('Tee') ? 'tees' : 'layers',
    code: String(index + 11).padStart(2, '0'),
    image: `${product.id}-cutout`,
    model: `rail-${product.id}`,
  }))
);
