import { useState, useCallback } from 'react';
import { LivingBackground } from './components/effects/LivingBackground';
import { Header } from './components/layout/Header';
import { LiveDropsBar } from './components/layout/LiveDropsBar';
import { UpgradeStage } from './components/upgrade/UpgradeStage';
import { UserInventory } from './components/inventory/UserInventory';
import { CatalogGrid } from './components/inventory/CatalogGrid';
import { Footer } from './components/layout/Footer';

// Modals
import { SkinInspectModal } from './components/effects/SkinInspectModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { FairVerifierModal } from './components/provably-fair/FairVerifierModal';
import { RoundResultModal } from './components/upgrade/RoundResultModal';
import { AirdropModal } from './components/effects/AirdropModal';

// Hooks & Data
import { useUserStore } from './hooks/useUserStore';
import { useUpgradeStore } from './hooks/useUpgradeStore';
import { useAirdropTimer } from './hooks/useAirdropTimer';
import { SKINS_MAP } from './data/skinsData';
import { SkinDefinition, AvatarId } from './types';
import { soundManager } from './utils/soundManager';

export function App() {
  const {
    profile,
    addScrap,
    sellInventoryItem,
    sellAllSkins,
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
    isSpinning,
    turboMode,
    statusMessage,
    lastRoundResult,
    showResultModal,
    roundHistory,
    fairState,
    setShowResultModal,
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

  // Quick inspect opener
  const handleInspectSkinId = useCallback((skinId: string) => {
    const skin = SKINS_MAP[skinId];
    if (skin) setInspectSkin(skin);
  }, []);

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col justify-between relative selection:bg-primary-red selection:text-white">
      {/* Living Atmospheric Rust Background (sparks, hangar gradient, swinging lamp) */}
      <LivingBackground />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        <div>
          {/* Top Header */}
          <Header
            profile={profile}
            turboMode={turboMode}
            onToggleTurbo={() => setTurboMode(!turboMode)}
            onOpenFairModal={() => setIsFairModalOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />

          {/* Real-time Drops Feed */}
          <LiveDropsBar />

          {/* Main Content Wrapper */}
          <main className="max-w-7xl mx-auto px-3 md:px-6 py-6 flex flex-col gap-8">
            {/* 1. Core Upgrade Stage (Left Slot | Wheel & Multipliers | Target Slot) */}
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

            {/* 2. Lower Split: User Inventory (50%) & Upgrade Catalog (50%) */}
            <section
              aria-label="Inventory and Catalog"
              className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 items-stretch"
            >
              {/* Left: User Inventory */}
              <UserInventory
                inventory={profile.inventory}
                selectedItemIds={selectedItemIds}
                onToggleSelect={toggleSelectItem}
                onSellItem={sellInventoryItem}
                onSellAll={sellAllSkins}
                onInspectSkin={handleInspectSkinId}
                onMineScrap={() => {
                  soundManager.play('barrel_hit');
                  addScrap(1.0);
                }}
                disabled={isSpinning}
              />

              {/* Right: Catalog Grid (51 skins) */}
              <CatalogGrid
                selectedTargetSkin={targetSkin}
                onSelectTarget={setTargetSkin}
                onInspectSkin={handleInspectSkinId}
                disabled={isSpinning}
              />
            </section>
          </main>
        </div>

        {/* Footer */}
        <Footer />
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

      {/* Round Result Modal */}
      <RoundResultModal
        round={lastRoundResult}
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
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
