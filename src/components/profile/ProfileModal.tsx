import React, { useState } from 'react';
import { UserProfile, AvatarId } from '../../types';
import { SKINS_MAP } from '../../data/skinsData';
import { X, Trophy, Gift, RotateCcw, Package, Check, Award } from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAvatar: (avatar: AvatarId) => void;
  onUpdateNickname: (nick: string) => void;
  onRedeemPromo: (code: string) => { success: boolean; message: string };
  onTriggerAirdrop: () => void;
  onResetProgress: () => void;
}

const AVATARS: { id: AvatarId; label: string; icon: string }[] = [
  { id: 'scientist', label: 'Scientist', icon: '👨‍🔬' },
  { id: 'naked', label: 'Naked', icon: '🪨' },
  { id: 'big_grin', label: 'Big Grin', icon: '😈' },
  { id: 'wolf', label: 'Wolf Headdress', icon: '🐺' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateAvatar,
  onUpdateNickname,
  onRedeemPromo,
  onTriggerAirdrop,
  onResetProgress,
}) => {
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoFeedback, setPromoFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [isEditingNick, setIsEditingNick] = useState<boolean>(false);
  const [nickInput, setNickInput] = useState<string>(profile.nickname);

  if (!isOpen) return null;

  const winrate =
    profile.stats.totalUpgrades > 0
      ? ((profile.stats.totalWins / profile.stats.totalUpgrades) * 100).toFixed(1)
      : '0.0';

  const bestSkin = profile.stats.bestDropSkinId ? SKINS_MAP[profile.stats.bestDropSkinId] : null;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onRedeemPromo(promoInput);
    setPromoFeedback({ text: res.message, isError: !res.success });
    if (res.success) {
      setPromoInput('');
    }
  };

  const handleSaveNick = () => {
    if (nickInput.trim()) {
      onUpdateNickname(nickInput.trim());
      setIsEditingNick(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-surface-card border border-border-dark rounded-3xl p-6 md:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#1B202A] hover:bg-[#262B37] text-text-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-5 border-b border-border-dark/70">
          {/* Avatar Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#262B37] to-[#14171E] border-2 border-primary-red/60 flex items-center justify-center text-4xl shadow-lg relative">
            <span>
              {AVATARS.find((a) => a.id === profile.avatar)?.icon || '👨‍🔬'}
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2">
              {isEditingNick ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nickInput}
                    onChange={(e) => setNickInput(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-[#0D0F12] border border-border-dark text-sm font-bold text-white focus:outline-none focus:border-primary-red"
                    maxLength={16}
                  />
                  <button
                    onClick={handleSaveNick}
                    className="p-1 rounded bg-success-green text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{profile.nickname}</h2>
                  <button
                    onClick={() => setIsEditingNick(true)}
                    className="text-xs text-text-muted hover:text-white transition-colors"
                  >
                    (изменить)
                  </button>
                </div>
              )}
            </div>

            <span className="text-xs text-text-muted font-mono mt-0.5">
              ID: {profile.id} • Баланс: ⚙️ {profile.balance.toFixed(2)} Scrap
            </span>

            {/* Avatar Selector Pills */}
            <div className="flex items-center gap-1.5 mt-2.5">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => onUpdateAvatar(av.id)}
                  className={`
                    px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border
                    ${
                      profile.avatar === av.id
                        ? 'bg-primary-red/20 border-primary-red text-white'
                        : 'bg-[#1B202A] border-border-dark text-text-secondary hover:text-white'
                    }
                  `}
                >
                  <span>{av.icon}</span>
                  <span className="text-[10px] hidden md:inline">{av.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
          <div className="p-3 rounded-xl bg-[#0D0F12] border border-border-dark text-center">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              АПГРЕЙДЫ
            </span>
            <span className="font-rajdhani font-black text-xl text-white">
              {profile.stats.totalUpgrades}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0F12] border border-border-dark text-center">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              ПОБЕДЫ / ВИНРЕЙТ
            </span>
            <span className="font-rajdhani font-black text-xl text-success-green">
              {profile.stats.totalWins} ({winrate}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0F12] border border-border-dark text-center">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              ПОРАЖЕНИЯ
            </span>
            <span className="font-rajdhani font-black text-xl text-primary-red">
              {profile.stats.totalLosses}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0F12] border border-border-dark text-center">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              AIRDROP'ОВ
            </span>
            <span className="font-rajdhani font-black text-xl text-amber-400">
              {profile.stats.totalAirdropsClaimed}
            </span>
          </div>
        </div>

        {/* Best Drop Showcase */}
        <div className="w-full bg-[#0D0F12] border border-border-dark rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FFD54F]">
                <Award className="w-3.5 h-3.5" />
                <span>ЛУЧШИЙ ДРОП ЗА ВСЁ ВРЕМЯ</span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {bestSkin ? (
                  <span>
                    Выбит с минимальным шансом{' '}
                    <strong className="text-white font-rajdhani text-sm">
                      {profile.stats.bestDropChance?.toFixed(2)}%
                    </strong>
                  </span>
                ) : (
                  'Вы пока не выбили ни одного апгрейда'
                )}
              </p>
            </div>
          </div>

          {bestSkin && (
            <div className="flex items-center gap-2 bg-[#1B202A] px-3 py-1.5 rounded-xl border border-border-dark">
              <img
                src={`/images/skins/${bestSkin.localFile}`}
                alt={bestSkin.name}
                className="w-10 h-10 object-contain drop-shadow"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{bestSkin.name}</span>
                <span className="text-[11px] font-rajdhani font-bold text-[#FFD54F]">
                  ⚙️ {bestSkin.price.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Promo Code Form */}
        <form onSubmit={handleRedeem} className="w-full mb-5">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 mb-2">
            <Gift className="w-3.5 h-3.5 text-primary-red" />
            <span>АКТИВАЦИЯ ПРОМОКОДА</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Введите промокод (например, START)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#0D0F12] border border-border-dark text-sm text-white focus:outline-none focus:border-primary-red font-mono uppercase"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary-red hover:bg-primary-red-hover text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Применить
            </button>
          </div>

          {promoFeedback && (
            <p
              className={`text-xs mt-2 font-medium ${
                promoFeedback.isError ? 'text-primary-red' : 'text-success-green'
              }`}
            >
              {promoFeedback.text}
            </p>
          )}

          <p className="text-[11px] text-text-muted mt-1.5">
            Подсказка: секретный промокод <code className="text-white font-bold">START</code> дает +25.00 Scrap, а <code className="text-white font-bold">RUST2026</code> дает +50.00 Scrap!
          </p>
        </form>

        {/* Action Buttons: Trigger Airdrop & Reset Progress */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-dark/60">
          <button
            onClick={() => {
              onTriggerAirdrop();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider transition-all"
            title="Вызвать самолет C-130 с контейнером прямо сейчас"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Вызвать Airdrop (Тест)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Вы уверены, что хотите сбросить прогресс? Баланс вернется к 5.00 Scrap.')) {
                onResetProgress();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-primary-red border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс прогресса</span>
          </button>
        </div>
      </div>
    </div>
  );
};
