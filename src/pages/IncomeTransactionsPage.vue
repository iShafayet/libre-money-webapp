<template>
  <q-page class="row items-center justify-evenly">

    <q-card class="std-card">
      <div class="title q-pa-xs">Income</div>

    </q-card>

  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "IncomeTransactionsPage",
  components: {},
  setup() {

    return {};
  }
});
</script>


<style scoped lang="scss">
.std-card {
  min-width: 300px;
  max-width: 600px;
  margin: 12px;

  .title {
    text-align: center;
    background-color: rgb(125, 181, 193);
    text-transform: uppercase;
    font-size: 26px;
    // padding-top: 8px;
  }
}
</style>
