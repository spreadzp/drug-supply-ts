import * as React from "react";
import { Button, ControlLabel, Form, FormControl, FormGroup } from "react-bootstrap";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

const SupplyCoreContract = TruffleContract(require("../../build/contracts/SupplyCore.json"));
import ISuppyCore from "../contract-interfaces/ISuppyCore";

interface ISupplyFormProps {
    web3: Web3;
}

interface ISupplyFormState {
    nameDrug: string;
    nameValid: boolean;
    count: number;
    countValid: boolean;
    drug: string;
    hash: string;
    price: number;
    sumSupply: number;
}

/* const drugsForSupply = [{ name: "Aspirine", hash: "uyewiquyy376", price: 5 },
{ name: "Panadol", hash: "uyewdsfadasyy3ewr6", price: 3 },
{ name: "Remens", hash: "dasfdy3erw", price: 2 }]; */
let instance: ISuppyCore;

export default class NewDrug extends React.Component<ISupplyFormProps, ISupplyFormState> {
    constructor(props) {
        super(props);
        // const name = props.name;
        // const nameIsValid = this.validateName(name);
        // const age = props.age;
        // const ageIsValid = this.validateAge(age);
        // this.state = {name: name, age: age, nameValid: nameIsValid, ageValid: ageIsValid};
        this.onPriceChange = this.onPriceChange.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.submitNewDrug = this.submitNewDrug.bind(this);
        this.state = {
            nameDrug: "",
            nameValid: false,
            count: 0,
            countValid: false,
            drug: "",
            hash: "",
            price: 0,
            sumSupply: 0,
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

        // const partners = await instance.getSupplierPartners();
    }

    public validatePrice(sum) {
        return sum > 0;
    }
    public validateName(name) {
        return name.length > 2;
    }
    public onNameChange(e) {
        const val = e.target.value;
        const valid = this.validateName(val);
        this.setState({ nameDrug: val, nameValid: valid});
    }

    public onPriceChange(e) {
        const val = e.target.value;
        console.log(val);
        const valid = this.validatePrice(val);
        this.setState({ countValid: valid, price: val});
    }

    public async submitNewDrug(e) {
        e.preventDefault();
        if (this.state.countValid && this.state.nameValid) {
            alert("Name:  " + this.state.nameDrug + " Price: " + this.state.price);
            await instance.addDrug(this.state.nameDrug, this.props.web3.toBigNumber(this.state.price),
                 { gas: 8888888, from: this.props.web3.eth.accounts[0] });
            this.setState({ price: 0, nameDrug: "", nameValid: false});
        }
    }

    public render() {
        const validColor = this.state.countValid === true ? "green" : "red";
        const validNameColor = this.state.nameValid === true ? "green" : "red";
        return (
            <div className="gift-list">
                <Form>
                    <FormGroup>
                        <ControlLabel>Name drug</ControlLabel>
                        <FormControl
                            className="input-person"
                            type="text"
                            value={this.state.nameDrug}
                            onChange={this.onNameChange}
                            style={{ borderColor: validNameColor }}
                        />

                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Price</ControlLabel>
                        <FormControl
                            className="input-present"
                            type="number"
                            value={this.state.price}
                            onChange={this.onPriceChange}
                            style={{ borderColor: validColor }}
                        />
                    </FormGroup>
                    <Button
                        className="btn-remove"
                        onClick={this.submitNewDrug}
                        type="submit"
                    >
                        Add new drug
                    </Button>
                </Form>
            </div>
        );
    }
}
