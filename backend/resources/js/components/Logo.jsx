import { useBranding } from "../state/branding";
import { 
  FaHeartbeat, 
  FaStethoscope, 
  FaHospital, 
  FaHeart, 
  FaBandAid, 
  FaDna, 
  FaLungs, 
  FaMedkit 
} from "react-icons/fa";

const ICON_MAP = {
  heartbeat: FaHeartbeat,
  stethoscope: FaStethoscope,
  hospital: FaHospital,
  heart: FaHeart,
  bandage: FaBandAid,
  dna: FaDna,
  lungs: FaLungs,
  medkit: FaMedkit
};

export default function Logo({ size = "md" }) {
  const { branding } = useBranding();
  
  const sizes = {
    sm: "w-8 h-8 rounded-full",
    md: "w-10 h-10 rounded-full",
    lg: "w-16 h-16 rounded-full"
  };

  const SelectedIcon = ICON_MAP[branding.logoIcon] || FaHeartbeat;

  return (
    <div className={`${sizes[size]} bg-primary/10 flex items-center justify-center shrink-0`}>
      <SelectedIcon className={`text-primary ${size === "lg" ? "text-4xl" : "text-xl"}`} />
    </div>
  );
}
