import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

import HomeView from '@/views/HomeView.vue';
import AboutView from '@/views/AboutView.vue';
import LoginView from '@/views/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import UserManagement from '@/components/Users/UserManagement.vue';
import EditUser from '@/components/Users/EditUser.vue';

import TasksView from '@/views/TasksView.vue';
import AddTask from '@/components/Tasks/AddTask.vue';
import EditTask from '@/components/Tasks/EditTask.vue';
import ViewTask from '@/components/Tasks/ViewTask.vue';

import AddProject from '@/components/Projects/AddProject.vue';
import EditProject from '@/components/Projects/EditProject.vue';
import ViewProject from '@/components/Projects/ViewProject.vue';
import ListProjects from '@/components/Projects/ListProjects.vue';

import ListParts from '@/components/Parts/ListParts.vue';
import AddPart from '@/components/Parts/AddPart.vue';
import EditPart from '@/components/Parts/EditPart.vue';
import ViewPart from '@/components/Parts/ViewPart.vue';


const routes = [
  { path: '/', name: 'HomeView', component: HomeView },
  { path: '/about', name: 'AboutView', component: AboutView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true, requiresAdmin: false }},

  { path: '/users', name: 'UserManagement', component: UserManagement, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/editUser/:id', name: 'EditUser', component: EditUser, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  // { path: '/viewUser/:id', name: 'ViewUser', component: View, props: true },

  { path: '/tasks', name: 'Tasks', component: TasksView, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/addTask', name: 'AddTask', component: AddTask, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/editTask/:id', name: 'EditTask', component: EditTask, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/viewTask/:id', name: 'ViewTask', component: ViewTask, props: true, meta: { requiresAuth: true,  }},

  { path: '/projects', name: 'listProjects', component: ListProjects, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/addProject', name: 'addProject', component: AddProject, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/editProject/:id', name: 'editProject', component: EditProject, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/viewProject/:id', name: 'viewProject', component: ViewProject, props: true, meta: { requiresAuth: true,  }},

  { path: '/parts', name: 'listParts', component: ListParts, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/addPart', name: 'addPart', component: AddPart, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/editPart/:id', name: 'editPart', component: EditPart, props: true, meta: { requiresAuth: true, requiresAdmin: true }},
  { path: '/viewPart/:id', name: 'viewPart', component: ViewPart, props: true, meta: { requiresAuth: true,  }},



];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  
  const userStore = useUserStore();
  await userStore.fetchUser(); // Ensure user data is loaded before checking auth
  
  // If the route requires authentication and the user is not authenticated
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    // Attempt to sign in anonymously if they are not authenticated
    await userStore.loginAnonymously();
    
    if (userStore.isAuthenticated) {
      next(); // Allow navigation if the user is authenticated
    } else {
      next({ name: 'Login' }); // Redirect to login if anonymous sign-in fails
    }
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ name: 'HomeView' }); // Redirect to home if the user is not an admin
  } else {
    next(); // Proceed to the requested route
  }
});

export default router;
