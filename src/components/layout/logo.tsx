import Link from 'next/link';

interface LogoProps {
  onClick?: () => void;
}

/**
 * ENEOS Logo component - reusable across sidebar and mobile sidebar
 */
export function Logo({ onClick }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3"
      onClick={onClick}
    >
      <div className="w-10 h-10 bg-eneos-red rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">E</span>
      </div>
      <span className="text-lg font-semibold text-foreground">ENEOS</span>
    </Link>
  );
}
