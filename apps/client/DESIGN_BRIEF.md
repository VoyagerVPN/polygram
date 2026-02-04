# Polygram - Design Brief for Google Stitch

## 📋 Project Overview

**Polygram** is a Telegram Mini App for AI-powered prediction markets on the TON blockchain. Users trade on future events (crypto, politics, sports) with "Yes/No" outcomes.

### Core Concept
- **Prediction Market**: Bet on future events with real money (TON)
- **AI-Generated Content**: Markets are created automatically by AI analyzing news
- **Social Trading**: See what others are predicting
- **Blockchain**: All transactions on TON network

---

## 🎯 Target Audience

- Crypto enthusiasts (25-45 years old)
- Telegram power users
- DeFi traders
- Prediction market fans (Polymarket users)

---

## 📱 Required Screens / Menu Structure

### 1. **Main Navigation (Bottom Tab Bar)**
```
┌─────────────────────────────────────┐
│  🏠 Markets  📊 Portfolio  🏆 Top   │
└─────────────────────────────────────┘
```

**Tabs:**
1. **Markets** (Home) - Browse and trade on active markets
2. **Portfolio** - View open positions, P&L, history
3. **Leaderboard** - Top traders, rankings, stats
4. **Profile** (Optional) - Settings, wallet, referrals

---

### 2. **Markets Screen (Home)**
**Layout:**
```
┌─────────────────────────────────────┐
│ 🔵 Polygram    💰 1,250 TON  👤    │  ← Header (Sticky)
├─────────────────────────────────────┤
│ 🔥 Trending | ⏰ Closing | 📈 Vol   │  ← Filter Tabs
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🤔 Will ETH reach $5000?        │ │
│ │ ⏳ 2 days left    🟢 Live 45%   │ │
│ │                                 │ │
│ │ [  YES 65%  ]  [  NO 35%  ]     │ │
│ │         [View Chart ▼]          │ │
│ └─────────────────────────────────┘ │
│         ... more cards ...          │
└─────────────────────────────────────┘
```

**Elements:**
- **Sticky Header**: Logo, Balance (TON), User Avatar
- **Filter Chips**: All | Trending | Closing Soon | High Volume | New
- **Market Cards** (Main Component):
  - Question title
  - Time remaining
  - Status badge (Live/Closed/Resolved)
  - Current probability bar (Yes/No split)
  - Trade buttons (Yes/No)
  - Expandable price chart
  - Volume indicator

---

### 3. **Market Detail Screen**
**Layout:**
```
┌─────────────────────────────────────┐
│ ← Will ETH reach $5000 by Dec?     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │      [Price Chart Area]         │ │
│ │         (Large)                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Current Probability:                │
│ ████████████░░░░░░░░  65% YES       │
│ ░░░░░░░░░░░░████████  35% NO        │
│                                     │
│ 💰 Volume: 2,450 TON                │
│ ⏰ Ends: Dec 31, 2025               │
│                                     │
│ [      BET YES (65%)      ]         │
│ [      BET NO  (35%)      ]         │
│                                     │
│ Description:                        │
│ This market resolves based on...    │
│                                     │
│ Recent Trades:                      │
│ • @user bought Yes for 100 TON      │
│ • @user sold No for 50 TON          │
└─────────────────────────────────────┘
```

---

### 4. **Portfolio Screen**
**Sections:**
- **Overview Card**: Total Value, P&L, Win Rate
- **Active Positions**: List of open trades with current value
- **History**: Closed positions with results

