  # Lofty AI-Native Hackathon

A reimagined first-experience for Lofty as an AI-native real estate platform. Built for the **"Real Estate AI-Native PM" track** — the goal was to rethink how users onboard, explore their dashboard, and interact with AI from day one.

Covers: AI-guided onboarding, a personalized dashboard that adapts to your investor profile, a voice AI lead-chat widget, a spotlight tour with live AI explanations, and a personal assistant page.

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
