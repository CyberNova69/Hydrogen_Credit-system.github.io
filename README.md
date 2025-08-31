# 🌱 Green Hydrogen Credit System

A comprehensive blockchain-based platform for issuing, tracking, and trading certified green hydrogen production credits. This system addresses the critical need for transparent and immutable certification of truly "green" hydrogen generated from renewable resources.

## 🎯 Problem Statement

In the transition to low-carbon economies, it's vital to accurately account for and incentivize the production of truly "green" hydrogen—hydrogen generated from renewable resources. This system utilizes blockchain technology to:

- **Issue and certify credits** for every unit of certified green hydrogen produced
- **Track transactions, transfers, and retirements** of credits between producers, certifying authorities, and industrial consumers
- **Ensure transparency and immutability** of all operations
- **Support integration with external auditors** and government verifiers
- **Monitor and prevent double counting or fraud**

## ✨ Key Features

### 🔐 Multi-Role Access Control
- **Regulator**: System administrator with full control
- **Certifier**: Authorized to issue new credits
- **Auditor**: Independent verification and batch management
- **Producer**: Hydrogen production facility
- **User**: Credit trading and retirement

### 🌍 Comprehensive Credit Management
- **Detailed Metadata**: Production date, renewable source, location, carbon intensity
- **Verification System**: Multi-auditor verification process
- **Status Tracking**: Active, Retired, Suspended states
- **Fraud Prevention**: Carbon intensity thresholds, production date validation
- **Expiry Management**: Automatic credit expiration after 1 year

### 🔍 Advanced Verification
- **Production Batches**: Group credits for efficient verification
- **Multi-Auditor Consensus**: Minimum 2 auditors required for batch verification
- **Audit Trail**: Complete history of all verifications and changes
- **Accreditation Tracking**: ISO standards and certification compliance

### 💱 Trading & Retirement
- **Secure Transfers**: Verified credits only
- **Retirement Tracking**: Purpose and reason documentation
- **Owner Management**: Automatic credit array updates
- **Transaction History**: Complete audit trail

## 🏗️ System Architecture

### Smart Contract Structure
```
GreenHydrogenCredit.sol
├── Credit Management
│   ├── Credit struct with comprehensive metadata
│   ├── Status and verification enums
│   └── Carbon intensity validation
├── Role Management
│   ├── Regulator functions
│   ├── Certifier functions
│   └── Auditor registration
├── Verification System
│   ├── Credit verification
│   ├── Production batch management
│   └── Multi-auditor consensus
└── Trading & Retirement
    ├── Secure transfers
    ├── Credit retirement
    └── Owner tracking
```

### Data Models

#### Credit Structure
```solidity
struct Credit {
    uint256 id;                    // Unique identifier
    address owner;                 // Current holder
    address producer;              // Production facility
    string producerName;           // Human-readable name
    uint256 amount;                // Hydrogen amount (kg)
    uint256 productionDate;        // Production timestamp
    string renewableSource;        // Energy source type
    string location;               // Geographic location
    uint256 carbonIntensity;       // gCO2/kWh (max 50)
    VerificationStatus verificationStatus;
    CreditStatus status;
    address certifier;             // Issuing authority
    uint256 certificationDate;
    string metadata;               // Additional data
    bool isRetired;                // Retirement status
    uint256 retirementDate;
    string retirementReason;
}
```

#### Auditor Structure
```solidity
struct Auditor {
    address auditorAddress;
    string name;
    string accreditation;
    bool isActive;
    uint256 verificationCount;
    uint256 lastVerification;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Hardhat development environment
- MetaMask or compatible wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd green-hydrogen-credit-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

5. **Run tests**
   ```bash
   npx hardhat test
   ```

6. **Deploy to local network**
   ```bash
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Deployment

The deployment script automatically:
- Deploys the smart contract
- Registers sample auditors
- Issues demonstration credits
- Sets up initial verification
- Creates production batches

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## 🎮 Usage Guide

### For Regulators

1. **Register Auditors**
   - Navigate to the Regulator tab
   - Enter auditor address, name, and accreditation
   - Click "Register Auditor"

2. **Manage System**
   - Set new certifiers
   - Deactivate auditors if needed
   - Suspend suspicious credits

### For Certifiers

