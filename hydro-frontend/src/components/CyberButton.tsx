import React from 'react';

interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

const CyberButton: React.FC<CyberButtonProps> = ({ children, onClick, className = '', icon: Icon, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative group overflow-hidden px-8 py-3 rounded-full transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95 hover:scale-[1.02]'} ${className}`}
      style={{
        background: 'linear-gradient(180deg, #4cc9f0 0%, #4361ee 100%)',
        boxShadow: disabled ? 'none' : `
          0 10px 20px -5px rgba(67, 97, 238, 0.4),
          inset 0 -4px 6px rgba(0, 0, 0, 0.15),
          inset 0 4px 6px rgba(255, 255, 255, 0.4),
          0 0 0 1px rgba(255, 255, 255, 0.1)
        `,
        color: 'white',
        fontWeight: 800,
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        letterSpacing: '0.02em',
        border: 'none',
      }}
    >
      {/* Glow effect on hover */}
      {!disabled && (
        <div className="absolute inset-0 bg-[#4cc9f0] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
      )}
      
      {/* Glossy top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none" />
      
      {/* Animated sweep light */}
      {!disabled && (
        <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:animate-sweep" />
      )}

      {Icon && <Icon size={20} className="relative z-10 drop-shadow-sm" />}
      <span className="relative z-10 drop-shadow-md">{children}</span>

      <style jsx>{`
        @keyframes sweep {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        .animate-sweep {
          animation: sweep 2.5s infinite ease-in-out;
        }
      `}</style>
    </button>
  );
};

export default CyberButton;
