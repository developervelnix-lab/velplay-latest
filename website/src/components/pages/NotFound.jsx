import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faHome, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';

const NotFound = () => {
    const COLORS = useColors();
    const navigate = useNavigate();

    return (
        <div 
            className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-white relative overflow-hidden"
            style={{ backgroundColor: COLORS.bg }}
        >
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 text-center max-w-md w-full">
                {/* 404 Visual */}
                <div className="relative mb-12">
                    <h1 
                        className="text-[120px] font-black leading-none tracking-tighter opacity-10 select-none"
                        style={{ fontFamily: FONTS.head }}
                    >
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-brand/20 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl animate-pulse">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-brand text-4xl -rotate-12" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <h2 
                    className="text-3xl font-black uppercase tracking-tight mb-4"
                    style={{ fontFamily: FONTS.head }}
                >
                    Lost in <span className="text-brand">Space?</span>
                </h2>
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-12 leading-relaxed">
                    The page you are looking for doesn't exist or has been moved to another galaxy.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => navigate("/")}
                        className="w-full py-4 rounded-2xl bg-brand text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faHome} />
                        Return Home
                    </button>
                    
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                        Go Back
                    </button>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-8 left-0 w-full text-center opacity-20">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Unauthorized Zone</p>
            </div>
        </div>
    );
};

export default NotFound;
