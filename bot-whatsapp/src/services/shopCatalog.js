const SHOP_ITEMS = [
  {
    key: 'lottery_ticket',
    name: 'Ticket de Lotería',
    emoji: '🎟️',
    price: 100,
    category: 'baratos',
    aliases: ['ticket', 'loteria', 'loteria_ticket'],
    usable: true,
    requiresTarget: false,
    description: 'Ítem de azar: 90% no ganas nada, 9% ganas 1,000 y 1% ganas 10,000 Yenes.'
  },
  {
    key: 'banana_peel',
    name: 'Cáscara de Plátano',
    emoji: '🍌',
    price: 150,
    category: 'baratos',
    aliases: ['platano', 'banana', 'cascara'],
    usable: true,
    requiresTarget: true,
    description: 'Sabotaje: añade +15 minutos al cooldown de !work del objetivo.'
  },
  {
    key: 'energy_drink',
    name: 'Bebida Energética',
    emoji: '⚡',
    price: 220,
    category: 'baratos',
    aliases: ['energetica', 'bebida', 'energia'],
    usable: true,
    requiresTarget: false,
    description: 'Mejora: elimina TODOS tus cooldowns actuales de economía.'
  },
  {
    key: 'lock',
    name: 'Candado de Bolsillo',
    emoji: '🔒',
    price: 350,
    category: 'baratos',
    aliases: ['candado', 'lock'],
    usable: false,
    requiresTarget: false,
    passiveDescription: 'Se activa automáticamente al ser víctima de !rob exitoso.',
    description: 'Protección pasiva: bloquea un robo exitoso y se rompe.'
  },
  {
    key: 'trick_dice',
    name: 'Dado Trucado',
    emoji: '🎲',
    price: 400,
    category: 'medios',
    aliases: ['dado', 'dado_trucado'],
    usable: false,
    requiresTarget: false,
    passiveDescription: 'Tu próximo !roll será exitoso y se consumirá automáticamente.',
    description: 'Mejora pasiva: garantiza éxito en tu próximo !roll.'
  },
  {
    key: 'balaclava',
    name: 'Pasamontañas',
    emoji: '🥷',
    price: 700,
    category: 'medios',
    aliases: ['pasamontanas', 'pasamontaña', 'mascara'],
    usable: true,
    requiresTarget: false,
    description: 'Sabotaje: equipa bonus para tu próximo !rob (80% de éxito).'
  },
  {
    key: 'double_espresso',
    name: 'Café Expreso Doble',
    emoji: '☕',
    price: 1200,
    category: 'medios',
    aliases: ['cafe', 'expreso', 'cafe_doble'],
    usable: true,
    requiresTarget: false,
    description: 'Mejora temporal: durante 2h multiplica x2 todas tus ganancias positivas de economía.'
  },
  {
    key: 'briefcase',
    name: 'Maletín de Soborno',
    emoji: '💼',
    price: 2000,
    category: 'caros',
    aliases: ['maletin', 'soborno'],
    usable: false,
    requiresTarget: false,
    passiveDescription: 'Se consume automáticamente si fallas !rob para evitar multa/cooldown.',
    description: 'Protección pasiva: evita la multa y cooldown si fallas un !rob.'
  },
  {
    key: 'usb',
    name: 'USB Criptográfico',
    emoji: '💾',
    price: 4500,
    category: 'caros',
    aliases: ['usb', 'criptografico'],
    usable: true,
    requiresTarget: true,
    description: 'Sabotaje extremo: roba 10% del banco del objetivo en un único uso.'
  },
  {
    key: 'crown',
    name: 'Corona de Oro Macizo',
    emoji: '👑',
    price: 30000,
    category: 'caros',
    aliases: ['corona', 'crown'],
    usable: false,
    requiresTarget: false,
    passiveDescription: 'Aparece en !lb y !verficha como símbolo de estatus.',
    description: 'Estatus puro: no da bonus directo, pero aumenta tu clase social.'
  }
];

const CATEGORY_LABELS = {
  baratos: '🟢 Ítems Baratos',
  medios: '🟡 Ítems de Precio Medio',
  caros: '🔴 Ítems Caros'
};

function normalizeToken(text = '') {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '_');
}

function findItemByQuery(query = '') {
  const token = normalizeToken(query);
  return SHOP_ITEMS.find((item) => item.key === token || item.aliases.some((alias) => normalizeToken(alias) === token)) || null;
}

function findItemByKey(key = '') {
  return SHOP_ITEMS.find((item) => item.key === key) || null;
}

module.exports = { SHOP_ITEMS, CATEGORY_LABELS, normalizeToken, findItemByQuery, findItemByKey };
