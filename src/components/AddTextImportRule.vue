<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="std-dialog-title q-pa-md">
          {{ existingRuleId ? "Editing an Import Rule" : "Adding an Import Rule" }}
        </div>
        <q-form class="q-gutter-md q-pa-md" ref="ruleForm">
          <div class="text-subtitle2 q-mb-sm">Rule Configuration (JSON)</div>
          <q-input filled type="textarea" v-model="ruleJson" label="Rule Configuration" lazy-rules :rules="[validateJson]" autogrow />

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

          <q-toggle v-model="ruleIsActive" label="Active" />
        </q-form>
      </q-card-section>

      <q-card-actions class="row justify-end">
        <q-btn color="blue-grey" label="Cancel" @click="cancelClicked" />
        <q-btn color="primary" label="OK" @click="okClicked" :disable="validationErrors.length > 0" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { QForm, useDialogPluginComponent, useQuasar } from "quasar";
import { Ref, ref } from "vue";
import { TextImportRules, TextImportRulesValidator } from "src/models/text-import-rules";
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
    const $q = useQuasar();
    let initialDoc: TextImportRules | null = null;

    const isLoading = ref(false);
    const ruleForm: Ref<QForm | null> = ref(null);
    const ruleJson: Ref<string> = ref("");
    const ruleIsActive: Ref<boolean> = ref(true);
    const validationErrors = ref<string[]>([]);

    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

    if (props.existingRuleId) {
      isLoading.value = true;
      (async function () {
        let res = (await pouchdbService.getDocById(props.existingRuleId)) as TextImportRules;
        initialDoc = res;
        ruleIsActive.value = res.isActive;

        // Remove _id and _rev from the JSON display
        const { _id, _rev, $collection, ...ruleConfig } = res;
        ruleJson.value = JSON.stringify(ruleConfig, null, 2);

        isLoading.value = false;
      })();
    }

    const validateJson = (val: string) => {
      try {
        const parsed = JSON.parse(val);
        const validation = TextImportRulesValidator.validate(parsed);
        validationErrors.value = validation.errors;
        return validation.isValid || "Invalid rule configuration";
      } catch (e) {
        validationErrors.value = ["Invalid JSON format"];
        return false;
      }
    };

    async function okClicked() {
      if (!(await ruleForm.value?.validate())) {
        return;
      }

      try {
        const parsedJson = JSON.parse(ruleJson.value);
        const validation = TextImportRulesValidator.validate(parsedJson);

        if (!validation.isValid) {
          $q.notify({
            type: "negative",
            message: "Invalid rule configuration",
          });
          return;
        }

        let rule: TextImportRules = {
          $collection: Collection.TEXT_IMPORT_RULES,
          ...parsedJson,
        };

        if (initialDoc) {
          rule = Object.assign({}, initialDoc, rule);
        }

        await pouchdbService.upsertDoc(rule);
        onDialogOK();
      } catch (error) {
        $q.notify({
          type: "negative",
          message: "Error saving rule",
        });
      }
    }

    return {
      dialogRef,
      onDialogHide,
      okClicked,
      cancelClicked: onDialogCancel,
      isLoading,
      ruleJson,
      ruleIsActive,
      validationErrors,
      validateJson,
      ruleForm,
    };
  },
};
</script>

<style scoped lang="scss"></style>
