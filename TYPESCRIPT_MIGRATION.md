# TypeScript Migration Guide

This document outlines the strategy for migrating the MotorcycleWkspMgtApp from JavaScript to TypeScript.

## Benefits of Migration

- **Type Safety**: Catch errors at compile time rather than runtime
- **Improved Developer Experience**: Better IDE support, autocompletion, and refactoring tools
- **Enhanced Documentation**: Types serve as built-in documentation
- **Better Code Maintainability**: Makes the codebase more robust for long-term maintenance
- **Easier Onboarding**: New developers can understand the codebase more easily

## Migration Approach: Incremental

We recommend an incremental migration rather than a big-bang approach to minimize disruption and risk.

### Current Status (May 2025)

- ✅ Phase 1 (Setup and Infrastructure) is complete
- ✅ Phase 2 (Store Migration) has significant progress:
  - ✅ userStore.ts
  - ✅ projectStore.ts
  - ✅ taskStore.ts
  - ✅ partStore.ts
  - ✅ costStore.ts
  - ✅ errorStore.ts
  - ✅ helpdeskStore.ts
  - ✅ storageStore.ts (NEW)
  - ✅ contributionStore.ts (NEW)
- ✅ Core files migrated (main.ts, router/index.ts)
- ✅ Several components migrated:
  - ✅ navBar.vue
  - ✅ KnowledgeBaseEditor.vue
  - ✅ TaskForm.vue (ALREADY MIGRATED)
  - ✅ UserManagement.vue (NEW)
  - ✅ ProjectForm.vue
  - ✅ ViewProject.vue
- ⚠️ TypeScript checking is using loose strictness settings during migration

Current challenges:
- There are interface mismatches between different type definitions (types/index.ts vs types/interfaces.ts)
- Some Firebase update operations need additional type adjustments
- Components will continue to be migrated incrementally

### Next Priorities (May 2025)

1. **Consolidate Type Definitions**:
   - Resolve duplications between types/index.ts and types/interfaces.ts
   - Create a single source of truth for type definitions
   - Ensure consistent naming and structure across all type interfaces

2. **Component Migration Priority List**:
   - Priority components to migrate next:
     - ListProjects.vue
     - ListTasks.vue
     - ListParts.vue
     - ListCosts.vue
     - EditUser.vue
     - AddProject.vue, AddTask.vue, AddPart.vue, AddCost.vue

3. **Firebase Integration**:
   - Improve typing for Firebase interactions
   - Create utility types for common Firebase patterns
   - Add better error handling with TypeScript discriminated unions

### Phase 1: Setup and Infrastructure (Completed)

- ✅ Add TypeScript configuration files (tsconfig.json, tsconfig.node.json)
- ✅ Create type definitions for core entities (src/types/index.ts)
- ✅ Set up Vue with TypeScript support
- ✅ Create environment type declarations (src/vite-env.d.ts)

### Phase 2: Store Migration

1. Rename store files from .js to .ts
2. Add type definitions to store state
3. Type computed properties and actions
4. Handle Firebase-specific typing

Priority order:
- userStore.ts
- projectStore.ts
- taskStore.ts
- partStore.ts
- costStore.ts
- inventoryStore.ts
- errorStore.ts

### Phase 3: Component Migration

1. Start with simpler components (forms, views)
2. Add props typing using defineProps and defineEmits with type imports
3. Type reactive variables and computed properties
4. Add return type annotations to methods

Priority order:
- Form components (ProjectForm, TaskForm, etc.)
- List components (ListProjects, ListTasks, etc.)
- View components (ViewProject, ProfileView, etc.)
- Layout components (navBar, etc.)

### Phase 4: Router and Utilities

1. Migrate router configuration to TypeScript
2. Add type definitions for route meta fields
3. Create utility types for navigation guards
4. Type API and service functions

### Phase 5: Complete Migration

1. Enable strict TypeScript checking (strict: true)
2. Resolve any remaining type issues
3. Remove any remaining 'any' types or @ts-ignore comments
4. Add test coverage for typed components

## Best Practices

1. **Avoid 'any'**: Use specific types or 'unknown' when type is uncertain
2. **Use interfaces** for object shapes that might be extended
3. **Use type** for unions, intersections, and mapped types
4. **Add JSDoc comments** for complex types
5. **Create utility types** for common patterns
6. **Use discriminated unions** for state management
7. **Leverage TypeScript's inference** - don't over-annotate

## Tools and Resources

- [Vue 3 + TypeScript documentation](https://vuejs.org/guide/typescript/overview.html)
- [TypeScript Playground](https://www.typescriptlang.org/play) for experimenting with types
- [Type-Challenges](https://github.com/type-challenges/type-challenges) for practicing TypeScript skills
- [ts-migrate](https://github.com/airbnb/ts-migrate) tool for automating parts of migration
- [Firebase with TypeScript](https://firebase.google.com/docs/reference/js/v9)

## Example Component Migration

```typescript
// Before: Component.vue
<script setup>
import { ref } from 'vue';

const count = ref(0);
const increment = () => count.value++;
</script>

// After: Component.vue
<script setup lang="ts">
import { ref } from 'vue';

const count = ref<number>(0);
const increment = (): void => count.value++;
</script>
```

## Example Store Migration

```typescript
// Before: store.js
export const useStore = defineStore({
  id: 'store',
  state: () => ({
    items: [],
    loading: false
  }),
  actions: {
    async fetchItems() {
      this.loading = true;
      try {
        const response = await api.getItems();
        this.items = response.data;
      } finally {
        this.loading = false;
      }
    }
  }
});

// After: store.ts
import { Item } from '@/types';

interface StoreState {
  items: Item[];
  loading: boolean;
}

export const useStore = defineStore({
  id: 'store',
  state: (): StoreState => ({
    items: [],
    loading: false
  }),
  actions: {
    async fetchItems(): Promise<void> {
      this.loading = true;
      try {
        const response = await api.getItems();
        this.items = response.data;
      } finally {
        this.loading = false;
      }
    }
  }
});
```

## Timeline Recommendation

- **Phase 1**: 1 week (Setup and infrastructure)
- **Phase 2**: 2-3 weeks (Store migration)
- **Phase 3**: 3-4 weeks (Component migration)
- **Phase 4**: 1-2 weeks (Router and utilities)
- **Phase 5**: 1 week (Cleanup and finalization)

Total estimated time: 8-11 weeks, depending on team size and complexity.