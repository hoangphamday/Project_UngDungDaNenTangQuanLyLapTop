import { catalogService } from '@/services/catalog.service';
import type { Product } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export function useCatalog() {
  const [data, setData] = useState<Product[]>([]); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    catalogService.getProducts().then((products) => { if (active) setData(products); }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải sản phẩm'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const refetch = useCallback(async () => { setRefreshing(true); setError(null); try { setData(await catalogService.getProducts()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể tải sản phẩm'); } finally { setRefreshing(false); } }, []);
  return { data, loading, refreshing, error, refetch };
}
