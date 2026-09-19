import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { useColors } from '../../hooks/useColors';
import { URL as BASE_URL } from "../../utils/constants"

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

function FrontScrollableCard({ banners = [] }) {
  const COLORS = useColors();

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative group hero-swiper-container rounded-sm sm:rounded md:rounded-md overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        loop={banners.length > 1}
        speed={1500}
        parallax={true}
        watchSlidesProgress={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        autoHeight={false}
        className="w-full h-auto"
      >
        {banners.map((slide, index) => (
          <SwiperSlide key={index} className="overflow-hidden">
            <div className="relative w-full h-[180px] sm:h-[280px] md:h-[380px] lg:h-[450px]" data-swiper-parallax="20%">
              <img
                className="w-full h-full object-fill block transform transition-transform duration-[6000ms] hover:scale-105"
                src={slide.image_path?.startsWith('http') ? slide.image_path : (slide.image_path?.startsWith('/') ? window.location.origin + slide.image_path : `${BASE_URL}${slide.image_path}`)}
                alt={`Banner ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
              />
              {/* Premium Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hero-swiper-container .swiper-pagination-bullet {
          background: #fff !important;
          opacity: 0.3;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .hero-swiper-container .swiper-pagination-bullet-active {
          background: #FFB000 !important;
          opacity: 1;
          width: 24px !important;
          border-radius: 4px !important;
        }
        .hero-swiper-container .swiper-button-disabled {
          opacity: 0 !important;
          pointer-events: none;
        }
      ` }} />
    </div>
  );
}

export default FrontScrollableCard;
