import Link from "next/link";
import Image from "next/image";

interface ContentShellProps {
  children: React.ReactNode;
}

/** Shared layout for subpages (blogs, legal, careers). */
export default function ContentShell({ children }: ContentShellProps) {
  return (
    <div className="content-shell">
      <header className="content-topbar">
        <Link href="/" className="content-logo">
          <Image src="/icon.png" alt="One Way Nepal" width={34} height={34} priority />
          <span>One Way Nepal</span>
        </Link>
        <Link href="/" className="content-back">
          Back to site
        </Link>
      </header>

      <main className="content-main">{children}</main>

      <footer className="content-footer">
        <p>© {new Date().getFullYear()} OneWayNepal. All rights reserved.</p>
        <p>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/admin">Admin</Link>
        </p>
      </footer>
    </div>
  );
}