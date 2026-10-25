import React, { useState } from 'react';
import { UpgradeRound } from '../../types';
import { StoredFairState } from '../../utils/storage';
import { calculateUpgradeRoll, FairResult } from '../../utils/provablyFair';
import { X, ShieldCheck, CheckCircle2, XCircle, Calculator, History } from 'lucide-react';

interface FairVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  fairState: StoredFairState | null;
  roundHistory: UpgradeRound[];
  onUpdateClientSeed?: (newSeed: string) => void;
}

export const FairVerifierModal: React.FC<FairVerifierModalProps> = ({
  isOpen,
  onClose,
  fairState,
  roundHistory,
  onUpdateClientSeed,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'verifier' | 'history'>('current');

  // Calculator inputs
  const [calcServerSeed, setCalcServerSeed] = useState<string>('');
  const [calcClientSeed, setCalcClientSeed] = useState<string>('');
  const [calcNonce, setCalcNonce] = useState<string>('1');
  const [calcChance, setCalcChance] = useState<string>('50.00');
  const [calcResult, setCalcResult] = useState<FairResult | null>(null);

  // Client seed editing
  const [customClientSeed, setCustomClientSeed] = useState<string>(fairState?.clientSeed || '');

  if (!isOpen) return null;

  const handleRunVerify = async () => {
    if (!calcServerSeed || !calcClientSeed) return;
    const n = parseInt(calcNonce, 10) || 1;
    const p = parseFloat(calcChance) || 50;

    const res = await calculateUpgradeRoll(calcServerSeed, calcClientSeed, n, p);
    setCalcResult(res);
  };

  const handleVerifyPastRound = (round: UpgradeRound) => {
    setCalcServerSeed(round.serverSeed);
    setCalcClientSeed(round.clientSeed);
    setCalcNonce(String(round.nonce));
    setCalcChance(String(round.winProbability));
    setActiveTab('verifier');
    calculateUpgradeRoll(round.serverSeed, round.clientSeed, round.nonce, round.winProbability).then(
      setCalcResult
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface-card border border-border-dark rounded-3xl p-6 md:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#1B202A] hover:bg-[#262B37] text-text-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-border-dark/70">
          <div className="w-10 h-10 rounded-xl bg-success-green/20 border border-success-green/40 flex items-center justify-center text-success-green">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
              СИСТЕМА PROVABLY FAIR
            </h2>
            <p className="text-xs text-text-muted">
              Криптографическая гарантия честности каждого апгрейда (HMAC-SHA256)
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 my-4 border-b border-border-dark/70 pb-3">
          <button
            onClick={() => setActiveTab('current')}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
              ${
                activeTab === 'current'
                  ? 'bg-primary-red text-white shadow-md'
                  : 'bg-[#14171E] text-text-muted hover:text-white border border-border-dark'
              }
            `}
          >
            Текущие сиды
          </button>

          <button
            onClick={() => setActiveTab('verifier')}
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
              ${
                activeTab === 'verifier'
                  ? 'bg-primary-red text-white shadow-md'
                  : 'bg-[#14171E] text-text-muted hover:text-white border border-border-dark'
              }
            `}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Калькулятор проверки</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
              ${
                activeTab === 'history'
                  ? 'bg-primary-red text-white shadow-md'
                  : 'bg-[#14171E] text-text-muted hover:text-white border border-border-dark'
              }
            `}
          >
            <History className="w-3.5 h-3.5" />
            <span>История ({roundHistory.length})</span>
          </button>
        </div>

        {/* Tab 1: Current Commit-Reveal Seeds */}
        {activeTab === 'current' && (
          <div className="flex flex-col gap-4 text-xs">
            <p className="text-text-secondary leading-relaxed">
              Перед каждым раундом сервер заранее генерирует секретный сид сервера, а вам демонстрируется его <strong>SHA-256 хеш</strong>. Исход раунда определяется математической формулой и не может быть изменен после ставки.
            </p>

            <div className="p-4 rounded-2xl bg-[#0D0F12] border border-border-dark flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  SHA-256 ХЕШ СЕРВЕРНОГО СИДА (АКТИВНЫЙ РАУНД)
                </span>
                <div className="p-2.5 rounded-xl bg-[#14171E] border border-border-dark font-mono text-[11px] text-[#A5D6A7] break-all select-all">
                  {fairState?.currentServerSeedHash || 'Генерация...'}
                </div>
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  Сам исходный серверный сид будет раскрыт сразу после вращения колеса в истории раундов.
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  ВАШ КЛИЕНТСКИЙ СИД (CLIENT SEED)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customClientSeed}
                    onChange={(e) => setCustomClientSeed(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#14171E] border border-border-dark text-white font-mono text-xs focus:outline-none focus:border-primary-red"
                  />
                  {onUpdateClientSeed && (
                    <button
                      onClick={() => onUpdateClientSeed(customClientSeed)}
                      className="px-3 py-2 rounded-xl bg-success-green hover:bg-success-green-hover text-white font-bold text-xs"
                    >
                      Сохранить
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-text-muted pt-2 border-t border-border-dark/60">
                <span>Текущий счетчик раундов (Nonce):</span>
                <span className="font-mono font-bold text-white text-sm">
                  {fairState?.nonce || 1}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Verifier Calculator */}
        {activeTab === 'verifier' && (
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-text-secondary leading-relaxed">
              Введите данные любого завершенного раунда (серверный сид, клиентский сид, nonce и процент шанса) для независимой математической проверки:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                  Server Seed (раскрытый):
                </label>
                <input
                  type="text"
                  value={calcServerSeed}
                  onChange={(e) => setCalcServerSeed(e.target.value)}
                  placeholder="Вставьте serverSeed..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0D0F12] border border-border-dark text-white font-mono text-xs focus:outline-none focus:border-primary-red"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                  Client Seed:
                </label>
                <input
                  type="text"
                  value={calcClientSeed}
                  onChange={(e) => setCalcClientSeed(e.target.value)}
                  placeholder="Вставьте clientSeed..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0D0F12] border border-border-dark text-white font-mono text-xs focus:outline-none focus:border-primary-red"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                  Nonce (раунд):
                </label>
                <input
                  type="number"
                  value={calcNonce}
                  onChange={(e) => setCalcNonce(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0D0F12] border border-border-dark text-white font-mono text-xs focus:outline-none focus:border-primary-red"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                  Шанс победы (%):
                </label>
                <input
                  type="number"
                  value={calcChance}
                  onChange={(e) => setCalcChance(e.target.value)}
                  step="0.01"
                  className="w-full px-3 py-2 rounded-xl bg-[#0D0F12] border border-border-dark text-white font-mono text-xs focus:outline-none focus:border-primary-red"
                />
              </div>
            </div>

            <button
              onClick={handleRunVerify}
              className="mt-2 py-3 rounded-xl bg-primary-red hover:bg-primary-red-hover text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              <span>Рассчитать исход</span>
            </button>

            {/* Result of calculation */}
            {calcResult && (
              <div className="mt-2 p-4 rounded-2xl bg-[#0D0F12] border border-border-dark flex flex-col gap-2">
                <div className="flex items-center justify-between pb-2 border-b border-border-dark/60">
                  <span className="font-bold text-text-secondary uppercase">
                    ИТОГ РАСЧЕТА:
                  </span>
                  <div className="flex items-center gap-1.5 font-bold">
                    {calcResult.isWin ? (
                      <span className="flex items-center gap-1 text-success-green">
                        <CheckCircle2 className="w-4 h-4" /> ПОБЕДА (WIN)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-primary-red">
                        <XCircle className="w-4 h-4" /> ПОРАЖЕНИЕ (LOSE)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-text-muted text-[11px] font-mono">
                  <div>Сгенерированный ролл (Roll): <span className="text-white">{calcResult.roll}</span></div>
                  <div>Порог победы (Threshold): <span className="text-white">{calcResult.threshold}</span></div>
                  <div>Угол остановки (Angle): <span className="text-white">{calcResult.landingAngle.toFixed(2)}°</span></div>
                  <div>Формула: <span className="text-white">Roll &lt; Threshold</span></div>
                </div>

                <div className="mt-1">
                  <span className="text-[10px] text-text-muted block">Полный HMAC-SHA256 хеш:</span>
                  <span className="text-[10px] text-zinc-400 font-mono break-all">{calcResult.hash}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Round History */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
            {roundHistory.length === 0 ? (
              <div className="py-8 text-center text-text-muted">
                История раундов пока пуста. Сыграйте хотя бы один апгрейд!
              </div>
            ) : (
              roundHistory.map((round) => (
                <div
                  key={round.id}
                  className="p-3 rounded-xl bg-[#0D0F12] border border-border-dark flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {round.isWin ? (
                      <CheckCircle2 className="w-5 h-5 text-success-green shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-primary-red shrink-0" />
                    )}

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          Раунд #{round.nonce}
                        </span>
                        <span className="font-rajdhani font-bold text-xs text-[#FFD54F]">
                          {round.winProbability.toFixed(2)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted font-mono truncate max-w-[200px] sm:max-w-[320px]">
                        Server: {round.serverSeed}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerifyPastRound(round)}
                    className="px-2.5 py-1 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white border border-border-dark text-[11px] font-bold uppercase tracking-wider shrink-0"
                  >
                    Проверить
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
