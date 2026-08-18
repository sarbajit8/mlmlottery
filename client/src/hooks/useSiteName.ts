import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '@/api/system';

const DEFAULT_COMPANY_NAME = 'Bhutan Cherapunji Lottery';

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'BC';
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/** Shared, cached read of the admin-configurable site/company name — used everywhere the brand
 * appears (landing page, login/join, sidebars, printed tickets), including before login. */
export function useSiteName() {
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: systemApi.publicSettings,
    staleTime: 5 * 60 * 1000,
  });

  const companyName = data?.companyName ?? DEFAULT_COMPANY_NAME;

  useEffect(() => {
    document.title = companyName;
  }, [companyName]);

  return { companyName, initials: initialsOf(companyName) };
}
