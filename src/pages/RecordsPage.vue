<template>
  <q-page class="row items-center justify-evenly">

    <q-card class="std-card">
      <div class="title-row q-pa-md q-gutter-sm">
        <div class="title"></div>
        <q-btn-dropdown size="md" color="primary" label="Add Expenses" split @click="addExpenseClicked">
          <q-list>
            <q-item clickable v-close-popup>
              <q-item-section>
                <q-item-label>Add Income</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>
                <q-item-label>Transfer Money</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <div class="q-pa-md">
        <div>Records</div>
        <div v-for="(record, index) in rows" class="data-row" v-bind:key="record._id">
          <div :data-index="index">{{ record.type }} {{ record.expense?.amount }} {{ record.notes }}</div>
        </div>
      </div>

    </q-card>

  </q-page>
</template>

<script lang="ts">
import { Ref, defineComponent, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { pouchdbService } from "src/services/pouchdb-service";
import { Record } from "src/models/record";
import { dialogService } from "src/services/dialog-service";
import AddExpenseRecord from "src/components/AddExpenseRecord.vue";
import { Collection } from "src/constants/constants";

export default defineComponent({
  name: "RecordsPage",
  components: {},
  setup() {

    const $q = useQuasar();

    // -----

    const searchFilter: Ref<string | null> = ref(null);

    const isLoading = ref(false);

    let rows: Ref<Record[]> = ref([]);

    // -----

    async function addExpenseClicked() {
      $q.dialog({ component: AddExpenseRecord }).onOk((res) => {
        loadData();
      });
    }

    async function loadData() {
      console.log("TODO");

      let dataRows = (await pouchdbService.listByCollection(Collection.RECORD)).docs as Record[];

      rows.value = dataRows;
    }

    async function editClicked(record: Record) {
      console.log("TODO");

      // $q.dialog({ component: AddRecord, componentProps: { existingRecordId: record._id } }).onOk((res) => {
      //   loadData();
      // });
    }

    async function deleteClicked(record: Record) {
      let answer = await dialogService.confirm("Remove record", `Are you sure you want to remove the record?`);
      if (!answer) return;

      let res = await pouchdbService.removeDoc(record);
      if (!res.ok) {
        await dialogService.alert("Error", "There was an error trying to remove the record.");
      }

      loadData();
    }

    // -----

    loadData();

    // -----

    watch(searchFilter, (_, __) => {
      loadData();
    });

    return {
      addExpenseClicked,
      searchFilter,
      rows,
      isLoading,
      editClicked,
      deleteClicked
    };
  }
});
</script>

<style scoped lang="scss"></style>
