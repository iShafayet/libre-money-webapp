<script setup lang="ts">
import { Collection } from "src/constants/constants";
import { Party } from "src/models/party";
import { pouchdbService } from "src/services/pouchdb-service";
import { Ref, computed, ref } from "vue";

const props = defineProps({
  modelValue: {},
  mandatory: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const isLoading: Ref<boolean> = ref(true);
const partyPartyList: Ref<Party[]> = ref([]);
const fullPartyPartyList: Ref<Party[]> = ref([]);

async function loadData() {
  isLoading.value = true;
  fullPartyPartyList.value = (await pouchdbService.listByCollection(Collection.PARTY)).docs as Party[];
  partyPartyList.value = fullPartyPartyList.value;
  isLoading.value = false;
  setTimeout(() => {
    if (fullPartyPartyList.value.length && !value.value && props.mandatory) {
      value.value = fullPartyPartyList.value[0]._id;
    }
  }, 10);
}

loadData();

function filterPartyFn(val: string, update: any, abort: any) {
  update(() => {
    const needle = val.toLowerCase();
    partyPartyList.value = fullPartyPartyList.value.filter((party) => {
      return party.name.toLowerCase().includes(needle);
    });
  });
}
</script>

<template>
  <div style="text-align: center" v-if="isLoading">
    <q-spinner color="primary" size="40px" :thickness="4" />
  </div>

  <q-select
    filled
    v-model="value"
    :options="partyPartyList"
    label="Party / Vendor"
    emit-value
    map-options
    fill-input
    use-input
    input-debounce="0"
    @filter="filterPartyFn"
    class="std-margin-bottom-32"
    option-value="_id"
    option-label="name"
    hide-selected
    v-if="!isLoading"
    :clearable="!mandatory"
  />
</template>
