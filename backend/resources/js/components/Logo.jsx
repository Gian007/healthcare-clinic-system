import { FaHeartbeat } from "react-icons/fa";

export default function Logo({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 rounded-full",
    md: "w-10 h-10 rounded-full",
    lg: "w-16 h-16 rounded-full"
  };

  return (
    <div className={`${sizes[size]} bg-primary/10 flex items-center justify-center shrink-0`}>
      <FaHeartbeat className={`text-primary ${size === "lg" ? "text-4xl" : "text-xl"}`} />
    </div>
  );
}
