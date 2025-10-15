# データモデル設計書

**プロジェクト名**: AI/システム開発特化型相見積もりサイト
**バージョン**: 1.0.0
**作成日**: 2025-10-15

---

## Prisma Schema

```prisma
// User (一般ユーザー)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  company       String?
  role          String?
  phone         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  requests      Request[]
  reviews       Review[]
  favorites     Favorite[]
}

// Company (企業)
model Company {
  id              String    @id @default(cuid())
  name            String    @unique
  slug            String    @unique
  logoUrl         String?
  catchphrase     String?
  description     String
  foundedYear     Int
  capitalMillion  Int
  employees       Int
  address         String
  phone           String
  websiteUrl      String
  status          String    @default("pending") // pending, approved, rejected
  rating          Float     @default(0.0)
  reviewCount     Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  users           CompanyUser[]
  techStacks      CompanyTechStack[]
  specialties     CompanySpecialty[]
  requests        RequestCompany[]
  reviews         Review[]
  favorites       Favorite[]
}

// CompanyUser (企業担当者)
model CompanyUser {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  role        String
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Request (資料請求)
model Request {
  id              String    @id @default(cuid())
  projectName     String
  description     String
  budget          String
  deadline        String
  techStacks      String[]
  otherRequests   String?
  status          String    @default("pending")
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  companies       RequestCompany[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// RequestCompany (資料請求-企業の中間テーブル)
model RequestCompany {
  id          String   @id @default(cuid())
  requestId   String
  companyId   String
  status      String   @default("pending") // pending, responded, meeting, contracted, rejected
  request     Request  @relation(fields: [requestId], references: [id])
  company     Company  @relation(fields: [companyId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Review (レビュー)
model Review {
  id              String   @id @default(cuid())
  rating          Float
  ratingTech      Float?
  ratingComm      Float?
  ratingDeadline  Float?
  ratingCost      Float?
  ratingSupport   Float?
  title           String
  content         String
  projectDesc     String?
  isAnonymous     Boolean  @default(false)
  userId          String
  companyId       String
  user            User     @relation(fields: [userId], references: [id])
  company         Company  @relation(fields: [companyId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Favorite (お気に入り)
model Favorite {
  id          String   @id @default(cuid())
  userId      String
  companyId   String
  user        User     @relation(fields: [userId], references: [id])
  company     Company  @relation(fields: [companyId], references: [id])
  createdAt   DateTime @default(now())
  
  @@unique([userId, companyId])
}

// TechStack (技術スタック)
model TechStack {
  id        String   @id @default(cuid())
  name      String   @unique
  category  String   // frontend, backend, database, infrastructure
  iconUrl   String?
  companies CompanyTechStack[]
}

// CompanyTechStack (企業-技術スタックの中間テーブル)
model CompanyTechStack {
  companyId    String
  techStackId  String
  company      Company    @relation(fields: [companyId], references: [id])
  techStack    TechStack  @relation(fields: [techStackId], references: [id])
  
  @@id([companyId, techStackId])
}

// Specialty (得意領域)
model Specialty {
  id        String   @id @default(cuid())
  name      String   @unique
  companies CompanySpecialty[]
}

// CompanySpecialty (企業-得意領域の中間テーブル)
model CompanySpecialty {
  companyId    String
  specialtyId  String
  company      Company    @relation(fields: [companyId], references: [id])
  specialty    Specialty  @relation(fields: [specialtyId], references: [id])
  
  @@id([companyId, specialtyId])
}
```

---

**このドキュメントは Issue #2 の要件に基づいて、Miyabi Autonomous Agent により自動生成されました。**

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