```
┌─────────────────────────────────────┐
│ 💼 My Portfolio                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Total Value    Profit/Loss      │ │
│ │ 2,450 TON      +125 TON (+5%)   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Active Positions (3)                │
│ ┌─────────────────────────────────┐ │
│ │ ETH $5000?          +45 TON     │ │
│ │ YES 65% → 72%      🟢 +12%      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ History                             │
│ ┌─────────────────────────────────┐ │
│ │ BTC $100k?         +120 TON ✅  │ │
│ │ Resolved: YES                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 5. **Leaderboard Screen**
- Tabs: Daily | Weekly | All Time
- Rankings: User, Profit, Win Rate, Volume
- User card: Avatar, Name, Profit, Trend

---

### 6. **Trading Modal (Overlay)**
```
┌─────────────────────────────────────┐
│                                     │
│     How much to invest?             │
│                                     │
│        ┌─────────────────┐          │
│        │    100 TON      │          │
│        └─────────────────┘          │
│                                     │
│     [Quick: 10 | 50 | 100 | MAX]    │
│                                     │
│     Potential Return: 165 TON       │
│     (if Yes wins)                   │
│                                     │
│     [     CONFIRM BUY YES     ]     │
│     [        CANCEL            ]    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 Design Inspiration & References

### 1. **Polymarket** (Primary Reference)
- Clean, professional crypto aesthetic
- Clear Yes/No visual hierarchy
- Good probability visualization
- https://polymarket.com

### 2. **Telegram Mini Apps Style**
- Native Telegram UI components
- @telegram-apps/telegram-ui library
- https://t.me/addstickers/trending_crypto

### 3. **Apple Liquid Glass (iOS 26)**
- Glassmorphism effects
- Translucent navigation bars
- Subtle depth and layering
- Frosted glass backgrounds

### 4. **Robinhood / Coinbase**
- Clean financial data display
- Simple trading interfaces
- Chart visualizations

### 5. **Notcoin / Hamster Kombat**
- Viral Telegram Mini App designs
- Gamification elements
- Dark mode focused

---

## 🎨 Visual Style Guidelines

### Color Palette (Dark Mode Primary)
```css
/* Backgrounds */
--bg-primary: #0b0e11;      /* Main background */
--bg-secondary: #151b21;    /* Cards, sections */
--bg-tertiary: #1c252c;     /* Elevated elements */

/* Accent Colors */
--accent-blue: #3390ec;     /* Primary actions, links */
--accent-green: #34c759;    /* YES button, profit */
--accent-red: #ff3b30;      /* NO button, loss */
--accent-gold: #ffb800;     /* Rankings, premium */

/* Text */
--text-primary: #ffffff;    /* Headings */
--text-secondary: #7a8b99;  /* Descriptions */
--text-tertiary: #5a6a7a;   /* Hints, timestamps */

/* UI Elements */
--border-subtle: rgba(255, 255, 255, 0.06);
--glass-bg: rgba(255, 255, 255, 0.03);
--glass-border: rgba(255, 255, 255, 0.08);
```

### Typography
- **Primary Font**: SF Pro Display / Inter / System UI
- **Headings**: 24px, 20px, 18px (Semibold)
- **Body**: 16px, 14px (Regular)
- **Captions**: 12px, 11px (Medium)
- **Numbers**: Tabular figures for prices

### Effects
- **Glassmorphism**: 
  - `backdrop-filter: blur(20px)`
  - Semi-transparent backgrounds
  - Subtle inner glow
  
- **Shadows**:
  - Soft drop shadows for cards
  - Glow effects for active elements

- **Gradients**:
  - Blue gradient for primary buttons
  - Green/Red gradients for Yes/No
  - Subtle background gradients

---

## 🧩 Key Components Design

### 1. **Market Card**
**Requirements:**
- Rounded corners (16px-20px)
- Glass effect background
- Progress bar at top showing Yes/No split
- Expandable for chart view
- Clear CTA buttons

**States:**
- Default
- Hover (slight lift)
- Expanded (showing chart)
- Closed (grayed out)
- Resolved (showing outcome)

### 2. **Trade Buttons (Yes/No)**
**YES Button:**
- Background: rgba(52, 199, 89, 0.15)
- Border: rgba(52, 199, 199, 0.2)
- Text: #34c759
- Hover: Brightness increase

**NO Button:**
- Background: rgba(255, 59, 48, 0.15)
- Border: rgba(255, 59, 48, 0.2)
- Text: #ff3b30

### 3. **Bottom Navigation**
- Glass effect background
- 3-4 icons with labels
- Active state: Filled icon + highlight
- Inactive: Outline icon, muted color

