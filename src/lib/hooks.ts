import { useEffect, useState } from 'react';
import { JobItem, JobItemExpanded } from './types';
import { BASE_API_URL } from './constant';
import { useQuery } from '@tanstack/react-query';
import { handleError } from './utils';

type JobItemApiResponse = {
  public: boolean;
  jobItem: JobItemExpanded;
};

const fetchJobItem = async (id: number): Promise<JobItemApiResponse> => {
  const response = await fetch(`${BASE_API_URL}/${id}`);

  // 4xx or 5xx
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.description);
  }

  const data = await response.json();
  return data;
};

export function useJobItem(id: number | null) {
  const { data, isInitialLoading } = useQuery(
    ['job-item', id],
    () => (id ? fetchJobItem(id) : null),
    {
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: Boolean(id),
      onError: handleError,
    }
  );

  const jobItem = data?.jobItem;
  return { jobItem, isLoading: isInitialLoading } as const;
}

// ----------------------------
// This hook fetches job items from the API
// export function useJobItems(searchText: string) {
//   const [jobItems, setJobItems] = useState<JobItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // derived state
//   // const totalNumberOfResults = jobItems.length;
//   // const jobItemsSliced = jobItems.slice(0, 7);

//   useEffect(() => {
//     // First mount don't search for anything
//     if (!searchText) return;

//     setIsLoading(true);

//     const fetchData = async () => {
//       const response = await fetch(`${BASE_API_URL}?search=${searchText}`);
//       const data = await response.json();
//       setIsLoading(false);
//       setJobItems(data.jobItems);
//     };

//     fetchData();
//   }, [searchText]);

//   return { jobItems, isLoading };
// }

type JobItemsApiResponse = {
  public: boolean;
  sorted: boolean;
  jobItems: JobItem[];
};

const fetchJobItems = async (
  searchText: string
): Promise<JobItemsApiResponse> => {
  const response = await fetch(`${BASE_API_URL}?search=${searchText}`);
  // 4xx or 5xx
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.description);
  }

  const data = await response.json();

  return data;
};

// ----------------------------
export function useJobItems(searchText: string) {
  const { data, isInitialLoading } = useQuery(
    ['job-items', searchText],
    () => fetchJobItems(searchText),
    {
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: Boolean(searchText),
      onError: handleError,
    }
  );

  // const jobItems = data?.jobItems;
  // const isLoading = isInitialLoading;
  return {
    jobItems: data?.jobItems,
    isLoading: isInitialLoading,
  } as const;
}
// ----------------------------

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export function useActiveId() {
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const id = +window.location.hash.slice(1);
      setActiveId(id);
    };
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return activeId;
}
