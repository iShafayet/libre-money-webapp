<template>
  <q-page class="row items-center justify-evenly">
    <q-card class="std-card">
      <div class="title-row q-pa-md q-gutter-sm">
        <div class="title">Application Settings</div>
      </div>

      <div class="q-pa-md row">
        <q-input
          type="number"
          filled
          v-model="recordPaginationStore.recordPaginationSize"
          label="Number of records per page"
          :rules="validators.nonZeroInteger"
          style="margin-right: 8px"
          @update:model-value="(value)=>{recordPaginationStore.setRecordPaginationSize(value as any)}"
        ></q-input>
        <q-input
          type="number"
          filled
          v-model="paginationStore.paginationSize"
          label="Number of rows per page"
          :rules="validators.nonZeroInteger"
          style="margin-right: 8px"
          @update:model-value="(value)=>{paginationStore.setPaginationSize(value as any)}"
        ></q-input>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { Ref, defineComponent, ref, watch } from "vue";
import { Collection, walletTypeList, rowsPerPageOptions } from "./../constants/constants";
import { useQuasar } from "quasar";
import AddDocument from "./../components/AddDocument.vue";
import { pouchdbService } from "src/services/pouchdb-service";
import { dialogService } from "src/services/dialog-service";
import { sleep } from "src/utils/misc-utils";
import { Currency } from "src/models/currency";
import { loginService } from "src/services/login-service";
import { usePaginationSizeStore } from "src/stores/pagination";
import { dataBackupService } from "src/services/data-backup-service";
import { useRecordPaginationSizeStore } from "src/stores/record-pagination";
import { validators } from "src/utils/validators";

export default defineComponent({
  name: "SettingsPage",
  components: {},
  setup() {
    const $q = useQuasar();
    const recordPaginationStore = useRecordPaginationSizeStore();
    const paginationStore = usePaginationSizeStore();
    // -----

    // -----

    // -----

    // -----

    return {
      recordPaginationStore,
      paginationStore,
      validators,
    };
  },
});
</script>

<style scoped lang="scss"></style>
