import * as React from "react";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";
import { Button, ControlLabel, Form, FormControl, FormGroup } from "react-bootstrap";

const SupplyCoreContract = TruffleContract(require("../../build/contracts/SupplyCore.json"));
import ISuppyCore from "../contract-interfaces/ISuppyCore";

interface IConfinrmFormProps {
    web3: Web3;
}

interface IConfinrmFormState {
    supplyHashes: string[];
    supplierPartners: string[];
    choisenHash: string;
    confirmerAddress: string;
}
let instance: ISuppyCore;
/* const drugsForSupply = [{ name: "Aspirine", hash: "uyewiquyy376", price: 5 },
{ name: "Panadol", hash: "uyewdsfadasyy3ewr6", price: 3 },
{ name: "Remens", hash: "dasfdy3erw", price: 2 }]; */

export default class ConfinrmForm extends React.Component<IConfinrmFormProps, IConfinrmFormState> {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onHashChange = this.onHashChange.bind(this);
        this.onConfirmChange = this.onConfirmChange.bind(this);
        this.state = {
            supplyHashes: [],
            supplierPartners: [],
            choisenHash: "",
            confirmerAddress: "",
        };
    }

    public async componentWillMount() {
        if (this.props.web3.eth.accounts.length === 0) {
            return;
        }
        SupplyCoreContract.setProvider(this.props.web3.currentProvider);
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
        const partners = await instance.getSupplierPartners();
        const hashes = await instance.getConsumerHashes(this.props.web3.eth.accounts[3],
            { gas: 8888888, from: this.props.web3.eth.accounts[0] });
        const validHashes = await this.getValidHashSupply(hashes);
        console.log('validHashes :', validHashes);
        this.setState({ supplyHashes: validHashes, supplierPartners: partners });
    }

    public async getValidHashSupply(hashes: string[]) {
        return hashes.filter(async (hash) => {
            const flag = await instance.checkSupplyFinish(hash);
            return flag;
        });
    }

    public onHashChange(e) {
        const choiseHash = e.target.value;
        if (choiseHash) {
            this.setState({ choisenHash: choiseHash });
        }
    }

    public onConfirmChange(e) {
        const choiseAddress = e.target.value;
        if (choiseAddress) {
            this.setState({ confirmerAddress: choiseAddress });
        }
    }

    public async handleSubmit(e) {
        e.preventDefault();
        alert(this.state.choisenHash + "@@" + this.state.confirmerAddress);

        const confirmLogs = await instance.cosignSupply(this.state.choisenHash, {
            gas: 999988888, from: this.state.confirmerAddress,
        });
        await this.setState({ choisenHash: "", confirmerAddress: ""});
        console.log(`confirmLogs = ${confirmLogs}`);
    }

    public render() {
        const hashes = this.state.supplyHashes;
        const cofirmers = this.state.supplierPartners;
        const options = [];
        const listConfimers = [];
        for (const hash of hashes) {
            options.push(<option value={hash}>{hash}</option>);
        }
        for (const cofirmer of cofirmers) {
            listConfimers.push(<option value={cofirmer}>{cofirmer}</option>);
        }
        return (
            <div className="gift-list">
                {
                    hashes.length && cofirmers.length &&
                    (
                        <Form>
                        <FormGroup controlId="formControlsSelect">
                            <ControlLabel>Select hash supply</ControlLabel>
                            <FormControl componentClass="select" placeholder="select" onChange={this.onHashChange} >
                                <option value="select" >select</option>
                                {options}
                            </FormControl>
                        </FormGroup>
                        <FormGroup controlId="formControlsSelect">
                            <ControlLabel>Select confirmers</ControlLabel>
                            <FormControl componentClass="select" placeholder="select" onChange={this.onConfirmChange} >
                                <option value="select" >select</option>
                                {listConfimers}
                            </FormControl>
                        </FormGroup>
                        <Button
                            className="btn-remove"
                            onClick={this.handleSubmit}
                            type="submit"
                        >
                            Confirm supply
                        </Button>
                    </Form>
                    )
                }
            </div>
        );
    }
}
