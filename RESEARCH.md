# CRM Kanban Board: Research

## 1. Drag & Drop: выбор библиотеки

### @dnd-kit (WINNER)
- Активно поддерживается, React-first
- ~10-15KB gzipped (модульный, импортируешь только нужное)
- Лучшая accessibility из коробки: keyboard navigation, screen reader, ARIA
- Touch-поддержка нативная
- Hook-based API: `useDraggable`, `useDroppable`, `useSortable`
- Sensors: pointer, keyboard, touch
- CSS transforms (без layout thrashing), поддержка виртуализации
- Пакеты: `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

### react-beautiful-dnd
- **Deprecated** Atlassian в 2024. Не использовать.

### @atlaskit/pragmatic-drag-and-drop
- Замена rbd от Atlassian. Поддерживается.
- ~4.5KB core (очень маленький)
- Vanilla JS core + React adapter
- Нативные HTML drag events
- Минус: low-level API, больше boilerplate для kanban

**Вывод:** `@dnd-kit` лучший выбор. Purpose-built sortable presets для kanban-колонок, лучшая accessibility, большое комьюнити.

---

## 2. Архитектура Kanban-доски

### Структура данных

```typescript
// Flat map лидов + массивы ID в колонках
interface KanbanState {
  columns: Record<LeadStatus, string[]>; // status -> lead IDs
  leads: Record<string, Lead>;           // id -> lead data
}

const COLUMN_ORDER: LeadStatus[] = [
  'new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'
];
```

Flat `leads` map + ordered ID arrays. Избегаем вложенных мутаций, drag-reorder тривиален (splice ID из одного массива, insert в другой).

### Drag Handler паттерн

```typescript
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id as string;
  const sourceCol = findColumn(activeId);
  const destCol = findColumnForDropTarget(over.id);
  if (!sourceCol || !destCol) return;

  // Optimistic update
  setColumns(prev => {
    const next = structuredClone(prev);
    next[sourceCol].splice(next[sourceCol].indexOf(activeId), 1);
    const overIndex = next[destCol].indexOf(over.id as string);
    next[destCol].splice(overIndex >= 0 ? overIndex : next[destCol].length, 0, activeId);
    return next;
  });

  // Persist если колонка изменилась
  if (sourceCol !== destCol) {
    updateLeadStatus(activeId, destCol);
  }
}
```

### Стратегия сохранения

**Immediate update при смене колонки:**
- Смена статуса = бизнес-событие (триггерит нотификации, AI)
- Optimistic update + rollback on error
- Порядок внутри колонки: не сохранять (для CRM неважно)

```typescript
async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
  try {
    const { error } = await supabase
      .schema('crm_demo')
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId);
    if (error) throw error;
  } catch {
    // Rollback optimistic update
    toast.error('Failed to update lead status');
  }
}
```

---

## 3. CRM-специфичные паттерны

### Lead Card дизайн

Показывать на карточке (3-4 строки макс):
- **Name** (bold, primary)
- **Priority badge**: Hot (red), Warm (amber), Cold (blue)
- **Email** (truncated)
- **Topic** + **time since created** (relative: "2h ago", "3d ago")

Не показывать: message preview (только в detail view).

```tsx
<Card className="cursor-grab active:cursor-grabbing">
  <CardContent className="p-3 space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="font-medium text-sm truncate">{lead.name}</span>
      <Badge variant={priorityVariant[lead.priority]}>{lead.priority}</Badge>
    </div>
    <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>{lead.topic}</span>
      <span>{formatDistanceToNow(lead.created_at, { addSuffix: true })}</span>
    </div>
  </CardContent>
</Card>
```

### Detail Panel: Sheet (slide-over)

**Sheet лучше чем Modal для kanban CRM:**
- Board остается видимым (пространственный контекст)
- Больше места для деталей лида + activity
- shadcn `Sheet` с `side="right"`
- Dialog только для деструктивных действий (delete lead)

### Real-time с Supabase

```typescript
useEffect(() => {
  const channel = supabase
    .channel('leads-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'crm_demo', table: 'leads' },
      (payload) => {
        if (payload.eventType === 'INSERT') addLeadToBoard(payload.new as Lead);
        else if (payload.eventType === 'UPDATE') updateLeadOnBoard(payload.new as Lead);
        else if (payload.eventType === 'DELETE') removeLeadFromBoard(payload.old.id);
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, []);
```

Важно: пропускать real-time updates для своих изменений (optimistic уже применен).

### Фильтрация и поиск

- Search: client-side по name/email/topic (быстро для <500 лидов)
- Priority filter: toggle buttons для hot/warm/cold
- Column counts: показывать количество в заголовке колонки

---

## 4. shadcn/ui компоненты для CRM

| Компонент | Использование |
|-----------|---------------|
| `Card` | Карточки лидов на доске |
| `Badge` | Priority (hot/warm/cold) |
| `Sheet` | Detail slide-over panel |
| `ScrollArea` | Скролл колонок |
| `Input` | Search bar |
| `Select` | Фильтры (priority, topic) |
| `Separator` | Разделители в detail panel |
| `Skeleton` | Loading states |
| `DropdownMenu` | Card actions (edit, delete) |
| `Dialog` | Delete confirmation |

**Уже установлены:** Card, Badge, Input, Label, Select, Separator, Textarea.
**Нужно добавить:** Sheet, ScrollArea, Skeleton, DropdownMenu.

---

## 5. State Management

### useReducer в custom hook (рекомендация)

Для этого скоупа достаточно локального React state:
- Одна страница (dashboard), нет кросс-роут стейта
- Source of truth: Supabase
- Real-time через Supabase subscriptions

```typescript
// useKanbanBoard.ts
type KanbanAction =
  | { type: 'SET_LEADS'; leads: Lead[] }
  | { type: 'MOVE_LEAD'; leadId: string; from: LeadStatus; to: LeadStatus; index: number }
  | { type: 'ADD_LEAD'; lead: Lead }
  | { type: 'UPDATE_LEAD'; lead: Lead }
  | { type: 'REMOVE_LEAD'; id: string }
  | { type: 'ROLLBACK_MOVE'; leadId: string; from: LeadStatus; to: LeadStatus };

function useKanbanBoard() {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);
  // fetch, subscribe, drag handlers
  return { state, dispatch, handleDragEnd, ... };
}
```

**Не использовать:** Redux (overkill), React Query/SWR (добавляет сложность при optimistic drag-drop + realtime).

---

## 6. Итоговый стек

| Задача | Решение |
|--------|---------|
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| State | `useReducer` в custom hook |
| Persistence | Прямые вызовы Supabase, optimistic updates |
| Real-time | Supabase Realtime subscriptions |
| Detail view | shadcn `Sheet` (slide-over) |
| UI | shadcn Card, Badge, Sheet, ScrollArea |
| Time format | `date-fns` (`formatDistanceToNow`) |
