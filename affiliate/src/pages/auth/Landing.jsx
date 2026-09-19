import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  DollarSign, 
  Users, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Target, 
  Layers, 
  Award, 
  Percent, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Share2, 
  MessageSquare, 
  Globe,
  Menu,
  X,
  Lock,
  Calculator,
  ArrowUpRight,
  Code,
  Image as ImageIcon,
  Send,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export const Landing = () => {
  // Calculator metrics
  const [ftds, setFtds] = useState(75);
  const [avgRevenue, setAvgRevenue] = useState(250);
  const [calculatorTab, setCalculatorTab] = useState('revshare');

  // Interactive console states
  const [selectedLadderLevel, setSelectedLadderLevel] = useState('Gold');
  const [activeFaq, setActiveFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Webhook Sandbox states
  const [webhookEvent, setWebhookEvent] = useState('ftd'); // 'ftd', 'bet', 'payout'
  const [isSandboxTesting, setIsSandboxTesting] = useState(false);
  const [sandboxLog, setSandboxLog] = useState(null);

  // Simulated live event stream for the ticker
  const [liveEvents, setLiveEvents] = useState([
    { id: 1, text: 'Affiliate partner_904 referred user registered from India', time: 'Just now' },
    { id: 2, text: 'Payout of $1,450.00 processed successfully via UPI', time: '2m ago' },
    { id: 3, text: 'Gold Partner referred user wagered $500 on Roulette', time: '5m ago' }
  ]);

  // Rotates simulated live events
  useEffect(() => {
    const eventTexts = [
      'Affiliate partner_204 referred player registered from Delhi',
      'Gold Partner referred player deposited $200 on Slots',
      'Diamond Partner weekly commission of $4,850 sent via USDT-TRC20',
      'Partner link generated for sub-id: google_search_sports',
      'Affiliate partner_718 override commission generated ($120.00)',
      'Payout of $3,120.50 processed successfully via Bank Wire'
    ];
    
    const interval = setInterval(() => {
      const randomText = eventTexts[Math.floor(Math.random() * eventTexts.length)];
      setLiveEvents(prev => [
        { id: Date.now(), text: randomText, time: 'Just now' },
        prev[0],
        prev[1]
      ].slice(0, 3));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const benefits = [
    { 
      title: 'Real-Time Web Analytics', 
      desc: 'Optimize campaigns using high-fidelity statistics tracking clicks, registration funnels, deposits, wagers, and commission payouts.', 
      icon: Cpu, 
      color: 'text-blue-600 bg-blue-50 border-blue-100 shadow-[0_4px_12px_rgba(37,99,235,0.03)]' 
    },
    { 
      title: 'Industry Leading Rev-Share', 
      desc: 'Earn lifetime recurring commission. Our partners receive up to 45% revenue share based on the total net gaming volume of referred players.', 
      icon: DollarSign, 
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100 shadow-[0_4px_12px_rgba(6,182,212,0.03)]' 
    },
    { 
      title: 'Sub-Affiliate Overrides', 
      desc: 'Grow your network exponentially. Recruit other webmasters and affiliates to earn an additional 5% override commission on their volume.', 
      icon: Users, 
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-[0_4px_12px_rgba(79,70,229,0.03)]' 
    },
    { 
      title: 'On-Time Guaranteed Payments', 
      desc: 'Calculated and paid automatically by the 5th of each month via Bank Transfer, local UPI, or USDT/BTC with $100 minimum payout threshold.', 
      icon: ShieldCheck, 
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-[0_4px_12px_rgba(16,185,129,0.03)]' 
    }
  ];

  const tools = [
    { title: 'Dynamic Trackers', desc: 'Generate target URLs with sub-ID parameters to segment traffic campaigns and monitor conversions.', icon: Share2 },
    { title: 'Rich Media Banner Gallery', desc: 'Access localized display banners, landing page HTMLs, and dynamic widgets optimized for sports and casino.', icon: Globe },
    { title: 'JSON Webhooks & API', desc: 'Integrate real-time postback events directly into your tracker backend to track registrations and deposits.', icon: Zap },
    { title: 'Dedicated Account Managers', desc: 'Get 24/7 personal assistance on Telegram or Skype to assist with custom creative design and CPA optimization.', icon: MessageSquare }
  ];

  const faqs = [
    {
      q: 'How does the Velplay Affiliate program work?',
      a: 'The affiliate program allows you to earn money by promoting Velplay to your audience. When users register via your unique referral links and make deposits or place wagers, you receive a percentage of the revenue generated or a flat CPA bonus, depending on your selected commission structure.'
    },
    {
      q: 'Is there a signup fee to join Velplay Partners?',
      a: 'No. Joining the affiliate program is completely free. We provide all the tracking links, banners, and back-office tools at no cost.'
    },
    {
      q: 'What is the "No Negative Carryover" policy?',
      a: 'If your referred players win big in a given month, generating a negative revenue balance for you, we will reset your negative balance back to zero at the beginning of the next calendar month. You never start a month in debt.'
    },
    {
      q: 'When do I get paid and what are the payment methods?',
      a: 'Earnings are compiled on the 1st of every month and processed by the 5th. We support bank wire transfers, local UPI, and cryptocurrency wallets (USDT/BTC). The minimum payout threshold is $100.'
    },
    {
      q: 'How long do cookies track my referred players?',
      a: 'Our tracking cookie lifetime is 30 days. If a user clicks your tracking link, they can sign up anytime within 30 days and they will be mapped to your affiliate account for lifetime commission overrides.'
    }
  ];

  // Commission tier data
  const tiersConfig = {
    Bronze: { share: 25, cpa: 20, ftds: '0 - 10 FTDs/Mo', desc: 'Standard commission tier for new creators and social media starters.', color: 'text-blue-500 border-blue-100 bg-blue-50/50' },
    Silver: { share: 30, cpa: 30, ftds: '11 - 30 FTDs/Mo', desc: 'Ideal for bloggers and media buyers with moderate traffic flow.', color: 'text-indigo-500 border-indigo-100 bg-indigo-50/50' },
    Gold: { share: 35, cpa: 40, ftds: '31 - 80 FTDs/Mo', desc: 'Unlock hybrid capabilities, dedicated Telegram support group and custom marketing materials.', color: 'text-cyan-500 border-cyan-100 bg-cyan-50/50' },
    Platinum: { share: 40, cpa: 50, ftds: '81 - 150 FTDs/Mo', desc: 'Get faster weekly payouts, higher CPA overrides, and custom event postbacks.', color: 'text-emerald-500 border-emerald-100 bg-emerald-50/50' },
    Diamond: { share: 45, cpa: 60, ftds: '150+ FTDs/Mo', desc: 'Ultimate tier for agency networks, sports channels, and top influencers. Features custom CPA and override options.', color: 'text-purple-500 border-purple-100 bg-purple-50/50 shadow-[0_4px_20px_rgba(168,85,247,0.08)]' }
  };

  const programTiers = [
    { name: 'Bronze', share: '25%', cpa: '$20', condition: '0 - 10 FTDs / Mo', glow: false },
    { name: 'Silver', share: '30%', cpa: '$30', condition: '11 - 30 FTDs / Mo', glow: false },
    { name: 'Gold', share: '35%', cpa: '$40', condition: '31 - 80 FTDs / Mo', glow: false },
    { name: 'Platinum', share: '40%', cpa: '$50', condition: '81 - 150 FTDs / Mo', glow: false },
    { name: 'Diamond', share: '45%', cpa: '$60+', condition: '150+ FTDs / Mo', glow: true }
  ];

  const currentTier = tiersConfig[selectedLadderLevel];

  // Dynamic calculations for the gauge calculator
  const netGamingRevenue = ftds * avgRevenue;
  // Get active tier based on ftds slider
  const getTierByFtds = (count) => {
    if (count <= 10) return tiersConfig.Bronze;
    if (count <= 30) return tiersConfig.Silver;
    if (count <= 80) return tiersConfig.Gold;
    if (count <= 150) return tiersConfig.Platinum;
    return tiersConfig.Diamond;
  };
  const activeCalcTier = getTierByFtds(ftds);
  const revShareEarnings = netGamingRevenue * (activeCalcTier.share / 100);
  const cpaEarnings = ftds * activeCalcTier.cpa;
  const totalEarnings = calculatorTab === 'revshare' ? (revShareEarnings + cpaEarnings) : (ftds * 50);

  // SVG Gauge radial computation
  const radius = 55;
  const circumference = 2 * Math.PI * radius; // 345.57
  const maxProjectedEarnings = 15000;
  const fillPercentage = Math.min(totalEarnings / maxProjectedEarnings, 1);
  const strokeDashoffset = circumference - (fillPercentage * circumference);

  // Mock Developer Webhook trigger
  const runSandboxTest = () => {
    setIsSandboxTesting(true);
    setSandboxLog(null);
    setTimeout(() => {
      setIsSandboxTesting(false);
      if (webhookEvent === 'ftd') {
        setSandboxLog({
          event: 'first_time_deposit',
          click_id: 'aff_click_' + Math.random().toString(36).substr(2, 9),
          affiliate_id: 48103,
          payout_cpa: activeCalcTier.cpa,
          player: { country: 'IN', deposit: avgRevenue, is_ftd: true },
          timestamp: new Date().toISOString()
        });
      } else if (webhookEvent === 'bet') {
        setSandboxLog({
          event: 'wager_placed',
          player_id: 'player_' + Math.floor(Math.random() * 9000 + 1000),
          wager_amount: 120.00,
          house_revenue: 8.50,
          affiliate_revshare: activeCalcTier.share + '%',
          payout_earned: (8.5 * (activeCalcTier.share / 100)).toFixed(3),
          timestamp: new Date().toISOString()
        });
      } else {
        setSandboxLog({
          event: 'payout_completed',
          payout_id: 'tx_' + Math.random().toString(36).substr(2, 9),
          amount_usd: totalEarnings.toFixed(2),
          method: 'USDT-TRC20',
          wallet: '0x71C...3a92',
          timestamp: new Date().toISOString()
        });
      }
    }, 1200);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      {/* Floating Header Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 flex justify-center w-full transition-all duration-300">
        <header className="w-full max-w-7xl bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl py-3 px-6 shadow-sm shadow-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo512.png" className="h-7 w-7 object-contain" alt="Logo" />
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent tracking-tight font-head">
              VELPLAY
            </span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.25em] block border-l border-slate-200 pl-2">
              Partners
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
            <a href="#bento-benefits" className="hover:text-slate-900 transition-colors">Why Velplay</a>
            <a href="#calculator-gauge" className="hover:text-slate-900 transition-colors">Estimates</a>
            <a href="#interactive-ladder" className="hover:text-slate-900 transition-colors">Tiers Ladder</a>
            <a href="#developer-sandbox" className="hover:text-slate-900 transition-colors">API Sandbox</a>
            <a href="#faqs" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-950 font-bold text-xs uppercase tracking-wider">Sign In</Button>
            </Link>
            <Link to="/apply">
              <Button size="sm" className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 hover:scale-[1.02] active:scale-[0.98] transition-transform text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md border-0 py-2.5 px-4 flex items-center gap-1.5 cursor-pointer">
                <UserPlus className="h-3.5 w-3.5" />
                Become a Partner
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-slate-500 hover:text-slate-950 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 space-y-4 flex flex-col shadow-xl animate-modal-in">
            <a href="#bento-benefits" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-slate-950 text-sm font-bold uppercase tracking-wider py-1 text-left">Why Velplay</a>
            <a href="#calculator-gauge" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-slate-950 text-sm font-bold uppercase tracking-wider py-1 text-left">Estimates</a>
            <a href="#interactive-ladder" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-slate-950 text-sm font-bold uppercase tracking-wider py-1 text-left">Tiers Ladder</a>
            <a href="#developer-sandbox" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-slate-950 text-sm font-bold uppercase tracking-wider py-1 text-left">API Sandbox</a>
            <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-slate-950 text-sm font-bold uppercase tracking-wider py-1 text-left">FAQ</a>
            
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full text-slate-700 border-slate-200 rounded-xl">Sign In</Button>
              </Link>
              <Link to="/apply" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Become a Partner
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center sm:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm mx-auto sm:mx-0">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">#1 iGaming Affiliate Network</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight leading-[1.05] text-slate-900 font-display mt-4">
              Monetize traffic.<br />
              Multiply{' '}
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Commissions
              </span>.
            </h1>
            
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
              Drive sports & casino wagers to Velplay. Enjoy lifetime recurring overrides up to <span className="text-slate-950 font-bold border-b-2 border-cyan-400">45% revenue shares</span>, weekly payments, customizable postbacks, and zero negative balance carryover.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-4">
              <Link to="/apply" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm uppercase tracking-wider font-bold shadow-lg shadow-blue-500/15 rounded-xl border-0 py-3.5 px-6">
                  Become a Partner
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-sm uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-2 py-3.5 px-6 font-bold">
                  <Lock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  Partner Login
                </Button>
              </Link>
            </div>
            
            {/* Quick trust metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200 max-w-xl text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">No Negative Carryover</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Lifetime Commissions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Weekly Payout Transfers</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration (Right column - Premium 3D Generated Asset) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 blur-[100px] rounded-full animate-pulse-glow" />
            
            <div className="border border-slate-200/50 bg-white rounded-[2rem] p-2.5 shadow-2xl shadow-blue-500/10 rotate-1 hover:rotate-0 transition-transform duration-500 overflow-hidden relative">
              <img 
                src="/affiliate_hero_premium.jpg" 
                alt="Velplay Premium Affiliate Suite" 
                className="w-full h-auto object-cover rounded-[1.7rem] relative z-10"
              />
              
              {/* Overlay Glassmorphism details */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/70 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-lg z-20 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Featured Dashboard</span>
                  <span className="font-bold text-slate-800 text-[11px] block mt-0.5">Velplay Sports & Casino Hub</span>
                </div>
                <span className="bg-blue-600 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                  Active
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Floating Neon Pill Live Action Timeline */}
      <section className="relative z-20 -mt-6 mb-16 px-4 max-w-6xl mx-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-[2rem] md:rounded-full py-4 px-6 md:px-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col lg:flex-row items-center gap-4 md:gap-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex items-center gap-2.5 text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-700 pb-3 lg:pb-0 lg:pr-6 w-full lg:w-auto justify-center lg:justify-start">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span>Live Action</span>
          </div>
          
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 relative z-10">
            {liveEvents.map((evt) => (
              <div key={evt.id} className="text-xs flex items-center justify-between border-l border-slate-700/50 pl-4 py-1">
                <span className="text-slate-300 font-medium truncate pr-2">{evt.text}</span>
                <span className="text-[9px] text-blue-400 font-bold uppercase font-mono shrink-0 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">{evt.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="bento-benefits" className="max-w-7xl mx-auto px-6 py-24 relative z-10 text-left">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest font-display">Bento Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900">
            Designed for Conversion, Engineered for Scale
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Discover a suite of tools built to track, optimize, and monetize player wagers.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Box 1: Web Analytics (2 columns) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl shadow-blue-900/10 hover:shadow-blue-500/20 hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="p-8 space-y-3 relative z-10">
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider block">Live Dashboard Analytics</span>
              <h3 className="text-[22px] font-bold text-white font-display">Real-Time Funnel Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal max-w-xl">
                Monitor player registrations, deposit activity, wager volumes, and commissions instantly inside your backoffice. Get immediate statistics mapping for traffic channels.
              </p>
            </div>
            
            {/* Visual Analytics Image inside bento grid - FULL BLEED */}
            <div className="relative z-10 mt-auto w-full h-[200px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay pointer-events-none z-10" />
              <img src="/affiliate_analytics.jpg" alt="Web Analytics Dashboard" className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>

          {/* Box 2: Weekly Cashout (1 column) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl shadow-blue-900/10 hover:shadow-emerald-500/20 hover:border-emerald-500/30 transition-all duration-500 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Cashflow Payouts</span>
              <h3 className="text-xl font-bold text-white font-display">Guaranteed Weekly Cashout</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Never wait weeks for commission balances. Payout balances process automatically every week directly via local UPI, wire, or cryptocurrency wallets.
              </p>
            </div>
            
            <div className="space-y-3 text-xs font-semibold text-slate-300 text-left pt-4 font-head relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✓</div>
                <span>$100 Minimum Payout Limit</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✓</div>
                <span>Zero Transfer / Admin Fees</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✓</div>
                <span>Automated Invoice Generation</span>
              </div>
            </div>
          </div>
          
          {/* Box 3: Sub-Affiliates matrix (1 column) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl shadow-blue-900/10 hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-500 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">Affiliate Overrides</span>
              <h3 className="text-xl font-bold text-white font-display">Sub-Affiliate Matrix</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Earn override commissions on players brought by affiliates you recruit. We support multi-level override mapping up to 5% flat.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 font-head text-[10px] font-bold relative z-10 group-hover:border-cyan-500/30 transition-colors">
              <div className="px-3 py-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm">You (100% Core)</div>
              <div className="h-4 w-0.5 bg-slate-700" />
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">Aff_Partner_A (5%)</span>
                <span className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">Aff_Partner_B (5%)</span>
              </div>
            </div>
          </div>

          {/* Box 4: Account Managers (2 columns) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl shadow-blue-900/10 hover:shadow-indigo-500/20 hover:border-indigo-500/30 transition-all duration-500 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">Dedicated Assistance</span>
              <h3 className="text-xl font-bold text-white font-display">1-on-1 VIP Managers Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Get custom designed banner creatives, exclusive player promocodes, API integrations, and direct custom deals via Telegram/Skype available 24/7.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between pt-2 relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  TG
                </div>
                <div className="text-left">
                  <h4 className="font-extrabold text-sm text-slate-200">Velplay Partners Telegram Support</h4>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active 24/7 online
                  </span>
                </div>
              </div>
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="self-center">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 text-xs font-bold font-display uppercase tracking-wider rounded-xl">
                  Message Manager
                </Button>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Income Calculator */}
      <section id="calculator-gauge" className="bg-slate-100/50 border-b border-slate-200/80 px-6 py-24 relative z-10 text-left">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-display">Projected Commissions</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900">
              Interactive Income Gauge
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Adjust sliders below to view estimated payouts. Watch the radial target gauge adjust in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left sliders console */}
            <div className="lg:col-span-6 bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm flex flex-col justify-center space-y-8">
              
              {/* Tab options toggle */}
              <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/60 flex w-full">
                <button 
                  onClick={() => setCalculatorTab('revshare')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    calculatorTab === 'revshare' 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Revenue Share (Up to 45%)
                </button>
                <button 
                  onClick={() => setCalculatorTab('cpa')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    calculatorTab === 'cpa' 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  CPA Deal ($50 FTD)
                </button>
              </div>

              {/* Slider 1: FTD count */}
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">New Depositing Players (FTDs)</label>
                  <span className="text-lg font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-lg font-mono">
                    {ftds}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="300" 
                  step="5"
                  value={ftds} 
                  onChange={(e) => setFtds(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>5 FTDs</span>
                  <span>10 (Bronze)</span>
                  <span>30 (Silver)</span>
                  <span>80 (Gold)</span>
                  <span>150+ (Diamond)</span>
                </div>
              </div>

              {/* Slider 2: Average Deposit (Only when RevShare is selected) */}
              {calculatorTab === 'revshare' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Avg. Deposit Per Player</label>
                    <span className="text-lg font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-lg font-mono">
                      ${avgRevenue}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="25" 
                    value={avgRevenue} 
                    onChange={(e) => setAvgRevenue(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>$50</span>
                    <span>$250</span>
                    <span>$500</span>
                    <span>$750</span>
                    <span>$1,000</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Gauge Dial Panel */}
            <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-around gap-8">
              
              {/* Radial Progress Gauge SVG */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track circle */}
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    className="stroke-slate-100" 
                    strokeWidth="10" 
                    fill="transparent" 
                  />
                  {/* Glowing Active Ring */}
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    className="stroke-blue-600 transition-all duration-300 ease-out" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Gauge inside data */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated</span>
                  <span className="text-xl font-black text-slate-900 font-display tracking-tight mt-0.5">
                    ${totalEarnings.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 mt-0.5">/ Month</span>
                </div>
              </div>

              {/* Receipt metrics list */}
              <div className="flex-1 space-y-4 text-left w-full">
                <div className="border-b pb-2 mb-2 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Contracts Breakdown</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    calculatorTab === 'revshare' ? activeCalcTier.badgeColor : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {calculatorTab === 'revshare' ? `${activeCalcTier.name} Tier` : 'CPA Deal'}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs font-mono font-bold text-slate-600">
                  {calculatorTab === 'revshare' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Commission Rate:</span>
                        <span>{activeCalcTier.share}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">RevShare Profit:</span>
                        <span>${revShareEarnings.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">CPA Tier Reward:</span>
                        <span>${cpaEarnings.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">CPA Rate:</span>
                        <span>$50.00 / FTD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Total FTD count:</span>
                        <span>{ftds}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-2">
                  <Link to="/apply">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl border-0 shadow-md shadow-blue-500/10 py-3">
                      Apply and Claim Deal
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Interactive Level Tiers Ladder */}
      <section id="interactive-ladder" className="max-w-7xl mx-auto px-6 py-24 border-b border-slate-200/60 relative z-10 text-left">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-display">Tiers Ladder</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900">
            Interactive Level Ladder
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Click on a level bracket below to view specific perks, reward payouts, and tier qualifications.
          </p>
        </div>

        {/* Level steps timeline */}
        <div className="space-y-12">
          {/* Timeline steps selection */}
          <div className="relative flex justify-between items-center max-w-4xl mx-auto font-head text-xs font-bold">
            {/* Timeline line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            
            {Object.keys(tiersConfig).map((level) => {
              const isSelected = selectedLadderLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLadderLevel(level)}
                  className={`h-9 px-4 rounded-full border relative z-10 transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/15 scale-105' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {/* Focal Tier detail display */}
          <div className={`max-w-xl mx-auto border rounded-3xl p-8 bg-white shadow-lg shadow-slate-100 flex flex-col justify-between min-h-[220px] transition-all duration-300 relative overflow-hidden ${currentTier.color}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold uppercase tracking-widest">{selectedLadderLevel} Contract Perks</span>
                <span className="text-[10px] font-black uppercase tracking-wider font-mono">Req: {currentTier.ftds}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">{currentTier.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t font-mono text-xs font-bold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans">RevShare Percentage:</span>
                <span className="text-slate-800 font-black text-sm">{currentTier.share}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans">CPA Override:</span>
                <span className="text-slate-800 font-black text-sm">${currentTier.cpa}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer API Webhook Sandbox Console */}
      <section id="developer-sandbox" className="max-w-7xl mx-auto px-6 py-24 border-b border-slate-200/60 relative z-10 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left info description column */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-display">Integration Testbed</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900 mt-2">
                Developer API Webhook Sandbox
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mt-4">
                Advanced tracking webhooks are available out of the box. Select an event trigger model on the right and test the payload response dynamically.
              </p>
            </div>

            {/* Test buttons */}
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => setWebhookEvent('ftd')}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  webhookEvent === 'ftd' ? 'border-blue-500 bg-white shadow-sm' : 'border-transparent hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Code className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-800">Player Deposit Event (FTD)</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button 
                onClick={() => setWebhookEvent('bet')}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  webhookEvent === 'bet' ? 'border-blue-500 bg-white shadow-sm' : 'border-transparent hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-800">Real-Time Bet Wager Event</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button 
                onClick={() => setWebhookEvent('payout')}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  webhookEvent === 'payout' ? 'border-blue-500 bg-white shadow-sm' : 'border-transparent hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-800">Weekly Commission Payout</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right API console layout */}
          <div className="lg:col-span-7 bg-slate-900 text-slate-200 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[380px]">
            
            {/* Header elements */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              <span>Velplay sandbox console v1.0</span>
              <span>Event: {webhookEvent.toUpperCase()}</span>
            </div>

            {/* Main log output screen */}
            <div className="flex-1 flex flex-col justify-center min-h-[220px] font-mono text-[10.5px] mt-4 overflow-y-auto text-left">
              {isSandboxTesting ? (
                <div className="flex items-center justify-center gap-2 text-slate-400 py-8">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  <span>Connecting webhook endpoint and transmitting mock payload...</span>
                </div>
              ) : sandboxLog ? (
                <pre className="text-emerald-400 font-mono">{JSON.stringify(sandboxLog, null, 2)}</pre>
              ) : (
                <div className="text-slate-500 py-8 text-center">
                  <span>Select an event trigger configuration on the left and click "Transmit Test Event" below to test the endpoint response.</span>
                </div>
              )}
            </div>

            {/* Footer trigger button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <Button 
                onClick={runSandboxTest}
                disabled={isSandboxTesting}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-105 text-white font-bold text-xs uppercase tracking-wider rounded-xl border-0 py-2.5 px-4 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                Transmit Test Event
              </Button>
            </div>

          </div>

        </div>
      </section>

      {/* Toolkit details */}
      <section id="tools" className="max-w-7xl mx-auto px-6 py-24 relative z-10 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-display">Creative Library</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900">
              Advanced Marketing Toolkit
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              We provide state-of-the-art marketing equipment and real-time tracking scripts to optimize and measure your traffic campaign ROI.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-sm text-slate-700 font-bold font-display">Automatic tracking link generation</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-sm text-slate-700 font-bold font-display">High conversion landing page creatives</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-400 text-white shadow-lg shadow-indigo-500/20 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-sm text-slate-700 font-bold font-display">Real-time stats sync & server postbacks</span>
              </div>
            </div>
          </div>

          {/* Right grid cards column - Staggered layout */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            
            {tools.map((t, idx) => (
              <div key={t.title} className={`bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-blue-500/40 hover:-translate-y-2 transition-all duration-300 text-left space-y-4 shadow-xl shadow-slate-200/50 group relative overflow-hidden ${idx % 2 !== 0 ? 'sm:mt-12' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center justify-center h-14 w-14 bg-slate-800 border border-slate-700 text-cyan-400 rounded-2xl group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-400 transition-all duration-300 shadow-lg">
                  <t.icon className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-white text-lg relative z-10 font-display">{t.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal relative z-10">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faqs" className="max-w-4xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-display">Got Questions?</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-sm">Everything you need to know about the Velplay Partner program.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div 
                key={faq.q} 
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-800 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <span className="text-sm sm:text-base pr-4 font-semibold">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-4 font-normal text-left">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom VIP CTA Block */}
      <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-2xl shadow-blue-900/20">
          {/* Glowing background */}
          <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="text-left space-y-6">
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest bg-blue-900/50 border border-blue-500/20 px-3 py-1.5 rounded-full">Velplay Partners Program</span>
              <h2 className="text-3xl sm:text-4xl lg:text-[45px] font-black tracking-tight font-display text-white leading-tight">
                Unlock Your VIP{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Earning Potential
                </span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md font-normal">
                Join thousands of successful webmasters, influencers, and media buyers who profit from the leading sportsbook and casino brand today.
              </p>
              <div className="pt-4">
                <Link to="/apply">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white font-bold px-8 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 border-0 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all py-4">
                    Apply Now & Start Earning
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 blur-3xl rounded-full" />
              <img src="/affiliate_vip.jpg" alt="VIP Access" className="w-full max-w-[320px] h-auto object-cover rounded-3xl rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-black/50 border border-white/10 relative z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200 relative z-10 text-center space-y-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Velplay Partners. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
            <span className="text-slate-200 hidden sm:inline">•</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <span className="text-slate-200 hidden sm:inline">•</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
