import Image from 'next/image';
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
      className="flex items-center"
      onClick={onClick}
    >
      <Image
        src="/eneos-logo-horizontal.png"
        alt="ENEOS"
        width={160}
        height={40}
        priority
        unoptimized
      />
    </Link>
  );
}
