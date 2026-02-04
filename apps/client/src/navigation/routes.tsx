import type { ComponentType, JSX } from 'react';

import { IndexPage } from '@/pages/IndexPage/IndexPage';
import { PortfolioPage } from '@/pages/PortfolioPage/PortfolioPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage/LeaderboardPage';
import { MenuPage } from '@/pages/MenuPage/MenuPage';
import { MarketDetailPage } from '@/pages/MarketDetailPage/MarketDetailPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: IndexPage, title: 'Markets' },
  { path: '/market/:marketId', Component: MarketDetailPage },
  { path: '/portfolio', Component: PortfolioPage, title: 'Portfolio' },
  { path: '/leaderboard', Component: LeaderboardPage, title: 'Leaderboard' },
  { path: '/menu', Component: MenuPage, title: 'Menu' },
];
