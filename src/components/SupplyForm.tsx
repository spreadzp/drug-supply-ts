import * as React from "react";
import { Button, ControlLabel, Form, FormControl, FormGroup } from "react-bootstrap";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";
import ISuppyCore from "../contract-interfaces/ISuppyCore";
const SupplyCoreContract = TruffleContract(require("../../build/contracts/SupplyCore.json"));

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
    drugHashes: string[];
    countDrugs: number;
    dayForSupply: number;
    daysValid: boolean;
    startDate: string;
    formattedData: string;
}

const drugsForSupply = [];
let instance: ISuppyCore;
/* const drugsForSupply = [{ name: "Aspirine", hash: "uyewiquyy376", price: 5 },
{ name: "Panadol", hash: "uyewdsfadasyy3ewr6", price: 3 },
{ name: "Remens", hash: "dasfdy3erw", price: 2 }]; */

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
        this.onDaysChange = this.onDaysChange.bind(this);
        this.onChangeDate = this.onChangeDate.bind(this);
        const date = new Date().toISOString();
        this.state = {
            name: "",
            nameValid: false,
            count: 0,
            countValid: false,
            drug: "",
            hash: "",
            price: 0,
            sumSupply: 0,
            drugHashes: [],
            countDrugs: 0,
            dayForSupply: 0,
            daysValid: false,
            startDate: date,
            formattedData: "",
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
        this.setState({ drugHashes: await instance.getDrugsHashes(this.props.web3.eth.accounts[0]) });
        for (const currentHash of this.state.drugHashes) {
            const medicines = await instance.getMedicines(currentHash);
            drugsForSupply.push({ name: medicines[0], hash: currentHash, price: Number(medicines[1]) });
            this.setState({ countDrugs: +this.state.countDrugs });
        }
    }

    public validatePositiveNumber(sum) {
        return sum >= 0;
    }

    public validateName(name) {
        return name.length > 2;
    }

    public validatePositiveDays(days) {
        return days >= 0;
    }

    public onCountChange(e) {
        const val = e.target.value;
        const valid = this.validatePositiveNumber(val);
        this.setState({ count: val, countValid: valid, sumSupply: this.state.price * val });
    }

    public onDaysChange(e) {
        const val = e.target.value;
        const valid = this.validatePositiveDays(val);
        this.setState({ dayForSupply: val, daysValid: valid });
    }

    public onDrugChange(e) {
        const choiseDrug = e.target.value;
        if (choiseDrug) {
            this.setParametersOfDrug(choiseDrug);
            this.setState({ drug: choiseDrug });
        }
    }

    public onChangeDate(value, formattedValue) {
        this.setState({
            startDate: value, // ISO String, ex: "2016-11-19T12:00:00.000Z"
            formattedData: formattedValue, // Formatted String, ex: "11/19/2016"
        });
    }

    public onNameChange(e) {
        const val = e.target.value;
        console.log(val);
        const valid = this.validateName(val);
        this.setState({ name: val, nameValid: valid });
    }

    public async handleSubmit(e) {
        e.preventDefault();
        if (this.state.countValid === true) {
            const valEthToFunc = this.props.web3.toWei(this.state.sumSupply, "ether");
            const count = this.props.web3.toBigNumber(this.state.count);
            const daysBig = this.props.web3.toBigNumber(this.state.dayForSupply);
            alert("DrugName: " + this.state.drug + "Имя: " + this.state.name + " Count: "
                + this.state.count + "Sum: " + this.state.sumSupply);
            const supply = await instance.createSupply(this.state.hash, count, daysBig, {
                gas: 999988888, from: this.props.web3.eth.accounts[3],
                value: valEthToFunc,
                // gasLimit: 21000, gasPrice: 20000000000,
            });
            await this.setState({
                count: 0, countValid: false, price: 0, name: "", nameValid: false, hash: "", sumSupply: 0,
            });
            console.log(`_nameOfMedicine = ${supply.logs[1].args._nameOfMedicine}
            _sumTheMedicine = ${supply.logs[1].args._sumTheMedicine.toNumber()}
            _countOfMedicine = ${supply.logs[1].args._countOfMedicine.toNumber()}
            _finishTime = ${this.parseHumanDate(supply.logs[1].args._finishTime.toNumber())}`);
        }
    }

    public parseHumanDate(numberData: string) {
        const millisecData = parseInt(numberData, 0) * 1000;
        return new Date(millisecData).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).replace(/\./g, "/");
    }
    public setParametersOfDrug(nameDrug: string) {
        const choisenDrug = drugsForSupply.find((drug: any) => drug.name === nameDrug);
        this.setState({ hash: choisenDrug.hash, price: choisenDrug.price });
    }
    public componentDidUpdate() {
        // Access ISO String and formatted values from the DOM.
        const hiddenInputElement = document.getElementById("example-datepicker");
        console.log(hiddenInputElement); // ISO String, ex: "2016-11-19T12:00:00.000Z"
    }
    public render() {
        const options = [];
        for (const drug of drugsForSupply) {
            options.push(<option value={drug.name}>{drug.name}</option>);
        }
        const countValidColor = this.state.countValid === true ? "green" : "red";
        const countDaysColor = this.state.countValid === true ? "green" : "red";
        return (
            <div className="gift-list">
                {
                    drugsForSupply.length && <Form>
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
                                style={{ borderColor: countValidColor }}
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
                        <FormGroup>
                            <ControlLabel>Days for supply</ControlLabel>
                            <FormControl
                                className="input-present"
                                type="number"
                                value={this.state.dayForSupply}
                                onChange={this.onDaysChange}
                                style={{ borderColor: countDaysColor }}
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
                }
            </div>
        );
    }
}
