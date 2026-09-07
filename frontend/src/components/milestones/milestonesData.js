import {
  TrendingUp,
  Heart,
  Activity,
  Wind,
  Brain,
  Shield,
  Award,
  Zap,
  Moon,
  Droplets,
  AlertTriangle,
} from 'lucide-react';

export const MILESTONES = {
  nicotine: [
    { time: '20 min', title: 'Heart Rate Normalizes', desc: 'Your heart rate and blood pressure begin to drop back to normal levels.', icon: Heart },
    { time: '12 hrs', title: 'CO Levels Drop', desc: 'Carbon monoxide levels in your blood drop to normal. Oxygen levels rise.', icon: Wind },
    { time: '24 hrs', title: 'Heart Attack Risk Falls', desc: 'Your risk of heart attack already starts decreasing.', icon: Heart },
    { time: '48 hrs', title: 'Nerves Regenerate', desc: 'Nerve endings damaged by smoking start regrowing. Smell and taste improve.', icon: Activity },
    { time: '72 hrs', title: 'Breathing Gets Easier', desc: 'Bronchial tubes relax and lung capacity increases. Breathing becomes noticeably easier.', icon: Wind },
    { time: '2 wks', title: 'Circulation Improves', desc: 'Circulation improves significantly. Walking and exercise become easier.', icon: Activity },
    { time: '1 mo', title: 'Lungs Cleaning', desc: 'Cilia re-grow in the lungs, improving ability to handle mucus, coughing, and infection.', icon: Wind },
    { time: '3 mo', title: 'Lung Function +30%', desc: 'Lung function improves by up to 30%. Coughing, fatigue, and wheezing decrease.', icon: TrendingUp },
    { time: '9 mo', title: 'Sinus Relief', desc: 'Sinuses clear out significantly reducing congestion, fatigue, and shortness of breath.', icon: Activity },
    { time: '1 yr', title: 'Heart Disease Halved', desc: 'Excess risk of coronary heart disease is half that of a continuing smoker.', icon: Heart },
    { time: '5 yrs', title: 'Stroke Risk = Normal', desc: 'Stroke risk reduces to that of someone who has never smoked.', icon: Brain },
    { time: '10 yrs', title: 'Lung Cancer Risk Halved', desc: 'Lung cancer death risk is about half that of a continuing smoker.', icon: Award },
    { time: '15 yrs', title: 'Heart Disease = Normal', desc: 'Risk of heart disease equals that of a person who has never smoked.', icon: Heart },
  ],
  chewing_tobacco: [
    { time: '12 hrs', title: 'Heart Rate Drops', desc: 'Your heart rate and blood pressure begin to stabilize back to normal levels.', icon: Heart },
    { time: '1 wk', title: 'Mouth Healing Starts', desc: 'Small sores begin repairing. Your sense of taste profoundly improves.', icon: Activity },
    { time: '2 wks', title: 'Gum Tissue Repairs', desc: 'Inflammation in your gums significantly reduces as tissue begins healing.', icon: TrendingUp },
    { time: '1 mo', title: 'White Patches Shrink', desc: 'Precancerous spots like leukoplakia often start to recede and heal.', icon: Shield },
    { time: '3 mo', title: 'Tooth Decay Risk Drops', desc: 'Your risk of severe gum disease and tooth loss visibly decreases.', icon: Award },
    { time: '1 yr', title: 'Oral Cancer Risk Drops', desc: 'Your overall risk for oral and throat cancers begins to noticeably decline.', icon: Heart },
    { time: '5 yrs', title: 'Oral Cancer Risk Halved', desc: 'Your risk of developing mouth, throat, or lip cancer is half that of a continuing user.', icon: Brain },
  ],
  alcohol: [
    { time: '6 hrs', title: 'Withdrawal Begins', desc: 'Body starts processing the absence of alcohol. Symptoms for heavy drinkers may begin.', icon: AlertTriangle },
    { time: '24 hrs', title: 'Blood Pressure Drops', desc: 'Blood pressure starts normalizing as alcohol leaves your system.', icon: Activity },
    { time: '48 hrs', title: 'Liver Recovery Starts', desc: 'Your liver begins to heal and process fats more efficiently.', icon: Heart },
    { time: '72 hrs', title: 'Sleep Improves', desc: 'Sleep quality begins improving as your brain chemistry rebalances.', icon: Moon },
    { time: '1 wk', title: 'Hydration Normalizes', desc: 'Your body returns to proper hydration. Skin clarity and energy improve.', icon: Droplets },
    { time: '2 wks', title: 'Liver Function Boosts', desc: 'Liver fat decreases significantly. Energy levels noticeably increase.', icon: TrendingUp },
    { time: '1 mo', title: 'Liver Fat -15%', desc: 'Liver fat reduces by ~15%. Sleep becomes dramatically better. Immune system improves.', icon: Award },
    { time: '3 mo', title: 'Brain Fog Clears', desc: 'Cognitive function, memory, and focus measurably improve.', icon: Brain },
    { time: '6 mo', title: 'Liver Disease Risk ↓', desc: 'Risk of alcohol-related liver disease drops significantly.', icon: Shield },
    { time: '1 yr', title: 'Liver Nearly Normal', desc: 'For non-cirrhotic patients, liver function approaches that of non-drinkers.', icon: Award },
  ],
  cannabis: [
    { time: '24 hrs', title: 'THC Starts Clearing', desc: 'Your body begins metabolizing remaining THC. Lung irritation starts to ease.', icon: Wind },
    { time: '72 hrs', title: 'Breathing Improves', desc: 'Respiratory symptoms significantly reduce. Coughs and phlegm lessen.', icon: Wind },
    { time: '1 wk', title: 'Sleep Normalizes', desc: 'Natural sleep cycles begin restoring. REM sleep quality improves.', icon: Moon },
    { time: '2 wks', title: 'Mood Stabilizes', desc: 'Anxiety and mood swings from withdrawal begin to even out.', icon: Activity },
    { time: '1 mo', title: 'Memory Improves', desc: 'Short-term memory and attention span noticeably improve.', icon: Brain },
    { time: '3 mo', title: 'Dopamine Recovery', desc: 'Dopamine receptors begin recovering. Natural motivation and pleasure return.', icon: Award },
    { time: '6 mo', title: 'Lung Function Near Normal', desc: 'Lung capacity approaches that of non-smokers if smoking was the delivery method.', icon: Activity },
    { time: '1 yr', title: 'Full Cognitive Recovery', desc: 'Cognitive performance, executive function, and processing speed normalize.', icon: Award },
  ],
  gambling: [
    { time: '1 day', title: 'Urge Peak', desc: 'Cravings are most intense. This is when support is most critical — reach out.', icon: Zap },
    { time: '1 wk', title: 'Clarity Returns', desc: 'The constant preoccupation with gambling begins to fade. Rational thinking improves.', icon: Brain },
    { time: '2 wks', title: 'Sleep Improves', desc: 'Without the anxiety of debt and losses, sleep quality noticeably improves.', icon: Moon },
    { time: '1 mo', title: 'Financial Awareness', desc: 'You start making realistic financial plans instead of chasing losses.', icon: Activity },
    { time: '3 mo', title: 'Relationships Heal', desc: 'Trust in personal and professional relationships begins to rebuild.', icon: Heart },
    { time: '6 mo', title: 'Emotional Balance', desc: 'Mood regulation improves significantly. Anxiety and depression symptoms lessen.', icon: Activity },
    { time: '1 yr', title: 'New Identity', desc: 'A new sense of self — not defined by gambling — becomes the foundation of your life.', icon: Award },
  ],
};

