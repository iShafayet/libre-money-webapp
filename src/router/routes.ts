import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        meta: { requiresAuthentication: true, title: null },
      },
      {
        path: "login",
        name: "login",
        component: () => import("pages/LoginPage.vue"),
        meta: { requiresAuthentication: false, title: null },
      },
      // --- Core:
      {
        path: "income-transactions",
        name: "income-transactions",
        component: () => import("pages/IncomeTransactionsPage.vue"),
        meta: { requiresAuthentication: true, title: "Income" },
      },
      // --- Entities:
      {
        path: "parties",
        name: "party-entities",
        component: () => import("pages/PartiesPage.vue"),
        meta: { requiresAuthentication: true, title: "Parties & Vendors" },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
    meta: { requiresAuthentication: false },
  },
];

export default routes;
