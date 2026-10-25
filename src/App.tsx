import { useState, useCallback } from 'react';
import { LivingBackground } from './components/effects/LivingBackground';
import { Header } from './components/layout/Header';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { UpgradeStage } from './components/upgrade/UpgradeStage';
import { UserInventory } from './components/inventory/UserInventory';
import { CatalogGrid } from './components/inventory/CatalogGrid';
import { Footer } from './components/layout/Footer';

// Modals
import { SkinInspectModal } from './components/effects/SkinInspectModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { FairVerifierModal } from './components/provably-fair/FairVerifierModal';
import { AirdropModal } from './components/effects/AirdropModal';

// Hooks & Data
import { useUserStore } from './hooks/useUserStore';
import { useUpgradeStore } from './hooks/useUpgradeStore';
import { useAirdropTimer } from './hooks/useAirdropTimer';
import { SKINS_MAP } from './data/skinsData';
import { SkinDefinition, AvatarId } from './types';
import { soundManager } from './utils/soundManager';
import { Headphones } from 'lucide-react';

interface ClickParticle {
  id: number;
  x: number;
  y: number;
}

export function App() {
  const {
    profile,
    addScrap,
    sellInventoryItem,
    sellAllSkins,
    buySkin,
    updateAvatar,
    updateNickname,
    redeemPromoCode,
    resetProgress,
  } = useUserStore();

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

  // Particles for Mining Scrap
  const [particles, setParticles] = useState<ClickParticle[]>([]);

  // Quick inspect opener
  const handleInspectSkinId = useCallback((skinId: string) => {
    const skin = SKINS_MAP[skinId];
    if (skin) setInspectSkin(skin);
  }, []);

  // Mining Scrap click handler with sound and floating particle
  const handleMineScrap = useCallback((e?: React.MouseEvent) => {
    soundManager.play('barrel_hit');
    addScrap(1.0);

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
  }, [addScrap]);

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col justify-between relative selection:bg-primary-red selection:text-white">
      {/* Living Atmospheric Rust Background (sparks, hangar gradient, swinging lamp) */}
      <LivingBackground />

      {/* Floating particles on Scrap click */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute font-rajdhani font-black text-lg text-[#FFD54F] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-float-up"
            style={{ left: p.x - 25, top: p.y - 20 }}
          >
            +1.00 ⚙️
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
            </main>
          </div>
        </div>

        {/* Footer */}
        <Footer />
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
      />

      {/* Provably Fair Verifier Modal */}
      <FairVerifierModal
        isOpen={isFairModalOpen}
        onClose={() => setIsFairModalOpen(false)}
        fairState={fairState}
        roundHistory={roundHistory}
      />

      {/* Airdrop Event Modal */}
      <AirdropModal
        isActive={isAirdropActive}
        timeLeft={airdropTimeLeft}
        lastReward={airdropReward}
        showClaimModal={showAirdropClaimModal}
        onClaim={handleClaimAirdrop}
        onCloseClaimModal={() => setShowAirdropClaimModal(false)}
      />
    </div>
  );
}

export default App;
