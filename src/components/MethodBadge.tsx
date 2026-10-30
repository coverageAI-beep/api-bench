import React from 'react';
import { HttpMethod } from '../types/api';

interface MethodBadgeProps {
  method: HttpMethod | string;
  size?: 'sm' | 'md' | 'lg';
}

export const MethodBadge: React.FC<MethodBadgeProps> = ({ method, size = 'md' }) => {
  const m = (method || 'GET').toUpperCase();

  const getStyles = () => {
    switch (m) {
      case 'GET':
        return 'bg-[#E5EFE7] text-[#265937] border-[#C8DEC9]';
      case 'POST':
        return 'bg-[#E5EEF7] text-[#2B577A] border-[#C4D9EC]';
      case 'PUT':
        return 'bg-[#FAF0DF] text-[#7C5318] border-[#EED7B0]';
      case 'PATCH':
        return 'bg-[#F2EBF9] text-[#5E3C7A] border-[#DEC9EE]';
      case 'DELETE':
        return 'bg-[#F9E7E4] text-[#8A372E] border-[#ECC4BE]';
      case 'OPTIONS':
      case 'HEAD':
        return 'bg-[#EFECE6] text-[#57534E] border-[#D9D2C7]';
      default:
        return 'bg-[#EFECE6] text-[#57534E] border-[#D9D2C7]';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[11px] tracking-wide';
      case 'lg':
        return 'px-3 py-1 text-sm tracking-wider font-semibold';
      case 'md':
      default:
        return 'px-2.5 py-0.5 text-xs tracking-wider';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-semibold rounded-md border shrink-0 ${getStyles()} ${getSize()}`}
    >
      {m}
    </span>
  );
};
