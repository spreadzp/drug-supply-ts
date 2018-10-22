import * as React from "react";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";
import { Form, FormControl, ControlLabel, Button, FormGroup } from "react-bootstrap";

const SupplyCoreContract = TruffleContract(require("../../build/contracts/SupplyCore.json"));
import ISuppyCore from "../contract-interfaces/ISuppyCore";

interface ISupplyFormProps {
    web3: Web3;
}

interface ISupplyFormState {
    name: string;
    nameValid: boolean;
    age: string;
    ageValid: boolean;
    drug: string;
    hash: string;
}

const drugsForSupply = [{ name: "Aspirine", hash: "uyewiquyy376" },
{ name: "Panadol", hash: "uyewdsfadasyy3ewr6" },
{ name: "Remens", hash: "dasfdy3erw" }];

export default class SupplyForm extends React.Component<ISupplyFormProps, ISupplyFormState> {

    constructor(props) {
        super(props);
        // const name = props.name;
        // const nameIsValid = this.validateName(name);
        // const age = props.age;
        // const ageIsValid = this.validateAge(age);
        // this.state = {name: name, age: age, nameValid: nameIsValid, ageValid: ageIsValid};
        this.onNameChange = this.onNameChange.bind(this);
        this.onAgeChange = this.onAgeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onDrugChange = this.onDrugChange.bind(this);
        this.state = {
            name: "",
            nameValid: false,
            age: "",
            ageValid: false,
            drug: "",
            hash: "",
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

    public validateAge(age) {
        return age >= 0;
    }
    public validateName(name) {
        return name.length > 2;
    }
    public onAgeChange(e) {
        const val = e.target.value;
        const valid = this.validateAge(val);
        this.setState({ age: val, ageValid: valid });
    }

    public onDrugChange(e) {
        const choiseDrug = e.target.value;
        if (choiseDrug) {
            console.log('choiseDrug :', choiseDrug);
            this.findHashOfDrug(choiseDrug);
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
        if (this.state.nameValid === true && this.state.ageValid === true) {
            alert("DrugName: " + this.state.drug + "Имя: " + this.state.name + " Возраст: " + this.state.age);
            this.setState({ age: "", ageValid: false, name: "", nameValid: false });
        }
    }
    public findHashOfDrug(nameDrug: string) {
        const choisenDrug = drugsForSupply.find(drug =>  drug.name === nameDrug);
        console.log('choisenDrug.hash :', choisenDrug.hash);
        this.setState({ hash: choisenDrug.hash });
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
        const ageColor = this.state.ageValid === true ? "green" : "red";
        return (
            <div className="gift-list">
                <Form>
                    <FormGroup controlId="formControlsSelect">
                        <ControlLabel>Select medicine for supply</ControlLabel>
                        <FormControl componentClass="select" placeholder="select" onChange={this.onDrugChange} >
                            <option value="select" >select</option>
                            {options}
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Medicine</ControlLabel>
                        <FormControl
                            className="input-person"
                            type="text"
                            value={this.state.hash}
                            onChange={this.onNameChange}
                            style={{ borderColor: ageColor }}
                        />

                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Count of the medicine</ControlLabel>
                        <FormControl
                            className="input-present"
                            type="number"
                            value={this.state.age}
                            onChange={this.onAgeChange}
                            style={{ borderColor: ageColor }}
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
