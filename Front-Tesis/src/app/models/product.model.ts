export class Product {

    id?: string;
    name?: string;
    marca?: Marca;
    size?: string;
    color?: string;
    category?: Category;
    price?: number;
    stock?: BigInteger;
    active?: boolean;
    imageUrls?: string[];
    weight?: number; // Peso en kg
    description?: string;
    // Spanish alias often returned by backend
    descripcion?: string;
    
    constructor(data?: Partial<Product>) {
        this.id = data?.id;
        this.name = data?.name;
        this.marca = data?.marca;
        this.size = data?.size;
        this.color = data?.color;
        this.category = data?.category;
        this.price = data?.price;
        this.stock = data?.stock;
        this.active = data?.active;
        this.imageUrls = data?.imageUrls;
        this.weight = data?.weight;
        // Normalize backend payloads that may use 'descripcion' (Spanish) or 'description' (English)
        const descrAny = (data as any)?.descripcion as string | undefined;
        this.descripcion = descrAny || data?.description;
        this.description = data?.description || descrAny;
    }
}
export class Marca {
    id?: string;
    name?: string;

    constructor(data?: Partial<Marca>) {
        this.id = data?.id;
        this.name = data?.name;
    }
}
export enum Size {
    XS = "XS",
    S = "S",
    M = "M",
    L = "L",
    XL = "XL",
    XXL = "XXL"
}

export class Category {
    id?: string;
    name?: string;
    image_url?: string;

    constructor(data?: Partial<Category>) {
        this.id = data?.id;
        this.name = data?.name;
        this.image_url = data?.image_url;
    }
}

export class ProductImage {
    id?: string;
    url?: string;
    productId?: string;

    constructor(data?: Partial<ProductImage>) {
        this.id = data?.id;
        this.url = data?.url;
        this.productId = data?.productId;
    }
}