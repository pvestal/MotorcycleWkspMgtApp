import { createRouter, createWebHistory, RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { isDemoActive, isFeatureAvailableInDemo } from '@/services/demoService';

// Import views
import HomeView from '@/views/HomeView.vue';
import AboutView from '@/views/AboutView.vue';
import LoginView from '@/views/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import UserManagement from '@/components/Users/UserManagement.vue';
import EditUser from '@/components/Users/EditUser.vue';
import DataRetentionManager from '@/components/admin/DataRetentionManager.vue';
import DemoRestrictionAlert from '@/components/Demo/DemoRestrictionAlert.vue';

// Task-related components
import TasksView from '@/views/TasksView.vue';
import AddTask from '@/components/Tasks/AddTask.vue';
import EditTask from '@/components/Tasks/EditTask.vue';
import ViewTask from '@/components/Tasks/ViewTask.vue';

// Project-related components
import AddProject from '@/components/Projects/AddProject.vue';
import EditProject from '@/components/Projects/EditProject.vue';
import ViewProject from '@/components/Projects/ViewProject.vue';
import ListProjects from '@/components/Projects/ListProjects.vue';

// Part-related components
import PartsView from '@/views/PartsView.vue';
import AddPart from '@/components/Parts/AddPart.vue';
import EditPart from '@/components/Parts/EditPart.vue';
import ViewPart from '@/components/Parts/ViewPart.vue';
import InventoryView from '@/views/InventoryView.vue';
import SubscriptionView from '@/views/SubscriptionView.vue';
import HelpdeskView from '@/views/HelpdeskView.vue';

// Cost-related components
import CostsView from '@/views/CostsView.vue';
import AddCost from '@/components/Costs/AddCost.vue';
import EditCost from '@/components/Costs/EditCost.vue';
import ViewCost from '@/components/Costs/ViewCost.vue';

/**
 * Route meta fields interface
 */
interface RouteMeta {
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

/**
 * Extend the route location type to include our custom meta fields
 */
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
  }
}

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'HomeView', component: HomeView },
  { path: '/about', name: 'AboutView', component: AboutView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/signup', name: 'SignUp', component: LoginView, props: { mode: 'signup' } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true, requiresAdmin: false }},
  { path: '/demo-restricted', name: 'DemoRestricted', component: DemoRestrictionAlert, props: route => ({ featureAttempted: route.query.feature, message: route.query.message }) },

  { path: '/users', name: 'UserManagement', component: UserManagement, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/editUser/:id', name: 'EditUser', component: EditUser, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  // { path: '/viewUser/:id', name: 'ViewUser', component: View, props: true },

  { path: '/tasks', name: 'Tasks', component: TasksView, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/addTask/:projectId/:projectName', name: 'AddTask', component: AddTask, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/editTask/:id', name: 'EditTask', component: EditTask, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/viewTask/:id', name: 'ViewTask', component: ViewTask, props: true, meta: { requiresAuth: true }},

  { path: '/projects', name: 'listProjects', component: ListProjects, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/addProject', name: 'addProject', component: AddProject, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/editProject/:id', name: 'editProject', component: EditProject, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/viewProject/:id', name: 'viewProject', component: ViewProject, props: true, meta: { requiresAuth: true }},

  { path: '/parts', name: 'listParts', component: PartsView, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/addPart', name: 'addPart', component: AddPart, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/addPart/:projectId', name: 'addPartWithProject', component: AddPart, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/editPart/:id', name: 'editPart', component: EditPart, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/viewPart/:id', name: 'viewPart', component: ViewPart, props: true, meta: { requiresAuth: true }},
  { path: '/inventory', name: 'inventory', component: InventoryView, meta: { requiresAuth: true, requiresAdmin: false }},
  { path: '/subscription', name: 'subscription', component: SubscriptionView, meta: { requiresAuth: true, requiresAdmin: false }},
  { path: '/helpdesk', name: 'helpdesk', component: HelpdeskView, meta: { requiresAuth: true, requiresAdmin: false }},
  { path: '/admin/data-retention', name: 'dataRetention', component: DataRetentionManager, meta: { requiresAuth: true, requiresAdmin: true }},

  { path: '/costs', name: 'listCosts', component: CostsView, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/addCost', name: 'addCost', component: AddCost, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/addCost/:projectId', name: 'addCostWithProject', component: AddCost, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/editCost/:id', name: 'editCost', component: EditCost, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/viewCost/:id', name: 'viewCost', component: ViewCost, props: true, meta: { requiresAuth: true }},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore();
  await userStore.fetchUser(); // Ensure user data is loaded before checking auth

  // Check if the route requires authentication
  const requiresAuth = to.meta.requiresAuth === true;
  const requiresAdmin = to.meta.requiresAdmin === true;

  // Get the feature name from the route path
  // We'll use this to check if demo users can access this feature
  const getFeatureFromRoute = (path: string): string | null => {
    if (path.includes('/projects')) return 'project-management';
    if (path.includes('/parts') || path.includes('/part-catalog')) return 'parts-catalog';
    if (path.includes('/tasks')) return 'task-tracking';
    if (path.includes('/costs')) return 'cost-tracking';
    return null;
  };

  const feature = getFeatureFromRoute(to.path);
  const demoActive = isDemoActive();

  // If the route requires authentication and the user is not authenticated
  if (requiresAuth) {
    // Check if demo is active
    if (demoActive) {
      // Check if this feature is available in demo mode
      if (feature && isFeatureAvailableInDemo(feature)) {
        // Allow demo users to access this feature
        if (!userStore.user) {
          // Ensure user is at least anonymously logged in for demo
          await userStore.loginAnonymously();
        }
        next();
      } else {
        // Feature is not available in demo mode, redirect to restriction page
        // Determine which feature was attempted
        let featureName = feature || 'unknown';
        let restrictionMessage = '';

        if (requiresAdmin) {
          restrictionMessage = 'Administrative features are not available in demo mode.';
        } else if (to.path.includes('/profile')) {
          restrictionMessage = 'User profiles cannot be saved in demo mode.';
        } else if (to.path.includes('/subscription')) {
          restrictionMessage = 'Subscription management is not available in demo mode.';
        } else {
          restrictionMessage = 'This feature is not available in demo mode. Sign up for full access.';
        }

        next({
          name: 'DemoRestricted',
          query: {
            feature: featureName,
            message: restrictionMessage
          }
        });
      }
    } else if (!userStore.isAuthenticated) {
      // Attempt to sign in anonymously if they are not authenticated
      await userStore.loginAnonymously();

      if (userStore.isAuthenticated) {
        next(); // Allow navigation if the user is authenticated
      } else {
        next({ name: 'Login' }); // Redirect to login if anonymous sign-in fails
      }
    } else {
      next(); // User is authenticated, allow navigation
    }
  } else if (requiresAdmin && !userStore.isAdmin) {
    // Admin-only route but user is not admin
    if (demoActive) {
      // In demo mode, show a specific restriction message
      next({
        name: 'DemoRestricted',
        query: {
          feature: 'admin',
          message: 'Administrative features are not available in demo mode. Sign up for a full account to access these features.'
        }
      });
    } else {
      next({ name: 'HomeView' }); // Redirect to home if the user is not an admin
    }
  } else {
    next(); // Proceed to the requested route
  }
});

export default router;