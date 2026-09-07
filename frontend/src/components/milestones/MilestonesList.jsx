import MilestoneItem from './MilestoneItem';
import { parseMilestoneToMinutes } from './milestonesData';

export default function MilestonesList({ milestones, minutesClean }) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/30 via-teal-500/30 to-transparent" />
      <div className="space-y-4">
        {milestones.map((m, i) => {
          const achieved = minutesClean >= parseMilestoneToMinutes(m.time);
          return (
            <MilestoneItem
              key={m.title + i}
              milestone={m}
              index={i}
              achieved={achieved}
            />
          );
        })}
      </div>
    </div>
  );
}
