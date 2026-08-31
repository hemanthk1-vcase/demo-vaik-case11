import { LOGO_URL } from '@/lib/brand';

const SIZE = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-20'
};

export default function Logo({ size = 'md' }) {
  return (
    <img
      src={LOGO_URL}
      alt="VakilCase"
      className={`${SIZE[size] || SIZE.md} w-auto object-contain`}
    />
  );
}