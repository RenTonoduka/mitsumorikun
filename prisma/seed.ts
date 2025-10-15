import { PrismaClient, TechStackCategory } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Seed TechStacks
  const techStacks = [
    // Languages
    { name: "TypeScript", slug: "typescript", category: "LANGUAGE" as TechStackCategory },
    { name: "JavaScript", slug: "javascript", category: "LANGUAGE" as TechStackCategory },
    { name: "Python", slug: "python", category: "LANGUAGE" as TechStackCategory },
    { name: "Java", slug: "java", category: "LANGUAGE" as TechStackCategory },
    { name: "Go", slug: "go", category: "LANGUAGE" as TechStackCategory },
    
    // Frameworks
    { name: "Next.js", slug: "nextjs", category: "FRAMEWORK" as TechStackCategory },
    { name: "React", slug: "react", category: "FRAMEWORK" as TechStackCategory },
    { name: "Vue.js", slug: "vuejs", category: "FRAMEWORK" as TechStackCategory },
    { name: "Angular", slug: "angular", category: "FRAMEWORK" as TechStackCategory },
    { name: "Django", slug: "django", category: "FRAMEWORK" as TechStackCategory },
    { name: "FastAPI", slug: "fastapi", category: "FRAMEWORK" as TechStackCategory },
    
    // Databases
    { name: "PostgreSQL", slug: "postgresql", category: "DATABASE" as TechStackCategory },
    { name: "MySQL", slug: "mysql", category: "DATABASE" as TechStackCategory },
    { name: "MongoDB", slug: "mongodb", category: "DATABASE" as TechStackCategory },
    { name: "Redis", slug: "redis", category: "DATABASE" as TechStackCategory },
    
    // Cloud
    { name: "AWS", slug: "aws", category: "CLOUD" as TechStackCategory },
    { name: "Google Cloud", slug: "gcp", category: "CLOUD" as TechStackCategory },
    { name: "Azure", slug: "azure", category: "CLOUD" as TechStackCategory },
    { name: "Vercel", slug: "vercel", category: "CLOUD" as TechStackCategory },
  ]

  for (const tech of techStacks) {
    await prisma.techStack.upsert({
      where: { slug: tech.slug },
      update: {},
      create: tech,
    })
  }

  console.log("✅ TechStacks seeded")

  // Seed Specialties
  const specialties = [
    { name: "Web開発", slug: "web-development", description: "Webアプリケーション開発" },
    { name: "モバイルアプリ開発", slug: "mobile-app", description: "iOS/Androidアプリ開発" },
    { name: "AI・機械学習", slug: "ai-ml", description: "AI・機械学習システム開発" },
    { name: "業務システム", slug: "business-system", description: "業務システム・ERPの開発" },
    { name: "ECサイト", slug: "e-commerce", description: "ECサイト・オンラインショップ開発" },
    { name: "SaaS開発", slug: "saas", description: "SaaSプロダクト開発" },
    { name: "インフラ構築", slug: "infrastructure", description: "クラウドインフラ構築・運用" },
    { name: "セキュリティ", slug: "security", description: "セキュリティ対策・診断" },
  ]

  for (const specialty of specialties) {
    await prisma.specialty.upsert({
      where: { slug: specialty.slug },
      update: {},
      create: specialty,
    })
  }

  console.log("✅ Specialties seeded")
  console.log("🎉 Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
