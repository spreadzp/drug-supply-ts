import * as BigNumber from "bignumber.js";

export default interface ISupplyCore {
    addDrug(name: string, price: BigNumber.BigNumber, from?: any);
    addSupplierPartners(partner: string, from?: any);
    cosignSupply(hashSupply: string, from?: any);
    createHashSupply(countOfMedicine: BigNumber.BigNumber, intervalTimeSupply: BigNumber.BigNumber): Promise<string>;
    createSupply(hashDrug: string, countOfMedicine: BigNumber.BigNumber,
                 intervalTimeSupply: BigNumber.BigNumber, from?: any);
    proofOfConsumer(hashSupply: string);
    checkPaymentToSupplier(hash: string): Promise<boolean>;
    checkSupplyFinish(hash: string): Promise<boolean>;
    getConsumerHashes(consumer: string, from?: any): Promise<string[]>;
    getDrugsHashes(supplier: string): Promise<string[]>;
    getMedicines(hashDrug: string): Promise<string>;
    getSupplierPartners(): Promise<string[]>;
    getSupply(hash: string): Promise<ISupplyCore>;
}

export default interface ISupply {
    consumer: string;
    payment: BigNumber.BigNumber;
    nameOfMedicine: string;
    countOfMedicine: BigNumber.BigNumber;
    finishTimeOfSupply: BigNumber.BigNumber;
    supplier: string;
    supplyFinish: boolean;
    consignerGotDrug: boolean;
    paymentToSupplier: boolean;
}