export const DEFAULT_MILESTONES = [
  { time: '24 hrs', title: 'Acute Withdrawal Begins', desc: 'Your body starts clearing the substance. Acute withdrawal symptoms may peak.', icon: AlertTriangle },
  { time: '72 hrs', title: 'Worst Phase Passes', desc: 'Most acute physical withdrawal symptoms begin to ease off.', icon: Activity },
  { time: '1 wk', title: 'Physical Withdrawal Ends', desc: 'Physical symptoms mostly resolve. Psychological cravings remain but are manageable.', icon: Award },
  { time: '2 wks', title: 'Energy Returns', desc: 'Physical energy and appetite begin to normalize.', icon: Zap },
  { time: '1 mo', title: 'Brain Healing Starts', desc: 'Neuroplasticity allows the brain to begin structural healing and rewiring.', icon: Brain },
  { time: '3 mo', title: 'Dopamine Recovery', desc: 'Dopamine receptor density begins recovering, restoring natural feelings of reward.', icon: Award },
  { time: '6 mo', title: 'Cravings Greatly Reduced', desc: 'Craving frequency and intensity drop significantly for most people.', icon: TrendingUp },
  { time: '1 yr', title: 'Full Cognitive Recovery', desc: 'For many substances, full cognitive and emotional recovery is achieved.', icon: Award },
];

export function parseMilestoneToMinutes(timeStr) {
  const s = timeStr.toLowerCase();
  if (s.includes('min')) return parseFloat(s);
  if (s.includes('hr')) return parseFloat(s) * 60;
  if (s.includes('day')) return parseFloat(s) * 60 * 24;
  if (s.includes('wk') || s.includes('week')) return parseFloat(s) * 60 * 24 * 7;
  if (s.includes('mo') || s.includes('month')) return parseFloat(s) * 60 * 24 * 30;
  if (s.includes('yr') || s.includes('year')) return parseFloat(s) * 60 * 24 * 365;
  return Infinity;
}
