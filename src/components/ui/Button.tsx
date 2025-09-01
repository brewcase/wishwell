import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  href, 
  className = "",
  ...props 
}: ButtonProps) {
  const baseStyles = "font-medium transition-colors rounded-full text-center inline-flex items-center justify-center whitespace-nowrap";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-black text-white border border-gray-700 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed",
    outline: "border border-gray-600 text-white hover:bg-gray-900 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
  };
  
  const sizes = {
    sm: "px-6 py-3 text-sm h-11",
    md: "px-8 py-4 text-base h-12",
    lg: "px-10 py-4 text-lg h-14"
  };
  
  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    );
  }
  
  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
