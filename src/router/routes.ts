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
      {
        path: "wallets",
        name: "wallets",
        component: () => import("pages/WalletsPage.vue"),
        meta: { requiresAuthentication: true, title: "Wallets" },
      },
      // --- Entities:
      {
        path: "parties",
        name: "parties",
        component: () => import("pages/PartiesPage.vue"),
        meta: { requiresAuthentication: true, title: "Parties & Vendors" },
      },
      {
        path: "tags",
        name: "tags",
        component: () => import("pages/TagsPage.vue"),
        meta: { requiresAuthentication: true, title: "Tags" },
      },
      {
        path: "expense-avenues",
        name: "expense-avenues",
        component: () => import("pages/ExpenseAvenuesPage.vue"),
        meta: { requiresAuthentication: true, title: "Expense Avenues" },
      },
      {
        path: "income-sources",
        name: "income-sources",
        component: () => import("pages/IncomeSourcesPage.vue"),
        meta: { requiresAuthentication: true, title: "Income Sources" },
      },
      {
        path: "currencies",
        name: "currencies",
        component: () => import("pages/CurrenciesPage.vue"),
        meta: { requiresAuthentication: true, title: "Currencies" },
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
