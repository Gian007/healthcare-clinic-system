import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2, Eye, EyeOff } from "lucide-react";
import * as adminApi from "../../api/adminApi";
import { EditableText, EditableImage } from "../../components/admin/EditableElements";
import {
  FaClock, FaEnvelope, FaFacebook, FaInstagram,
  FaMapMarkerAlt, FaPhoneAlt, FaArrowRight, FaUsers, FaCalendarAlt,
  FaDesktop, FaShieldAlt, FaBell, FaCheck
} from "react-icons/fa";
import Logo from "../../components/Logo";

// Helper components for the Live Preview Toolbar
function VisibilityToggle({ isVisible, onToggle }) {
  return (
    <button 
      onClick={onToggle}
      className={`absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg backdrop-blur-md border ${
        isVisible 
          ? "bg-emerald-500/90 text-white border-emerald-400" 
          : "bg-slate-800/90 text-white border-slate-700 hover:bg-slate-700/90"
      }`}
    >
      {isVisible ? <><Eye size={14} /> Visible on Public Page</> : <><EyeOff size={14} /> Hidden from Public</>}
    </button>
  );
}

export default function AdminLandingPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [uploadingImageFor, setUploadingImageFor] = useState(null);

  const fetchSettings = async () => {
    try {
      const data = await adminApi.getLandingPageSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch landing page settings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleUpdate = (sectionKey, field, value) => {
    setSettings((prev) =>
      prev.map((s) => (s.section_key === sectionKey ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const section of settings) {
        await adminApi.updateLandingPageSetting(section.section_key, section);
      }
      showSuccess("All landing page settings saved successfully!");
    } catch (error) {
      console.error("Failed to save", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file, sectionKey) => {
    setUploadingImageFor(sectionKey);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await adminApi.uploadLandingPageImage(fd);
      handleUpdate(sectionKey, "image_url", res.url);
      showSuccess(`Image uploaded successfully!`);
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploadingImageFor(null);
    }
  };

  const getSection = (key) => settings.find(s => s.section_key === key) || {};
  const parseJson = (content) => {
    try { return JSON.parse(content) || []; }
    catch { return []; }
  };

  const hero = getSection('hero');
  const about = getSection('about');
  const features = getSection('features');
  const how = getSection('how_it_works');
  const professionals = getSection('professionals');
  const benefits = getSection('benefits');
  const cta = getSection('cta');

  if (loading) return <div className="p-8 text-center flex items-center justify-center h-[calc(100vh-100px)]"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="relative font-sans pb-24 text-slate-900 dark:text-slate-200">
      
      {/* Floating Action Bar */}
      <div className="sticky top-0 z-[100] flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm mb-8">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Live Editor: Landing Page</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Click any text or image below to edit. Toggles hide/show sections.</p>
        </div>
        <div className="flex items-center gap-4">
          {successMsg && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-bold text-white transition hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Publish Changes"}
          </button>
        </div>
      </div>

      {/* Editor Canvas Container */}
      <div className="max-w-[1400px] mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* --- HERO SECTION --- */}
        <section className={`relative pt-32 pb-20 px-6 overflow-hidden transition-opacity ${hero.is_visible ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
          <VisibilityToggle isVisible={hero.is_visible} onToggle={() => handleUpdate('hero', 'is_visible', !hero.is_visible)} />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent dark:from-teal-900/20 dark:to-slate-950/0 pointer-events-none" />
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md mb-8 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">System Live & Online</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
                <EditableText 
                  value={hero.title} 
                  onChange={(v) => handleUpdate('hero', 'title', v)} 
                  multiline={true}
                />
              </h1>
              
              <div className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl leading-relaxed font-medium">
                <EditableText 
                  value={hero.subtitle} 
                  onChange={(v) => handleUpdate('hero', 'subtitle', v)} 
                  multiline={true}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <div className="w-full sm:w-auto px-8 py-4 rounded-xl bg-teal-500 text-white font-bold tracking-wide shadow-[0_0_30px_-10px_rgba(20,184,166,0.5)] flex items-center justify-center gap-3">
                  <EditableText value={hero.button_text} onChange={(v) => handleUpdate('hero', 'button_text', v)} />
                  <FaArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* Hero Mock Right Side */}
            <div className="relative h-[600px] w-full hidden lg:block perspective-1000 opacity-50 select-none pointer-events-none">
               <div className="absolute inset-4 rounded-3xl bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-2xl rotate-y-[-10deg] rotate-x-[5deg] scale-95 flex items-center justify-center">
                 <div className="text-2xl font-bold text-slate-400 italic">Mock Interactive Preview</div>
               </div>
            </div>
          </div>
        </section>

        {/* --- ABOUT SECTION --- */}
        <section className={`py-24 px-6 relative bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 transition-opacity ${about.is_visible ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
          <VisibilityToggle isVisible={about.is_visible} onToggle={() => handleUpdate('about', 'is_visible', !about.is_visible)} />
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-sm font-black text-teal-500 uppercase tracking-widest mb-3">About The Platform</h2>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  <EditableText value={about.title} onChange={(v) => handleUpdate('about', 'title', v)} multiline />
                </h3>
                <div className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                  <EditableText value={about.subtitle} onChange={(v) => handleUpdate('about', 'subtitle', v)} multiline />
                </div>
                <div className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold">
                  <EditableText value={about.button_text} onChange={(v) => handleUpdate('about', 'button_text', v)} /> <FaArrowRight size={14} />
                </div>
              </div>
              <div className="relative">
                <EditableImage 
                  src={about.image_url} 
                  onUpload={(file) => handleImageUpload(file, 'about')} 
                  isUploading={uploadingImageFor === 'about'}
                  className="w-full aspect-video rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- PROFESSIONALS SECTION --- */}
        <section className={`py-24 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-opacity ${professionals.is_visible ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
          <VisibilityToggle isVisible={professionals.is_visible} onToggle={() => handleUpdate('professionals', 'is_visible', !professionals.is_visible)} />
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              <EditableText value={professionals.title} onChange={(v) => handleUpdate('professionals', 'title', v)} />
            </h2>
            <div className="text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              <EditableText value={professionals.subtitle} onChange={(v) => handleUpdate('professionals', 'subtitle', v)} multiline />
            </div>
            <div className="relative max-w-4xl mx-auto">
               <EditableImage 
                  src={professionals.image_url} 
                  onUpload={(file) => handleImageUpload(file, 'professionals')} 
                  isUploading={uploadingImageFor === 'professionals'}
                  className="w-full rounded-3xl shadow-xl min-h-[300px]"
                />
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className={`py-24 px-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-opacity ${features.is_visible ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
          <VisibilityToggle isVisible={features.is_visible} onToggle={() => handleUpdate('features', 'is_visible', !features.is_visible)} />
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-sm font-black text-teal-500 uppercase tracking-widest mb-3">
                <EditableText value={features.title} onChange={(v) => handleUpdate('features', 'title', v)} />
              </h2>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                <EditableText value={features.subtitle} onChange={(v) => handleUpdate('features', 'subtitle', v)} multiline />
              </h3>
            </div>
            
            <div className="relative p-8 rounded-3xl border border-dashed border-teal-500/30 bg-teal-50/50 dark:bg-teal-900/10 flex flex-col items-center justify-center">
              <div className="text-sm font-bold text-teal-600 dark:text-teal-400 mb-2">Content mapping is driven by JSON data</div>
              <textarea 
                className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs mt-4 outline-none focus:border-teal-500"
                value={features.content || ''}
                onChange={(e) => handleUpdate('features', 'content', e.target.value)}
                placeholder='[{"title":"Feature 1","desc":"Desc"}]'
              />
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS SECTION --- */}
        <section className={`py-24 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-opacity ${how.is_visible ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
          <VisibilityToggle isVisible={how.is_visible} onToggle={() => handleUpdate('how_it_works', 'is_visible', !how.is_visible)} />
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                <EditableText value={how.title} onChange={(v) => handleUpdate('how_it_works', 'title', v)} />
              </h2>
              <div className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                <EditableText value={how.subtitle} onChange={(v) => handleUpdate('how_it_works', 'subtitle', v)} multiline />
              </div>
            </div>
            
            <div className="relative p-8 rounded-3xl border border-dashed border-teal-500/30 bg-teal-50/50 dark:bg-teal-900/10 flex flex-col items-center justify-center">
              <div className="text-sm font-bold text-teal-600 dark:text-teal-400 mb-2">Timeline mapping is driven by JSON data</div>
              <textarea 
                className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs mt-4 outline-none focus:border-teal-500"
                value={how.content || ''}
                onChange={(e) => handleUpdate('how_it_works', 'content', e.target.value)}
                placeholder='[{"label":"Step 1","title":"Title","desc":"Desc"}]'
              />
            </div>
          </div>
        </section>

        {/* --- BENEFITS SECTION --- */}
        <section className={`py-24 px-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-opacity ${benefits.is_visible ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
          <VisibilityToggle isVisible={benefits.is_visible} onToggle={() => handleUpdate('benefits', 'is_visible', !benefits.is_visible)} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  <EditableText value={benefits.title} onChange={(v) => handleUpdate('benefits', 'title', v)} multiline />
                </h2>
                <div className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                  <EditableText value={benefits.subtitle} onChange={(v) => handleUpdate('benefits', 'subtitle', v)} multiline />
                </div>
              </div>
              <div className="relative p-8 rounded-3xl border border-dashed border-teal-500/30 bg-teal-50/50 dark:bg-teal-900/10 flex flex-col items-center justify-center">
                <div className="text-sm font-bold text-teal-600 dark:text-teal-400 mb-2">Stats mapping is driven by JSON data</div>
                <textarea 
                  className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs mt-4 outline-none focus:border-teal-500"
                  value={benefits.content || ''}
                  onChange={(e) => handleUpdate('benefits', 'content', e.target.value)}
                  placeholder='[{"stat":"10k+","title":"Users","desc":"Desc"}]'
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className={`py-32 px-6 relative border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-opacity ${cta.is_visible ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
          <VisibilityToggle isVisible={cta.is_visible} onToggle={() => handleUpdate('cta', 'is_visible', !cta.is_visible)} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-500/5 dark:to-teal-900/20" />
          <div className="max-w-3xl mx-auto relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              <EditableText value={cta.title} onChange={(v) => handleUpdate('cta', 'title', v)} multiline />
            </h2>
            <div className="text-slate-600 dark:text-slate-400 text-lg mb-10">
              <EditableText value={cta.subtitle} onChange={(v) => handleUpdate('cta', 'subtitle', v)} multiline />
            </div>
            <div className="inline-block px-10 py-5 rounded-2xl bg-teal-500 text-white font-black tracking-wide shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] text-lg">
              <EditableText value={cta.button_text} onChange={(v) => handleUpdate('cta', 'button_text', v)} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
