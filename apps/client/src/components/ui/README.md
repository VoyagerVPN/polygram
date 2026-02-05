# Polygram UI Component System

## Философия дизайна

**Консистентность прежде всего.** Все компоненты следуют единым принципам:
- Одинаковые отступы и размеры
- Единая типографика
- Консистентные цвета и стили
- Предсказуемое поведение интерактивных элементов

## Структура

```
ui/
├── Button/          # Все типы кнопок
├── Card/            # Карточки и контейнеры
├── Feedback/        # Loading, Error, Empty states
└── index.ts         # Единая точка входа
```

## Компоненты

### Button

Базовый компонент кнопки с вариантами:

```tsx
import { Button } from '@/components/ui';

// Варианты
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="white">White</Button>

// Размеры
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// Состояния
<Button isLoading>Loading</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>

// С иконками
<Button leftIcon={<Icon />}>With Icon</Button>
```

### Специализированные кнопки

```tsx
import { TradeButton, PredictionButton, IconButton, TabButton, FilterChip } from '@/components/ui';

// Для торговли YES/NO
<TradeButton outcome="YES" price={65} onClick={handleTrade} />
<PredictionButton outcome="NO" onClick={handleTrade} />

// Иконочная кнопка
<IconButton icon={<X />} aria-label="Закрыть" onClick={handleClose} />

// Таб
<TabButton isActive={true} count={5} onClick={handleTabClick}>Позиции</TabButton>

// Фильтр
<FilterChip isActive={true} leftIcon={<Icon />} onClick={handleFilter}>В тренде</FilterChip>
```

### Card

```tsx
import { Card, MarketCard, PositionCard, EmptyStateCard } from '@/components/ui';

// Базовая карточка
<Card variant="glass" padding="lg" radius="3xl">
  Content
</Card>

// Варианты
<Card variant="glass">Glassmorphism</Card>
<Card variant="flat">Flat panel</Card>
<Card variant="surface">Surface background</Card>
<Card variant="outlined">Outlined</Card>

// Интерактивная
<Card isInteractive onClick={handleClick}>
  Clickable content
</Card>

// Специализированные
<MarketCard onClick={handleMarketClick}>
  <MarketContent />
</MarketCard>

<PositionCard outcome="YES" isPositive={true}>
  <PositionContent />
</PositionCard>
```

### Feedback

```tsx
import { 
  LoadingSpinner, 
  LoadingState, 
  ErrorMessage, 
  EmptyState,
  Skeleton,
  Badge 
} from '@/components/ui';

// Загрузка
<LoadingSpinner size="lg" />
<LoadingState message="Загрузка рынков..." />

// Ошибка
<ErrorMessage 
  title="Ошибка загрузки" 
  message="Не удалось загрузить данные"
  onRetry={handleRetry}
/>

// Пустое состояние
<EmptyState 
  icon="search"
  title="Рынков не найдено"
  description="Новые рынки появятся здесь"
/>

// Скелетон
<Skeleton className="h-4 w-24" />
<SkeletonCard />

// Бейдж
<Badge variant="success">Активный</Badge>
<Badge variant="danger">Закрыт</Badge>
```

## Использование в коде

### Правильно:

```tsx
import { Button, Card, Badge } from '@/components/ui';

// Используйте готовые компоненты
<Card variant="glass">
  <Badge variant="success">Активный</Badge>
  <h3>Title</h3>
  <Button variant="primary" onClick={handleClick}>Action</Button>
</Card>
```

### Неправильно:

```tsx
// ❌ Не создавайте кнопки inline
<motion.button 
  className="bg-blue-600 hover:bg-blue-700..."
  whileTap={{ scale: 0.96 }}
>
  Action
</motion.button>

// ❌ Не используйте магические числа для размеров
<button className="text-[13px] py-3.5...">Action</button>

// ❌ Не дублируйте стили
<button className="bg-[var(--app-success)]/20...">Yes</button>
<button className="bg-[var(--app-success)]/15...">Yes</button>
```

## Дизайн-токены

### Цвета
- `--app-primary` - Основной цвет (синий)
- `--app-success` - Успех/YES (зелёный)
- `--app-danger` - Ошибка/NO (красный)
- `--app-surface-bg` - Фон поверхности
- `--app-border` - Границы

### Размеры
- `text-[12px]` - Мелкий текст (бейджи)
- `text-[13px]` - Основной текст кнопок
- `text-[14px]` - Заголовки секций
- `rounded-xl` - Маленький радиус (кнопки)
- `rounded-2xl` - Средний радиус (карточки)
- `rounded-3xl` - Большой радиус (модалки)

## Принципы

1. **DRY** - Don't Repeat Yourself. Используйте готовые компоненты.
2. **Consistency** - Одинаковые элементы должны выглядеть одинаково.
3. **Accessibility** - Все кнопки имеют focus states и поддерживают keyboard navigation.
4. **Motion** - Единая анимация нажатия (scale 0.96) для всех интерактивных элементов.
