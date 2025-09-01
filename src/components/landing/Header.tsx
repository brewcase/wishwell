import Link from "next/link";
import Logo from "../icons/Logo";
import Button from "../ui/Button";

export default function Header() {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6">
      <Logo />
      <div className="flex items-center gap-8">
        <Link 
          href="/signin" 
          className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
        >
          Login
        </Link>
        <Button href="/signup" size="sm">
          Try WishWell for free
        </Button>
      </div>
    </nav>
  );
}
