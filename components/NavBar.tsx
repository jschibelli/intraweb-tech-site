import Link from 'next/link';
import Image from 'next/image';

export function NavBar() {
  return (
    <nav aria-label="Main navigation" className="flex items-center gap-6">
      <Link href="/">
        <Image src="../public/intraweb-logo-white.png" alt="IntraWeb Technologies Logo" width={40} height={40} className="mr-4" />
      </Link>
      <Link href="/" className="focus:outline-brand-primary">Home</Link>
      {/* <Link href="/work" className="focus:outline-brand-primary">Work</Link> */}
      <Link href="/process" className="focus:outline-brand-primary">Process</Link>
      <Link href="/about" className="focus:outline-brand-primary">About</Link>
      <Link href="/faq" className="focus:outline-brand-primary">FAQ</Link>
    </nav>
  );
} 