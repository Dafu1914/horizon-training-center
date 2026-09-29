import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "outline" | "white" | "emerald";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const base =
    "rounded-lg font-semibold transition inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-800 text-white hover:bg-blue-900",
    secondary: "bg-gray-900 text-white hover:bg-gray-800",
    accent: "bg-emerald-500 text-white hover:bg-emerald-600",
    outline: "border-2 border-blue-800 text-blue-800 hover:bg-blue-50",
    white: "bg-white text-blue-900 hover:bg-blue-50 shadow-lg",
    emerald: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}