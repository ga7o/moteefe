"use strict";

import { Response, Request, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import {IPayload} from "payload";
import {IProduct} from "product";
import {IShipment} from "outcome";
const moment = require("moment");
import _ from "lodash";

// This is a fake database sample data
export const fakeDatabase = () => {

    return [
        {
            product_name: "black_mug",
            supplier: "Shirts4U",
            delivery_times: {"eu": 1, "us": 6, "uk": 2},
            in_stock: 3
        },
        {
            product_name: "blue_t-shirt",
            supplier: "Best Tshirts",
            delivery_times: {"eu": 1, "us": 5, "uk": 2},
            in_stock: 10
        },
        {
            product_name: "white_mug",
            supplier: "Shirts Unlimited",
            delivery_times: {"eu": 1, "us": 8, "uk": 2},
            in_stock: 3
        },
        {
            product_name: "black_mug",
            supplier: "Shirts Unlimited",
            delivery_times: {"eu": 1, "us": 7, "uk": 2},
            in_stock: 4
        },
        {
            product_name: "pink_t-shirt",
            supplier: "Shirts4U",
            delivery_times: {"eu": 1, "us": 6, "uk": 2},
            in_stock: 2
        },
        {
            product_name: "pink_t-shirt",
            supplier: "Best Tshirts",
            delivery_times: {"eu": 1, "us": 3, "uk": 2},
            in_stock: 2
        }
    ];
};

// This simulates the return from the database
export const fetchDatabaseData = async (): Promise<IProduct[]> => {
    const productsList: IProduct[] = [];
    fakeDatabase().forEach((product) => {
        const elem: IProduct = product;
        productsList.push(elem);
    });
    return productsList;
};


// This simulates the return from the database query
export const fetchProductData = async (region: string, productName: string, quantity: number): Promise<IShipment[]> => {

    const productsListData: IProduct[] = [];
    fakeDatabase().forEach((product) => {
        if(product.product_name === productName) {
            const elem: IProduct = product;
            productsListData.push(elem);
        }
    });

    _.sortBy(productsListData, [(e) => {
        if(region === "eu")
            return e.delivery_times.eu;
        else if(region === "us")
            return e.delivery_times.us;
        else
            return e.delivery_times.uk;
    }]);

    const shipmentList: IShipment[] = [];
    let totalItemsInBasket = 0;

    productsListData.forEach((product) => {
        if(totalItemsInBasket <  quantity) {
            let itemCount = 0;
            if ((quantity - totalItemsInBasket) >= product.in_stock) {
                itemCount = product.in_stock;
                totalItemsInBasket = totalItemsInBasket + itemCount;
            }
            else {

                itemCount =  quantity - totalItemsInBasket;
                totalItemsInBasket = totalItemsInBasket + itemCount;
            }

            let deliveryDays = 0;
            if(region === "eu")
                deliveryDays = product.delivery_times.eu;
            else if(region === "us")
                deliveryDays = product.delivery_times.us;
            else
                deliveryDays = product.delivery_times.uk;

            const shipment: IShipment = {
                suplier: product.supplier,
                delivery_date: moment().add(deliveryDays, "days").format("YYYY-MM-DD"),
                items: [{
                    title: productName,
                    count: itemCount
                }]
            };

            shipmentList.push(shipment);
        }
    });

    return shipmentList;
};

export const getDeliveryDate = (currentDate: string, compareDate: string) => {

    const diff = moment(compareDate).diff(moment(currentDate), "days");
    if(diff > 1) {
        return compareDate;
    }
    return currentDate;
};

/**
 * List of API examples.
 * @route GET /api
 */
export const getApi = (req: Request, res: Response, next: NextFunction) => {

    try{
        return res.json({ "ok": 3});
    }
    catch (err) {
        return next(err);
    }
};


/**
 * List of API examples.
 * @route GET /api
 */
export const moteefePostApi = async(req: Request, res: Response, next: NextFunction) => {

    await check("region", "Region cannot be blank").not().isEmpty().run(req);
    await check("basket", "Basket cannot be blank").not().isEmpty().run(req);
    await check("basket.items", "Items is missing").isArray().run(req);

    await check("basket.items.*.produsct", "Items product is missing").exists().not().isEmpty().run(req);
    await check("basket.items.*.ciount", "Item count is missing").exists().isNumeric().not().isEmpty().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.json({ "errors": errors.array()});
    }

    try{
        const payload: IPayload = req.body;

        let delivery_date = moment().format("YYYY-MM-DD");
        const totalShipments: IShipment[] = [];
        await payload.basket.items.forEach((item) => {
            fetchProductData(payload.region, item.produsct, item.ciount)
                .then((data) => {
                    data.forEach((item) => {
                        const index = _.findIndex(totalShipments, (o) => {
                            return o.suplier === item.suplier;
                        });
                        if(index === -1){
                            totalShipments.push(item);
                            delivery_date = getDeliveryDate(delivery_date, item.delivery_date);
                        }
                        else{
                            totalShipments[index].delivery_date = getDeliveryDate(totalShipments[index].delivery_date, item.delivery_date);
                            totalShipments[index].items.push(item.items[0]);
                            delivery_date = getDeliveryDate(delivery_date, totalShipments[index].delivery_date);
                        }
                    });
                });
        });

        return res.json({ delivery_date, shipments:totalShipments});
    }
    catch (err) {
        return next(err);
    }
};



