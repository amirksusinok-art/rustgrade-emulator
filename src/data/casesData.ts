import { CaseDefinition } from '../types';

export const CASES_DATA: CaseDefinition[] = [
  {
    id: 'wooden_crate',
    name: 'Деревянный ящик',
    subtitle: 'Свалка & Лес • Низкий риск (Safe)',
    price: 5.0,
    badge: 'SAFE • RTP 93%',
    color: '#8D6E63',
    glowColor: 'rgba(141, 110, 99, 0.4)',
    image: '/images/crates/wooden_crate.jpg',
    items: [
      { skinId: 'dr_brainus_chestplate', weight: 15.0 },     // 0.80 ⚙️
      { skinId: 'corrupted_metal_door', weight: 14.0 },      // 1.01 ⚙️
      { skinId: 'bombing_thompson', weight: 18.0 },          // 1.94 ⚙️
      { skinId: 'hatchet_from_hell', weight: 18.0 },         // 1.97 ⚙️
      { skinId: 'hazma_egg_garage_door', weight: 10.0 },     // 3.01 ⚙️
      { skinId: 'no_mercy_l96', weight: 8.0 },               // 3.04 ⚙️
      { skinId: 'desert_hawk_ak47', weight: 6.0 },           // 3.14 ⚙️
      { skinId: 'bombing_facemask', weight: 13.65 },         // 3.26 ⚙️
      { skinId: 'blackout_poncho', weight: 32.76 },          // 6.99 ⚙️ (Окуп x1.4)
      { skinId: 'desert_raiders_ar', weight: 21.84 },        // 8.37 ⚙️ (Окуп x1.7)
      { skinId: 'witch_garage_door', weight: 12.28 },        // 9.71 ⚙️ (Окуп x2)
      { skinId: 'whiteout_roadsign_gloves', weight: 4.09 },  // 14.53 ⚙️ (Джекпот x3)
    ],
  },
  {
    id: 'military_crate',
    name: 'Военный ящик',
    subtitle: 'Монументы & Сферы • Сбалансированный',
    price: 30.0,
    badge: 'BALANCED • RTP 93%',
    color: '#4CAF50',
    glowColor: 'rgba(76, 175, 80, 0.4)',
    image: '/images/crates/military_crate.jpg',
    items: [
      { skinId: 'tempered_hmlmg', weight: 18.0 },                  // 3.26 ⚙️
      { skinId: 'witch_garage_door', weight: 26.0 },               // 9.71 ⚙️
      { skinId: 'glory_bar', weight: 16.0 },                       // 11.52 ⚙️
      { skinId: 'neon_pumpkin_metal_double_door', weight: 14.0 },  // 12.00 ⚙️
      { skinId: 'bamboo_sar', weight: 12.0 },                      // 14.28 ⚙️
      { skinId: 'forest_raiders_boots', weight: 10.0 },            // 14.37 ⚙️
      { skinId: 'blackout_hoodie', weight: 28.42 },                // 38.67 ⚙️ (Окуп x1.3)
      { skinId: 'chop_shop_garage_door', weight: 16.24 },          // 43.28 ⚙️ (Окуп x1.4)
      { skinId: 'desert_raiders_chest_plate', weight: 10.15 },     // 54.50 ⚙️ (Окуп x1.8)
      { skinId: 'after_death_ar', weight: 5.08 },                  // 80.96 ⚙️ (Окуп x2.7)
      { skinId: 'gold_rock', weight: 3.05 },                       // 138.79 ⚙️ (Окуп x4.6)
      { skinId: 'military_camo_mp5', weight: 1.22 },               // 237.95 ⚙️ (Джекпот x8)
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
    image: '/images/crates/elite_crate.jpg',
    items: [
      { skinId: 'whiteout_roadsign_gloves', weight: 14.0 },        // 14.53 ⚙️
      { skinId: 'desert_raiders_pants', weight: 22.0 },            // 49.70 ⚙️
      { skinId: 'shard_of_true_ice', weight: 16.0 },               // 55.61 ⚙️
      { skinId: 'desert_raiders_facemask', weight: 12.0 },         // 75.96 ⚙️
      { skinId: 'gold_rock', weight: 23.36 },                      // 138.79 ⚙️
      { skinId: 'alien_red', weight: 20.44 },                      // 159.28 ⚙️ (Окуп x1.1)
      { skinId: 'hot_tempered_longsword', weight: 11.68 },         // 208.50 ⚙️ (Окуп x1.4)
      { skinId: 'young_dragon_garage_door', weight: 6.0 },         // 215.00 ⚙️ (Окуп x1.4)
      { skinId: 'neon_dragon_garage_door', weight: 5.11 },         // 434.49 ⚙️ (Окуп x2.9)
      { skinId: 'tempered_mp5', weight: 3.65 },                    // 522.78 ⚙️ (Окуп x3.5)
      { skinId: 'creepy_clown_bandana', weight: 2.04 },           // 828.07 ⚙️ (Окуп x5.5)
      { skinId: 'big_grin', weight: 1.17 },                        // 1058.13 ⚙️ (Мега-Джекпот x7)
    ],
  },
  {
    id: 'relief_crate',
    name: 'Ящик новичка',
    subtitle: 'Гуманитарная помощь при банкротстве',
    price: 0,
    badge: 'FREE DROP',
    color: '#FF9800',
    glowColor: 'rgba(255, 152, 0, 0.4)',
    image: '/images/crates/relief_crate.jpg',
    isFree: true,
    freeConditionText: 'Баланс < 2.00 ⚙️ и пустой инвентарь (1 раз в 4 часа)',
    items: [
      { skinId: 'xxl_picture_frame', weight: 20.0 },       // 0.14 ⚙️
      { skinId: 'green_hoodie', weight: 20.0 },            // 0.14 ⚙️
      { skinId: 'red_tshirt', weight: 18.0 },              // 0.14 ⚙️
      { skinId: 'dr_brainus_chestplate', weight: 14.0 },   // 0.80 ⚙️
      { skinId: 'victorian_furnace', weight: 10.0 },       // 0.99 ⚙️
      { skinId: 'hatchet_from_hell', weight: 8.0 },        // 1.97 ⚙️
      { skinId: 'bombing_thompson', weight: 5.0 },         // 1.94 ⚙️
      { skinId: 'no_mercy_l96', weight: 3.0 },             // 3.04 ⚙️
      { skinId: 'retrowave_large_box', weight: 1.5 },      // 4.91 ⚙️
      { skinId: 'blackout_poncho', weight: 0.5 },          // 6.99 ⚙️ (Топ джекпот)
    ],
  },
];
