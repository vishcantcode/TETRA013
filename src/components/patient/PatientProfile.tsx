import React from 'react';
import { User, Shield, Phone, Mail, MapPin, Heart, Stethoscope, AlertTriangle, Droplets, UserCheck, CreditCard, Globe, Calendar, Utensils, Briefcase } from 'lucide-react';
import { Patient } from '../../types';

interface Props {
  activePatient: Patient;
}

export const PatientProfile: React.FC<Props> = ({ activePatient }) => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-600" />
          Patient Demographic Profile & Cultural Identifiers
        </h1>
        <p className="text-xs text-slate-500">
          Personal identification, emergency contact records, Indian cultural & dietary profile, primary doctor affiliation, allergies & health insurance details
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Main Header Identity Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-100 dark:border-slate-800 pb-6">
          <img
            src={activePatient.avatar}
            alt={activePatient.name}
            className="w-20 h-20 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{activePatient.name}</h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] rounded-full">
                Active EHR
              </span>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-[10px] rounded-full">
                🇮🇳 {activePatient.region || 'Gujarat'} Region
              </span>
            </div>
            <p className="text-xs text-slate-500">
              MRN #{activePatient.mrn} • Age: {activePatient.age} yrs • Gender: {activePatient.gender}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Primary Doctor: {activePatient.primaryDoctor}
              </span>
            </div>
          </div>
        </div>

        {/* CULTURAL & PREVENTIVE PROFILE SECTION */}
        <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 pb-3">
            <h3 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Indian Cultural & Lifestyle Profile
            </h3>
            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900 px-2.5 py-1 rounded-full uppercase">
              Preventive CDSS Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Preferred Language</span>
              <p className="font-extrabold text-slate-900 dark:text-white pt-0.5">
                {activePatient.preferredLanguage || 'Gujarati'}
              </p>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Food Preference</span>
              <p className="font-extrabold text-slate-900 dark:text-white pt-0.5">
                {activePatient.foodPreference || 'Vegetarian'}
              </p>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Occupation</span>
              <p className="font-extrabold text-slate-900 dark:text-white pt-0.5">
                {activePatient.occupation || 'Textile Business'}
              </p>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Festival Calendar</span>
              <p className="font-extrabold text-slate-900 dark:text-white pt-0.5">
                {activePatient.festivalCalendar?.join(', ') || 'Navratri, Diwali'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid for Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Basic Information */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
              Basic Contact & Address
            </span>
            <div className="space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" /> +91 98250 12345
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" /> {activePatient.name.toLowerCase().replace(' ', '.')}@healthnet.org
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" /> Ring Road, Surat, Gujarat 395002
              </p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
              Emergency Contact Record
            </span>
            <div className="space-y-1">
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                {activePatient.caregiverName || 'Mark Vance'}
              </p>
              <p className="text-slate-500 font-medium">
                Relationship: {activePatient.caregiverRelation || 'Son'}
              </p>
              <p className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 pt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> +91 98250 98765
              </p>
            </div>
          </div>

          {/* Blood Group & Clinical Identifiers */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
              Blood Group & Vital Identifiers
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-black text-sm">
                O+
              </div>
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white">Blood Group: O Positive</p>
                <p className="text-slate-500 text-[11px]">Universal red cell donor compatible</p>
              </div>
            </div>
          </div>

          {/* Known Allergies */}
          <div className="p-5 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-3">
            <span className="text-amber-800 dark:text-amber-300 text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Known Medical Allergies
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 rounded-lg text-xs font-bold">
                Penicillin (Severe Rash)
              </span>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 rounded-lg text-xs font-bold">
                Peanuts (Anaphylaxis)
              </span>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 rounded-lg text-xs font-bold">
                Sulfa Antibiotics
              </span>
            </div>
          </div>
        </div>

        {/* Insurance Information Card */}
        <div className="p-5 bg-blue-50/70 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">Star Health Premier Insurance</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Policy #: SH-293810293 • Ayushman Bharat Linked</p>
              <p className="text-[10px] text-slate-500">Effective Date: Jan 1, 2026 - Dec 31, 2026</p>
            </div>
          </div>

          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
            Active Coverage
          </span>
        </div>
      </div>
    </div>
  );
};
