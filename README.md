# Lofty Features Addition & Dashboard Redesign

Lofty is already a great AI-first Real Estate agent CRM. To make it even better, we analyzed the reviews and found the gaps — then filled them. We added features like AI voice-powered lead engagement, a smarter onboarding flow that personalizes your dashboard from day one, a live AI tour that explains every widget in context, and a personal AI assistant that actually knows your portfolio.

Built for the **"Real Estate AI-Native PM" track** — the goal was to go beyond a redesign and ship real AI integrations that agents would actually use.

---

## Running locally

**1. Install dependencies**

```bash
npm install
```

**2. Set up environment variables**

Create a `.env.local` file at the root:

```env
# DeepSeek — powers onboarding chat, tour explanations, and widget personalization
DEEPSEEK_API_KEY=your_deepseek_api_key

# Vapi — voice AI for the lead chat widget
VAPI_PRIVATE_KEY=your_vapi_private_key
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
VAPI_CUSTOMER_PHONE=+1xxxxxxxxxx
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

All keys are optional for browsing the UI — AI features degrade gracefully when keys are missing.

**3. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The onboarding flow triggers on first visit.

---

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS + shadcn/ui
- DeepSeek API (via OpenAI-compatible SDK)
- Vapi for voice AI calls
- Recharts for portfolio charts
