import { listAllBosses } from '@/lib/bossData';
import { isDailyVariant, isMonthlyBase, parseBase } from '@/features/boss-tracker/utils/bossListUtils';

export interface BossVariant {
  name: string;
  difficulty: string;
  mesos: number;
  imageUrl: string;
}

export type GroupedBosses = Array<[string, BossVariant[]]>;

/**
 * Sort grouped bosses by mesos in descending order
 */
export const sortByMesosDesc = (list: GroupedBosses): GroupedBosses =>
  list.sort((a, z) => {
    const aMax = Math.max(...a[1].map(v => v.mesos));
    const zMax = Math.max(...z[1].map(v => v.mesos));
    return zMax - aMax;
  });

/**
 * Group all bosses by base name and sort variants by difficulty
 */
export const groupBossesByBase = (): GroupedBosses => {
  const allBosses = listAllBosses();
  const m = new Map<string, BossVariant[]>();
  
  // Group by base name
  allBosses.forEach(boss => {
    const base = parseBase(boss.name);
    const difficulty = boss.name.split(' ')[0]; // Extract difficulty from name
    if (!m.has(base)) {
      m.set(base, []);
    }
    m.get(base)!.push({
      name: boss.name,
      difficulty,
      mesos: boss.mesos,
      imageUrl: boss.imageUrl
    });
  });

  // Sort variants by difficulty order
  const order = new Map([
    ['Easy', 1], ['Normal', 2], ['Hard', 3], ['Chaos', 4], ['Extreme', 5]
  ]);
  
  for (const [_, variants] of m) {
    variants.sort((a, z) => (order.get(a.difficulty) ?? 99) - (order.get(z.difficulty) ?? 99));
  }
  
  return Array.from(m.entries()).sort((a, z) => a[0].localeCompare(z[0]));
};

/**
 * Filter grouped bosses by category (daily, weekly, monthly)
 */
export const filterBossesByCategory = (grouped: GroupedBosses, category: 'daily' | 'weekly' | 'monthly'): GroupedBosses => {
  switch (category) {
    case 'daily':
      return sortByMesosDesc(
        grouped
          .map(([base, vars]) => [base, vars.filter(v => isDailyVariant(v.name))] as [string, BossVariant[]])
          .filter(([_, vars]) => vars.length > 0)
      );
    
    case 'weekly':
      return sortByMesosDesc(
        grouped
          .map(([base, vars]) => [base, vars.filter(v => !isDailyVariant(v.name) && !isMonthlyBase(base))] as [string, BossVariant[]])
          .filter(([_, vars]) => vars.length > 0)
      );
    
    case 'monthly':
      return sortByMesosDesc(
        grouped
          .map(([base, vars]) => [base, isMonthlyBase(base) ? vars : []] as [string, BossVariant[]])
          .filter(([_, vars]) => vars.length > 0)
      );
    
    default:
      return [];
  }
};

/**
 * Get all categorized boss groups
 */
export const getAllCategorizedBosses = (): {
  groupedDaily: GroupedBosses;
  groupedWeekly: GroupedBosses;
  groupedMonthly: GroupedBosses;
} => {
  const grouped = groupBossesByBase();
  
  return {
    groupedDaily: filterBossesByCategory(grouped, 'daily'),
    groupedWeekly: filterBossesByCategory(grouped, 'weekly'),
    groupedMonthly: filterBossesByCategory(grouped, 'monthly'),
  };
};

/**
 * Filter grouped bosses by search query
 */
export const filterBossesBySearch = (grouped: GroupedBosses, searchQuery: string): GroupedBosses => {
  if (!searchQuery.trim()) return grouped;
  
  const query = searchQuery.toLowerCase();
  return grouped.filter(([base]) => base.toLowerCase().includes(query));
};

/**
 * Get filtered and categorized bosses for all categories
 */
export const getFilteredCategorizedBosses = (searchQuery: string): {
  groupedDaily: GroupedBosses;
  groupedWeekly: GroupedBosses;
  groupedMonthly: GroupedBosses;
  filteredGroupedDaily: GroupedBosses;
  filteredGroupedWeekly: GroupedBosses;
  filteredGroupedMonthly: GroupedBosses;
} => {
  const { groupedDaily, groupedWeekly, groupedMonthly } = getAllCategorizedBosses();
  
  return {
    groupedDaily,
    groupedWeekly,
    groupedMonthly,
    filteredGroupedDaily: filterBossesBySearch(groupedDaily, searchQuery),
    filteredGroupedWeekly: filterBossesBySearch(groupedWeekly, searchQuery),
    filteredGroupedMonthly: filterBossesBySearch(groupedMonthly, searchQuery),
  };
};

/**
 * Create a group key for boss identification
 */
export const makeGroupKey = (category: string, base: string): string => `${category}:${base}`;

/**
 * Get all boss categories for iteration
 */
export const getBossCategories = () => ['daily', 'weekly', 'monthly'] as const;

export type BossCategory = ReturnType<typeof getBossCategories>[number];