### 4. **Progress Bar / Probability Indicator**
- Split bar showing Yes% vs No%
- Animated transitions
- Color coded (Green/Red)

### 5. **Charts**
- Area charts for price history
- Gradient fill under line
- Minimal grid
- Time range selector (1H, 1D, 1W, ALL)

---

## ✨ Animations & Interactions

### Essential Animations:
1. **Page Transitions**: Slide from right (iOS style)
2. **Card Hover**: Subtle scale (1.02) + shadow increase
3. **Button Press**: Scale down (0.98) + ripple
4. **Tab Switch**: Smooth underline slide
5. **Progress Bars**: Animated fill on load
6. **Chart Expansion**: Smooth height transition
7. **Pull to Refresh**: Telegram native style
8. **Skeleton Loading**: Shimmer effect on cards

### Micro-interactions:
- Number counting animation for balance
- Price change indicators (flash green/red)
- Toast notifications for trades
- Haptic feedback on buttons

---

## 📐 Layout Specifications

### Spacing System
- Base unit: 4px
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px

### Responsive Behavior
- Max width: 430px (iPhone Pro Max)
- Mobile-first design
- Safe area insets for iOS notch
- Bottom padding for gesture bar

### Grid
- Single column layout
- Full-width cards with 16px padding
- 12px gap between cards

---

## 🔧 Technical Constraints (Telegram Mini App)

### Must Follow:
1. **Theme Params Support**:
   - Respect Telegram's dark/light mode
   - Use CSS variables for colors
   - Support theme switching

2. **Viewport**:
   - Header can be expanded/collapsed
   - Account for safe areas
   - Handle keyboard appearance

3. **Performance**:
   - 60fps animations
   - Lazy load images
   - Virtualize long lists

4. **Touch Targets**:
   - Minimum 44x44px for buttons
   - Proper spacing between clickable elements

### Platform Guidelines:
- Follow Telegram Mini Apps UI Kit
- Use native back button (no custom back in header)
- Support swipe gestures where appropriate
- Respect Telegram's color scheme

---

## 🖼️ Deliverables Needed

### 1. **Figma File** with:
- [ ] All screens (Markets, Portfolio, Leaderboard, Profile)
- [ ] Component library (buttons, cards, inputs)
- [ ] Icon set (custom or recommended)
- [ ] Color palette
- [ ] Typography styles
- [ ] Spacing/sizing system

### 2. **Interactive Prototype**:
- [ ] Clickable navigation between screens
- [ ] Animations demonstration
- [ ] Hover/press states

### 3. **Assets Export**:
- [ ] Icons (SVG)
- [ ] Illustrations (if any)
- [ ] Background patterns/gradients

---

## 📝 Additional Notes

### Brand Personality:
- **Professional** but approachable
- **Fast** and responsive
- **Trustworthy** (financial app)
- **Modern** crypto aesthetic

### Must Avoid:
- ❌ Cluttered interfaces
- ❌ Too many colors
- ❌ Complex navigation
- ❌ Small touch targets
- ❌ Slow animations

### Key Metrics to Highlight:
- Probability %
- Potential returns
- Volume
- Time remaining
- User's position/P&L

---

## 🎯 Success Criteria

The design should:
1. ✅ Feel native to Telegram
2. ✅ Make trading feel simple and intuitive
3. ✅ Build trust (professional look)
4. ✅ Encourage engagement (gamification)
5. ✅ Work perfectly in dark mode
6. ✅ Be accessible (contrast, text size)

---

**Questions for Designer:**
1. How can we make the Yes/No decision feel more engaging?
2. What visual cues can show "hot" trending markets?
3. How to display complex data (probability, volume, time) without clutter?
4. What micro-interactions would enhance the trading experience?
5. How should we handle loading states and empty states?

---

*Reference Links:*
- Telegram Mini Apps UI: https://tma-ui.vercel.app
- Telegram Design Guidelines: https://core.telegram.org/bots/webapps
- Polymarket: https://polymarket.com
- Apple Liquid Glass: https://developer.apple.com/design/human-interface-guidelines
