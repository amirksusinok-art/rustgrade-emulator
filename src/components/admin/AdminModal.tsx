import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, SkinDefinition } from '../../types';
import { SKINS_DATA } from '../../data/skinsData';
import { soundManager } from '../../utils/soundManager';
import { ScrapIcon } from '../common/ScrapIcon';
import { adminManager, AdminRiggingState, ProfileSlotInfo } from '../../utils/adminManager';
import {
  X,
  Terminal,
  Lock,
  Unlock,
  Coins,
  Dice5,
  Package,
  Database,
  Search,
  Plus,
  Minus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertTriangle,
  Plane,
  Flame,
  Gauge,
  Sliders,
  UserCheck,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSetBalance: (newBalance: number) => void;
  onAddSkin: (skinId: string) => void;
  onClearInventory: () => void;
  onImportProfile: (imported: UserProfile) => void;
  onTriggerAirdrop?: () => void;
  onResetProgress: () => void;
}

type AdminTab = 'balance' | 'rigging' | 'spawner' | 'data';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSetBalance,
  onAddSkin,
  onClearInventory,
  onImportProfile,
  onTriggerAirdrop,
  onResetProgress,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => adminManager.isAdmin());
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('balance');

  // Balance Modifier Inputs
  const [balanceAmountInput, setBalanceAmountInput] = useState<string>('1000');
  const [slotsList, setSlotsList] = useState<ProfileSlotInfo[]>(() => adminManager.getAllSlots());

  // Rigging state
  const [rigging, setRigging] = useState<AdminRiggingState>(() => adminManager.getRigging());

  // Spawner Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [spawnerFeedback, setSpawnerFeedback] = useState<string | null>(null);

  // Spawner memoized list
  const filteredSkins = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SKINS_DATA.filter((s) => {
      if (selectedRarity !== 'all' && s.rarity !== selectedRarity) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.type.toLowerCase().includes(q)) return false;
      return true;
    }).slice(0, 48); // performance cap
  }, [searchQuery, selectedRarity]);

  // Sync Rigging from manager
  useEffect(() => {
    const unsub = adminManager.subscribe((st) => setRigging(st));
    return () => unsub();
  }, []);

  // Update slots when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(adminManager.isAdmin());
      setSlotsList(adminManager.getAllSlots());
    }
  }, [isOpen]);

  // Handle Password Submit
  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminManager.login(passwordInput)) {
      soundManager.play('win');
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
    } else {
      soundManager.play('codelock_error');
      setAuthError('НЕВЕРНЫЙ ПАРОЛЬ ДОСТУПА');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    adminManager.logout();
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Parse numerical input safely
  const parseAmount = (val: string): number => {
    const n = parseFloat(val.replace(',', '.'));
    return isNaN(n) ? 0 : Math.max(0, n);
  };

  // Current balance controls
  const handleSetExactBalance = () => {
    const amt = parseAmount(balanceAmountInput);
    onSetBalance(amt);
    soundManager.play('barrel_hit');
  };

  const handleAddBalance = () => {
    const amt = parseAmount(balanceAmountInput);
    onSetBalance(profile.balance + amt);
    soundManager.play('barrel_hit');
  };

  const handleDeductBalance = () => {
    const amt = parseAmount(balanceAmountInput);
    onSetBalance(Math.max(0, profile.balance - amt));
    soundManager.play('barrel_hit');
  };

  const handleQuickAdd = (amt: number) => {
    onSetBalance(profile.balance + amt);
    soundManager.play('barrel_hit');
  };

  const handleQuickResetZero = () => {
    onSetBalance(0);
    soundManager.play('barrel_hit');
  };

  // Slot balance controls
  const handleUpdateSlot = (slotId: 'slot_1' | 'slot_2' | 'slot_3', newBal: number) => {
    adminManager.updateSlotBalance(slotId, newBal);
    setSlotsList(adminManager.getAllSlots());
    if (slotId === adminManager.getActiveSlotId()) {
      onSetBalance(newBal);
    }
    soundManager.play('barrel_hit');
  };

  const handleSwitchSlot = (slotId: 'slot_1' | 'slot_2' | 'slot_3') => {
    adminManager.setActiveSlotId(slotId);
    const targetProf = adminManager.loadSlotProfile(slotId);
    onImportProfile(targetProf);
    setSlotsList(adminManager.getAllSlots());
    soundManager.play('item_select');
  };

  // Rigging controls
  const handleToggleForce = (val: 'win' | 'lose') => {
    if (rigging.forceNextOutcome === val) {
      adminManager.setForceNextOutcome(null);
    } else {
      adminManager.setForceNextOutcome(val);
      soundManager.play(val === 'win' ? 'win' : 'lose');
    }
  };

  const handleToggleFurnace = () => {
    adminManager.setRiggedFurnace(!rigging.riggedFurnace);
    soundManager.play('furnace_turn_on');
  };

  const handleWheelSpeedChange = (speed: number) => {
    adminManager.setWheelSpeed(speed);
  };

  const handleSpawnSkin = (skin: SkinDefinition) => {
    onAddSkin(skin.id);
    soundManager.play('item_select');
    setSpawnerFeedback(`Выдан предмет: ${skin.name}`);
    setTimeout(() => setSpawnerFeedback(null), 2000);
  };

  // Data Export & Import
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rustgrade_backup_${profile.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    soundManager.play('item_select');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed.balance === 'number') {
          onImportProfile(parsed);
          soundManager.play('win');
          alert('Профиль успешно загружен из файла!');
        } else {
          soundManager.play('codelock_error');
          alert('Ошибка: неверный формат файла сохранения.');
        }
      } catch {
        soundManager.play('codelock_error');
        alert('Ошибка при чтении JSON файла.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleHardReset = () => {
    if (window.confirm('ВНИМАНИЕ! Полная очистка LocalStorage сбросит все данные, баланс, инвентарь и настройки. Продолжить?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-3xl bg-[#0E1015] border-2 border-[#E53935]/60 rounded-xl shadow-[0_0_40px_rgba(229,57,53,0.35)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#151821] border-b border-[#232731]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#E53935]/20 border border-[#E53935]/50 flex items-center justify-center text-[#E53935]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-rajdhani font-black text-lg text-white tracking-wider">
                  RUSTGRADE ADMIN CONSOLE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#E53935]/20 text-[#E53935] text-[10px] font-bold tracking-widest uppercase border border-[#E53935]/40">
                  ADMIN MODE
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                Панель администратора и отладки • Доступ через профиль
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
                title="Заблокировать консоль"
              >
                Выйти
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1E222B] hover:bg-[#2A303C] text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* LOCKED LOGIN SCREEN */
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E53935]/10 border-2 border-[#E53935]/40 flex items-center justify-center text-[#E53935] mb-4 shadow-[0_0_20px_rgba(229,57,53,0.25)]">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="font-rajdhani font-black text-2xl text-white tracking-wider uppercase mb-1">
              ДОСТУП ЗАБЛОКИРОВАН
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mb-6 font-mono">
              Для доступа к функциям администратора требуется ввести мастер-пароль.
            </p>

            <form onSubmit={handleLoginSubmit} className="w-full max-w-sm flex flex-col gap-3">
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Введите пароль доступа..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-[#151821] border border-zinc-700 focus:border-[#E53935] text-white text-center font-mono tracking-widest placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner"
                />
              </div>

              {authError && (
                <div className="text-xs text-[#E53935] font-bold font-mono tracking-wider animate-shake flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#E53935] hover:bg-[#D32F2F] active:bg-[#B71C1C] text-white font-rajdhani font-black text-sm tracking-wider uppercase shadow-[0_4px_16px_rgba(229,57,53,0.5)] transition-all active:scale-[0.98]"
              >
                РАЗБЛОКИРОВАТЬ КОНСОЛЬ
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN PANEL */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex border-b border-[#232731] bg-[#12141A] px-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('balance')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'balance'
                    ? 'border-[#E53935] text-white bg-[#1A1D24]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-[#FFD54F]" />
                <span>Баланс & Слоты</span>
              </button>

              <button
                onClick={() => setActiveTab('rigging')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'rigging'
                    ? 'border-[#E53935] text-white bg-[#1A1D24]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Dice5 className="w-3.5 h-3.5 text-[#4CAF50]" />
                <span>Подкрутка & Шансы</span>
              </button>

              <button
                onClick={() => setActiveTab('spawner')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'spawner'
                    ? 'border-[#E53935] text-white bg-[#1A1D24]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-[#2196F3]" />
                <span>Спавнер предметов</span>
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'data'
                    ? 'border-[#E53935] text-white bg-[#1A1D24]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#AB47BC]" />
                <span>Данные & Тесты</span>
              </button>
            </div>

            {/* Tab Views */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* TAB 1: BALANCE & SLOTS */}
              {activeTab === 'balance' && (
                <div className="space-y-6">
                  {/* Current Active Player Balance */}
                  <div className="p-4 rounded-xl bg-[#151821] border border-[#232731]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">
                          Текущий активный игрок
                        </span>
                        <h4 className="font-rajdhani font-black text-lg text-white">
                          {profile.nickname} <span className="text-xs font-mono text-zinc-500">({profile.id})</span>
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D0F12] border border-[#232731]">
                        <span className="text-xs text-zinc-400">Баланс:</span>
                        <ScrapIcon size="sm" />
                        <span className="font-rajdhani font-black text-base text-[#FFD54F]">
                          {profile.balance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Amount Input & Main Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
                      <div className="relative w-full sm:w-48">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={balanceAmountInput}
                          onChange={(e) => setBalanceAmountInput(e.target.value)}
                          placeholder="Сумма скрапа..."
                          className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-zinc-700 text-white font-mono text-sm focus:border-[#E53935] focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                        <button
                          onClick={handleSetExactBalance}
                          className="px-3 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold uppercase transition-all"
                        >
                          Установить
                        </button>
                        <button
                          onClick={handleAddBalance}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#4CAF50] hover:bg-[#43A047] text-white text-xs font-bold uppercase transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Добавить</span>
                        </button>
                        <button
                          onClick={handleDeductBalance}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#E53935] hover:bg-[#D32F2F] text-white text-xs font-bold uppercase transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                          <span>Удалить</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#232731]/60">
                      <span className="text-[11px] text-zinc-400">Быстрые действия:</span>
                      <button
                        onClick={() => handleQuickAdd(1000)}
                        className="px-2.5 py-1 rounded bg-[#1E222B] hover:bg-[#2B313E] text-xs font-bold text-zinc-200 border border-zinc-700/50"
                      >
                        +1 000 ⚙️
                      </button>
                      <button
                        onClick={() => handleQuickAdd(10000)}
                        className="px-2.5 py-1 rounded bg-[#1E222B] hover:bg-[#2B313E] text-xs font-bold text-amber-300 border border-amber-500/30"
                      >
                        +10 000 ⚙️
                      </button>
                      <button
                        onClick={handleQuickResetZero}
                        className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-primary-red border border-red-500/30"
                      >
                        Обнулить до 0 ⚙️
                      </button>
                    </div>
                  </div>

                  {/* Slot Profiles Management */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">
                        Управление профилями (Слоты игроков)
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Каждый слот хранит отдельный баланс и инвентарь
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {slotsList.map((slot) => (
                        <div
                          key={slot.slotId}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                            slot.isActive
                              ? 'bg-[#182319] border-[#4CAF50]/60 shadow-[0_0_15px_rgba(76,175,80,0.2)]'
                              : 'bg-[#151821] border-[#232731]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-bold text-white uppercase">{slot.label}</span>
                              {slot.isActive ? (
                                <span className="px-1.5 py-0.5 rounded bg-[#4CAF50]/20 text-[#4CAF50] text-[10px] font-black uppercase">
                                  АКТИВЕН
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSwitchSlot(slot.slotId)}
                                  className="text-[10px] text-[#2196F3] hover:underline font-bold"
                                >
                                  Выбрать
                                </button>
                              )}
                            </div>
                            <span className="text-xs text-zinc-400 block truncate">{slot.nickname}</span>

                            <div className="flex items-center gap-1.5 my-2">
                              <ScrapIcon size="xs" />
                              <span className="font-rajdhani font-black text-sm text-[#FFD54F]">
                                {slot.balance.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                • {slot.inventoryCount} предметов
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-2 border-t border-[#232731]">
                            <button
                              onClick={() => handleUpdateSlot(slot.slotId, slot.balance + 1000)}
                              className="flex-1 py-1 rounded bg-[#1E222B] hover:bg-[#2B313E] text-[10px] font-bold text-zinc-300 border border-zinc-700/40"
                              title="Добавить +1000 скрапа"
                            >
                              +1 000
                            </button>
                            <button
                              onClick={() => handleUpdateSlot(slot.slotId, 0)}
                              className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-[10px] font-bold text-primary-red border border-red-500/30"
                              title="Обнулить баланс слота"
                            >
                              Сброс
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RIGGING & CHANCES */}
              {activeTab === 'rigging' && (
                <div className="space-y-6">
                  {/* Upgrader Outcome Rigging */}
                  <div className="p-4 rounded-xl bg-[#151821] border border-[#232731]">
                    <div className="flex items-center gap-2 mb-2">
                      <Dice5 className="w-4 h-4 text-[#4CAF50]" />
                      <h4 className="font-rajdhani font-black text-base text-white uppercase tracking-wider">
                        Подкрутка Апгрейдера (На следующий раунд)
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 mb-4">
                      Принудительно направляет стрелку колеса в зеленую победную зону или зону промаха для проверки анимаций.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <button
                        onClick={() => handleToggleForce('win')}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-rajdhani font-black text-sm uppercase tracking-wider transition-all ${
                          rigging.forceNextOutcome === 'win'
                            ? 'bg-[#1C3520] border-[#4CAF50] text-[#4CAF50] shadow-[0_0_20px_rgba(76,175,80,0.4)]'
                            : 'bg-[#1A1D24] border-zinc-700 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>100% ПОБЕДА (ВИН)</span>
                      </button>

                      <button
                        onClick={() => handleToggleForce('lose')}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-rajdhani font-black text-sm uppercase tracking-wider transition-all ${
                          rigging.forceNextOutcome === 'lose'
                            ? 'bg-[#35181A] border-[#E53935] text-[#E53935] shadow-[0_0_20px_rgba(229,57,53,0.4)]'
                            : 'bg-[#1A1D24] border-zinc-700 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span>100% ПРОИГРЫШ</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                      <span>Текущий статус:</span>
                      <span className="font-bold text-white">
                        {rigging.forceNextOutcome === 'win'
                          ? 'ПРИНУДИТЕЛЬНЫЙ ВИН НА СЛЕДУЮЩИЙ СПИН'
                          : rigging.forceNextOutcome === 'lose'
                          ? 'ПРИНУДИТЕЛЬНЫЙ ЛУЗ НА СЛЕДУЮЩИЙ СПИН'
                          : 'СТАНДАРТНЫЙ ЧЕСТНЫЙ PROVABLY FAIR ШАНС'}
                      </span>
                    </div>
                  </div>

                  {/* Furnace Rigging */}
                  <div className="p-4 rounded-xl bg-[#151821] border border-[#232731]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="w-4 h-4 text-[#FF9800]" />
                          <h4 className="font-rajdhani font-black text-base text-white uppercase tracking-wider">
                            Подкрутка печки (100% крафт)
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-400 max-w-lg">
                          Отключает шанс неудачи в переплавке: печь гарантированно выдает лучший доступный скин тиром выше с максимальной окупаемостью.
                        </p>
                      </div>

                      <button
                        onClick={handleToggleFurnace}
                        className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                          rigging.riggedFurnace
                            ? 'bg-[#FF9800] text-black border-[#FF9800] shadow-[0_0_15px_rgba(255,152,0,0.5)]'
                            : 'bg-[#1E222B] text-zinc-400 border-zinc-700 hover:text-white'
                        }`}
                      >
                        {rigging.riggedFurnace ? 'ВКЛЮЧЕНО' : 'ВЫКЛЮЧЕНО'}
                      </button>
                    </div>
                  </div>

                  {/* Roulette Speed Slider */}
                  <div className="p-4 rounded-xl bg-[#151821] border border-[#232731]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[#2196F3]" />
                        <h4 className="font-rajdhani font-black text-base text-white uppercase tracking-wider">
                          Скорость вращения рулетки
                        </h4>
                      </div>
                      <span className="font-rajdhani font-black text-sm text-[#2196F3]">
                        {rigging.wheelSpeed.toFixed(1)} сек.
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mb-4">
                      Бегунок времени вращения стрелки: от мгновенной остановки (0.2с) для мгновенного теста до плавной кинематографичной (5.0с).
                    </p>

                    <input
                      type="range"
                      min="0.2"
                      max="5.0"
                      step="0.1"
                      value={rigging.wheelSpeed}
                      onChange={(e) => handleWheelSpeedChange(parseFloat(e.target.value))}
                      className="w-full accent-[#2196F3] bg-zinc-800 rounded-lg cursor-pointer h-2"
                    />

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <button
                        onClick={() => handleWheelSpeedChange(0.2)}
                        className="px-2.5 py-1 rounded bg-[#1E222B] hover:bg-[#2B313E] text-xs font-bold text-zinc-300 border border-zinc-700/40"
                      >
                        0.2с (Мгновенно)
                      </button>
                      <button
                        onClick={() => handleWheelSpeedChange(0.8)}
                        className="px-2.5 py-1 rounded bg-[#1E222B] hover:bg-[#2B313E] text-xs font-bold text-zinc-300 border border-zinc-700/40"
                      >
                        0.8с (Турбо)
                      </button>
                      <button
                        onClick={() => handleWheelSpeedChange(3.5)}
                        className="px-2.5 py-1 rounded bg-[#1E222B] hover:bg-[#2B313E] text-xs font-bold text-zinc-300 border border-zinc-700/40"
                      >
                        3.5с (Стандарт)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ITEM SPAWNER */}
              {activeTab === 'spawner' && (
                <div className="space-y-4">
                  {/* Search & Rarity Filters */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск скина по названию или оружию..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#151821] border border-zinc-700 text-white text-xs focus:border-[#E53935] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
                      {['all', 'contraband', 'master', 'rare', 'common'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setSelectedRarity(r)}
                          className={`px-2.5 py-1.5 rounded text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                            selectedRarity === r
                              ? 'bg-[#E53935] text-white'
                              : 'bg-[#151821] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {spawnerFeedback && (
                    <div className="p-2 rounded bg-green-500/10 border border-green-500/30 text-xs text-success-green font-bold flex items-center gap-1.5 animate-fade-in">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{spawnerFeedback}</span>
                    </div>
                  )}

                  {/* Skins Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[360px] overflow-y-auto pr-1">
                    {filteredSkins.map((skin) => (
                      <div
                        key={skin.id}
                        className="p-2 rounded-lg bg-[#151821] border border-[#232731] hover:border-zinc-500 flex flex-col justify-between transition-all group"
                      >
                        <div className="flex flex-col items-center text-center">
                          <img
                            src={`/images/skins/${skin.localFile}`}
                            alt={skin.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = skin.iconUrl;
                            }}
                            className="w-12 h-12 object-contain mb-1 group-hover:scale-105 transition-transform"
                          />
                          <span className="text-[10px] font-bold text-white truncate w-full" title={skin.name}>
                            {skin.name}
                          </span>
                          <span className="text-[9px] text-[#FFD54F] font-rajdhani font-bold">
                            {skin.price.toFixed(2)} ⚙️
                          </span>
                        </div>

                        <button
                          onClick={() => handleSpawnSkin(skin)}
                          className="mt-1.5 w-full py-1 rounded bg-[#1E222B] hover:bg-[#4CAF50] text-zinc-300 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          + Выдать
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Mass Clear */}
                  <div className="pt-3 border-t border-[#232731] flex items-center justify-between">
                    <span className="text-xs text-zinc-400">
                      Инвентарь игрока: {profile.inventory.length} предметов
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm('Очистить весь инвентарь текущего игрока?')) {
                          onClearInventory();
                          soundManager.play('scrap_sell');
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-primary-red border border-red-500/30 text-xs font-bold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Очистить весь инвентарь</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: DATA & TESTS */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  {/* Export & Import */}
                  <div className="p-4 rounded-xl bg-[#151821] border border-[#232731]">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-[#AB47BC]" />
                      <h4 className="font-rajdhani font-black text-base text-white uppercase tracking-wider">
                        Резервное копирование (JSON)
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 mb-4">
                      Сохранение полного профиля, баланса и инвентаря в файл на компьютер и восстановление из файла.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleExportJSON}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1E222B] hover:bg-[#2B313E] text-white border border-zinc-700 text-xs font-bold uppercase transition-all shadow"
                      >
                        <Download className="w-4 h-4 text-[#AB47BC]" />
                        <span>Скачать профиль (.json)</span>
                      </button>

                      <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1E222B] hover:bg-[#2B313E] text-white border border-zinc-700 text-xs font-bold uppercase cursor-pointer transition-all shadow">
                        <Upload className="w-4 h-4 text-[#2196F3]" />
                        <span>Загрузить профиль (.json)</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJSON}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Event Trigger: Airdrop */}
                  {onTriggerAirdrop && (
                    <div className="p-4 rounded-xl bg-[#151821] border border-[#232731]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Plane className="w-4 h-4 text-amber-400" />
                            <h4 className="font-rajdhani font-black text-base text-white uppercase tracking-wider">
                              Вызвать тестовый Airdrop
                            </h4>
                          </div>
                          <p className="text-xs text-zinc-400">
                            Мгновенно запускает пролёт самолёта C-130 с контейнером для проверки звука и модального окна.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            onTriggerAirdrop();
                            onClose();
                          }}
                          className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider transition-all"
                        >
                          Сбросить Airdrop
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hard Reset */}
                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 text-primary-red">
                          <AlertTriangle className="w-4 h-4" />
                          <h4 className="font-rajdhani font-black text-base uppercase tracking-wider">
                            Hard Reset LocalStorage
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-400">
                          Полная очистка локального кэша и возврат игры в исходное начальное состояние (5.00 Scrap).
                        </p>
                      </div>

                      <button
                        onClick={handleHardReset}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(229,57,53,0.5)]"
                      >
                        Полный сброс
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
