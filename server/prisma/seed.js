"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Start seeding...');
    // 1. Create Zones
    const northStand = await prisma.zone.create({
        data: {
            name: 'North Stand',
            description: 'Home supporter section',
            density: 'HIGH',
            riskLevel: 'NORMAL',
            waitingTime: 15,
        },
    });
    const vipZone = await prisma.zone.create({
        data: {
            name: 'VIP Lounge',
            description: 'Exclusive access area',
            density: 'LOW',
            riskLevel: 'NORMAL',
            waitingTime: 0,
        },
    });
    // 2. Create Facilities
    await prisma.facility.create({
        data: {
            name: 'North Stand Restrooms (Gate A)',
            type: 'RESTROOM',
            location: 'Level 1, Near Gate A',
            zoneId: northStand.id,
            isOpen: true,
            waitingTime: 5,
        },
    });
    await prisma.facility.create({
        data: {
            name: 'VIP Dining Area',
            type: 'FOOD',
            location: 'Level 3, Suite Area',
            zoneId: vipZone.id,
            isOpen: true,
            waitingTime: 0,
        },
    });
    await prisma.facility.create({
        data: {
            name: 'Medical Center - North',
            type: 'MEDICAL',
            location: 'Level 1, Room 104',
            zoneId: northStand.id,
            isOpen: true,
            waitingTime: 2,
        },
    });
    // 3. Create Events (Match Schedule)
    await prisma.event.create({
        data: {
            title: 'Stadium Gates Open',
            type: 'GATE_OPENING',
            description: 'All public gates are open for spectator entry.',
            time: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
    });
    await prisma.event.create({
        data: {
            title: 'Match Kickoff - Quarter Final',
            type: 'KICKOFF',
            description: 'The match has officially started.',
            time: new Date(new Date().getTime() + 1 * 60 * 60 * 1000), // In 1 hour
        },
    });
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map