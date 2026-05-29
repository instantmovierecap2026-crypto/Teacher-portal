import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, ExternalLink, Globe, Award, ShieldCheck, Cpu } from 'lucide-react';

export default function About() {
  const contacts = [
    { label: 'Email', value: 'ramodatechnologies@gmail.com', icon: Mail, color: 'bg-red-50 text-red-600', link: 'mailto:ramodatechnologies@gmail.com' },
    { label: 'Phone', value: '+251 993 253 633', icon: Phone, color: 'bg-green-50 text-green-600', link: 'tel:+251993253633' },
    { label: 'Telegram', value: '@Rtdart', icon: Send, color: 'bg-blue-50 text-blue-600', link: 'https://t.me/Rtdart' },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative inline-block"
        >
          <img 
            src="https://i.postimg.cc/Bv0tdgJh/a-premium-corporate-logo-design-featurin-v-N8j-Lss-Wsycx-HTk-GT4as-Q-X7Hkqgyr-Sa6F8HUkp-R7H-Q-sd-(1).jpg"
            alt="Ramoda Technologies Logo"
            className="h-32 w-32 rounded-3xl shadow-2xl shadow-blue-500/20 mx-auto"
          />
          <div className="absolute -right-2 -bottom-2 bg-blue-600 text-white p-2 rounded-xl border-4 border-white dark:border-slate-950">
            <Cpu size={20} />
          </div>
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase transition-all hover:tracking-normal cursor-default">
            Ramoda Technologies
          </h1>
          <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs">
            Software Development Excellence
          </p>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed"
        >
          Empowering educational institutions through state-of-the-art software solutions. 
          We specialize in high-performance web systems and database management.
        </motion.p>
      </section>

      {/* Founder Section */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-[#e2e8f0] dark:border-slate-800 p-8 shadow-sm scale-110 mb-8 mt-4 mx-8">
        <div className="flex items-center space-x-4 mb-6">
          <img src="https://i.postimg.cc/Bv0tdgJh/a-premium-corporate-logo-design-featurin-v-N8j-Lss-Wsycx-HTk-GT4as-Q-X7Hkqgyr-Sa6F8HUkp-R7H-Q-sd-(1).jpg" className="w-8 h-8 rounded-full" alt="Logo" />
          <h3 className="font-bold text-xs uppercase tracking-tighter text-slate-800 dark:text-white">Ramoda Technologies</h3>
        </div>

        <div className="bg-[#f1f5f9] dark:bg-slate-800/50 rounded-xl p-6 border border-dashed border-[#cbd5e1] dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <img src="https://i.postimg.cc/Y0yKdbbg/IMG-20260517-213404-358.jpg" className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-900 shadow-sm object-cover" alt="Nahom" />
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-widest">Founder</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">Nahom Debebe</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
            If you need this system for your school, contact us by email or Telegram.
          </p>
          <div className="grid grid-cols-1 gap-2">
            <a href="mailto:ramodatechnologies@gmail.com" className="flex items-center px-4 py-2.5 bg-white dark:bg-slate-900 rounded-lg border border-[#e2e8f0] dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
              📧 ramodatechnologies@gmail.com
            </a>
            <a href="tel:+251993253633" className="flex items-center px-4 py-2.5 bg-white dark:bg-slate-900 rounded-lg border border-[#e2e8f0] dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
              📞 +251 993 253 633
            </a>
            <a href="https://t.me/Rtdart" className="flex items-center justify-center px-4 py-3 bg-[#2563eb] text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10">
              ✈️ Contact on Telegram
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white">Get In Touch</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contacts.map((contact, i) => (
            <motion.a
              key={contact.label}
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col items-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className={`p-4 rounded-2xl ${contact.color} mb-4 group-hover:scale-110 transition-transform`}>
                <contact.icon size={24} />
              </div>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">{contact.label}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white text-center break-all">{contact.value}</p>
            </motion.a>
          ))}
        </div>

        <div className="bg-blue-600 rounded-[2rem] p-8 text-center text-white shadow-xl shadow-blue-500/20">
          <h3 className="text-2xl font-black mb-3">Interested in this system?</h3>
          <p className="text-blue-100 text-sm mb-6 max-w-sm mx-auto">
            If you need this system for your school, contact us by email or Telegram. We provide custom solutions for all educational levels.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://t.me/Rtdart"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Send size={16} />
              Telegram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
