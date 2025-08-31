const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Green Hydrogen Credit System...");

  // Get the contract factory
  const GreenHydrogenCredit = await ethers.getContractFactory("GreenHydrogenCredit");
  
  // Deploy the contract
  const greenHydrogenCredit = await GreenHydrogenCredit.deploy();
  await greenHydrogenCredit.waitForDeployment();
  
  const contractAddress = await greenHydrogenCredit.getAddress();
  console.log("✅ Green Hydrogen Credit System deployed to:", contractAddress);

  // Get the deployer account (regulator)
  const [deployer] = await ethers.getSigners();
  console.log("🏛️  Regulator address:", deployer.address);

  // Set up initial configuration
  console.log("\n🔧 Setting up initial configuration...");

  // Register some sample auditors (you can replace these with real addresses)
  const sampleAuditors = [
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account #1
      name: "Green Energy Auditors Inc.",
      accreditation: "ISO 14064-1:2018, GHG Protocol"
    },
    {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account #2
      name: "Sustainable Certification Authority",
      accreditation: "IEC 17025:2017, ISO 14065:2013"
    },
    {
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Hardhat account #3
      name: "Renewable Energy Verification Bureau",
      accreditation: "ISO 14064-2:2019, VCS Standard"
    }
  ];

  console.log("📋 Registering sample auditors...");
  for (const auditor of sampleAuditors) {
    try {
      const tx = await greenHydrogenCredit.registerAuditor(
        auditor.address,
        auditor.name,
        auditor.accreditation
      );
      await tx.wait();
      console.log(`   ✅ Registered: ${auditor.name} (${auditor.address})`);
    } catch (error) {
      console.log(`   ❌ Failed to register ${auditor.name}:`, error.message);
    }
  }

  // Issue some sample credits for demonstration
  console.log("\n🌱 Issuing sample green hydrogen credits...");
  
  const sampleCredits = [
    {
      producer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      producerName: "Solar Hydrogen Farm Alpha",
      amount: 1000, // 1000 kg of H2
      renewableSource: "Solar PV",
      location: "California, USA",
      carbonIntensity: 25, // gCO2/kWh
      metadata: "Solar-powered electrolysis with battery storage"
    },
    {
      producer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      producerName: "Wind Hydrogen Station Beta",
      amount: 1500, // 1500 kg of H2
      renewableSource: "Wind Turbine",
      location: "Texas, USA",
      carbonIntensity: 30, // gCO2/kWh
      metadata: "Offshore wind farm with hydrogen production facility"
    },
    {
      producer: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      producerName: "Hydroelectric Hydrogen Plant Gamma",
      amount: 800, // 800 kg of H2
      renewableSource: "Hydroelectric",
      location: "Washington, USA",
      carbonIntensity: 20, // gCO2/kWh
      metadata: "Run-of-river hydroelectric with electrolysis"
    }
  ];

  for (let i = 0; i < sampleCredits.length; i++) {
    const credit = sampleCredits[i];
    try {
      const tx = await greenHydrogenCredit.issueCredit(
        credit.producer, // Issue to producer initially
        credit.producer,
        credit.producerName,
        credit.amount,
        Math.floor(Date.now() / 1000) - (i * 86400), // Production dates in the past
        credit.renewableSource,
        credit.location,
        credit.carbonIntensity,
        credit.metadata
      );
      await tx.wait();
      console.log(`   ✅ Issued credit #${i + 1}: ${credit.producerName} - ${credit.amount} kg H2`);
    } catch (error) {
      console.log(`   ❌ Failed to issue credit #${i + 1}:`, error.message);
    }
  }

  // Verify some credits as an auditor
  console.log("\n🔍 Verifying sample credits...");
  const auditor1 = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", ethers.provider);
  const auditorContract = greenHydrogenCredit.connect(auditor1);
  
  try {
    // Verify first credit
    const tx1 = await auditorContract.verifyCredit(1, 1, "Verified by Green Energy Auditors Inc. - All documentation reviewed and site inspection completed.");
    await tx1.wait();
    console.log("   ✅ Credit #1 verified by Green Energy Auditors Inc.");
    
    // Verify second credit
    const tx2 = await auditorContract.verifyCredit(2, 1, "Verified by Green Energy Auditors Inc. - Wind farm certification confirmed, carbon intensity validated.");
    await tx2.wait();
    console.log("   ✅ Credit #2 verified by Green Energy Auditors Inc.");
    
    // Verify third credit
    const tx3 = await auditorContract.verifyCredit(3, 1, "Verified by Green Energy Auditors Inc. - Hydroelectric facility inspected, environmental impact assessed.");
    await tx3.wait();
    console.log("   ✅ Credit #3 verified by Green Energy Auditors Inc.");
  } catch (error) {
    console.log("   ❌ Failed to verify credits:", error.message);
  }

  // Create and verify a production batch
  console.log("\n📦 Creating production batch...");
  try {
    const batchTx = await auditorContract.createProductionBatch(
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Producer
      [1, 2, 3] // Credit IDs
    );
    await batchTx.wait();
    console.log("   ✅ Production batch #1 created");
    
    // Second auditor verifies the batch
    const auditor2 = new ethers.Wallet("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", ethers.provider);
    const auditor2Contract = greenHydrogenCredit.connect(auditor2);
    
    const verifyBatchTx = await auditor2Contract.verifyProductionBatch(1);
    await verifyBatchTx.wait();
    console.log("   ✅ Production batch #1 verified by second auditor");
  } catch (error) {
    console.log("   ❌ Failed to create/verify batch:", error.message);
  }

  console.log("\n🎉 Deployment and setup completed successfully!");
  console.log("\n📊 System Summary:");
  console.log("   • Contract Address:", contractAddress);
  console.log("   • Regulator:", deployer.address);
  console.log("   • Auditors Registered:", sampleAuditors.length);
  console.log("   • Sample Credits Issued:", sampleCredits.length);
  console.log("   • Production Batch Created: 1");
  
  console.log("\n🔗 Next Steps:");
  console.log("   1. Update your frontend with the new contract address");
  console.log("   2. Test the system with different user roles");
  console.log("   3. Deploy to testnet/mainnet when ready");
  console.log("   4. Register real auditors and producers");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
