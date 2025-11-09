# 📱 Recommendations UI Comparison with Statistics

## UI Design Pattern Matching

### ✅ Shared Design Elements

#### 1. **Header**
```tsx
// Both use AppHeader
<AppHeader title="Thống kê" />        // Statistics
<AppHeader title="Gợi ý học tập" />   // Recommendations
```

#### 2. **Metric Cards Layout** (3 columns)
```tsx
// Statistics: totalHours, totalExercises, avgScore
// Recommendations: avg_score, total_quizzes, topics_studied

<View className="flex-row gap-3">
  <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.primary + '10' }}>
    <Ionicons name="icon" size={24} color={colors.primary} />
    <Text className="text-2xl font-bold mt-2">VALUE</Text>
    <Text className="text-xs">LABEL</Text>
  </View>
  // ... 2 more cards
</View>
```

#### 3. **Section Headers**
```tsx
<View className="flex-row items-center mb-4">
  <Ionicons name="icon" size={22} color="#COLOR" />
  <Text className="text-lg font-bold ml-2" style={{ color: '#0f172a' }}>
    SECTION TITLE
  </Text>
</View>
```

#### 4. **Info Cards**
```tsx
<View 
  className="p-4 rounded-2xl"
  style={{
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  }}
>
  // Content
</View>
```

#### 5. **Loading State**
```tsx
<View className="flex-1 items-center justify-center">
  <ActivityIndicator size="large" color={colors.primary} />
  <Text className="mt-4 text-base">Loading message...</Text>
</View>
```

---

## 🎨 Color Coding System

### Statistics:
| Element | Color | Usage |
|---------|-------|-------|
| Time | `colors.primary` (#667eea) | Total hours |
| Exercises | `colors.accent` (#f59e0b) | Total exercises |
| Score | `colors.success` (#10b981) | Average score |
| Streak | `#EF4444` (Red) | Learning streak |

### Recommendations:
| Element | Color | Usage |
|---------|-------|-------|
| Score | `colors.primary` (#667eea) | Average score |
| Quizzes | `colors.accent` (#f59e0b) | Total quizzes |
| Topics | `colors.success` (#10b981) | Topics studied |
| Priority High | `#EF4444` (Red) | High priority topics |
| Priority Medium | `#F59E0B` (Orange) | Medium priority |
| Priority Low | `#10B981` (Green) | Low priority |

---

## 📊 Layout Comparison

### Statistics Screen Structure:
```
AppHeader
  ↓
ScrollView
  ├─ Summary Cards (3 columns)
  ├─ Study Time Chart (Bar chart)
  ├─ Subject Progress (List)
  ├─ Learning Streak (Featured card)
  └─ AI Insights (Optional)
```

### Recommendations Screen Structure:
```
AppHeader
  ↓
ScrollView
  ├─ Performance Summary (Featured card)
  ├─ Performance Metrics (3 columns)
  ├─ Next Topics (List with priority)
  ├─ Learning Path (Timeline)
  ├─ Difficulty Adjustment (Comparison)
  ├─ General Tips (List)
  └─ Refresh Button
```

---

## 🎯 Common UI Patterns

### 1. **Featured Info Card**
Used in both screens for important information:

**Statistics - Learning Streak:**
```tsx
<View style={{ backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }}>
  <Ionicons name="flame" size={80} color="#EF4444" />
  <Text className="text-4xl font-bold">{streak} ngày</Text>
</View>
```

**Recommendations - Performance Summary:**
```tsx
<View style={{ backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }}>
  <Ionicons name="analytics" size={24} color={colors.primary} />
  <Text className="text-sm">{summary}</Text>
</View>
```

### 2. **List Items with Icons**
**Statistics - Subject Progress:**
```tsx
<View className="flex-row items-center">
  <View className="w-10 h-10 rounded-full" style={{ backgroundColor: color + '20' }}>
    <Ionicons name={icon} size={20} color={color} />
  </View>
  <Text>{subject.name}</Text>
</View>
```

**Recommendations - Next Topics:**
```tsx
<View className="flex-row items-start">
  <Ionicons name={getPriorityIcon(priority)} color={getPriorityColor(priority)} />
  <Text>{topic.topic}</Text>
</View>
```

### 3. **Progress Indicators**
**Statistics - Subject Progress Bar:**
```tsx
<View className="h-2 rounded-full" style={{ backgroundColor: '#F1F5F9' }}>
  <View className="h-full rounded-full" style={{ backgroundColor: color, width: `${progress}%` }} />
</View>
```

**Recommendations - Difficulty Adjustment:**
```tsx
<View className="flex-row items-center">
  <View style={{ backgroundColor: color + '20' }}>
    <Text>{current_level}</Text>
  </View>
  <Ionicons name="arrow-forward" />
  <View style={{ backgroundColor: color + '20' }}>
    <Text>{recommended_level}</Text>
  </View>
</View>
```

---

## 🔧 Shared Utilities

### Color Helpers:
```typescript
// Both screens use similar color mapping functions
const getPriorityColor = (priority) => { /* ... */ }
const getDifficultyColor = (difficulty) => { /* ... */ }
```

### Text Styles:
```typescript
// Title
style={{ color: '#0f172a' }}  // Dark text

// Subtitle  
style={{ color: '#64748b' }}  // Gray text

// Caption
style={{ color: '#94a3b8' }}  // Light gray
```

### Spacing:
```tsx
px-6   // Horizontal padding (24px)
pt-6   // Top padding (24px)
pb-8   // Bottom padding (32px)
mb-3   // Bottom margin (12px)
mb-4   // Bottom margin (16px)
gap-3  // Gap between items (12px)
```

---

## ✅ Consistency Checklist

- [x] Same header component (AppHeader)
- [x] Same color scheme from theme
- [x] Same card styling (rounded-2xl, border, shadow)
- [x] Same icon library (Ionicons)
- [x] Same loading state design
- [x] Same error state design
- [x] Same spacing system (px-6, pt-6, etc.)
- [x] Same typography hierarchy
- [x] Same ScrollView container
- [x] Same SafeAreaView wrapper
- [x] Same TouchableOpacity for buttons

---

## 🎨 UI Philosophy

Both screens follow the same design principles:

1. **Clean & Minimal**: White background, subtle borders
2. **Color-coded Information**: Different colors for different types
3. **Card-based Layout**: Every section in a rounded card
4. **Icon Support**: Ionicons for visual hierarchy
5. **Responsive**: Works on all screen sizes
6. **Accessible**: Good contrast, readable text sizes
7. **Consistent Spacing**: Predictable padding/margins
8. **Loading States**: Clear feedback during async operations

---

## 📱 Final Result

The Recommendations screen matches Statistics perfectly in terms of:
- ✅ Visual style
- ✅ Component structure
- ✅ Color usage
- ✅ Typography
- ✅ Spacing
- ✅ Interactions
- ✅ State handling

Both screens feel like part of the same cohesive app! 🎉
