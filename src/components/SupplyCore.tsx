import * as React from "react";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

const SupplyCoreContract = TruffleContract(require("../../build/contracts/SupplyCore.json"));
import ISuppyCore from "../contract-interfaces/ISuppyCore";

interface ISupplyCoreProps {
    web3: Web3;
}

interface ISupplyCoreState {
    supplier: string;
    accountError: boolean;
    consumer: string;
    contractAddress: string;
    nameDrug: string;
    priceDrug: number;
    partnersSupplier: string[];
    hashesDrug: string[];
    redirect: boolean;
    consumerSupplyHashes: string[];
}

export default class SupplyCore extends React.Component<ISupplyCoreProps, ISupplyCoreState> {
    constructor(props) {
        super(props);
        this.state = {
            supplier: "",
            accountError: false,
            consumer: "",
            contractAddress: "",
            nameDrug: "",
            priceDrug: 0,
            partnersSupplier: [],
            hashesDrug: [],
            redirect: false,
            consumerSupplyHashes: [],
        };
    }

    public async componentWillMount() {
        if (this.props.web3.eth.accounts.length === 0) {
            this.setState({
                supplier: "",
                accountError: true,
            });
            return;
        }
        SupplyCoreContract.setProvider(this.props.web3.currentProvider);
        let instance: ISuppyCore;
        try {
            instance = await SupplyCoreContract.deployed();
        } catch (err) {
            alert(err);
            return;
        }
        await instance.addSupplierPartners(this.props.web3.eth.accounts[1],
            { gas: 8888888, from: this.props.web3.eth.accounts[0] });

        await instance.addSupplierPartners(this.props.web3.eth.accounts[2],
            { gas: 8888888, from: this.props.web3.eth.accounts[0] });
        const hashes = await instance.getConsumerHashes(this.props.web3.eth.accounts[3],
            { gas: 8888888, from: this.props.web3.eth.accounts[0] });
        this.setState({ consumerSupplyHashes: hashes });

        const partners = await instance.getSupplierPartners();
        const drugHashes = await instance.getDrugsHashes(this.props.web3.eth.accounts[0]);
        this.setState({
            supplier: this.props.web3.eth.accounts[0],
            accountError: false,
            consumer: this.props.web3.eth.accounts[3],
            nameDrug: "ASPIRINE",
            priceDrug: 5,
            partnersSupplier: partners,
            hashesDrug: drugHashes,
        });
    }

    public render() {
        return (
            <div>
                <h3>Supply</h3>
                <p>Supplier: {this.state.supplier}</p>
                <p>consumer: {this.state.consumer}</p>
                <p>consumerSupplyHashes: {this.state.consumerSupplyHashes}</p>
                <p>nameDrug: {this.state.nameDrug}</p>
                <p>countDrug: {this.state.priceDrug}</p>
                <p>partnersSupplier: {this.state.partnersSupplier}</p>
                <p>hashesDrags: {this.state.hashesDrug}</p>
            </div>
        );
    }
}