1. **Issue New Credits**
   - Navigate to the Certifier tab
   - Fill in all required fields
   - Ensure carbon intensity ≤ 50 gCO2/kWh
   - Click "Issue Credit"

2. **Required Information**
   - Producer details and address
   - Production amount and date
   - Renewable energy source
   - Geographic location
   - Carbon intensity measurement
   - Additional metadata

### For Auditors

1. **Verify Credits**
   - Navigate to the Auditor tab
   - Enter credit ID and verification status
   - Add verification notes
   - Click "Verify Credit"

2. **Manage Production Batches**
   - Create batches from verified credits
   - Verify batches for consensus
   - Monitor verification counts

### For Producers

1. **View Production**
   - Navigate to the Producer tab
   - Enter your producer address
   - View all issued credits
   - Check production statistics

2. **Track Performance**
   - Monitor verification status
   - Track total active credits
   - View production history

### For Users

1. **Trade Credits**
   - Navigate to the Trading tab
   - Transfer credits to other addresses
   - View credit details and history

2. **Retire Credits**
   - Choose credits to retire
   - Provide retirement reason
   - Complete retirement process

## 🔒 Security Features

### Access Control
- **Role-based permissions** for all functions
- **Multi-signature requirements** for critical operations
- **Auditor consensus** for batch verification

### Fraud Prevention
- **Carbon intensity validation** (max 50 gCO2/kWh)
- **Production date verification** (no future dates)
- **Credit status tracking** (prevent double-spending)
- **Retirement documentation** (prevent false claims)

### Data Integrity
- **Immutable blockchain storage**
- **Complete audit trail**
- **Status validation** for all operations
- **Array management** for credit tracking

## 📊 System Constants

```solidity
MAX_CARBON_INTENSITY = 50 gCO2/kWh
MIN_VERIFICATION_COUNT = 2 auditors
CREDIT_EXPIRY_DAYS = 365 days
```

## 🧪 Testing

The system includes comprehensive tests covering:

- **Contract deployment** and initialization
- **Role management** and access control
- **Credit issuance** and validation
- **Auditor verification** processes
- **Trading and retirement** functionality
- **Edge cases** and security scenarios

Run tests with:
```bash
npx hardhat test
```

## 🌐 Frontend Interface

The web interface provides:
- **Responsive design** for all devices
- **Role-based access** to functions
- **Real-time updates** from blockchain
- **Comprehensive forms** for all operations
- **Status indicators** and alerts

## 🔗 Integration

### External Systems
- **Government verification** APIs
- **Environmental certification** databases
- **Energy grid** monitoring systems
- **Carbon trading** platforms

### Blockchain Networks
- **Ethereum mainnet** for production
- **Polygon** for low-cost transactions
- **Testnets** for development
- **Private networks** for enterprise

## 📈 Future Enhancements

### Planned Features
- **Carbon credit integration** with existing markets
- **IoT sensor integration** for real-time monitoring
- **Machine learning** for fraud detection
- **Mobile applications** for field operations
- **API endpoints** for third-party integration

### Scalability Improvements
- **Layer 2 solutions** for high throughput
- **Sharding** for parallel processing
- **Cross-chain bridges** for interoperability
- **Zero-knowledge proofs** for privacy

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow Solidity best practices
- Maintain comprehensive test coverage
- Update documentation for new features
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Smart Contract API](docs/contract-api.md)
- [Frontend Guide](docs/frontend-guide.md)
- [Deployment Guide](docs/deployment.md)
- [Integration Examples](docs/integration.md)

### Community
- [Discord Server](https://discord.gg/greenhydrogen)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discussion Forum](https://forum.greenhydrogen.org)

### Contact
- **Email**: support@greenhydrogen.org
- **Twitter**: [@GreenH2Credits](https://twitter.com/GreenH2Credits)
- **LinkedIn**: [Green Hydrogen Credits](https://linkedin.com/company/green-hydrogen-credits)

## 🙏 Acknowledgments

- **Ethereum Foundation** for blockchain infrastructure
- **Hardhat** for development tools
- **OpenZeppelin** for security libraries
- **Green Hydrogen Community** for feedback and testing

---

**Built with ❤️ for a sustainable future**

*This system represents a significant step forward in the transition to a low-carbon economy, providing the transparency and trust needed for widespread adoption of green hydrogen technologies.*
