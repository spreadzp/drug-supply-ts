import * as React from "react";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";
import { Button, ControlLabel, Form, FormControl, FormGroup } from "react-bootstrap";

const SupplyCoreContract = TruffleContract(require("../../build/contracts/SupplyCore.json"));
import ISuppyCore from "../contract-interfaces/ISuppyCore";

interface ISupplyFormProps {
    web3: Web3;
}

interface ISupplyFormState {
    name: string;
    nameValid: boolean;
    count: number;
    countValid: boolean;
    drug: string;
    hash: string;
    price: number;
    sumSupply: number;
}

const drugsForSupply = [{ name: "Aspirine", hash: "uyewiquyy376", price: 5 },
{ name: "Panadol", hash: "uyewdsfadasyy3ewr6", price: 3 },
{ name: "Remens", hash: "dasfdy3erw", price: 2 }];

export default class SupplyForm extends React.Component<ISupplyFormProps, ISupplyFormState> {

    constructor(props) {
        super(props);
        // const name = props.name;
        // const nameIsValid = this.validateName(name);
        // const age = props.age;
        // const ageIsValid = this.validateAge(age);
        // this.state = {name: name, age: age, nameValid: nameIsValid, ageValid: ageIsValid};
        this.onNameChange = this.onNameChange.bind(this);
        this.onCountChange = this.onCountChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onDrugChange = this.onDrugChange.bind(this);
        this.state = {
            name: "",
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

        // const partners = await instance.getSupplierPartners();
    }

    public validateAge(sum) {
        return sum >= 0;
    }
    public validateName(name) {
        return name.length > 2;
    }
    public onCountChange(e) {
        const val = e.target.value;
        const valid = this.validateAge(val);
        this.setState({ count: val, countValid: valid, sumSupply: this.state.price * val});
    }

    public onDrugChange(e) {
        const choiseDrug = e.target.value;
        if (choiseDrug) {
            this.setParametersOfDrug(choiseDrug);
            this.setState({ drug: choiseDrug });
        }
    }

    public onNameChange(e) {
        const val = e.target.value;
        console.log(val);
        const valid = this.validateName(val);
        this.setState({ name: val, nameValid: valid });
    }

    public handleSubmit(e) {
        e.preventDefault();
        if (this.state.countValid === true) {
            alert("DrugName: " + this.state.drug + "Имя: " + this.state.name + " Возраст: " + this.state.count);
            this.setState({ count: 0, countValid: false, price: 0, name: "", nameValid: false, hash: "", sumSupply: 0 });
        }
    }
    public setParametersOfDrug(nameDrug: string) {
        const choisenDrug = drugsForSupply.find(drug =>  drug.name === nameDrug);
        this.setState({ hash: choisenDrug.hash, price: choisenDrug.price });
    }

    public render() {
        // цвет границы для поля для ввода имени
        // const nameColor = this.state.nameValid === true ? "green" : "red";
        // цвет границы для поля для ввода возраста

        // this.setState({drugs: drugsForSupply});
        const options = [];

        for (const drug of drugsForSupply) {
            options.push(<option value={drug.name}>{drug.name}</option>);
        }
        const ageColor = this.state.countValid === true ? "green" : "red";
        return (
            <div className="gift-list">
                <Form>
                    <FormGroup controlId="formControlsSelect">
                        <ControlLabel>Select drug for supply</ControlLabel>
                        <FormControl componentClass="select" placeholder="select" onChange={this.onDrugChange} >
                            <option value="select" >select</option>
                            {options}
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Hash drug</ControlLabel>
                        <FormControl
                            className="input-person"
                            type="text"
                            value={this.state.hash}
                        />

                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Price drug</ControlLabel>
                        <FormControl
                            className="input-person"
                            type="text"
                            value={this.state.price}
                        />

                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Count</ControlLabel>
                        <FormControl
                            className="input-present"
                            type="number"
                            value={this.state.count}
                            onChange={this.onCountChange}
                            style={{ borderColor: ageColor }}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Sum of the order</ControlLabel>
                        <FormControl
                            className="input-person"
                            type="text"
                            value={this.state.sumSupply}
                        />

                    </FormGroup>
                    <Button
                        className="btn-remove"
                        onClick={this.handleSubmit}
                        type="submit"
                    >
                        Make supply
                    </Button>
                </Form>
            </div>
        );
    }
}
