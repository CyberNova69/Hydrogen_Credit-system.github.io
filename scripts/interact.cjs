const { ethers } = require("hardhat");

async function main() {
    console.log("🔗 Interacting with Green Hydrogen Credit System...");

    // Get the contract instance
    const contractAddress = "0x7C16981685a373c7f4ED0dBdBFC2921D14c9A134"; // Update this after deployment
    const GreenHydrogenCredit = await ethers.getContractFactory("GreenHydrogenCredit");
    const contract = GreenHydrogenCredit.attach(contractAddress);

    // Get signers
    const [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();
    
    console.log("🏛️  Regulator (Owner):", owner.address);
    console.log("👤 User 1:", user1.address);
    console.log("👤 User 2:", user2.address);
    console.log("👤 User 3:", user3.address);
    console.log("👤 User 4:", user4.address);
    console.log("👤 User 5:", user5.address);

    try {
        // Check current system state
        console.log("\n📊 Current System State:");
        const nextId = await contract.nextId();
        const nextBatchId = await contract.nextBatchId();
        const regulator = await contract.regulator();
        const certifier = await contract.certifier();
        
        console.log(`   Total Credits: ${nextId - 1}`);
        console.log(`   Total Batches: ${nextBatchId - 1}`);
        console.log(`   Regulator: ${regulator}`);
        console.log(`   Certifier: ${certifier}`);

        // Example: Register a new auditor
        console.log("\n👥 Registering new auditor...");
        try {
            const tx = await contract.registerAuditor(
                user1.address,
                "Independent Energy Auditors",
                "ISO 14064-1:2018, GHG Protocol"
            );
            await tx.wait();
            console.log("   ✅ Auditor registered successfully!");
        } catch (error) {
            console.log("   ⚠️  Auditor registration failed (may already exist):", error.message);
        }

        // Example: Issue a new credit
        console.log("\n🌱 Issuing new credit...");
        try {
            const productionDate = Math.floor(Date.now() / 1000) - 86400; // Yesterday
            const tx = await contract.issueCredit(
                user2.address,           // Recipient
                user2.address,           // Producer
                "Wind Hydrogen Farm",    // Producer name
                2000,                    // Amount (kg H2)
                productionDate,          // Production date
                "Wind Turbine",          // Renewable source
                "North Dakota, USA",     // Location
                28,                      // Carbon intensity (gCO2/kWh)
                "Offshore wind farm with hydrogen production facility" // Metadata
            );
            await tx.wait();
            console.log("   ✅ Credit issued successfully!");
            
            // Get the new credit details
            const newCreditId = nextId;
            const credit = await contract.getCredit(newCreditId);
            console.log(`   📋 Credit #${newCreditId}: ${credit.producerName} - ${credit.amount} kg H2`);
            
        } catch (error) {
            console.log("   ❌ Credit issuance failed:", error.message);
        }

        // Example: Verify a credit
        console.log("\n🔍 Verifying credit...");
        try {
            const newCreditId = await contract.nextId() - 1;
            const tx = await contract.connect(user1).verifyCredit(
                newCreditId,
                1, // Verified
                "Site inspection completed, documentation verified, carbon intensity validated"
            );
            await tx.wait();
            console.log(`   ✅ Credit #${newCreditId} verified successfully!`);
        } catch (error) {
            console.log("   ❌ Credit verification failed:", error.message);
        }

        // Example: Create production batch
        console.log("\n📦 Creating production batch...");
        try {
            const newCreditId = await contract.nextId() - 1;
            const tx = await contract.connect(user1).createProductionBatch(
                user2.address, // Producer
                [newCreditId]  // Credit IDs
            );
            await tx.wait();
            console.log("   ✅ Production batch created successfully!");
        } catch (error) {
            console.log("   ❌ Production batch creation failed:", error.message);
        }

        // Example: Transfer credit
        console.log("\n💱 Transferring credit...");
        try {
            const newCreditId = await contract.nextId() - 1;
            const tx = await contract.connect(user2).transferCredit(
                newCreditId,
                user3.address
            );
            await tx.wait();
            console.log(`   ✅ Credit #${newCreditId} transferred to ${user3.address}!`);
        } catch (error) {
            console.log("   ❌ Credit transfer failed:", error.message);
        }

        // Example: Retire credit
        console.log("\n♻️  Retiring credit...");
        try {
            const newCreditId = await contract.nextId() - 1;
            const tx = await contract.connect(user3).retireCredit(
                newCreditId,
                "Used for carbon offset in manufacturing process"
            );
            await tx.wait();
            console.log(`   ✅ Credit #${newCreditId} retired successfully!`);
        } catch (error) {
            console.log("   ❌ Credit retirement failed:", error.message);
        }

        // Example: Get producer statistics
        console.log("\n📊 Getting producer statistics...");
        try {
            const totalCredits = await contract.getTotalCreditsByProducer(user2.address);
            const producerCredits = await contract.getProducerCredits(user2.address);
            console.log(`   Producer ${user2.address}:`);
            console.log(`     Total Active Credits: ${totalCredits} kg H2`);
            console.log(`     Total Credits Issued: ${producerCredits.length}`);
        } catch (error) {
            console.log("   ❌ Failed to get producer statistics:", error.message);
        }

        // Example: Check credit expiry
        console.log("\n⏰ Checking credit expiry...");
        try {
            const creditId = 1; // Check first credit
            const isExpired = await contract.isCreditExpired(creditId);
            console.log(`   Credit #${creditId} expired: ${isExpired ? 'Yes' : 'No'}`);
        } catch (error) {
            console.log("   ❌ Failed to check credit expiry:", error.message);
        }

        // Final system state
        console.log("\n📊 Final System State:");
        const finalNextId = await contract.nextId();
        const finalNextBatchId = await contract.nextBatchId();
        
        console.log(`   Total Credits: ${finalNextId - 1}`);
        console.log(`   Total Batches: ${finalNextBatchId - 1}`);

        console.log("\n🎉 Interaction completed successfully!");
        console.log("\n💡 Next Steps:");
        console.log("   1. Test the frontend interface");
        console.log("   2. Try different user roles");
        console.log("   3. Explore all system functions");
        console.log("   4. Deploy to testnet for real testing");

    } catch (error) {
        console.error("❌ Interaction failed:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
