# Matching Feature Implementation

Complete implementation of Issue #9: Intelligent company-request matching system with proposal management.

## 🎯 Overview

The matching feature enables automatic discovery of compatible companies for quote requests using a sophisticated scoring algorithm. Companies can submit proposals, and users can compare and select the best offer.

## 📊 Matching Algorithm

### Scoring System (Total: 100 points)

```typescript
Tech Stack Match:    40 points (Jaccard similarity)
Specialty Alignment: 30 points (Project type + custom specialties)
Budget Compatibility: 20 points (Range analysis)
Company Rating:      10 points (Review-based reputation)
```

### Algorithm Details

**1. Tech Stack Matching (0-40 points)**
- Uses Jaccard similarity coefficient: `|intersection| / |union|`
- Case-insensitive matching
- No requirements = perfect match (40 points)
- Empty company tech stacks = 0 points

**2. Specialty Matching (0-30 points)**
- Primary match: Project type keywords (15 points)
- Secondary match: Custom specialties (15 points)
- Fuzzy matching with `includes()` for flexibility

**3. Budget Compatibility (0-20 points)**
- Perfect (18-20): Moderate budget range (0.2-0.5x ratio)
- Good (10-14): Narrow or wide ranges
- Acceptable (5-9): Very wide ranges
- Bonus: +2 for large budgets (>10M JPY)

**4. Company Rating (0-10 points)**
- Base score: `(rating / 5) * 8` (up to 8 points)
- Bonus for reviews: +2 for 50+, +1.5 for 20+, +1 for 10+
- New companies: 5 points (neutral)

## 🔌 API Routes

### 1. GET `/api/requests/[id]/matches`
Get matched companies with scores.

**Query Parameters:**
- `minScore`: Minimum matching score (default: 30)
- `maxResults`: Max number of results (default: 20)
- `verifiedOnly`: Only verified companies (boolean)
- `minRating`: Minimum company rating (0-5)

**Response:**
```json
{
  "requestId": "clxxx",
  "totalMatches": 15,
  "matches": [
    {
      "company": { /* Company details */ },
      "matchScore": {
        "total": 85,
        "techStackScore": 35,
        "specialtyScore": 28,
        "budgetScore": 15,
        "ratingScore": 7,
        "matchedTechStacks": ["React", "Node.js"],
        "matchedSpecialties": ["Web Development"],
        "budgetCompatibility": "perfect"
      }
    }
  ]
}
```

### 2. POST `/api/requests/[id]/proposals`
Submit a proposal for a request.

**Authorization:** Verified company members only

**Request Body:**
```json
{
  "estimatedCost": 5000000,
  "estimatedDuration": "3 months",
  "proposal": "Our detailed proposal...",
  "attachments": ["https://..."]
}
```

**Business Rules:**
- Only PUBLISHED requests accept proposals
- Only verified companies can submit
- One proposal per company per request
- Updates existing PENDING proposals

### 3. GET `/api/requests/[id]/proposals`
Get all proposals for a request.

**Authorization:** Request owner only

**Response:**
```json
{
  "requestId": "clxxx",
  "totalProposals": 8,
  "proposals": [
    {
      "id": "clyyy",
      "estimatedCost": 5000000,
      "estimatedDuration": "3 months",
      "proposal": "...",
      "status": "RESPONDED",
      "company": { /* Full company details */ },
      "matchScore": { /* Match breakdown */ }
    }
  ]
}
```

### 4. GET `/api/proposals/[id]`
Get detailed proposal information.

**Authorization:** Request owner OR company member

### 5. PATCH `/api/proposals/[id]`
Update proposal status (REJECTED only).

**Authorization:** Request owner only

**Request Body:**
```json
{
  "status": "REJECTED",
  "reason": "Budget exceeds our limit"
}
```

### 6. POST `/api/proposals/[id]/select`
Select a proposal and auto-reject all others.

**Authorization:** Request owner only

**Side Effects:**
- Sets proposal status to SELECTED
- Sets all other proposals to REJECTED
- Closes the request (status → CLOSED)
- Triggers notifications (TODO)

## 🎨 UI Components

### Pages

**1. `/requests/[id]/matches` - Matched Companies List**
- Displays all matched companies with scores
- Interactive filters (score threshold, rating, verified only)
- Click to submit proposal
- Empty state with filter reset

**2. `/requests/[id]/proposals` - Proposals Management**
- View all received proposals
- Separated sections: Awaiting Review, Selected, Rejected
- Quick actions: Select, Reject, View Details
- Link to comparison view
- Empty state with CTA to view matches

**3. `/requests/[id]/proposals/compare` - Side-by-Side Comparison**
- Summary statistics (avg cost, range, avg match)
- Comparison table with key metrics
- Detailed breakdown cards with match score details
- Quick filtering and sorting

**4. `/requests/[id]/proposals/new` - Proposal Submission Form**
- Estimated cost input (JPY)
- Estimated duration input
- Rich text proposal (min 50 chars)
- Multiple attachment URLs
- Validation with helpful tips

### Reusable Components

**1. `<MatchScoreBadge />`**
```tsx
<MatchScoreBadge
  score={85}
  showLabel={true}
  size="md"
/>
```
Displays score with color-coded badge:
- 80-100: Green (Excellent Match)
- 60-79: Blue (Good Match)
- 40-59: Yellow (Fair Match)
- 0-39: Gray (Poor Match)

