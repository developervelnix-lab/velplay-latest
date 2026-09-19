import { NetworkStatusToast } from './components/common/NetworkStatusToast';
/*
  Author: DevKilla
  Buy Code From: jinkteam.com
  Contact: @devkilla (Telegram)
*/

import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from 'react-router-dom';
import Home from './components/home/Home';
import GameplayComponent from './components/GamePlayComponent';
import Transaction from './components/pages/Transaction';
import ProfitLossPage from './components/pages/ProfitLossPage';
import OpenBetPage from './components/pages/OpenBetPage';
import ChangePasswordPage from './components/pages/ChangePasswordPage';
import RulesAndRegulationPage from './components/pages/RulesAndRegulationPage';
import ExclusionPolicyPage from './components/pages/ExclusionPolicyPage';
import ResponsibleGamblingPage from './components/pages/ResponsibleGamblingPage';
import PrivacyPolicy from './components/sidebar-components/legal-complience/PrivacyPolicy';
import DepositPage from './components/pages/DepositPage';
import WithdrawPage from './components/pages/WithdrawPage';
import GifrCardPage from './components/pages/GifrCardPage';
import PromotionPage from './components/pages/PromotionPage';
import InviteAndEarnPage from './components/pages/InviteAndEarnPage';
import SupportPage from './components/pages/SupportPage';
import BonusDetailsPage from './components/pages/BonusDetailsPage';
import ActiveBonusPage from './components/pages/ActiveBonusPage';
import BonusPage from './components/pages/BonusPage';   
import NotificationsPage from './components/pages/NotificationsPage';
import RoulettePage from './components/pages/RoulettePage';
import LotteryPage from './components/pages/LotteryPage';
import CrashGamesPage from './components/pages/CrashGamesPage';
import CasinoPage from './components/pages/CasinoPage';
import CategoryGamesPage from './components/pages/CategoryGamesPage';
import SearchPage from './components/pages/SearchPage';
import NotFound from './components/pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ThemeSynchronizer from './constants/ThemeSynchronizer';
import { useEffect, useRef } from 'react';
import { useSite, SiteProvider } from './context/SiteContext';
import { GameProvider } from './context/GameContext';
import { URL as BASE_URL, API_URL } from './utils/constants';
import BroadcastModal from './components/common/BroadcastModal';
import MultiTabGuardModal from './components/common/MultiTabGuardModal';
import AppInstallModal from './components/navbar/AppInstallModal';
import WhatsAppFloat from './components/common/WhatsAppFloat';

const GlobalAppInstallModal = () => {
  const { showAppInstallModal, setShowAppInstallModal, isInstallable, installApp, isInstalled, platform, accountInfo } = useSite();
  return (
    <AppInstallModal
      isOpen={showAppInstallModal}
      onClose={() => setShowAppInstallModal(false)}
      isInstallable={isInstallable}
      installApp={installApp}
      isInstalled={isInstalled}
      currentPlatform={platform}
      accountInfo={accountInfo}
    />
  );
};

