const economyService = require('./economyService');

const SHOP_ITEMS = [
  {
    key: 'lottery_ticket',
    name: 'Ticket de Lotería',
    emoji: '🎟️',
    price: 200,
    category: 'baratos',
    aliases: ['ticket', 'loteria', 'loteria_ticket'],
    usable: true,
    requiresTarget: false
  },
  {
    key: 'banana_peel',
    name: 'Cáscara de Plátano',
    emoji: '🍌',
    price: 300,
    category: 'baratos',
    aliases: ['platano', 'banana', 'cascara'],
    usable: true,
    requiresTarget: true
  },
  {
    key: 'energy_drink',
    name: 'Bebida Energética',
    emoji: '⚡',
    price: 500,
    category: 'baratos',
    aliases: ['energetica', 'bebida', 'energia'],
    usable: true,
    requiresTarget: false
  },
  {
    key: 'lock',
    name: 'Candado de Bolsillo',
    emoji: '🔒',
    price: 800,
    category: 'baratos',
    aliases: ['candado', 'lock'],
    usable: false,
    requiresTarget: false,
    passiveDescription: 'Se activa automáticamente al ser víctima de !rob exitoso.'
  },
  {
    key: 'trick_dice',
    name: 'Dado Trucado',
    emoji: '🎲',
    price: 1000,
    category: 'medios',
    aliases: ['dado', 'dado_trucado'],
    usable: false,
    requiresTarget: false,
    passiveDescription: 'Tu próximo !roll será exitoso y se consumirá automáticamente.'
  },
  {
    key: 'balaclava',
    name: 'Pasamontañas',
    emoji: '🥷',
    price: 1500,
    category: 'medios',
    aliases: ['pasamontanas', 'pasamontaña', 'mascara'],
    usable: true,
    requiresTarget: false
  },
  {
    key: 'double_espresso',
    name: 'Café Expreso Doble',
    emoji: '☕',
    price: 2500,
    category: 'medios',
    aliases: ['cafe', 'expreso', 'cafe_doble'],
    usable: true,
    requiresTarget: false
  },
  {
    key: 'briefcase',
    name: 'Maletín de Soborno',
    emoji: '💼',
    price: 4000,
    category: 'caros',
    aliases: ['maletin', 'soborno'],
    usable: false,
    requiresTarget: false,
    passiveDescription: 'Se consume automáticamente si fallas !rob para evitar multa/cooldown.'
  },
  {
    key: 'usb',
    name: 'USB Criptográfico',
    emoji: '💾',
    price: 8000,
    category: 'caros',
    aliases: ['usb', 'criptografico'],
    usable: true,
    requiresTarget: true
  },
  {
    key: 'crown',
    name: 'Corona de Oro Macizo',
    emoji: '👑',
    price: 50000,
    category: 'caros',
    aliases: ['corona', 'crown'],
    usable: false,
    requiresTarget: false,
    passiveDescription: 'Aparece en !lb y !verficha como símbolo de estatus.'
  }
];

const CATEGORY_LABELS = {
  baratos: '🟢 Ítems Baratos',
  medios: '🟡 Ítems de Precio Medio',
  caros: '🔴 Ítems Caros'
};

function normalizeToken(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function findItem(query = '') {
  const token = normalizeToken(query);
  return SHOP_ITEMS.find((item) => item.key === token || item.aliases.some((alias) => normalizeToken(alias) === token)) || null;
}

function getItemsByCategory(category = 'baratos') {
  const normalized = normalizeToken(category);
  const selected = ['baratos', 'medios', 'caros'].includes(normalized) ? normalized : 'baratos';
  return {
    category: selected,
    label: CATEGORY_LABELS[selected],
    items: SHOP_ITEMS.filter((item) => item.category === selected)
  };
}

function getShopPage({ category = 'baratos', page = 1, pageSize = 5 }) {
  const { category: selected, label, items } = getItemsByCategory(category);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    category: selected,
    categoryLabel: label,
    page: safePage,
    totalPages,
    items: items.slice(start, start + pageSize)
  };
}

async function buyItem(userId, itemQuery) {
  const item = findItem(itemQuery);
  if (!item) {
    throw new Error('SHOP_ITEM_NOT_FOUND');
  }

  const tx = await economyService.buyItem(userId, item.key, item.price);
  return { ...tx, item };
}

async function useItem(userId, itemQuery, targetId = null) {
  const item = findItem(itemQuery);
  if (!item) {
    throw new Error('SHOP_ITEM_NOT_FOUND');
  }

  if (!item.usable) {
    throw new Error('ITEM_NOT_MANUAL_USABLE');
  }

  if (item.requiresTarget && !targetId) {
    throw new Error('ITEM_TARGET_REQUIRED');
  }

  const tx = await economyService.useItem(userId, item.key, { targetId });
  return { ...tx, item };
}

module.exports = {
  SHOP_ITEMS,
  CATEGORY_LABELS,
  findItem,
  getShopPage,
  buyItem,
  useItem
};
