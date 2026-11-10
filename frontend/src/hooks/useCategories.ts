import { useEffect, useState } from "react";

import { listCategories } from "@/api/categories";
import type { Category } from "@/api/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    listCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, isLoading };
}
