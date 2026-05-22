import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaEnvelope, FaExclamationTriangle, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import Logo from "../components/Logo";
import * as publicApi from "../api/publicApi";
import { useAuth } from "../state/auth";
import { useAdminSettings } from "../state/adminSettings";
import { resolveLogoUrl } from "../config/adminSettings";

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { settings } = useAdminSettings();
  const { homepage } = settings;
  const logoUrl = resolveLogoUrl(settings.branding.logoPath);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getClinicStatus()
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const getBannerColors = (type) => {
    switch (type) {
      case "Clinic Closed":
      case "Emergency":
        return "bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50";
      case "Shortened Hours":
        return "bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50";
      default:
        return "bg-indigo-100 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50";
    }
  };

  const getBannerText = (spec) => {
    if (!spec) return "";
    if (spec.type === "Shortened Hours" && spec.start_time && spec.end_time) {
      return `${spec.title}: Shortened Hours (${formatTime(spec.start_time)} - ${formatTime(spec.end_time)})`;
    }
    return `${spec.title}: ${spec.type}`;
  };

  const getScheduleDisplay = () => {
    if (!status || !status.hours) {
      return { isOpen: false, badge: null, times: homepage.schedule.closedTodayText, color: "rose" };
    }

    const special = status.special;

    if (special && (special.type === "Clinic Closed" || special.type === "Emergency")) {
      return {
        isOpen: false,
        badge: <BadgePulse color="rose" text={homepage.schedule.closedTodayText} />,
        times: homepage.schedule.clinicClosedText,
        subtitle: special.title,
        color: "rose",
      };
    }

    const now = new Date();
    let openStr = status.hours.open_time;
    let closeStr = status.hours.close_time;
    let isShortened = false;

    if (special && special.type === "Shortened Hours" && special.start_time && special.end_time) {
      openStr = special.start_time;
      closeStr = special.end_time;
      isShortened = true;
    }

    const [oh, om] = openStr.split(":").map(Number);
    const [ch, cm] = closeStr.split(":").map(Number);
    const openTime = new Date();
    openTime.setHours(oh, om, 0);
    const closeTime = new Date();
    closeTime.setHours(ch, cm, 0);
    const timeRangeStr = `${formatTime(openStr)} - ${formatTime(closeStr)}`;

    if (now >= openTime && now < closeTime) {
      return {
        isOpen: true,
        badge: <BadgePulse color={isShortened ? "amber" : "emerald"} text={isShortened ? homepage.schedule.openShortenedText : homepage.schedule.openText} />,
        times: timeRangeStr,
        subtitle: isShortened ? `${homepage.schedule.specialScheduleLabel}: ${special.title}` : null,
        color: isShortened ? "amber" : "emerald",
      };
    }

    return {
      isOpen: false,
      badge: <BadgePulse color="rose" text={homepage.schedule.closedNowText} />,
      times: timeRangeStr,
      subtitle: isShortened ? `${homepage.schedule.specialScheduleLabel}: ${special.title}` : null,
      color: "rose",
    };
  };

  const sched = getScheduleDisplay();
  const safeHref = (url) => url || "#";

  const goBook = () => {
    if (!user) return nav("/login?next=/patient/book");
    return nav("/patient/book");
  };

  return (
    <div className="bg-[#eef2f3] dark:bg-slate-950 min-h-screen transition-colors flex flex-col">
      <div className="max-w-6xl mx-auto px-6 flex-1 w-full">
        <section className="pt-14 pb-10 text-center">
          <div className="flex flex-col items-center mb-6">
            <Logo size="lg" src={logoUrl} />
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter font-comfortaa leading-none font-fat">
            {settings.branding.clinicName}
          </h1>
          <p className="mt-2 text-base font-bold text-primary uppercase tracking-[0.2em] font-poppins">{homepage.hero.subtitle}</p>
          <div className="w-20 h-1 bg-primary/30 mx-auto my-6 rounded-full" />

          {status?.special && (
            <div className="mb-6 animate-bounce">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border font-bold text-sm shadow-lg ${getBannerColors(status.special.type)}`}>
                <FaExclamationTriangle /> {getBannerText(status.special)}
              </div>
            </div>
          )}

          <p className="text-lg md:text-xl italic font-medium text-gray-600 dark:text-slate-400 max-w-2xl mx-auto font-playfair">
            {homepage.hero.quote}
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={goBook}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl shadow-xl hover:opacity-95 active:scale-95 transition-all font-black uppercase tracking-widest text-sm"
              type="button"
            >
              {homepage.hero.ctaLabel}
              <ArrowRight />
            </button>
          </div>
        </section>

        <section className="bg-white/70 dark:bg-slate-900/70 backdrop-blur rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          <div className="text-center flex flex-col items-center">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner text-xl transition-colors duration-300 ${
              sched.color === "rose" ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600" :
                sched.color === "amber" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600" :
                  "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
            }`}>
              <FaClock />
            </div>
            <div className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">{homepage.schedule.title}</div>
            <div className="mt-4 text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
              {loading ? (
                <span className="animate-pulse">{homepage.schedule.loadingText}</span>
              ) : (
                <>
                  <div className="flex items-center gap-2 justify-center mb-2">
                    {sched.badge}
                  </div>

                  <div className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${
                    sched.color === "rose" ? "text-rose-600 dark:text-rose-400" :
                      sched.color === "amber" ? "text-amber-600 dark:text-amber-400" :
                        "text-slate-900 dark:text-slate-100"
                  }`}>
                    {sched.times}
                  </div>

                  {sched.subtitle && (
                    <div className="text-xs text-amber-600 dark:text-amber-500 font-bold mt-1">
                      {sched.subtitle}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">{status?.today}, {status?.date}</div>
                </>
              )}
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 mb-4 shadow-inner text-xl">
              <FaExclamationTriangle />
            </div>
            <div className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">{homepage.emergency.title}</div>
            <div className="mt-4 text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
              {homepage.emergency.message}<br />
              <span className="text-2xl font-black text-rose-600 dark:text-rose-500 tracking-tighter">{homepage.emergency.hotline}</span>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{homepage.emergency.caption}</div>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-16 pb-12 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <Logo size="sm" src={logoUrl} />
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {homepage.contact.description}
              </p>
              <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                <FaMapMarkerAlt className="mt-1 text-primary" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{homepage.contact.locationTitle}</p>
                  <p className="text-xs mt-1">{homepage.contact.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">{homepage.contact.sectionTitle}</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">{homepage.contact.emailLabel}</p>
                    <a href={`mailto:${homepage.contact.email}`} className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">{homepage.contact.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-xs">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">{homepage.contact.customerServiceLabel}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{homepage.contact.customerServicePhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-xs">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">{homepage.contact.managerLabel}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{homepage.contact.managerPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Connect With Us</h4>
              <div className="flex flex-col gap-4">
                <a href="https://www.facebook.com/profile.php?id=100076509421523" target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <FaFacebook/>
                   </div>
                   <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Smart Healthcare Availability and Queue Management</span>
                </a>
                <a href="https://www.instagram.com/smart_healthcaresys?igsh=bDJrbDFseGxrNTly" target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm">
                      <FaInstagram/>
                   </div>
                   <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">@smart_healthcaresys</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-50 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{homepage.footer.copyright}</p>
            <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <a href={safeHref(homepage.footer.privacyUrl)} className="hover:text-primary transition-colors">{homepage.footer.privacyLabel}</a>
              <a href={safeHref(homepage.footer.termsUrl)} className="hover:text-primary transition-colors">{homepage.footer.termsLabel}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BadgePulse({ color, text }) {
  const colors = {
    emerald: "bg-emerald-500 text-emerald-500",
    rose: "bg-rose-500 text-rose-500",
    amber: "bg-amber-500 text-amber-500",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors[color].split(" ")[0]}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[color].split(" ")[0]}`} />
      </span>
      <span className={`text-[10px] font-black uppercase tracking-widest ${colors[color].split(" ")[1]}`}>{text}</span>
    </div>
  );
}
