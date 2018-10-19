import * as React from "react";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

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
}

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
        this.state = {
            name: "",
            nameValid: false,
            age: "",
            ageValid: false,
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
    public onNameChange(e) {
        const val = e.target.value;
        console.log(val);
        const valid = this.validateName(val);
        this.setState({ name: val, nameValid: valid });
    }

    public handleSubmit(e) {
        e.preventDefault();
        if (this.state.nameValid === true && this.state.ageValid === true) {
            alert("Имя: " + this.state.name + " Возраст: " + this.state.age);
            this.setState({ age: "", ageValid: false, name: "", nameValid: false });
        }
    }
    public render() {
        // цвет границы для поля для ввода имени
        const nameColor = this.state.nameValid === true ? "green" : "red";
        // цвет границы для поля для ввода возраста
        const ageColor = this.state.ageValid === true ? "green" : "red";
        return (
            <form onSubmit={this.handleSubmit}>
                <p>
                    <label>Hash the drug:</label><br />
                    <input type="text" value={this.state.name}
                        onChange={this.onNameChange} style={{ borderColor: nameColor }} />
                </p>
                <p>
                    <label>count of drugs:</label><br />
                    <input type="number" value={this.state.age}
                        onChange={this.onAgeChange} style={{ borderColor: ageColor }} />
                </p>
                <p>
                    <label>numer days for the supply:</label><br />
                    <input type="number" value={this.state.age}
                        onChange={this.onAgeChange} style={{ borderColor: ageColor }} />
                </p>
                <input type="submit" value="Отправить" />
            </form>
        );
    }
}
