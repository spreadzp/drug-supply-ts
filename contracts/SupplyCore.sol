pragma solidity ^0.4.24;

contract SupplyCore {
    
    event NewSupply(uint256 _sumTheMedicine, string _nameOfMedicine, uint256 _countOfMedicine, uint256 _now, uint256 _finishTime);
    event NewHash(bytes32 _hash);
    event PartnerCosighned(bytes32 _hashSupply, address _consigner);
    event SupplyFullfiled(bytes32 _hashSupply, uint256 _timeLastConsigner);
    event ConsignerGetMedicine(bytes32 _hashSupply, uint256 _timeLastConsigner);
    event SupplierGotPayment(bytes32 _hashSupply, uint256 _sumSupply);
    
    modifier onlyNoConsignerPartnersSupplier(bytes32 hashSupply) {
        address supplier = supplies[hashSupply][0].supplier;
        address[] storage partners = partnersOfSupplier[supplier];        
        uint256 countPartners = partners.length;
        address[] storage cosignerPartners = cosignersSupply[hashSupply];
        uint256 countCosignerPartners = cosignerPartners.length;
        bool partnerSupply = false;
        for(uint256 i = 0; i < countPartners; i++) {
            if(msg.sender == partners[i]) {
                partnerSupply = true;
                for(uint256 j = 0; j < countCosignerPartners; j++) {
                    if(msg.sender == cosignerPartners[j]) {
                        partnerSupply = false; 
                    }
                }
            }
        }
        require(partnerSupply);
        _;
    }

    modifier onlySupplyTime(bytes32 hashSupply) {
        uint256 endTime = supplies[hashSupply][0].finishTimeOfSupply;
        require(endTime > now);
        _;
    }
    
    modifier onlyConsumer(bytes32 hashSupply) {
        address consumer = supplies[hashSupply][0].consumer;
        require(consumer == msg.sender && !supplies[hashSupply][0].consignerGotDrug);
        _;
    }
    
    struct Supply {
        address consumer;
        uint256 payment;
        string nameOfMedicine;
        uint256 countOfMedicine;
        uint256 finishTimeOfSupply;
        address supplier;
        bool supplyFinish;
        bool consignerGotDrug;
        bool paymentToSupplier;
    }
    
    struct Drug {
        string nameDrug;
        uint256 priceDrug;
        address supplier;
    }
    
    mapping (bytes32 => address[]) public cosignersSupply;
    mapping (bytes32 => Drug[]) public drugs;
    mapping (address => bytes32[]) public medicinesOfSupplier;
    mapping (address => bytes32[]) public consumerHashes;
    mapping (bytes32 => Supply[]) public supplies;
    mapping (address => address[]) public partnersOfSupplier;
    address[] public suppliers; 
    
    // @dev don't accept straight eth (normally comes with low gas)
    function () public payable {
        revert();
    }
    
    // add modifier supplier
    function addDrug(string name, uint256 price) public returns (bytes32 hashMedicine) {
        Drug memory newDrug = Drug({
            nameDrug: name,
            priceDrug: price,
            supplier: msg.sender
        });

        hashMedicine = keccak256(abi.encodePacked(name, price, msg.sender));
        medicinesOfSupplier[msg.sender].push(hashMedicine);
        drugs[hashMedicine].push(newDrug);        
        return hashMedicine;
    }

    function getDrugsHashes(address supplier) public view returns (bytes32[]){
        return medicinesOfSupplier[supplier];
    }
    
    function getMedicines(bytes32 hashDrug) public view returns(string nameDrug,
        uint256 priceDrug, address supplier) {
        return (drugs[hashDrug][0].nameDrug, drugs[hashDrug][0].priceDrug,
        drugs[hashDrug][0].supplier);
    }
    
    function addSupplierPartners(address partner) public {
        suppliers.push(partner);
        partnersOfSupplier[msg.sender].push(partner);
    }
    
    function getSupplierPartners() public view returns (address[]){
        return suppliers;
    }
    
    function getConsumerHashes(address consumer) public view returns (bytes32[]){
        return consumerHashes[consumer];
    }
    
    function checkSupplyFinish(bytes32 hash) public view returns (bool){
        return supplies[hash][0].finishTimeOfSupply < now;
    }

    function checkAllConsignSupply(bytes32 hash) public view returns (bool){
        return supplies[hash][0].supplyFinish;
    }
    
    function getSupply(bytes32 hash) public view returns (address _consumer,
        uint256 _payment,
        string _nameOfMedicine, 
        uint256 countOfMedicine,
        uint256 _endSupplyTime) {
        return (supplies[hash][0].consumer, supplies[hash][0].payment,
        supplies[hash][0].nameOfMedicine, 
        supplies[hash][0].countOfMedicine,
        supplies[hash][0].finishTimeOfSupply);
    }
    
    function checkPaymentToSupplier(bytes32 hash) public view returns (bool){
        return supplies[hash][0].paymentToSupplier;
    }

    function checkSupplier(bytes32 hash) public view returns (address){
        return supplies[hash][0].supplier;
    }
    
    // add Math lib check count suppliers, comission 
    function createSupply (
        bytes32 hashDrug, uint256 countOfMedicine, uint256 intervalTimeSupply) public payable {
        uint256 sumOfConsumer = drugs[hashDrug][0].priceDrug * countOfMedicine;
         /* require (msg.value >= sumOfConsumer, "consumer have not enough ethers for this supply"); */
        bytes32 newHashSupply = createHashSupply(countOfMedicine, intervalTimeSupply);
        consumerHashes[msg.sender].push(newHashSupply);
        uint256 endTimeOfSupply = now + intervalTimeSupply;
        Supply memory newSupply = Supply({
            consumer: msg.sender, // msg.value
            payment: sumOfConsumer,
            nameOfMedicine: drugs[hashDrug][0].nameDrug,
            countOfMedicine: countOfMedicine,
            finishTimeOfSupply: endTimeOfSupply,
            supplier: drugs[hashDrug][0].supplier,
            supplyFinish: false,
            consignerGotDrug: false,
            paymentToSupplier: false
        });
        supplies[newHashSupply].push(newSupply);
        emit NewSupply (msg.value, drugs[hashDrug][0].nameDrug, countOfMedicine, now, endTimeOfSupply);
    }
    
    event Cnt(uint256 _countPartners, uint256 _countCosignerPartners);
    function cosignSupply(bytes32 hashSupply) public onlySupplyTime(hashSupply)
      onlyNoConsignerPartnersSupplier(hashSupply)
      {
        cosignersSupply[hashSupply].push(msg.sender); 
        emit PartnerCosighned(hashSupply, msg.sender);
        address supplier = supplies[hashSupply][0].supplier;
        // uint256 countPartners = partnersOfSupplier[supplier].length; 
        // uint256 countCosignerPartners = cosignersSupply[hashSupply].length;
        emit Cnt(partnersOfSupplier[supplier].length, suppliers.length);
        if(partnersOfSupplier[supplier].length == suppliers.length) {
            supplies[hashSupply][0].supplyFinish = true;
            emit SupplyFullfiled(hashSupply, now);
        }
    }
    
    // consumer get drug but may fail with payment add withdrow method
    function proofOfConsumer(bytes32 hashSupply) public onlyConsumer(hashSupply) {
        require(supplies[hashSupply][0].supplyFinish, "the supply is not finish yet");
        require(!supplies[hashSupply][0].consignerGotDrug, "consigner already have got the drug");
        supplies[hashSupply][0].consignerGotDrug = true;
        emit ConsignerGetMedicine(hashSupply, now);
        address supplier = supplies[hashSupply][0].supplier;
        uint256 sumSupply = supplies[hashSupply][0].payment;
        supplier.transfer(sumSupply);
        supplies[hashSupply][0].paymentToSupplier = true;
        emit SupplierGotPayment(hashSupply, sumSupply);
    } 
    
    function createHashSupply(uint256 countOfMedicine, uint256 intervalTimeSupply) public returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(countOfMedicine, intervalTimeSupply, now));
        emit NewHash(hash);
        return hash;
    }
}
