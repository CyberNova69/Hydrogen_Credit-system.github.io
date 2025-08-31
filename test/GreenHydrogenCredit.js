const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Green Hydrogen Credit System", function () {
    let GreenHydrogenCredit;
    let greenHydrogenCredit;
    let owner;
    let regulator;
    let certifier;
    let auditor1;
    let auditor2;
    let producer1;
    let producer2;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, regulator, certifier, auditor1, auditor2, producer1, producer2, user1, user2] = await ethers.getSigners();
        
        GreenHydrogenCredit = await ethers.getContractFactory("GreenHydrogenCredit");
        greenHydrogenCredit = await GreenHydrogenCredit.deploy();
        await greenHydrogenCredit.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct regulator and certifier", async function () {
            expect(await greenHydrogenCredit.regulator()).to.equal(owner.address);
            expect(await greenHydrogenCredit.certifier()).to.equal(owner.address);
        });

        it("Should start with correct initial values", async function () {
            expect(await greenHydrogenCredit.nextId()).to.equal(1);
            expect(await greenHydrogenCredit.nextBatchId()).to.equal(1);
        });
    });

    describe("Regulator Functions", function () {
        it("Should allow regulator to set new certifier", async function () {
            await greenHydrogenCredit.setCertifier(certifier.address);
            expect(await greenHydrogenCredit.certifier()).to.equal(certifier.address);
        });

        it("Should allow regulator to register auditors", async function () {
            await greenHydrogenCredit.registerAuditor(
                auditor1.address,
                "Test Auditor 1",
                "ISO 14064-1:2018"
            );

            const auditor = await greenHydrogenCredit.getAuditor(auditor1.address);
            expect(auditor.name).to.equal("Test Auditor 1");
            expect(auditor.accreditation).to.equal("ISO 14064-1:2018");
            expect(auditor.isActive).to.be.true;
            expect(await greenHydrogenCredit.isAuditor(auditor1.address)).to.be.true;
        });

        it("Should allow regulator to deactivate auditors", async function () {
            await greenHydrogenCredit.registerAuditor(
                auditor1.address,
                "Test Auditor 1",
                "ISO 14064-1:2018"
            );

            await greenHydrogenCredit.deactivateAuditor(auditor1.address);
            expect(await greenHydrogenCredit.isAuditor(auditor1.address)).to.be.false;
        });

        it("Should allow regulator to suspend credits", async function () {
            // First issue a credit
            await greenHydrogenCredit.issueCredit(
                producer1.address,
                producer1.address,
                "Test Producer",
                1000,
                Math.floor(Date.now() / 1000),
                "Solar PV",
                "California, USA",
                25,
                "Test metadata"
            );

            await greenHydrogenCredit.suspendCredit(1, "Suspicious activity");
            const credit = await greenHydrogenCredit.getCredit(1);
            expect(credit.status).to.equal(2); // Suspended
        });

        it("Should prevent non-regulator from calling regulator functions", async function () {
            await expect(
                greenHydrogenCredit.connect(user1).setCertifier(certifier.address)
            ).to.be.revertedWith("Only regulator can call this function");

            await expect(
                greenHydrogenCredit.connect(user1).registerAuditor(
                    auditor1.address,
                    "Test",
                    "Test"
                )
            ).to.be.revertedWith("Only regulator can call this function");
        });
    });

    describe("Certifier Functions", function () {
        beforeEach(async function () {
            await greenHydrogenCredit.setCertifier(certifier.address);
        });

        it("Should allow certifier to issue credits", async function () {
            const productionDate = Math.floor(Date.now() / 1000);
            
            await greenHydrogenCredit.connect(certifier).issueCredit(
                producer1.address,
                producer1.address,
                "Solar Hydrogen Farm",
                1000,
                productionDate,
                "Solar PV",
                "California, USA",
                25,
                "Solar-powered electrolysis"
            );

            const credit = await greenHydrogenCredit.getCredit(1);
            expect(credit.owner).to.equal(producer1.address);
            expect(credit.producer).to.equal(producer1.address);
            expect(credit.producerName).to.equal("Solar Hydrogen Farm");
            expect(credit.amount).to.equal(1000);
            expect(credit.productionDate).to.equal(productionDate);
            expect(credit.renewableSource).to.equal("Solar PV");
            expect(credit.location).to.equal("California, USA");
            expect(credit.carbonIntensity).to.equal(25);
            expect(credit.verificationStatus).to.equal(0); // Pending
            expect(credit.status).to.equal(0); // Active
            expect(credit.certifier).to.equal(certifier.address);
            expect(credit.isRetired).to.be.false;
        });

        it("Should reject credits with high carbon intensity", async function () {
            await expect(
                greenHydrogenCredit.connect(certifier).issueCredit(
                    producer1.address,
                    producer1.address,
                    "Test Producer",
                    1000,
                    Math.floor(Date.now() / 1000),
                    "Coal",
                    "Test Location",
                    100, // Above MAX_CARBON_INTENSITY
                    "Test metadata"
                )
            ).to.be.revertedWith("Carbon intensity too high");
        });

        it("Should reject credits with future production dates", async function () {
            const futureDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
            
            await expect(
                greenHydrogenCredit.connect(certifier).issueCredit(
                    producer1.address,
                    producer1.address,
                    "Test Producer",
                    1000,
                    futureDate,
                    "Solar PV",
                    "Test Location",
                    25,
                    "Test metadata"
                )
            ).to.be.revertedWith("Production date cannot be in the future");
        });

        it("Should prevent non-certifier from issuing credits", async function () {
            await expect(
                greenHydrogenCredit.connect(user1).issueCredit(
                    producer1.address,
                    producer1.address,
                    "Test Producer",
                    1000,
                    Math.floor(Date.now() / 1000),
                    "Solar PV",
                    "Test Location",
                    25,
                    "Test metadata"
                )
            ).to.be.revertedWith("Only certifier can call this function");
        });
    });

    describe("Auditor Functions", function () {
        beforeEach(async function () {
            await greenHydrogenCredit.registerAuditor(
                auditor1.address,
                "Test Auditor 1",
                "ISO 14064-1:2018"
            );
            await greenHydrogenCredit.registerAuditor(
                auditor2.address,
                "Test Auditor 2",
                "ISO 14064-1:2018"
            );

            // Issue a test credit
            await greenHydrogenCredit.issueCredit(
                producer1.address,
                producer1.address,
                "Test Producer",
                1000,
                Math.floor(Date.now() / 1000),
                "Solar PV",
                "Test Location",
                25,
                "Test metadata"
            );
        });

        it("Should allow auditors to verify credits", async function () {
            await greenHydrogenCredit.connect(auditor1).verifyCredit(
                1,
                1, // Verified
                "All documentation reviewed and verified"
            );

            const credit = await greenHydrogenCredit.getCredit(1);
            expect(credit.verificationStatus).to.equal(1); // Verified
        });

        it("Should allow auditors to reject credits", async function () {
            await greenHydrogenCredit.connect(auditor1).verifyCredit(
                1,
                2, // Rejected
                "Documentation incomplete"
            );

            const credit = await greenHydrogenCredit.getCredit(1);
            expect(credit.verificationStatus).to.equal(2); // Rejected
        });

        it("Should prevent verification of already verified credits", async function () {
            await greenHydrogenCredit.connect(auditor1).verifyCredit(
                1,
                1,
                "First verification"
            );

            await expect(
                greenHydrogenCredit.connect(auditor2).verifyCredit(
                    1,
                    1,
                    "Second verification"
                )
            ).to.be.revertedWith("Credit already verified");
        });

        it("Should allow auditors to create production batches", async function () {
            // Verify the credit first
            await greenHydrogenCredit.connect(auditor1).verifyCredit(
                1,
                1,
                "Verified"
            );

            await greenHydrogenCredit.connect(auditor1).createProductionBatch(
                producer1.address,
                [1]
            );

            const batch = await greenHydrogenCredit.getProductionBatch(1);
            expect(batch.producer).to.equal(producer1.address);
            expect(batch.totalAmount).to.equal(1000);
            expect(batch.verificationCount).to.equal(1);
            expect(batch.isVerified).to.be.false;
            expect(batch.creditIds).to.deep.equal([1]);
        });

        it("Should allow multiple auditors to verify production batches", async function () {
            // Verify the credit first
            await greenHydrogenCredit.connect(auditor1).verifyCredit(
                1,
                1,
                "Verified"
            );

            // Create batch
            await greenHydrogenCredit.connect(auditor1).createProductionBatch(
                producer1.address,
                [1]
            );

            // Second auditor verifies the batch
            await greenHydrogenCredit.connect(auditor2).verifyProductionBatch(1);

            const batch = await greenHydrogenCredit.getProductionBatch(1);
            expect(batch.verificationCount).to.equal(2);
            expect(batch.isVerified).to.be.true;
        });

        it("Should prevent non-auditors from calling auditor functions", async function () {
            await expect(
                greenHydrogenCredit.connect(user1).verifyCredit(
                    1,
                    1,
                    "Test verification"
                )
            ).to.be.revertedWith("Only active auditor can call this function");
        });
    });

    describe("Credit Management", function () {
        beforeEach(async function () {
            // Issue and verify a test credit
            await greenHydrogenCredit.issueCredit(
                producer1.address,
                producer1.address,
                "Test Producer",
                1000,
                Math.floor(Date.now() / 1000),
                "Solar PV",
                "Test Location",
                25,
                "Test metadata"
            );

            await greenHydrogenCredit.registerAuditor(
                auditor1.address,
                "Test Auditor",
                "ISO 14064-1:2018"
            );

            await greenHydrogenCredit.connect(auditor1).verifyCredit(
                1,
                1,
                "Verified"
            );
        });

        it("Should allow credit owners to transfer credits", async function () {
            await greenHydrogenCredit.connect(producer1).transferCredit(1, user1.address);

            const credit = await greenHydrogenCredit.getCredit(1);
            expect(credit.owner).to.equal(user1.address);
        });

        it("Should prevent non-owners from transferring credits", async function () {
            await expect(
                greenHydrogenCredit.connect(user1).transferCredit(1, user2.address)
            ).to.be.revertedWith("Not credit owner");
        });

        it("Should prevent transfer of unverified credits", async function () {
            // Issue another unverified credit
            await greenHydrogenCredit.issueCredit(
                producer2.address,
                producer2.address,
                "Test Producer 2",
                500,
                Math.floor(Date.now() / 1000),
                "Wind",
                "Test Location 2",
                30,
                "Test metadata 2"
            );

            await expect(
                greenHydrogenCredit.connect(producer2).transferCredit(2, user1.address)
            ).to.be.revertedWith("Credit not verified");
        });

        it("Should allow credit owners to retire credits", async function () {
            await greenHydrogenCredit.connect(producer1).retireCredit(
                1,
                "Used for carbon offset"
            );

            const credit = await greenHydrogenCredit.getCredit(1);
            expect(credit.isRetired).to.be.true;
            expect(credit.status).to.equal(1); // Retired
            expect(credit.retirementReason).to.equal("Used for carbon offset");
        });

        it("Should prevent retirement of already retired credits", async function () {
            await greenHydrogenCredit.connect(producer1).retireCredit(
                1,
                "First retirement"
            );

            await expect(
                greenHydrogenCredit.connect(producer1).retireCredit(
                    1,
                    "Second retirement"
                )
            ).to.be.revertedWith("Credit has been retired");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            // Issue multiple credits
            await greenHydrogenCredit.issueCredit(
                producer1.address,
                producer1.address,
                "Producer 1",
                1000,
                Math.floor(Date.now() / 1000),
                "Solar PV",
                "Location 1",
                25,
                "Metadata 1"
            );

            await greenHydrogenCredit.issueCredit(
                producer1.address,
                producer1.address,
                "Producer 1",
                500,
                Math.floor(Date.now() / 1000),
                "Wind",
                "Location 1",
                30,
                "Metadata 2"
            );

            await greenHydrogenCredit.issueCredit(
                producer2.address,
                producer2.address,
                "Producer 2",
                750,
                Math.floor(Date.now() / 1000),
                "Hydroelectric",
                "Location 2",
                20,
                "Metadata 3"
            );
        });

        it("Should return correct producer credits", async function () {
            const producer1Credits = await greenHydrogenCredit.getProducerCredits(producer1.address);
            const producer2Credits = await greenHydrogenCredit.getProducerCredits(producer2.address);

            expect(producer1Credits).to.deep.equal([1, 2]);
            expect(producer2Credits).to.deep.equal([3]);
        });

        it("Should return correct owner credits", async function () {
            const owner1Credits = await greenHydrogenCredit.getOwnerCredits(producer1.address);
            const owner2Credits = await greenHydrogenCredit.getOwnerCredits(producer2.address);

            expect(owner1Credits).to.deep.equal([1, 2]);
            expect(owner2Credits).to.deep.equal([3]);
        });

        it("Should calculate correct total credits by producer", async function () {
            const total1 = await greenHydrogenCredit.getTotalCreditsByProducer(producer1.address);
            const total2 = await greenHydrogenCredit.getTotalCreditsByProducer(producer2.address);

            expect(total1).to.equal(1500); // 1000 + 500
            expect(total2).to.equal(750);
        });

        it("Should check credit expiry correctly", async function () {
            const isExpired = await greenHydrogenCredit.isCreditExpired(1);
            expect(isExpired).to.be.false; // Credit was just created
        });
    });

    describe("Edge Cases and Security", function () {
        it("Should handle zero addresses correctly", async function () {
            await expect(
                greenHydrogenCredit.setCertifier(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid certifier address");

            await expect(
                greenHydrogenCredit.registerAuditor(
                    ethers.ZeroAddress,
                    "Test",
                    "Test"
                )
            ).to.be.revertedWith("Invalid auditor address");
        });

        it("Should prevent duplicate auditor registration", async function () {
            await greenHydrogenCredit.registerAuditor(
                auditor1.address,
                "Test Auditor",
                "ISO 14064-1:2018"
            );

            await expect(
                greenHydrogenCredit.registerAuditor(
                    auditor1.address,
                    "Test Auditor 2",
                    "ISO 14064-2:2019"
                )
            ).to.be.revertedWith("Auditor already registered");
        });

        it("Should handle non-existent credits gracefully", async function () {
            await expect(
                greenHydrogenCredit.getCredit(999)
            ).to.be.revertedWith("Credit does not exist");

            await expect(
                greenHydrogenCredit.transferCredit(999, user1.address)
            ).to.be.revertedWith("Credit does not exist");
        });

        it("Should maintain data integrity during transfers", async function () {
            // Issue a credit
            await greenHydrogenCredit.issueCredit(
                producer1.address,
                producer1.address,
                "Test Producer",
                1000,
                Math.floor(Date.now() / 1000),
                "Solar PV",
                "Test Location",
                25,
                "Test metadata"
            );

            // Transfer credit
            await greenHydrogenCredit.connect(producer1).transferCredit(1, user1.address);

            // Verify producer credits still include this credit
            const producerCredits = await greenHydrogenCredit.getProducerCredits(producer1.address);
            expect(producerCredits).to.include(1);

            // Verify owner credits are updated
            const ownerCredits = await greenHydrogenCredit.getOwnerCredits(user1.address);
            expect(ownerCredits).to.include(1);
        });
    });
});
