const economyService = require('./economyService');
const {
  SHOP_ITEMS,
  CATEGORY_LABELS,
  normalizeToken,
  findItemByQuery
} = require('./shopCatalog');

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

function getItemInfo(itemQuery) {
  const item = findItemByQuery(itemQuery);
  if (!item) {
    throw new Error('SHOP_ITEM_NOT_FOUND');
  }
  return item;
}

async function buyItem(userId, itemQuery) {
  const item = getItemInfo(itemQuery);
  const tx = await economyService.buyItem(userId, item.key, item.price);
  return { ...tx, item };
}

async function useItem(userId, itemQuery, targetId = null) {
  const item = getItemInfo(itemQuery);

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
  getShopPage,
  getItemInfo,
  buyItem,
  useItem
};
