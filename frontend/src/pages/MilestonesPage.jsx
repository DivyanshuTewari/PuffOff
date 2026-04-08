import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Lock, Heart, Activity, Wind, Brain, Shield, Award, Zap, Moon, Droplets, AlertTriangle } from 'lucide-react';
import api from '../api/api';

const MILESTONES = {
  nicotine: [
    { time: '20 min',  title: 'Heart Rate Normalizes',    desc: 'Your heart rate and blood pressure begin to drop back to normal levels.',                  icon: Heart },
    { time: '12 hrs',  title: 'CO Levels Drop',           desc: 'Carbon monoxide levels in your blood drop to normal. Oxygen levels rise.',                  icon: Wind },
    { time: '24 hrs',  title: 'Heart Attack Risk Falls',  desc: 'Your risk of heart attack already starts decreasing.',                                       icon: Heart },
    { time: '48 hrs',  title: 'Nerves Regenerate',        desc: 'Nerve endings damaged by smoking start regrowing. Smell and taste improve.',                 icon: Activity },
    { time: '72 hrs',  title: 'Breathing Gets Easier',    desc: 'Bronchial tubes relax and lung capacity increases. Breathing becomes noticeably easier.',   icon: Wind },
    { time: '2 wks',   title: 'Circulation Improves',     desc: 'Circulation improves significantly. Walking and exercise become easier.',                   icon: Activity },
    { time: '1 mo',    title: 'Lungs Cleaning',           desc: 'Cilia re-grow in the lungs, improving ability to handle mucus, coughing, and infection.',   icon: Wind },
    { time: '3 mo',    title: 'Lung Function +30%',       desc: 'Lung function improves by up to 30%. Coughing, fatigue, and wheezing decrease.',            icon: TrendingUp },
    { time: '9 mo',    title: 'Sinus Relief',             desc: 'Sinuses clear out significantly reducing congestion, fatigue, and shortness of breath.',    icon: Activity },
    { time: '1 yr',    title: 'Heart Disease Halved',     desc: 'Excess risk of coronary heart disease is half that of a continuing smoker.',                icon: Heart },
    { time: '5 yrs',   title: 'Stroke Risk = Normal',     desc: 'Stroke risk reduces to that of someone who has never smoked.',                              icon: Brain },
    { time: '10 yrs',  title: 'Lung Cancer Risk Halved', desc: 'Lung cancer death risk is about half that of a continuing smoker.',                         icon: Award },
    { time: '15 yrs',  title: 'Heart Disease = Normal',  desc: 'Risk of heart disease equals that of a person who has never smoked.',                       icon: Heart },
  ],
  chewing_tobacco: [
    { time: '12 hrs',  title: 'Heart Rate Drops',         desc: 'Your heart rate and blood pressure begin to stabilize back to normal levels.',              icon: Heart },
    { time: '1 wk',    title: 'Mouth Healing Starts',     desc: 'Small sores begin repairing. Your sense of taste profoundly improves.',                     icon: Activity },
    { time: '2 wks',   title: 'Gum Tissue Repairs',       desc: 'Inflammation in your gums significantly reduces as tissue begins healing.',                 icon: TrendingUp },
    { time: '1 mo',    title: 'White Patches Shrink',     desc: 'Precancerous spots like leukoplakia often start to recede and heal.',                       icon: Shield },
    { time: '3 mo',    title: 'Tooth Decay Risk Drops',   desc: 'Your risk of severe gum disease and tooth loss visibly decreases.',                         icon: Award },
    { time: '1 yr',    title: 'Oral Cancer Risk Drops',   desc: 'Your overall risk for oral and throat cancers begins to noticeably decline.',               icon: Heart },
    { time: '5 yrs',   title: 'Oral Cancer Risk Halved',  desc: 'Your risk of developing mouth, throat, or lip cancer is half that of a continuing user.',     icon: Brain },
  ],
  alcohol: [
    { time: '6 hrs',   title: 'Withdrawal Begins',        desc: 'Body starts processing the absence of alcohol. Symptoms for heavy drinkers may begin.',    icon: AlertTriangle },
    { time: '24 hrs',  title: 'Blood Pressure Drops',     desc: 'Blood pressure starts normalizing as alcohol leaves your system.',                         icon: Activity },
    { time: '48 hrs',  title: 'Liver Recovery Starts',    desc: 'Your liver begins to heal and process fats more efficiently.',                             icon: Heart },
    { time: '72 hrs',  title: 'Sleep Improves',           desc: 'Sleep quality begins improving as your brain chemistry rebalances.',                       icon: Moon },
    { time: '1 wk',    title: 'Hydration Normalizes',     desc: 'Your body returns to proper hydration. Skin clarity and energy improve.',                  icon: Droplets },
    { time: '2 wks',   title: 'Liver Function Boosts',    desc: 'Liver fat decreases significantly. Energy levels noticeably increase.',                    icon: TrendingUp },
    { time: '1 mo',    title: 'Liver Fat -15%',           desc: 'Liver fat reduces by ~15%. Sleep becomes dramatically better. Immune system improves.',    icon: Award },
    { time: '3 mo',    title: 'Brain Fog Clears',         desc: 'Cognitive function, memory, and focus measurably improve.',                                icon: Brain },
    { time: '6 mo',    title: 'Liver Disease Risk ↓',     desc: 'Risk of alcohol-related liver disease drops significantly.',                               icon: Shield },
    { time: '1 yr',    title: 'Liver Nearly Normal',      desc: 'For non-cirrhotic patients, liver function approaches that of non-drinkers.',              icon: Award },
  ],
  cannabis: [
    { time: '24 hrs',  title: 'THC Starts Clearing',      desc: 'Your body begins metabolizing remaining THC. Lung irritation starts to ease.',            icon: Wind },
    { time: '72 hrs',  title: 'Breathing Improves',       desc: 'Respiratory symptoms significantly reduce. Coughs and phlegm lessen.',                    icon: Wind },
    { time: '1 wk',    title: 'Sleep Normalizes',         desc: 'Natural sleep cycles begin restoring. REM sleep quality improves.',                       icon: Moon },
    { time: '2 wks',   title: 'Mood Stabilizes',          desc: 'Anxiety and mood swings from withdrawal begin to even out.',                              icon: Activity },
    { time: '1 mo',    title: 'Memory Improves',          desc: 'Short-term memory and attention span noticeably improve.',                                 icon: Brain },
    { time: '3 mo',    title: 'Dopamine Recovery',        desc: 'Dopamine receptors begin recovering. Natural motivation and pleasure return.',             icon: Award },
    { time: '6 mo',    title: 'Lung Function Near Normal',desc: 'Lung capacity approaches that of non-smokers if smoking was the delivery method.',        icon: Activity },
    { time: '1 yr',    title: 'Full Cognitive Recovery',  desc: 'Cognitive performance, executive function, and processing speed normalize.',              icon: Award },
  ],
  gambling: [
    { time: '1 day',   title: 'Urge Peak',                desc: 'Cravings are most intense. This is when support is most critical — reach out.',           icon: Zap },
    { time: '1 wk',    title: 'Clarity Returns',          desc: 'The constant preoccupation with gambling begins to fade. Rational thinking improves.',     icon: Brain },
    { time: '2 wks',   title: 'Sleep Improves',           desc: 'Without the anxiety of debt and losses, sleep quality noticeably improves.',              icon: Moon },
    { time: '1 mo',    title: 'Financial Awareness',      desc: 'You start making realistic financial plans instead of chasing losses.',                    icon: Activity },
    { time: '3 mo',    title: 'Relationships Heal',       desc: 'Trust in personal and professional relationships begins to rebuild.',                      icon: Heart },
    { time: '6 mo',    title: 'Emotional Balance',        desc: 'Mood regulation improves significantly. Anxiety and depression symptoms lessen.',          icon: Activity },
    { time: '1 yr',    title: 'New Identity',             desc: 'A new sense of self — not defined by gambling — becomes the foundation of your life.',     icon: Award },
  ],
};
// Default milestones for opioids, stimulants, other
const defaultMilestones = [
  { time: '24 hrs',  title: 'Acute Withdrawal Begins',   desc: 'Your body starts clearing the substance. Acute withdrawal symptoms may peak.',           icon: AlertTriangle },
  { time: '72 hrs',  title: 'Worst Phase Passes',        desc: 'Most acute physical withdrawal symptoms begin to ease off.',                             icon: Activity },
  { time: '1 wk',    title: 'Physical Withdrawal Ends',  desc: 'Physical symptoms mostly resolve. Psychological cravings remain but are manageable.',   icon: Award },
  { time: '2 wks',   title: 'Energy Returns',            desc: 'Physical energy and appetite begin to normalize.',                                       icon: Zap },
  { time: '1 mo',    title: 'Brain Healing Starts',      desc: 'Neuroplasticity allows the brain to begin structural healing and rewiring.',             icon: Brain },
  { time: '3 mo',    title: 'Dopamine Recovery',         desc: 'Dopamine receptor density begins recovering, restoring natural feelings of reward.',     icon: Award },
  { time: '6 mo',    title: 'Cravings Greatly Reduced',  desc: 'Craving frequency and intensity drop significantly for most people.',                   icon: TrendingUp },
  { time: '1 yr',    title: 'Full Cognitive Recovery',   desc: 'For many substances, full cognitive and emotional recovery is achieved.',                icon: Award },
];

