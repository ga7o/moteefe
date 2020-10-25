/*
    This interface defines the Product object
 */
export interface IProduct {
    product_name: string;
    supplier: string;
    delivery_times: {
        eu: number;
        us: number;
        uk: number;
    };
    in_stock: number;
}
