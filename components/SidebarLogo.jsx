import { LOGO_URL } from '@/lib/brand';

export default function SidebarLogo() {
  return (
    <div className="flex items-center">
      <img src={LOGO_URL} alt="Vakil Case" className="h-9 w-auto max-w-[180px] object-contain" />
    </div>
  );
}