function parseToMinutes(timeStr) {
  const s = timeStr.toLowerCase();
  if (s.includes('min')) return parseFloat(s);
  if (s.includes('hr')) return parseFloat(s) * 60;
  if (s.includes('day') || s.includes('day')) return parseFloat(s) * 60 * 24;
  if (s.includes('wk') || s.includes('week')) return parseFloat(s) * 60 * 24 * 7;
  if (s.includes('mo') || s.includes('month')) return parseFloat(s) * 60 * 24 * 30;
  if (s.includes('yr') || s.includes('year')) return parseFloat(s) * 60 * 24 * 365;
  return Infinity;
}

export default function MilestonesPage() {
  const [addictions, setAddictions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/api/addictions').then(r => {
      setAddictions(r.data.addictions);
      if (r.data.addictions.length > 0) setSelected(r.data.addictions[0]);
    });
  }, []);

  const milestones = selected
    ? (MILESTONES[selected.viceName] || defaultMilestones)
    : [];

  const minutesClean = selected
    ? (Date.now() - new Date(selected.lastRelapseDate).getTime()) / 60000
    : 0;

  return (
    <div className="page max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={28} className="text-violet-400" />
          <h1 className="font-display font-bold text-3xl text-white">Health Milestones</h1>
        </div>
        <p className="text-slate-400 mb-8">See what's happening in your body as it heals. Science-backed recovery timeline.</p>

        {addictions.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {addictions.map(a => (
              <button key={a._id} onClick={() => setSelected(a)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                  selected?._id === a._id
                    ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                    : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/8'
                }`}>
                {a.customName || a.viceName}
              </button>
            ))}
          </div>
        )}

        {addictions.length === 0 ? (
          <div className="glass text-center py-16">
            <TrendingUp size={40} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Add a vice first to see your recovery milestones.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/30 via-teal-500/30 to-transparent" />
            <div className="space-y-4">
              {milestones.map((m, i) => {
                const achieved = minutesClean >= parseToMinutes(m.time);
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex gap-4 pl-2 ${achieved ? '' : 'opacity-50'}`}>
                    {/* Dot */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      achieved ? 'bg-teal-500/25 border border-teal-500/40' : 'bg-dark-700 border border-white/10'
                    }`}>
                      {achieved
                        ? <CheckCircle size={14} className="text-teal-400" />
                        : <Lock size={12} className="text-slate-600" />}
                    </div>
                    {/* Content */}
                    <div className={`glass flex-1 p-4 mb-1 border ${achieved ? 'border-teal-500/20 bg-teal-500/5' : 'border-white/5'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                            <m.icon size={16} />
                          </div>
                          <span className="font-semibold text-sm text-white">{m.title}</span>
                        </div>
                        <span className={`badge text-xs ${achieved ? 'bg-teal-500/20 text-teal-300' : 'bg-white/5 text-slate-500'}`}>
                          {m.time}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{m.desc}</p>
                      {achieved && <p className="text-teal-400 text-xs font-medium mt-2">✅ Achieved!</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
