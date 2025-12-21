import {createRouter, createWebHistory, type RouteRecordRaw} from "vue-router";

import AppPage from "@/pages/AppPage.vue";
import AuthorizationPage from "@/pages/AuthorizationPage.vue";

import LoginPage from "@/modules/login/LoginPage.vue";
import RegistrationPage from "@/modules/login/RegistrationPage.vue";

import MainPage from "@/modules/main/MainPage.vue";
import ProjectsPage from "@/modules/projects/ProjectsPage.vue";
import ProjectCardPage from "@/modules/projects/projectCard/ProjectCardPage.vue";
import InvestitionsPage from "@/modules/investitions/InvestitionsPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: AuthorizationPage,
    meta: {requiresGuest: false},
    children: [
      {path: "", name: "login", component: LoginPage},
      {path: "register", name: "register", component: RegistrationPage},
    ],
  },

  {
    path: "/",
    component: AppPage,
    meta: {requiresAuth: true},
    children: [
      {path: "", redirect: {name: "main"}},
      {path: "main", name: "main", component: MainPage},
      {path: "projects", name: "projects", component: ProjectsPage},
      {path: "projects/:id", name: "projectCard", component: ProjectCardPage, props: true},
      {path: "investitions", name: "investitions", component: InvestitionsPage},
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach(async (to, from, next) => {

  const {useAuthStore} = await import('@/stores/useAuthStore');
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (e) {

    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({name: 'login'});
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({name: 'main'});
  } else {
    next();
  }
});

export default router;
