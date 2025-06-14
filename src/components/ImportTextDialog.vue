<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="std-dialog-title q-pa-md">Import Text</div>
        <q-form class="q-gutter-md q-pa-md" ref="importForm">
          <q-input type="textarea" filled v-model="importText" label="Paste your text here" lazy-rules :rules="validators.required" autogrow />

          <q-select
            filled
            v-model="selectedRuleId"
            :options="ruleOptions"
            label="Select Import Rule"
            emit-value
            map-options
            lazy-rules
            :rules="validators.required"
          />

          <div v-if="parsedData" class="q-mt-md">
            <div class="text-h6">Parsed Data</div>
            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Wallet</q-item-label>
                  <q-item-label>{{ parsedData.wallet }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Expense Avenue</q-item-label>
                  <q-item-label>{{ parsedData.expenseAvenue }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Date</q-item-label>
                  <q-item-label>{{ parsedData.date }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Amount</q-item-label>
                  <q-item-label>{{ parsedData.amount }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions class="row justify-end">
        <q-btn color="blue-grey" label="Cancel" @click="cancelClicked" />
        <q-btn color="primary" label="Parse" @click="parseClicked" />
        <q-btn v-if="parsedData" color="green" label="Create Expense" @click="createExpenseClicked" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { QForm, useDialogPluginComponent, useQuasar } from "quasar";
import { Ref, ref, computed } from "vue";
import { validators } from "src/utils/validators";
import { TextImportRules } from "src/models/text-import-rules";
import { pouchdbService } from "src/services/pouchdb-service";
import { Collection } from "src/constants/constants";
import { dialogService } from "src/services/dialog-service";
import AddExpenseRecord from "src/components/AddExpenseRecord.vue";
import { date } from "quasar";

const parse = (text: string, format: string) => {
  return date.extractDate(text, format);
};

type ParsedData = {
  wallet: string;
  expenseAvenue: string;
  date: string;
  amount: string;
};

export default {
  emits: [...useDialogPluginComponent.emits],

  setup() {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
    const $q = useQuasar();

    const importForm: Ref<QForm | null> = ref(null);
    const importText: Ref<string | null> = ref(null);
    const selectedRuleId: Ref<string | null> = ref(null);
    const parsedData: Ref<ParsedData | null> = ref(null);

    const ruleOptions = ref<{ label: string; value: string }[]>([]);

    async function loadRules() {
      const res = await pouchdbService.listByCollection(Collection.TEXT_IMPORT_RULES);
      const rules = res.docs as TextImportRules[];
      ruleOptions.value = rules
        .filter((rule) => rule.isActive)
        .map((rule) => ({
          label: rule.name,
          value: rule._id!,
        }));
    }

    loadRules();

    const parseText = async () => {
      if (!selectedRuleId.value || !importText.value) return;

      const rule = (await pouchdbService.getDocById(selectedRuleId.value)) as TextImportRules;
      console.debug("Selected rule:", rule);
      console.debug("Text to parse:", importText.value);

      const regex = new RegExp(rule.regex);
      console.debug("Regex pattern:", regex);

      const match = importText.value.match(regex);
      console.debug("Match result:", match);

      if (!match) {
        $q.notify({
          type: "negative",
          message: "Text does not match the selected rule pattern",
        });
        return;
      }

      try {
        const date = parse(match[rule.dateCaptureGroup], rule.dateFormat);
        parsedData.value = {
          wallet: match[rule.walletCaptureGroup],
          expenseAvenue: match[rule.expenseAvenueCaptureGroup],
          date: date.toISOString(),
          amount: match[rule.amountCaptureGroup],
        };

        console.debug("Parsed data:", parsedData.value);
      } catch (error) {
        console.error("Error parsing date:", error);
        $q.notify({
          type: "negative",
          message: "Error parsing date from text",
        });
      }
    };

    async function createExpenseClicked() {
      if (!parsedData.value) return;

      $q.dialog({
        component: AddExpenseRecord,
        componentProps: {
          parsedData: parsedData.value,
        },
      }).onOk(() => {
        onDialogOK();
      });
    }

    return {
      dialogRef,
      onDialogHide,
      cancelClicked: onDialogCancel,
      importForm,
      importText,
      selectedRuleId,
      ruleOptions,
      parsedData,
      validators,
      parseClicked: parseText,
      createExpenseClicked,
    };
  },
};
</script>

<style scoped lang="scss"></style>
