export interface IOutcome {
    delivery_date: string;
    shipments: [IShipment];
}


export interface IShipment {
    suplier: string;
    delivery_date: string;
    items: [{
        title: string;
        count: number;
    }];
}
