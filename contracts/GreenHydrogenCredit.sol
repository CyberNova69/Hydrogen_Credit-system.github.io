// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GreenHydrogenCredit {
    enum CreditStatus { Active, Retired, Suspended }
    enum VerificationStatus { Pending, Verified, Rejected }
    
    struct Credit {
        uint256 id;
        address owner;                    // Current credit holder
        address producer;                 // Hydrogen producer address
        string producerName;              // Human-readable producer name
        uint256 amount;                   // Hydrogen credits (kg of H2)
        uint256 productionDate;           // When hydrogen was produced
        string renewableSource;           // Type of renewable energy (solar, wind, etc.)
        string location;                  // Geographic location of production
        uint256 carbonIntensity;          // gCO2/kWh (must be below threshold)
        VerificationStatus verificationStatus;
        CreditStatus status;
        address certifier;                // Who certified this credit
        uint256 certificationDate;
        string metadata;                  // Additional certification data
        bool isRetired;                   // Track if credit has been retired
        uint256 retirementDate;
        string retirementReason;
    }
    
    struct Auditor {
        address auditorAddress;
        string name;
        string accreditation;
        bool isActive;
        uint256 verificationCount;
        uint256 lastVerification;
    }
    
    struct ProductionBatch {
        uint256 batchId;
        address producer;
        uint256 totalAmount;
        uint256 verificationCount;
        bool isVerified;
        uint256[] creditIds;
    }
    
    // State variables
    uint256 public nextId = 1;
    uint256 public nextBatchId = 1;
    mapping(uint256 => Credit) public credits;
    mapping(uint256 => ProductionBatch) public productionBatches;
    mapping(address => Auditor) public auditors;
    mapping(address => bool) public isAuditor;
    mapping(address => uint256[]) public producerCredits;
    mapping(address => uint256[]) public ownerCredits;
    
    // Constants and thresholds
    uint256 public constant MAX_CARBON_INTENSITY = 50; // gCO2/kWh threshold
    uint256 public constant MIN_VERIFICATION_COUNT = 2; // Minimum auditors needed
    uint256 public constant CREDIT_EXPIRY_DAYS = 365; // Credits expire after 1 year
    
    address public regulator;
    address public certifier;
    
    // Events
    event CreditIssued(uint256 indexed id, address indexed owner, address indexed producer, uint256 amount, uint256 productionDate);
    event CreditVerified(uint256 indexed id, address indexed auditor, VerificationStatus status);
    event CreditRetired(uint256 indexed id, address indexed owner, string reason);
    event CreditTransferred(uint256 indexed id, address indexed from, address indexed to);
    event CreditSuspended(uint256 indexed id, address indexed regulator, string reason);
    event AuditorRegistered(address indexed auditor, string name);
    event AuditorDeactivated(address indexed auditor);
    event ProductionBatchCreated(uint256 indexed batchId, address indexed producer, uint256 totalAmount);
    event ProductionBatchVerified(uint256 indexed batchId, address indexed auditor);
    
    // Modifiers
    modifier onlyRegulator() {
        require(msg.sender == regulator, "Only regulator can call this function");
        _;
    }
    
    modifier onlyCertifier() {
        require(msg.sender == certifier || msg.sender == regulator, "Only certifier can call this function");
        _;
    }
    
    modifier onlyAuditor() {
        require(isAuditor[msg.sender] && auditors[msg.sender].isActive, "Only active auditor can call this function");
        _;
    }
    
    modifier onlyOwner(uint256 id) {
        require(credits[id].id != 0, "Credit does not exist");
        require(msg.sender == credits[id].owner, "Not credit owner");
        _;
    }
    
    modifier creditExists(uint256 id) {
        require(credits[id].id != 0, "Credit does not exist");
        _;
    }
    
    modifier notRetired(uint256 id) {
        require(!credits[id].isRetired, "Credit has been retired");
        _;
    }
    
    constructor() {
        regulator = msg.sender;
        certifier = msg.sender;
    }
    
    // Regulator functions
    function setCertifier(address newCertifier) external onlyRegulator {
        require(newCertifier != address(0), "Invalid certifier address");
        certifier = newCertifier;
    }
    
    function registerAuditor(address auditorAddress, string memory name, string memory accreditation) external onlyRegulator {
        require(auditorAddress != address(0), "Invalid auditor address");
        require(!isAuditor[auditorAddress], "Auditor already registered");
        
        auditors[auditorAddress] = Auditor({
            auditorAddress: auditorAddress,
            name: name,
            accreditation: accreditation,
            isActive: true,
            verificationCount: 0,
            lastVerification: 0
        });
        
        isAuditor[auditorAddress] = true;
        emit AuditorRegistered(auditorAddress, name);
    }
    
    function deactivateAuditor(address auditorAddress) external onlyRegulator {
        require(isAuditor[auditorAddress], "Auditor not found");
        auditors[auditorAddress].isActive = false;
        isAuditor[auditorAddress] = false;
        emit AuditorDeactivated(auditorAddress);
    }
    
    function suspendCredit(uint256 id, string memory reason) external onlyRegulator creditExists(id) {
        credits[id].status = CreditStatus.Suspended;
        emit CreditSuspended(id, msg.sender, reason);
    }
    
    // Certifier functions
    function issueCredit(
        address to,
        address producer,
        string memory producerName,
        uint256 amount,
        uint256 productionDate,
        string memory renewableSource,
        string memory location,
        uint256 carbonIntensity,
        string memory metadata
    ) external onlyCertifier {
        require(to != address(0), "Invalid recipient address");
        require(producer != address(0), "Invalid producer address");
        require(amount > 0, "Amount must be greater than 0");
        require(carbonIntensity <= MAX_CARBON_INTENSITY, "Carbon intensity too high");
        require(productionDate <= block.timestamp, "Production date cannot be in the future");
        
        credits[nextId] = Credit({
            id: nextId,
            owner: to,
            producer: producer,
            producerName: producerName,
            amount: amount,
            productionDate: productionDate,
            renewableSource: renewableSource,
            location: location,
            carbonIntensity: carbonIntensity,
            verificationStatus: VerificationStatus.Pending,
            status: CreditStatus.Active,
            certifier: msg.sender,
            certificationDate: block.timestamp,
            metadata: metadata,
            isRetired: false,
            retirementDate: 0,
            retirementReason: ""
        });
        
        producerCredits[producer].push(nextId);
        ownerCredits[to].push(nextId);
        
        emit CreditIssued(nextId, to, producer, amount, productionDate);
        nextId++;
    }
    
    // Auditor functions
    function verifyCredit(uint256 id, VerificationStatus status, string memory verificationNotes) external onlyAuditor creditExists(id) notRetired(id) {
        require(credits[id].verificationStatus == VerificationStatus.Pending, "Credit already verified");
        
        credits[id].verificationStatus = status;
        auditors[msg.sender].verificationCount++;
        auditors[msg.sender].lastVerification = block.timestamp;
        
        emit CreditVerified(id, msg.sender, status);
    }
    
    function createProductionBatch(
        address producer,
        uint256[] memory creditIds
    ) external onlyAuditor {
        require(producer != address(0), "Invalid producer address");
        require(creditIds.length > 0, "Must include at least one credit");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < creditIds.length; i++) {
            require(credits[creditIds[i]].producer == producer, "Credit producer mismatch");
            require(credits[creditIds[i]].verificationStatus == VerificationStatus.Verified, "Credit not verified");
            totalAmount += credits[creditIds[i]].amount;
        }
        
        productionBatches[nextBatchId] = ProductionBatch({
            batchId: nextBatchId,
            producer: producer,
            totalAmount: totalAmount,
            verificationCount: 1,
            isVerified: false,
            creditIds: creditIds
        });
        
        emit ProductionBatchCreated(nextBatchId, producer, totalAmount);
        nextBatchId++;
    }
    
    function verifyProductionBatch(uint256 batchId) external onlyAuditor {
        require(productionBatches[batchId].batchId != 0, "Batch does not exist");
        require(!productionBatches[batchId].isVerified, "Batch already verified");
        
        productionBatches[batchId].verificationCount++;
        
        if (productionBatches[batchId].verificationCount >= MIN_VERIFICATION_COUNT) {
            productionBatches[batchId].isVerified = true;
            emit ProductionBatchVerified(batchId, msg.sender);
        }
    }
    
    // User functions
    function transferCredit(uint256 id, address to) external onlyOwner(id) notRetired(id) {
        require(to != address(0), "Invalid recipient address");
        require(credits[id].status == CreditStatus.Active, "Credit is not active");
        require(credits[id].verificationStatus == VerificationStatus.Verified, "Credit not verified");
        
        address from = credits[id].owner;
        credits[id].owner = to;
        
        // Update credit arrays
        _removeFromArray(ownerCredits[from], id);
        ownerCredits[to].push(id);
        
        emit CreditTransferred(id, from, to);
    }
    
    function retireCredit(uint256 id, string memory reason) external onlyOwner(id) notRetired(id) {
        require(credits[id].status == CreditStatus.Active, "Credit is not active");
        require(credits[id].verificationStatus == VerificationStatus.Verified, "Credit not verified");
        
        credits[id].isRetired = true;
        credits[id].retirementDate = block.timestamp;
        credits[id].retirementReason = reason;
        credits[id].status = CreditStatus.Retired;
        
        emit CreditRetired(id, msg.sender, reason);
    }
    
    // View functions
    function getCredit(uint256 id) external view returns (Credit memory) {
        require(credits[id].id != 0, "Credit does not exist");
        return credits[id];
    }
    
    function getProducerCredits(address producer) external view returns (uint256[] memory) {
        return producerCredits[producer];
    }
    
    function getOwnerCredits(address owner) external view returns (uint256[] memory) {
        return ownerCredits[owner];
    }
    
    function getAuditor(address auditorAddress) external view returns (Auditor memory) {
        require(isAuditor[auditorAddress], "Auditor not found");
        return auditors[auditorAddress];
    }
    
    function getProductionBatch(uint256 batchId) external view returns (ProductionBatch memory) {
        require(productionBatches[batchId].batchId != 0, "Batch does not exist");
        return productionBatches[batchId];
    }
    
    function isCreditExpired(uint256 id) external view returns (bool) {
        require(credits[id].id != 0, "Credit does not exist");
        return (block.timestamp - credits[id].productionDate) > (CREDIT_EXPIRY_DAYS * 1 days);
    }
    
    function getTotalCreditsByProducer(address producer) external view returns (uint256 total) {
        uint256[] memory creditIds = producerCredits[producer];
        for (uint256 i = 0; i < creditIds.length; i++) {
            if (credits[creditIds[i]].status == CreditStatus.Active && 
                !credits[creditIds[i]].isRetired) {
                total += credits[creditIds[i]].amount;
            }
        }
        return total;
    }
    
    // Internal helper functions
    function _removeFromArray(uint256[] storage array, uint256 value) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
}
