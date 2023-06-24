<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated v-if="userStore.isUserLoggedIn">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          {{ $route.meta.title || "Cash Keeper" }}
        </q-toolbar-title>

        <div v-if="$route.meta.title">Cash Keeper</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered v-if="userStore.isUserLoggedIn">
      <q-list>
        <q-item-label header>
          OPERATIONS
        </q-item-label>
        <EssentialLink v-for="link in operationList" :key="link.title" v-bind="link" />
      </q-list>

      <q-list>
        <q-item-label header>
          ACCOUNTS
        </q-item-label>
        <EssentialLink v-for="link in accountList" :key="link.title" v-bind="link" />
      </q-list>

      <q-list>
        <q-item-label header>
          PARTIES &amp; TAGS
        </q-item-label>
        <EssentialLink v-for="link in partyList" :key="link.title" v-bind="link" />
      </q-list>

      <q-list>
        <q-item-label header>
          REPORTS
        </q-item-label>
        <EssentialLink v-for="link in reportList" :key="link.title" v-bind="link" />
      </q-list>

      <div class="drawer-bottom">
        <div class="app-version">{{ appVersion }}</div>

      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useUserStore } from "src/stores/user";
import EssentialLink from "components/sidebar/EssentialLink.vue";

const operationList = [
  {
    title: "Income Records",
    caption: "",
    icon: "money",
    link: "#/income-transactions"
  },
  {
    title: "Expense Records",
    caption: "",
    icon: "money",
    link: ""
  },
  {
    title: "Loans & Debts",
    caption: "",
    icon: "money",
    link: ""
  },
  {
    title: "Other Transactions",
    caption: "",
    icon: "money",
    link: ""
  },
];

const accountList = [
  {
    title: "Wallets",
    caption: "",
    icon: "school",
    link: ""
  },
  {
    title: "Expense Accounts",
    caption: "",
    icon: "school",
    link: ""
  },
  {
    title: "Income Accounts",
    caption: "",
    icon: "school",
    link: ""
  },
  {
    title: "Asset Accounts",
    caption: "",
    icon: "school",
    link: ""
  },
  {
    title: "Other Accounts",
    caption: "",
    icon: "school",
    link: ""
  },
];

const partyList = [
  {
    title: "Tags",
    caption: "",
    icon: "school",
    link: ""
  },
  {
    title: "Parties",
    caption: "",
    icon: "school",
    link: ""
  },
];

const reportList = [
  {
    title: "Monthly Report",
    caption: "",
    icon: "school",
    link: ""
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink
  },

  setup() {
    const isLeftDrawerOpen = ref(false);

    const userStore = useUserStore();

    return {
      operationList,
      accountList,
      partyList,
      reportList,

      leftDrawerOpen: isLeftDrawerOpen,
      toggleLeftDrawer() {
        isLeftDrawerOpen.value = !isLeftDrawerOpen.value;
      },
      appVersion: "v0.0.1 (POC)",

      userStore,
    };
  }
});
</script>

<style scoped lang="scss">
.drawer-bottom {
  background: #ececec;
  padding: 12px;
  font-size: 12px;
}
</style>