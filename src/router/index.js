import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import LoginView from '@/views/LoginView.vue'
// import OurMission from '@/views/OurMission.vue'
import ProgressLog from '@/views/ProgressLog.vue'
import AddTodo from '../components/progressLog/AddTodo.vue'
import EditTodo from '../components/progressLog/EditTodo.vue'
import ViewTodo from '../components/progressLog/ViewTodo.vue'
// import TodoList from '../components/progressLog/TodoList.vue'

import UserManagement from '../components/userManagement/UserManagement.vue'
import EditUser from '../components/userManagement/EditUser.vue';
import ProfileView from '@/views/ProfileView.vue'

import { logEvent } from 'firebase/analytics';
import { analytics } from '../fbConfig';
import { useUserStore } from '../stores/userStore';

import AddProject from '@/components/project/AddProject.vue'
import EditProject from '@/components/project/EditProject.vue'
import ListProjects from '@/components/project/ListProjects.vue'
import ProjectForm from '@/components/project/ProjectForm.vue'

logEvent(analytics, 'page_view', {
  page_title: 'Profile Page',
  page_location: window.location.href,
  page_path: '/profile'
});

logEvent(analytics, 'page_view', {
  page_title: 'About Us',
  page_location: window.location.href,
  page_path: '/about'
});


const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView,
  },
  {
    // path: '/admin',
    // component: () => import('../views/ProgressLog.vue'), // Parent component, could be a layout or dashboard
    // children: [
    //   { path: '', name: 'TodoList', component: () => import('../components/progressLog/TodoList.vue') },
    //   { path: 'edit/:id', name: 'EditUser', component: () => import('../components/userManagement/EditUser.vue') },
    // ],
  },
  {
    path: '/admin',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/edit/:id',
    name: 'EditUser',
    component: EditUser,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/progress',
    name: 'Progress',
    component: ProgressLog,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/addTodo',
    name: 'AddTodo',
    component: AddTodo,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/editTodo/:id',
    name: 'EditTodo',
    component: EditTodo,
    meta: {requiresAuth: true, requiresAdmin: true}
  },
  {
    path: '/viewTodo/:id',
    name: 'ViewTodo',
    component: ViewTodo
  },
  {
    path: '/addProject',
    name: 'addProject',
    component: AddProject,
    // meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/editProject/:id',
    name: 'editProject',
    component: EditProject,
    // meta: {requiresAuth: true, requiresAdmin: true}
  },
  {
    path: '/viewProject/:id',
    name: 'viewProject',
    component: ProjectForm,
    // meta: {requiresAuth: true, requiresAdmin: true}
  },
  {
    path: '/projects',
    name: 'listProjects',
    component: ListProjects
  },
  {
    path: '/admin/edit/:id',
    name: 'EditUser',
    component: EditUser,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true, requiresAdmin: false },
  },
  {
    path: '/about',
    name: 'AboutView',
    component: AboutView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;

