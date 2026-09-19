import React from 'react';
import { useSite } from '../../context/SiteContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowRestore, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const MultiTabGuardModal = () => {
  const { isDuplicateTab, claimPrimaryTab, logout } = useSite();

  if (!isDuplicateTab) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[100000] bg-black/80 backdrop-blur-md animate-fadeIn p-4">
      <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-5 animate-modal-in">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 text-amber-400">
          <FontAwesomeIcon icon={faWindowRestore} className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
            Session Active in Another Tab
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed font-sans">
            You are currently logged in on another tab of this browser. Multi-tab gaming is restricted to protect your real-time wallet balance and account security.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={claimPrimaryTab}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
          >
            <FontAwesomeIcon icon={faWindowRestore} className="w-4 h-4" />
            Switch Active Session To This Tab
          </button>

          <button
            onClick={logout}
            className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold rounded-xl transition border border-zinc-700 flex items-center justify-center gap-2 text-sm"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
            Log Out Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiTabGuardModal;