**2. `<MatchScoreDetails />`**
```tsx
<MatchScoreDetails matchScore={matchScore} />
```
Shows detailed breakdown with progress bars:
- Tech Stack Match (blue)
- Specialty Alignment (purple)
- Budget Compatibility (green)
- Company Rating (yellow)

**3. `<ProposalCard />`**
```tsx
<ProposalCard
  proposal={proposal}
  onSelect={handleSelect}
  onReject={handleReject}
  showActions={true}
/>
```
Complete proposal display card with:
- Company info + verification badge
- Match score badge
- Cost & duration
- Proposal text preview
- Status badge
- Action buttons

**4. `<CompanyMatchCard />`**
```tsx
<CompanyMatchCard
  match={matchedCompany}
  onSubmitProposal={handleSubmit}
  showActions={true}
/>
```
Company display with match details:
- Company logo + verification
- Rating & review count
- Match score (large)
- Matched tech stacks
- Matched specialties
- Budget compatibility
- Action buttons

## 🔒 Authorization & Security

### Access Control

**Request Owners Can:**
- View matched companies (any published request)
- View received proposals
- Select/reject proposals
- Compare proposals

**Company Members Can:**
- View matched requests (published only)
- Submit proposals (verified companies only)
- View their own proposals
- Update their proposals (before submission)

**Public Can:**
- View published requests
- View company profiles
- View public reviews

### Business Rules

1. Only PUBLISHED requests receive proposals
2. Only VERIFIED companies can submit proposals
3. One proposal per company per request
4. Cannot submit to own requests
5. Selecting one proposal auto-rejects all others
6. Draft requests are private to owners

## 📁 File Structure

```
src/
├── types/
│   └── matching.ts                    # TypeScript interfaces
├── lib/
│   └── matching/
│       └── algorithm.ts               # Core matching logic
├── components/
│   └── matching/
│       ├── MatchScoreBadge.tsx       # Score display
│       ├── MatchScoreDetails.tsx     # Score breakdown
│       ├── ProposalCard.tsx          # Proposal display
│       ├── CompanyMatchCard.tsx      # Company display
│       └── index.ts                  # Exports
├── app/
│   ├── api/
│   │   ├── requests/[id]/
│   │   │   ├── matches/route.ts      # GET matches
│   │   │   └── proposals/route.ts    # GET/POST proposals
│   │   └── proposals/[id]/
│   │       ├── route.ts              # GET/PATCH proposal
│   │       └── select/route.ts       # POST select
│   └── requests/[id]/
│       ├── matches/page.tsx          # Matches list
│       └── proposals/
│           ├── page.tsx              # Proposals list
│           ├── new/page.tsx          # Submission form
│           └── compare/page.tsx      # Comparison view
```

## 🧪 Testing Checklist

### Matching Algorithm
- [ ] Tech stack matching with various combinations
- [ ] Specialty matching for all project types
- [ ] Budget compatibility edge cases
- [ ] Rating score calculations
- [ ] Empty requirements handling
- [ ] No companies match scenario

### API Routes
- [ ] Matches endpoint with filters
- [ ] Proposal submission validation
- [ ] Authorization checks
- [ ] One proposal per company enforcement
- [ ] Select proposal transaction
- [ ] Error handling

### UI Components
- [ ] Responsive layouts (mobile, tablet, desktop)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Form validation
- [ ] Filter interactions

## 🚀 Future Enhancements

### Phase 2 (Recommended)
1. **Notification System**
   - Email notifications on proposal submission
   - Push notifications for status changes
   - Digest emails for new matches

2. **Advanced Filtering**
   - Location-based matching
   - Company size preferences
   - Industry experience
   - Certification requirements

3. **Analytics Dashboard**
   - Proposal acceptance rates
   - Average response times
   - Matching accuracy metrics
   - Company performance scores

4. **Proposal Templates**
   - Save proposal templates
   - Quick responses
   - Standard T&C attachments

5. **Chat System**
   - In-app messaging
   - Clarification requests
   - Negotiation threads

### Phase 3 (Advanced)
1. **Machine Learning**
   - Historical success prediction
   - Dynamic weight adjustment
   - Personalized recommendations

2. **Automated Negotiation**
   - Counter-offer system
   - Budget flexibility indicators
   - Timeline adjustments

3. **Project Management**
   - Milestone tracking
   - Payment escrow
   - Delivery verification

## 📝 Notes

- All timestamps are UTC
- Currency is JPY only (for now)
- Match scores are cached (no real-time updates)
- File attachments use URLs (no direct uploads yet)
- Notifications are placeholder (TODO)

## 🐛 Known Issues

1. NextAuth route type error (pre-existing, unrelated)
2. No real-time score updates (refresh required)
3. No file upload support (URLs only)
4. No draft proposal saving

## 📞 Support

For issues or questions:
- GitHub Issues: [mitsumorikun/issues](https://github.com/RenTonoduka/mitsumorikun/issues)
- Documentation: See README.md

---

**Implementation Date:** 2025-10-15
**Issue:** #9
**Status:** ✅ Complete

🤖 Generated with Claude Code
