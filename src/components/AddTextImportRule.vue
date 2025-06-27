<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="q-dialog-plugin" style="min-width: 800px">
      <q-card-section>
        <div class="std-dialog-title q-pa-md">
          {{ existingRuleId ? "Editing an Import Rule" : "Adding an Import Rule" }}
        </div>
        <q-form class="q-gutter-md q-pa-md" ref="ruleForm">
          <!-- Basic Information -->
          <div class="text-h6">Basic Information</div>
          <q-input filled v-model="ruleName" label="Rule Name" lazy-rules :rules="validators.required" />
          <q-input filled v-model="ruleDescription" label="Description" type="textarea" />
          <q-input filled v-model="ruleRegex" label="Regular Expression" lazy-rules :rules="[validateRegex]" />

          <!-- Capture Groups -->
          <div class="text-h6 q-mt-lg">Capture Groups</div>
          <div class="row q-gutter-md">
            <q-input
              filled
              v-model.number="walletCaptureGroup"
              label="Wallet Capture Group"
              type="number"
              lazy-rules
              :rules="validators.required"
              class="col"
            />
            <q-input
              filled
              v-model.number="expenseAvenueCaptureGroup"
              label="Expense Avenue Capture Group"
              type="number"
              lazy-rules
              :rules="validators.required"
              class="col"
            />
            <q-input filled v-model.number="dateCaptureGroup" label="Date Capture Group" type="number" lazy-rules :rules="validators.required" class="col" />
            <q-input
              filled
              v-model.number="amountCaptureGroup"
              label="Amount Capture Group"
              type="number"
              lazy-rules
              :rules="validators.required"
              class="col"
            />
          </div>
          <q-input filled v-model="dateFormat" label="Date Format" lazy-rules :rules="validators.required" />

          <!-- Wallet Match Rules -->
          <div class="text-h6 q-mt-lg">Wallet Match Rules</div>
          <div v-for="(rule, index) in walletMatchRules" :key="index" class="q-pa-md q-mb-md" style="border: 1px solid #e0e0e0; border-radius: 4px">
            <div class="row q-gutter-md items-center">
              <q-select filled v-model="rule.operator" :options="operatorOptions" label="Operator" class="col-3" />
              <q-input filled v-model="rule.value" label="Match Value" class="col-4" />
              <select-wallet v-model="rule.walletId" label="Target Wallet" class="col-4" />
              <q-btn icon="delete" color="negative" flat @click="removeWalletRule(index)" />
            </div>
          </div>
          <q-btn icon="add" color="primary" label="Add Wallet Rule" @click="addWalletRule" />

          <!-- Expense Avenue Match Rules -->
          <div class="text-h6 q-mt-lg">Expense Avenue Match Rules</div>
          <div v-for="(rule, index) in expenseAvenueMatchRules" :key="index" class="q-pa-md q-mb-md" style="border: 1px solid #e0e0e0; border-radius: 4px">
            <div class="row q-gutter-md items-center">
              <q-select filled v-model="rule.operator" :options="operatorOptions" label="Operator" class="col-3" />
              <q-input filled v-model="rule.value" label="Match Value" class="col-4" />
              <select-expense-avenue v-model="rule.expenseAvenueId" label="Target Expense Avenue" class="col-4" />
              <q-btn icon="delete" color="negative" flat @click="removeExpenseAvenueRule(index)" />
            </div>
          </div>
          <q-btn icon="add" color="primary" label="Add Expense Avenue Rule" @click="addExpenseAvenueRule" />

          <q-toggle v-model="ruleIsActive" label="Active" />

          <div v-if="validationErrors.length > 0" class="q-mt-md">
            <div class="text-negative text-subtitle2">Validation Errors:</div>
            <q-list bordered separator>
              <q-item v-for="error in validationErrors" :key="error" dense>
                <q-item-section>
                  <q-item-label class="text-negative">{{ error }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions class="row justify-between">
        <div class="row q-gutter-sm">
          <q-btn color="orange" icon="code" label="Export as Code" @click="exportAsCodeClicked" outline />
          <q-btn color="purple" icon="download" label="Import Code" @click="importCodeClicked" outline />
        </div>
        <div class="row q-gutter-sm">
          <q-btn color="blue-grey" label="Cancel" @click="cancelClicked" />
          <q-btn color="primary" label="OK" @click="okClicked" :disable="validationErrors.length > 0" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { QForm, useDialogPluginComponent, useQuasar } from "quasar";
import { Ref, ref, computed } from "vue";
import { TextImportRules, TextImportRulesValidator, WalletMatchRule, ExpenseAvenueMatchRule, MatchingOperator } from "src/models/text-import-rules";
import { pouchdbService } from "src/services/pouchdb-service";
import { Collection } from "src/constants/constants";
import SelectWallet from "./SelectWallet.vue";
import SelectExpenseAvenue from "./SelectExpenseAvenue.vue";
import { validators } from "src/utils/validators";
import ExportTextImportRuleDialog from "./ExportTextImportRuleDialog.vue";
import ImportTextImportRuleDialog from "./ImportTextImportRuleDialog.vue";

export default {
  components: {
    SelectWallet,
    SelectExpenseAvenue,
  },

  props: {
    existingRuleId: {
      type: String,
      required: false,
      default: null,
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup(props) {
    const $q = useQuasar();
    let initialDoc: TextImportRules | null = null;

    const isLoading = ref(false);
    const ruleForm: Ref<QForm | null> = ref(null);
    const ruleName = ref("");
    const ruleDescription = ref("");
    const ruleRegex = ref("");
    const walletCaptureGroup = ref(1);
    const expenseAvenueCaptureGroup = ref(2);
    const dateCaptureGroup = ref(3);
    const amountCaptureGroup = ref(4);
    const dateFormat = ref("DD/MM/YYYY");
    const walletMatchRules = ref<WalletMatchRule[]>([]);
    const expenseAvenueMatchRules = ref<ExpenseAvenueMatchRule[]>([]);
    const ruleIsActive = ref(true);

    const operatorOptions = [
      { label: "Exact Match", value: "exact-match" as MatchingOperator },
      { label: "Contains", value: "contains" as MatchingOperator },
      { label: "Starts With", value: "starts-with" as MatchingOperator },
      { label: "Ends With", value: "ends-with" as MatchingOperator },
      { label: "Regex", value: "regex" as MatchingOperator },
    ];

    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

    if (props.existingRuleId) {
      isLoading.value = true;
      (async function () {
        let res = (await pouchdbService.getDocById(props.existingRuleId)) as TextImportRules;
        initialDoc = res;

        // Populate form fields
        ruleName.value = res.name;
        ruleDescription.value = res.description || "";
        ruleRegex.value = res.regex;
        walletCaptureGroup.value = res.walletCaptureGroup;
        expenseAvenueCaptureGroup.value = res.expenseAvenueCaptureGroup;
        dateCaptureGroup.value = res.dateCaptureGroup;
        amountCaptureGroup.value = res.amountCaptureGroup;
        dateFormat.value = res.dateFormat;
        walletMatchRules.value = [...res.walletMatchRules];
        expenseAvenueMatchRules.value = [...res.expenseAvenueMatchRules];
        ruleIsActive.value = res.isActive;

        isLoading.value = false;
      })();
    }

    const validationErrors = computed(() => {
      const rule: Partial<TextImportRules> = {
        name: ruleName.value,
        description: ruleDescription.value,
        regex: ruleRegex.value,
        walletCaptureGroup: walletCaptureGroup.value,
        expenseAvenueCaptureGroup: expenseAvenueCaptureGroup.value,
        dateCaptureGroup: dateCaptureGroup.value,
        amountCaptureGroup: amountCaptureGroup.value,
        dateFormat: dateFormat.value,
        walletMatchRules: walletMatchRules.value,
        expenseAvenueMatchRules: expenseAvenueMatchRules.value,
      };

      return TextImportRulesValidator.validate(rule).errors;
    });

    const validateRegex = (val: string) => {
      if (!val) return "Regex is required";
      try {
        new RegExp(val);
        return true;
      } catch (e) {
        return "Invalid regular expression";
      }
    };

    const addWalletRule = () => {
      walletMatchRules.value.push({
        operator: "contains",
        value: "",
        walletId: "",
      });
    };

    const removeWalletRule = (index: number) => {
      walletMatchRules.value.splice(index, 1);
    };

    const addExpenseAvenueRule = () => {
      expenseAvenueMatchRules.value.push({
        operator: "contains",
        value: "",
        expenseAvenueId: "",
      });
    };

    const removeExpenseAvenueRule = (index: number) => {
      expenseAvenueMatchRules.value.splice(index, 1);
    };

    const getCurrentRuleData = (): Partial<TextImportRules> => {
      return {
        name: ruleName.value,
        description: ruleDescription.value,
        regex: ruleRegex.value,
        walletCaptureGroup: walletCaptureGroup.value,
        expenseAvenueCaptureGroup: expenseAvenueCaptureGroup.value,
        dateCaptureGroup: dateCaptureGroup.value,
        amountCaptureGroup: amountCaptureGroup.value,
        dateFormat: dateFormat.value,
        walletMatchRules: walletMatchRules.value,
        expenseAvenueMatchRules: expenseAvenueMatchRules.value,
        isActive: ruleIsActive.value,
      };
    };

    const exportAsCodeClicked = () => {
      $q.dialog({
        component: ExportTextImportRuleDialog,
        componentProps: {
          rule: getCurrentRuleData(),
        },
      });
    };

    const importCodeClicked = () => {
      $q.dialog({
        component: ImportTextImportRuleDialog,
      }).onOk((importedRule: Partial<TextImportRules>) => {
        // Update UI values with imported data
        if (importedRule.name !== undefined) ruleName.value = importedRule.name;
        if (importedRule.description !== undefined) ruleDescription.value = importedRule.description;
        if (importedRule.regex !== undefined) ruleRegex.value = importedRule.regex;
        if (importedRule.walletCaptureGroup !== undefined) walletCaptureGroup.value = importedRule.walletCaptureGroup;
        if (importedRule.expenseAvenueCaptureGroup !== undefined) expenseAvenueCaptureGroup.value = importedRule.expenseAvenueCaptureGroup;
        if (importedRule.dateCaptureGroup !== undefined) dateCaptureGroup.value = importedRule.dateCaptureGroup;
        if (importedRule.amountCaptureGroup !== undefined) amountCaptureGroup.value = importedRule.amountCaptureGroup;
        if (importedRule.dateFormat !== undefined) dateFormat.value = importedRule.dateFormat;
        if (importedRule.walletMatchRules !== undefined) walletMatchRules.value = [...importedRule.walletMatchRules];
        if (importedRule.expenseAvenueMatchRules !== undefined) expenseAvenueMatchRules.value = [...importedRule.expenseAvenueMatchRules];
        if (importedRule.isActive !== undefined) ruleIsActive.value = importedRule.isActive;

        $q.notify({
          type: "positive",
          message: "Rule imported successfully! Review and save to apply changes.",
        });
      });
    };

    async function okClicked() {
      if (!(await ruleForm.value?.validate())) {
        return;
      }

      if (validationErrors.value.length > 0) {
        $q.notify({
          type: "negative",
          message: "Please fix validation errors before saving",
        });
        return;
      }

      try {
        let rule: TextImportRules = {
          $collection: Collection.TEXT_IMPORT_RULES,
          name: ruleName.value,
          description: ruleDescription.value,
          regex: ruleRegex.value,
          walletCaptureGroup: walletCaptureGroup.value,
          expenseAvenueCaptureGroup: expenseAvenueCaptureGroup.value,
          dateCaptureGroup: dateCaptureGroup.value,
          amountCaptureGroup: amountCaptureGroup.value,
          dateFormat: dateFormat.value,
          walletMatchRules: walletMatchRules.value,
          expenseAvenueMatchRules: expenseAvenueMatchRules.value,
          isActive: ruleIsActive.value,
        };

        if (initialDoc) {
          rule = Object.assign({}, initialDoc, rule);
        }

        await pouchdbService.upsertDoc(rule);
        onDialogOK();
      } catch (error) {
        console.error("Error saving rule:", error);
        $q.notify({
          type: "negative",
          message: "Error saving rule",
        });
      }
    }

    // Initialize with at least one rule for each type
    if (walletMatchRules.value.length === 0) {
      addWalletRule();
    }
    if (expenseAvenueMatchRules.value.length === 0) {
      addExpenseAvenueRule();
    }

    return {
      dialogRef,
      onDialogHide,
      okClicked,
      cancelClicked: onDialogCancel,
      isLoading,
      ruleForm,
      ruleName,
      ruleDescription,
      ruleRegex,
      walletCaptureGroup,
      expenseAvenueCaptureGroup,
      dateCaptureGroup,
      amountCaptureGroup,
      dateFormat,
      walletMatchRules,
      expenseAvenueMatchRules,
      ruleIsActive,
      operatorOptions,
      validationErrors,
      validateRegex,
      addWalletRule,
      removeWalletRule,
      addExpenseAvenueRule,
      removeExpenseAvenueRule,
      validators,
      exportAsCodeClicked,
      importCodeClicked,
    };
  },
};
</script>

<style scoped lang="scss"></style>
