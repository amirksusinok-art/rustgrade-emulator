import React from 'react';
import { ShieldCheck, Heart, Terminal, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="w-full bg-[#0D0F12] border-t border-border-dark py-6 px-4 text-xs text-text-muted mt-12 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="font-rajdhani font-black text-white tracking-wider">
              RUST<span className="text-primary-red">GRADE</span> EMULATOR
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#1B202A] text-[10px] text-text-muted border border-border-dark">
              v2.0.0
            </span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="p-1 rounded bg-[#1A1D24] hover:bg-[#252934] border border-[#232731] text-zinc-500 hover:text-[#E53935] transition-all ml-1 group"
                title="F1 Dev Console (Режим Администратора)"
              >
                <Terminal className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[11px] max-w-lg text-text-muted">
            Бесплатный браузерный эмулятор сайта Rustgrade. Виртуальная экономика Scrap (⚙️). Без реальных денег, азартных игр и связи со Steam.
          </p>
        </div>

        <div className="flex flex-col md:items-end gap-1">
          <div className="flex items-center justify-center md:justify-end gap-1.5 text-success-green font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Provably Fair (HMAC-SHA256)</span>
          </div>
          <p className="text-[10px] text-text-muted flex items-center justify-center md:justify-end gap-1">
            <span>Создано с</span>
            <Heart className="w-3 h-3 text-primary-red fill-current" />
            <span>для сообщества игроков Rust</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
