// Green Hydrogen Credit System Configuration Example
// Copy this file to config.js and update with your values

module.exports = {
    // Network Configuration
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
            gas: 3000000,
            gasPrice: 20000000000
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
            chainId: 11155111,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gas: 3000000,
            gasPrice: 20000000000
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
            chainId: 1,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gas: 3000000,
            gasPrice: 20000000000
        }
    },

    // Contract Configuration
    contract: {
        address: process.env.CONTRACT_ADDRESS || "0x7C16981685a373c7f4ED0dBdBFC2921D14c9A134",
        name: "GreenHydrogenCredit",
        version: "1.0.0"
    },

    // System Constants
    constants: {
        MAX_CARBON_INTENSITY: 50, // gCO2/kWh
        MIN_VERIFICATION_COUNT: 2, // Minimum auditors needed
        CREDIT_EXPIRY_DAYS: 365, // Credits expire after 1 year
        MAX_CREDIT_AMOUNT: 1000000, // Maximum credit amount in kg H2
        MIN_CREDIT_AMOUNT: 1 // Minimum credit amount in kg H2
    },

    // Role Configuration
    roles: {
        REGULATOR: "regulator",
        CERTIFIER: "certifier",
        AUDITOR: "auditor",
        PRODUCER: "producer",
        USER: "user"
    },

    // API Configuration
    api: {
        port: process.env.API_PORT || 8000,
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    },

    // Frontend Configuration
    frontend: {
        url: process.env.FRONTEND_URL || "http://localhost:3000",
        buildPath: "./frontend/build",
        staticPath: "./frontend"
    },

    // Database Configuration (if using external database)
    database: {
        url: process.env.DATABASE_URL || "postgresql://username:password@localhost:5432/green_hydrogen_db",
        type: "postgres",
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },

    // External Service Configuration
    externalServices: {
        carbonCreditAPI: {
            url: process.env.CARBON_CREDIT_API_URL || "https://api.carboncredits.com",
            apiKey: process.env.CARBON_CREDIT_API_KEY || "your_api_key_here"
        },
        governmentVerification: {
            url: process.env.GOVERNMENT_VERIFICATION_API || "https://api.gov-verification.org",
            apiKey: process.env.GOVERNMENT_VERIFICATION_API_KEY || "your_api_key_here"
        },
        environmentalCertification: {
            url: process.env.ENVIRONMENTAL_CERTIFICATION_API || "https://api.environmental-cert.org",
            apiKey: process.env.ENVIRONMENTAL_CERTIFICATION_API_KEY || "your_api_key_here"
        }
    },

    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || "your_jwt_secret_here",
        sessionSecret: process.env.SESSION_SECRET || "your_session_secret_here",
        bcryptRounds: 12,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || "info",
        file: process.env.LOG_FILE || "logs/green-hydrogen.log",
        maxSize: "20m",
        maxFiles: "14d"
    },

    // Email Configuration
    email: {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || "your_email@gmail.com",
            pass: process.env.SMTP_PASS || "your_app_password"
        }
    },

    // Monitoring Configuration
    monitoring: {
        enabled: process.env.ENABLE_MONITORING === "true",
        metricsPort: process.env.METRICS_PORT || 9090,
        healthCheckPort: process.env.HEALTH_CHECK_PORT || 8080,
        prometheus: {
            enabled: true,
            path: "/metrics"
        }
    },

    // Development Configuration
    development: {
        autoDeploy: true,
        hotReload: true,
        debugMode: true,
        mockExternalServices: true
    },

    // Production Configuration
    production: {
        autoDeploy: false,
        hotReload: false,
        debugMode: false,
        mockExternalServices: false,
        enableCompression: true,
        enableSecurityHeaders: true
    }
};
