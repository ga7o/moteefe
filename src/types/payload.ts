export interface IPayload {
    region: "us" | "eu" | "uk";
    basket: {
        items: [{
            produsct: string;
            ciount: number;
        }];
    };
}
