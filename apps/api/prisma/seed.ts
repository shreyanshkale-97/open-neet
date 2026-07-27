import { PrismaClient, FeatureFlag } from '@prisma/client';
import { NEET_CURRICULUM } from '../src/libs/shared/constants/src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Default Feature Flags
  const flags = [
    { flag: FeatureFlag.AI_TUTOR, enabled: false },
    { flag: FeatureFlag.ADAPTIVE_TEST, enabled: false },
    { flag: FeatureFlag.LEADERBOARD, enabled: false },
    { flag: FeatureFlag.VOICE_MODE, enabled: false },
    { flag: FeatureFlag.OWN_PAPER_MODE, enabled: true },
    { flag: FeatureFlag.YOUTUBE_RAG, enabled: false },
  ];

  for (const f of flags) {
    await prisma.featureFlagRecord.upsert({
      where: { flag: f.flag },
      update: { enabled: f.enabled },
      create: { flag: f.flag, enabled: f.enabled },
    });
  }
  console.log('✅ Feature flags seeded');

  // 2. Seed NEET Curriculum (Subjects, Units, Topics)
  const curriculumMap = [
    { key: 'PHYSICS', data: NEET_CURRICULUM.PHYSICS, order: 1 },
    { key: 'CHEMISTRY', data: NEET_CURRICULUM.CHEMISTRY, order: 2 },
    { key: 'BOTANY', data: NEET_CURRICULUM.BOTANY, order: 3 },
    { key: 'ZOOLOGY', data: NEET_CURRICULUM.ZOOLOGY, order: 4 },
  ];

  for (const subItem of curriculumMap) {
    const subject = await prisma.subject.upsert({
      where: { name: subItem.data.name },
      update: { displayOrder: subItem.order },
      create: { name: subItem.data.name, displayOrder: subItem.order },
    });

    let unitOrder = 1;
    for (const [, unitData] of Object.entries(subItem.data.units)) {
      const unit = await prisma.unit.create({
        data: {
          subjectId: subject.id,
          name: unitData.name,
          displayOrder: unitOrder++,
        },
      });

      let topicOrder = 1;
      for (const topicName of unitData.topics) {
        await prisma.topic.create({
          data: {
            unitId: unit.id,
            name: topicName,
            displayOrder: topicOrder++,
          },
        });
      }
    }
  }
  console.log('✅ NEET curriculum (Physics, Chemistry, Botany, Zoology) seeded');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });