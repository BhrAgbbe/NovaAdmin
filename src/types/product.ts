export interface Product {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly price: number;
  readonly category: string;
  readonly image: string;
  readonly rating?: { readonly rate: number; readonly count: number };
}

export type ProductInput = Pick<Product, "title" | "description" | "price" | "category" | "image">;
