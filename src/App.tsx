import { useState, useCallback, useEffect } from 'react';
import { LivingBackground } from './components/effects/LivingBackground';
import { Header } from './components/layout/Header';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { UpgradeStage } from './components/upgrade/UpgradeStage';
import { UserInventory } from './components/inventory/UserInventory';
import { CatalogGrid } from './components/inventory/CatalogGrid';
import { FurnaceTradeUp } from './components/furnace/FurnaceTradeUp';
import { Footer } from './components/layout/Footer';

// Modals
import { SkinInspectModal } from './components/effects/SkinInspectModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { FairVerifierModal } from './components/provably-fair/FairVerifierModal';
import { AirdropModal } from './components/effects/AirdropModal';
import { AdminModal } from './components/admin/AdminModal';

// Hooks & Data
import { useUserStore } from './hooks/useUserStore';
import { useUpgradeStore } from './hooks/useUpgradeStore';
import { useAirdropTimer } from './hooks/useAirdropTimer';
import { SKINS_MAP } from './data/skinsData';
import { SkinDefinition, AvatarId } from './types';
import { soundManager } from './utils/soundManager';
import { Headphones } from 'lucide-react';
import { ScrapIcon } from './components/common/ScrapIcon';

interface ClickParticle {
  id: number;
  x: number;
  y: number;
}

