import { route } from "quasar/wrappers";
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from "vue-router";

import routes from "./routes";
import { useUserStore } from "src/stores/user";
import { useSettingsStore } from "src/stores/settings";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER ? createMemoryHistory : process.env.VUE_ROUTER_MODE === "history" ? createWebHistory : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    console.debug({ to, from });
    const settingsStore = useSettingsStore();

    if (from.fullPath === "/" && to.fullPath === "/") {
      if (settingsStore.rememberLastOpenedView) {
        return next({ path: settingsStore.lastOpenedView });
      } else {
        return next({ name: settingsStore.defaultView });
      }
    }

    const isUserLoggedIn = useUserStore().isUserLoggedIn;
    const doesRouteRequireAuthentication = to.matched.some((record) => record.meta.requiresAuthentication);
    if (doesRouteRequireAuthentication && !isUserLoggedIn) {
      return next({ name: "login", query: { next: to.fullPath } });
    } else {
      if (to.meta?.rememberable) {
        settingsStore.setLastOpenedView(to.fullPath);
      }
      return next();
    }
  });

  return Router;
});
