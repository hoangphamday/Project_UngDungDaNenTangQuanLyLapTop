import { products } from '@/data/mock-data';
import type { Product } from '@/types';

// Backend hiện chưa có endpoint catalog được triển khai. Service giữ cùng contract để thay mock bằng REST sau này.
export const catalogService = {
  async getProducts(): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return products;
  },
  async getProductById(id: string): Promise<Product | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return products.find((product) => product.id === id);
  },
};
