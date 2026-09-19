import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import {
  FaGift,
  FaCrown,
  FaStar,
  FaTrophy,
  FaGamepad,
  FaGem,
  FaBolt,
  FaCalendarAlt,
  FaShieldAlt,
  FaUserFriends,
  FaArrowRight,
  FaTimes,
  FaExpandAlt
} from 'react-icons/fa';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { URL as BASE_URL } from "../../utils/constants"

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

function PromotionSection({ banners = [] }) {
  const COLORS = useColors();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  
  if (!banners || banners.length === 0) {
    return null; // Hide the section if no promotions are active
  }

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath?.startsWith('http') ? imagePath : (imagePath?.startsWith('/') ? window.location.origin + imagePath : `${BASE_URL}${imagePath}`));
  };

  const closePortal = () => setSelectedImage(null);

  const promotions = [
    {
      title: "Welcome Bonus",
      description: "Get 100% bonus on your first deposit up to ₹10,000",
      gradient: "from-cyan-500/10 to-transparent",
      icon: <FaGift className="text-cyan-400" />,
      buttonText: "Claim Now"
    },
    {
      title: "Weekly Rebate",
      description: "Enjoy up to 1.2% unlimited weekly rebate on all games",
      gradient: "from-blue-500/10 to-transparent",
      icon: <FaBolt className="text-blue-500" />,
      buttonText: "Learn More"
    },
    {
      title: "Daily Cashback", description: "Get real daily cashback on your casino and sports gameplay", gradient: "from-brand/10 to-transparent", icon: <FaCrown className="text-brand" />, buttonText: "Learn More"
    }
  ];

  return (
    <section className="relative py-2 md:py-4 overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Elite Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 md:gap-0 mb-8 md:mb-10 pb-6 border-b border-black/5 dark:border-white/5">
          <div className="space-y-2">
            <h2
              className="section-banner max-w-full"
              style={{ fontFamily: FONTS.head }}
            >
              <span>Exclusive Elite Offers</span>
            </h2>
            <div className="flex items-center gap-2 md:gap-3 pl-1">
              <div className="h-px w-8 md:w-12 bg-gray-100 dark:bg-white/20"></div>
              <span className="text-[8px] md:text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]">Current Promotions & Rewards</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/promotion')}
            className="see-all"
          >
            View All Promotions
          </button>
        </div>

        {/* Promotions Carousel */}
        <div className="relative group">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              0: { slidesPerView: 1.15, spaceBetween: 12 },
              480: { slidesPerView: 1.6, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 2.5, spaceBetween: 24 },
              1280: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="!pb-12"
          >
            {banners.map((item, index) => (
              <SwiperSlide key={index}>
                <motion.div
                   whileHover={{ scale: 1.02 }}
                   className="relative aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-2xl group/card bg-black"
                   onClick={() => handleImageClick(item.image_path)}
                >
                  <img 
                    src={item.image_path?.startsWith('http') ? item.image_path : (item.image_path?.startsWith('/') ? window.location.origin + item.image_path : `${BASE_URL}${item.image_path}`)} 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover/card:scale-110" 
                    alt={`Promotion ${index + 1}`} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity"></div>
                  
                  {/* Hover Overlay Content */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 text-white transform scale-90 group-hover/card:scale-100 transition-transform duration-300">
                      <FaExpandAlt className="text-xl" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-5 right-5 pointer-events-none">
                     <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-px bg-brand"></div>
                        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-brand">Featured Offer</span>
                     </div>
                     <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1 drop-shadow-lg">
                        Exclusive Rewards
                     </h3>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Premium Image Portal Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 overflow-hidden bg-black/95 backdrop-blur-xl"
            onClick={closePortal}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-6xl w-full max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closePortal}
                className="absolute -top-12 right-0 md:-right-12 w-10 h-10 rounded-full bg-white/10 hover:bg-brand/20 border border-white/10 flex items-center justify-center text-white transition-all group"
              >
                <FaTimes className="group-hover:rotate-90 transition-transform" />
              </button>
              
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(var(--brand-rgb),0.3)] border border-white/10">
                <img 
                  src={selectedImage} 
                  alt="Enlarged Promotion" 
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
                
                {/* Modal Footer Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center text-brand border border-brand/30">
                      <FaCrown />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">Elite Exclusive Offer</h3>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Premium Rewards Membership</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default PromotionSection;
