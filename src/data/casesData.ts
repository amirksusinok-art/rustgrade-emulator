import { CaseDefinition } from '../types';

export const CASES_DATA: CaseDefinition[] = [
  {
    id: 'wooden_crate',
    name: 'Деревянный ящик',
    subtitle: 'Свалка • Низкий риск (Safe)',
    price: 5.0,
    badge: 'SAFE • RTP 93%',
    color: '#8D6E63',
    glowColor: 'rgba(141, 110, 99, 0.4)',
    items: [
      { skinId: 'hatchet_from_hell', weight: 30 },     // 1.97 ⚙️
      { skinId: 'bombing_thompson', weight: 22 },      // 1.94 ⚙️
      { skinId: 'blackout_poncho', weight: 24 },       // 6.99 ⚙️
      { skinId: 'desert_raiders_ar', weight: 16 },     // 8.37 ⚙️
      { skinId: 'witch_garage_door', weight: 8 },      // 9.71 ⚙️ (Топ окуп x2)
    ],
  },
  {
    id: 'military_crate',
    name: 'Военный ящик',
    subtitle: 'Монументы • Сбалансированный',
    price: 30.0,
    badge: 'BALANCED • RTP 93%',
    color: '#4CAF50',
    glowColor: 'rgba(76, 175, 80, 0.4)',
    items: [
      { skinId: 'witch_garage_door', weight: 52 },      // 9.71 ⚙️
      { skinId: 'blackout_hoodie', weight: 28 },        // 38.67 ⚙️ (Окуп x1.3)
      { skinId: 'chop_shop_garage_door', weight: 12 },  // 43.28 ⚙️ (Окуп x1.4)
      { skinId: 'desert_raiders_pants', weight: 5 },    // 49.70 ⚙️ (Окуп x1.6)
      { skinId: 'gold_rock', weight: 2.2 },             // 138.79 ⚙️ (Окуп x4.6)
      { skinId: 'military_camo_mp5', weight: 0.8 },     // 237.95 ⚙️ (Джекпот x8)
    ],
  },
  {
    id: 'elite_crate',
    name: 'Элитный ящик',
    subtitle: 'Нефтянка & Космодром • Высокий риск',
    price: 150.0,
    badge: 'HIGH RISK • RTP 93%',
    color: '#AB47BC',
    glowColor: 'rgba(171, 71, 188, 0.4)',
    items: [
      { skinId: 'desert_raiders_pants', weight: 38 },   // 49.70 ⚙️
      { skinId: 'gold_rock', weight: 28 },              // 138.79 ⚙️
      { skinId: 'alien_red', weight: 20 },              // 159.28 ⚙️ (Окуп)
      { skinId: 'hot_tempered_longsword', weight: 9 },  // 208.50 ⚙️ (Окуп x1.4)
      { skinId: 'tempered_mp5', weight: 4.1 },          // 522.78 ⚙️ (Окуп x3.5)
      { skinId: 'big_grin', weight: 0.9 },              // 1058.13 ⚙️ (Мега-джекпот x7)
    ],
  },
  {
    id: 'relief_crate',
    name: 'Ящик новичка',
    subtitle: 'Бесплатная помощь при банкротстве',
    price: 0,
    badge: 'FREE DROP',
    color: '#FF9800',
    glowColor: 'rgba(255, 152, 0, 0.4)',
    isFree: true,
    freeConditionText: 'Баланс < 2.00 ⚙️ и пустой инвентарь (1 раз в 4 часа)',
    items: [
      { skinId: 'hatchet_from_hell', weight: 40 },
      { skinId: 'bombing_thompson', weight: 35 },
      { skinId: 'retrowave_large_box', weight: 20 },
      { skinId: 'blackout_poncho', weight: 5 },
    ],
  },
];