const RootLayout = () => {
  useEffect(() => {
    try {
      const search = window.location.search;
      if (search) {
        const params = new URLSearchParams(search);
        const ref = params.get('ref') || params.get('invite') || params.get('code');
        if (ref) {
          localStorage.setItem('referral_code', ref);
          const trackKey = 'tracked_aff_click_' + ref;
          if (!sessionStorage.getItem(trackKey)) {
            sessionStorage.setItem(trackKey, '1');
            const targetApi = API_URL || 'https://api.velplay365.com/router/';
            fetch(`${targetApi}?Route=/api/v1/affiliate/track&ref=${encodeURIComponent(ref)}`).catch(() => {});
          }
        }
      }
    } catch (e) {}
  }, []);

  return (
    <>
      <ScrollRestoration />
      <BroadcastModal />
      <GlobalAppInstallModal />
      <MultiTabGuardModal />
      <WhatsAppFloat />
      <Outlet />
    </>
  );
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/register",
        element: <Home />,
      },
      {
        path: "/withdraw",
        element: (
          <ProtectedRoute>
            <WithdrawPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/bonus-details/:id",
        element: <BonusDetailsPage />,
      },
      {
        path: "/bonus-details",
        element: <BonusDetailsPage />,
      },
      {
        path: "/deposit",
        element: (
          <ProtectedRoute>
            <DepositPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/game/:gameName",
        element: (
          <ProtectedRoute>
            <GameplayComponent />
          </ProtectedRoute>
        ),
      },
      {
        path: "/game-url/:gameUrl/:gameName",
        element: (
          <ProtectedRoute>
            <GameplayComponent />
          </ProtectedRoute>
        ),
      },
      {
        path: "/transaction",
        element: (
          <ProtectedRoute>
            <Transaction />
          </ProtectedRoute>
        ),
      },
      {
        path: "/betting-profit-loss",
        element: (
          <ProtectedRoute>
            <ProfitLossPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/change-password",
        element: (
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/openbet",
        element: (
          <ProtectedRoute>
            <OpenBetPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/rules-regulation",
        element: <RulesAndRegulationPage />,
      },
      {
        path: "/exclusion",
        element: <ExclusionPolicyPage />,
      },
      {
        path: "/responsible-gambling",
        element: <ResponsibleGamblingPage />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/gifrcardreedom",
        element: (
          <ProtectedRoute>
            <GifrCardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/promotion",
        element: <PromotionPage />,
      },
      {
        path: "/bonus",
        element: <BonusPage />,
      },
      {
        path: "/active-bonus",
        element: (
          <ProtectedRoute>
            <ActiveBonusPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/inviteandearn",
        element: (
          <ProtectedRoute>
            <InviteAndEarnPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/support",
        element: <SupportPage />,
      },
      {
        path: "/notifications", element: <NotificationsPage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/roulette",
        element: <RoulettePage />,
      },
      {
        path: "/category/:categoryName",
        element: <CategoryGamesPage />,
      },
      {
        path: "/lottery",
        element: <LotteryPage />,
      },
      {
        path: "/crash-games",
        element: <CrashGamesPage />,
      },
      {
        path: "/casino",
        element: <CasinoPage />,
      },
      {
        path: "/blackjack",
        element: <CategoryGamesPage title="Blackjack" icon="🃏" sectionId="blackjack-collection" />,
      },
      {
        path: "/baccarat",
        element: <CategoryGamesPage title="Baccarat" icon="💎" sectionId="baccarat-collection" />,
      },
      {
        path: "/dragon-tiger",
        element: <CategoryGamesPage title="Dragon Tiger" icon="🐯" sectionId="dragon-tiger-collection" />,
      },
      {
        path: "/teen-patti",
        element: <CategoryGamesPage title="Teen Patti" icon="🎴" sectionId="teen-patti-collection" />,
      },
      {
        path: "/poker",
        element: <CategoryGamesPage title="Poker" icon="♠️" sectionId="poker-collection" />,
      },
      {
        path: "/game-shows",
        element: <CategoryGamesPage title="Game Shows" icon="📺" sectionId="game-shows-collection" />,
      },
      {
        path: "/andar-bahar",
        element: <CategoryGamesPage title="Andar Bahar" icon="🎴" sectionId="andar-bahar-collection" />,
      },
      {
        path: "/cockfight",
        element: <CategoryGamesPage title="Cockfight" icon="🐓" sectionId="cockfight-collection" />,
      },
      {
        path: "/fantasy",
        element: <CategoryGamesPage title="Fantasy Games" icon="🎮" sectionId="fantasy-games-collection" />,
      },
      {
        path: "/fantasy-games",
        element: <CategoryGamesPage title="Fantasy Games" icon="🎮" sectionId="fantasy-games-collection" />,
      },
      {
        path: "/fantasy_games",
        element: <CategoryGamesPage title="Fantasy Games" icon="🎮" sectionId="fantasy-games-collection" />,
      },
      {
        path: "/sic-bo",
        element: <CategoryGamesPage title="Sic Bo" icon="🎲" sectionId="sic-bo-collection" />,
      },
      {
        path: "/lucky-7",
        element: <CategoryGamesPage title="Lucky 7" icon="🎰" sectionId="lucky-7-collection" />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ]
  }
]);

const BrandManager = () => {
  const { accountInfo } = useSite();
  const lastLogoRef = useRef('');
  const lastTitleRef = useRef('');

  useEffect(() => {
    if (!accountInfo) return;

    if (accountInfo.service_site_name && lastTitleRef.current !== accountInfo.service_site_name) {
      lastTitleRef.current = accountInfo.service_site_name;
      document.title = accountInfo.service_site_name;
    }

    if (accountInfo.service_site_logo && lastLogoRef.current !== accountInfo.service_site_logo) {
      lastLogoRef.current = accountInfo.service_site_logo;

      const logoPath = String(accountInfo.service_site_logo).replace(/\\/g, '/');
      const logoUrl = (logoPath.startsWith('http') || logoPath.startsWith('data:'))
        ? logoPath
        : (logoPath.startsWith('/') ? window.location.origin + logoPath : `${BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL}${logoPath.startsWith('/') ? logoPath : `/${logoPath}`}`);

      ['icon', 'shortcut icon', 'apple-touch-icon'].forEach(rel => {
        let link = document.querySelector(`link[rel="${rel}"]`);
        if (!link) {
          link = document.createElement('link');
          link.rel = rel;
          document.head.appendChild(link);
        }
        if (link.getAttribute('href') !== logoUrl) {
          link.setAttribute('href', logoUrl);
        }
      });
    }
  }, [accountInfo?.service_site_name, accountInfo?.service_site_logo]);

  return null;
};

function App() {
  return (
    <SiteProvider>
      <GameProvider>
        <BrandManager />
        <ThemeSynchronizer />
        <NetworkStatusToast />
        <RouterProvider router={appRouter} />
      </GameProvider>
    </SiteProvider>
  );
}

export default App;

