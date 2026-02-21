import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const DEAL_TYPE_MAP: Record<string, string> = {
    SALE: '매매',
    JEONSE: '전세',
    MONTHLY: '월세',
};

export const PROPERTY_TYPE_MAP: Record<string, string> = {
    APARTMENT: '아파트',
    OFFICETEL: '오피스텔',
    VILLA: '빌라/주택',
    ONEROOM: '원룸',
    TWOROOM: '투룸',
    SHOP: '상가',
};

export function formatPrice(price: number | null | undefined, unit = '만원'): string {
    if (!price) return '미확인';
    if (price >= 10000) {
        const billions = Math.floor(price / 10000);
        const remainder = price % 10000;
        return remainder > 0 ? `${billions}억 ${remainder.toLocaleString()}${unit}` : `${billions}억`;
    }
    return `${price.toLocaleString()}${unit}`;
}