export function App() {
  const {
    profile,
    addScrap,
    addSkin,
    removeInventoryItems,
    sellInventoryItem,
    sellAllSkins,
    buySkin,
    updateAvatar,
    updateNickname,
    redeemPromoCode,
    resetProgress,
    setBalance,
    clearInventory,
    importProfile,
  } = useUserStore();

  const [activeNavTab, setActiveNavTab] = useState<'upgrade' | 'furnace'>('upgrade');

  const {
    selectedItemIds,
    selectedInventoryItems,
    scrapSlider,
    targetSkin,
    totalInputValue,
    winProbability,
    safetyStatus,
    wheelRotation,
    wheelOutcome,
    outcomeSkin,
    isSpinning,
    spinDuration,
    turboMode,
    statusMessage,
    roundHistory,
    fairState,
    toggleSelectItem,
    removeSelectedItem,
    clearSelectedItems,
    setScrapSlider,
    setTargetSkin,
    setTurboMode,
    applyMultiplier,
    applyTargetChance,
    executeUpgrade,
  } = useUpgradeStore();

  const {
    isActive: isAirdropActive,
    timeLeft: airdropTimeLeft,
    lastReward: airdropReward,
    showClaimModal: showAirdropClaimModal,
    setShowClaimModal: setShowAirdropClaimModal,
    spawnAirdrop,
    handleClaim: handleClaimAirdrop,
  } = useAirdropTimer();

  // Modal States
  const [inspectSkin, setInspectSkin] = useState<SkinDefinition | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isFairModalOpen, setIsFairModalOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Particles for Mining Scrap
  const [particles, setParticles] = useState<ClickParticle[]>([]);

  // Quick inspect opener
  const handleInspectSkinId = useCallback((skinId: string) => {
    const skin = SKINS_MAP[skinId];
    if (skin) setInspectSkin(skin);
  }, []);

  // 15-second Cooldown for Mining Scrap (+1 Scrap every 15s)
  const COOLDOWN_SECONDS = 15;
  const [mineCooldown, setMineCooldown] = useState<number>(() => {
    try {
      const last = localStorage.getItem('rustgrade_last_mine_time');
      if (last) {
        const elapsed = Math.floor((Date.now() - parseInt(last, 10)) / 1000);
        if (elapsed < COOLDOWN_SECONDS) {
          return COOLDOWN_SECONDS - elapsed;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  useEffect(() => {
    if (mineCooldown <= 0) return;
    const timer = setInterval(() => {
      setMineCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mineCooldown]);

  // Mining Scrap click handler with sound and floating particle
  const handleMineScrap = useCallback((e?: React.MouseEvent) => {
    if (mineCooldown > 0) return;

    soundManager.play('barrel_hit');
    addScrap(0.5);
    try {
      localStorage.setItem('rustgrade_last_mine_time', Date.now().toString());
    } catch {
      // ignore
    }
    setMineCooldown(COOLDOWN_SECONDS);

    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : 80;

    const newParticle: ClickParticle = {
      id: Date.now() + Math.random(),
      x,
      y,
    };

    setParticles((prev) => [...prev, newParticle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1000);
  }, [addScrap, mineCooldown]);

  // Trade-Up handler for Electric Furnace
  const handleTradeUp = useCallback(
    (removedInstanceIds: string[], gainedSkinId: string) => {
      removeInventoryItems(removedInstanceIds);
      addSkin(gainedSkinId);
    },
    [removeInventoryItems, addSkin]
  );

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col justify-between relative selection:bg-primary-red selection:text-white">
      {/* Living Atmospheric Rust Background (sparks, hangar gradient, swinging lamp) */}
      <LivingBackground />

      {/* Floating particles on Scrap click */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute font-rajdhani font-black text-lg text-[#FFD54F] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-float-up flex items-center gap-1"
            style={{ left: p.x - 25, top: p.y - 20 }}
          >
            <span>+0.50</span>
            <ScrapIcon size="sm" />
          </div>
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        <div className="flex flex-col flex-1">
          {/* Top Header strictly matching Photo 5 */}
          <Header
            profile={profile}
            turboMode={turboMode}
            mineCooldown={mineCooldown}
            activeTab={activeNavTab}
            onSelectTab={setActiveNavTab}
            onToggleTurbo={() => setTurboMode(!turboMode)}
            onOpenFairModal={() => setIsFairModalOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onMineScrap={handleMineScrap}
          />

          {/* Main Layout: Left Sidebar + Arena & Catalog */}
          <div className="flex flex-1 w-full">
            {/* Left Sidebar (Photo 5: Wipe BP, Online, Upgrade stream) */}
            <LeftSidebar
              roundHistory={roundHistory}
              onInspectSkin={handleInspectSkinId}
            />

            {/* Main Content Area */}
            <main className="flex-1 max-w-[1550px] mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 flex flex-col gap-6 w-full">
              {activeNavTab === 'furnace' ? (
                /* Electric Furnace Trade-Up View */
                <FurnaceTradeUp
                  inventory={profile.inventory}
                  userBalance={profile.balance}
                  onTradeUp={handleTradeUp}
                  onBuySkin={buySkin}
                  onInspectSkin={handleInspectSkinId}
                />
              ) : (
                /* Core Upgrade View */
                <>
                  {/* 1. Core Upgrade Stage (Left Slot | Wheel & Button | Target Slot & Multipliers) */}
                  <section aria-label="Upgrade Arena">
                    <UpgradeStage
                      selectedItems={selectedInventoryItems}
                      scrapSlider={scrapSlider}
                      userBalance={profile.balance}
                      totalInputValue={totalInputValue}
                      targetSkin={targetSkin}
                      winProbability={winProbability}
                      safetyStatus={safetyStatus}
                      wheelRotation={wheelRotation}
                      wheelOutcome={wheelOutcome}
                      outcomeSkin={outcomeSkin}
                      isSpinning={isSpinning}
                      spinDuration={spinDuration}
                      turboMode={turboMode}
                      statusMessage={statusMessage}
                      onRemoveItem={removeSelectedItem}
                      onClearAll={clearSelectedItems}
                      onSliderChange={setScrapSlider}
                      onApplyMultiplier={applyMultiplier}
                      onApplyChance={applyTargetChance}
                      onExecuteUpgrade={executeUpgrade}
                      onInspectTarget={() => targetSkin && setInspectSkin(targetSkin)}
                    />
                  </section>

                  {/* 2. Lower Split: User Inventory & Shop (Left) & Upgrade Catalog (Right) */}
                  <section
                    aria-label="Inventory and Catalog"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 items-stretch"
                  >
                    {/* Left: User Inventory & Shop (Фото 5 & 2) */}
                    <UserInventory
                      inventory={profile.inventory}
                      userBalance={profile.balance}
                      selectedItemIds={selectedItemIds}
                      onToggleSelect={toggleSelectItem}
                      onSellItem={sellInventoryItem}
                      onSellAll={sellAllSkins}
                      onBuySkin={buySkin}
                      onInspectSkin={handleInspectSkinId}
                      disabled={isSpinning}
                    />

                    {/* Right: Catalog Grid (51 skins matching Photo 5) */}
                    <CatalogGrid
                      selectedTargetSkin={targetSkin}
                      onSelectTarget={setTargetSkin}
                      onInspectSkin={handleInspectSkinId}
                      disabled={isSpinning}
                    />
                  </section>
                </>
              )}
            </main>
          </div>
        </div>

        {/* Footer */}
        <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
      </div>

      {/* Floating Support Chat Icon in bottom right corner strictly matching Photo 5 */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsProfileOpen(true)}
          className="w-12 h-12 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(229,57,53,0.5)] transition-all hover:scale-105 active:scale-95"
          title="Служба поддержки"
        >
          <Headphones className="w-6 h-6" />
        </button>
      </div>

      {/* MODALS */}

      {/* F1 Admin Dev Console Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        profile={profile}
        onSetBalance={setBalance}
        onAddSkin={addSkin}
        onClearInventory={clearInventory}
        onImportProfile={importProfile}
        onTriggerAirdrop={spawnAirdrop}
        onResetProgress={resetProgress}
      />

      {/* 3D Skin Inspect Modal */}
      <SkinInspectModal
        skin={inspectSkin}
        onClose={() => setInspectSkin(null)}
        onSelectAsTarget={(skin) => {
          setTargetSkin(skin);
          soundManager.play('item_select');
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        profile={profile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdateAvatar={(av: AvatarId) => updateAvatar(av)}
        onUpdateNickname={(nick: string) => updateNickname(nick)}
        onRedeemPromo={redeemPromoCode}
        onTriggerAirdrop={spawnAirdrop}
        onResetProgress={resetProgress}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Provably Fair Verifier Modal */}
      <FairVerifierModal
        isOpen={isFairModalOpen}
        onClose={() => setIsFairModalOpen(false)}
        fairState={fairState}
        roundHistory={roundHistory}
      />

      {/* Airdrop Event Modal (rendered only if triggered) */}
      {(isAirdropActive || showAirdropClaimModal) && (
        <AirdropModal
          isActive={isAirdropActive}
          timeLeft={airdropTimeLeft}
          lastReward={airdropReward}
          showClaimModal={showAirdropClaimModal}
          onClaim={handleClaimAirdrop}
          onCloseClaimModal={() => setShowAirdropClaimModal(false)}
        />
      )}
    </div>
  );
}

export default App;
