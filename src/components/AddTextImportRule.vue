<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="std-dialog-title q-pa-md">
          {{ existingRuleId ? "Editing an Import Rule" : "Adding an Import Rule" }}
        </div>
        <q-form class="q-gutter-md q-pa-md" ref="ruleForm">
          <q-input filled v-model="ruleName" label="Name" lazy-rules :rules="validators.name" />
          <q-input filled v-model="ruleDescription" label="Description" />
          <q-input filled v-model="ruleRegex" label="Regular Expression" lazy-rules :rules="validators.required" />
          <q-input filled v-model="ruleDateFormat" label="Date Format" lazy-rules :rules="validators.required" />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input filled type="number" v-model="ruleWalletCaptureGroup" label="Wallet Capture Group" lazy-rules :rules="validators.required" />
            </div>
            <div class="col-6">
              <q-input
                filled
                type="number"
                v-model="ruleExpenseAvenueCaptureGroup"
                label="Expense Avenue Capture Group"
                lazy-rules
                :rules="validators.required"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input filled type="number" v-model="ruleDateCaptureGroup" label="Date Capture Group" lazy-rules :rules="validators.required" />
            </div>
            <div class="col-6">
              <q-input filled type="number" v-model="ruleAmountCaptureGroup" label="Amount Capture Group" lazy-rules :rules="validators.required" />
            </div>
          </div>

          <q-toggle v-model="ruleIsActive" label="Active" />
        </q-form>
      </q-card-section>

      <q-card-actions class="row justify-end">
        <q-btn color="blue-grey" label="Cancel" @click="cancelClicked" />
        <q-btn color="primary" label="OK" @click="okClicked" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { QForm, useDialogPluginComponent } from "quasar";
import { Ref, ref } from "vue";
import { validators } from "src/utils/validators";
import { TextImportRules } from "src/models/text-import-rules";
import { pouchdbService } from "src/services/pouchdb-service";
import { Collection } from "src/constants/constants";

export default {
  props: {
    existingRuleId: {
      type: String,
      required: false,
      default: null,
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup(props) {
    let initialDoc: TextImportRules | null = null;

    const isLoading = ref(false);

    const ruleForm: Ref<QForm | null> = ref(null);

    const ruleName: Ref<string | null> = ref(null);
    const ruleDescription: Ref<string | null> = ref(null);
    const ruleRegex: Ref<string | null> = ref(null);
    const ruleDateFormat: Ref<string | null> = ref(null);
    const ruleWalletCaptureGroup: Ref<number | null> = ref(null);
    const ruleExpenseAvenueCaptureGroup: Ref<number | null> = ref(null);
    const ruleDateCaptureGroup: Ref<number | null> = ref(null);
    const ruleAmountCaptureGroup: Ref<number | null> = ref(null);
    const ruleIsActive: Ref<boolean> = ref(true);

    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

    if (props.existingRuleId) {
      isLoading.value = true;
      (async function () {
        let res = (await pouchdbService.getDocById(props.existingRuleId)) as TextImportRules;
        initialDoc = res;
        ruleName.value = res.name;
        ruleDescription.value = res.description || null;
        ruleRegex.value = res.regex;
        ruleDateFormat.value = res.dateFormat;
        ruleWalletCaptureGroup.value = res.walletCaptureGroup;
        ruleExpenseAvenueCaptureGroup.value = res.expenseAvenueCaptureGroup;
        ruleDateCaptureGroup.value = res.dateCaptureGroup;
        ruleAmountCaptureGroup.value = res.amountCaptureGroup;
        ruleIsActive.value = res.isActive;
        isLoading.value = false;
      })();
    }

    async function okClicked() {
      if (!(await ruleForm.value?.validate())) {
        return;
      }

      let rule: TextImportRules = {
        $collection: Collection.TEXT_IMPORT_RULES,
        name: ruleName.value!,
        description: ruleDescription.value || undefined,
        regex: ruleRegex.value!,
        dateFormat: ruleDateFormat.value!,
        walletCaptureGroup: ruleWalletCaptureGroup.value!,
        expenseAvenueCaptureGroup: ruleExpenseAvenueCaptureGroup.value!,
        dateCaptureGroup: ruleDateCaptureGroup.value!,
        amountCaptureGroup: ruleAmountCaptureGroup.value!,
        isActive: ruleIsActive.value,
      };

      if (initialDoc) {
        rule = Object.assign({}, initialDoc, rule);
      }

      pouchdbService.upsertDoc(rule);

      onDialogOK();
    }

    return {
      dialogRef,
      onDialogHide,
      okClicked,
      cancelClicked: onDialogCancel,
      isLoading,
      ruleName,
      ruleDescription,
      ruleRegex,
      ruleDateFormat,
      ruleWalletCaptureGroup,
      ruleExpenseAvenueCaptureGroup,
      ruleDateCaptureGroup,
      ruleAmountCaptureGroup,
      ruleIsActive,
      validators,
      ruleForm,
    };
  },
};
</script>

<style scoped lang="scss"></style>
