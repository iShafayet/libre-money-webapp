<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" no-backdrop-dismiss maximized>
    <q-card class="q-dialog-plugin">
      <q-card-section class="row items-center q-pb-none">
        <div>
          <div class="text-h6">Document Changes</div>
          <div>
            <span>Added: {{ addedCount }}</span>
            <span> | Modified: {{ modifiedCount }}</span>
            <span> | Removed: {{ removedCount }}</span>
          </div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="okClicked" />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <div class="row" style="height: calc(100vh - 100px)">
          <!-- Old Document -->
          <div class="col-6 column">
            <div class="bg-red-1 q-pa-md text-center">
              <div class="text-subtitle1 text-weight-bold text-red-8">
                <q-icon name="remove_circle" class="q-mr-xs" />
                Old Document
              </div>
            </div>
            <div class="diff-content old-content">
              <div class="diff-lines">
                <div v-for="(line, index) in formattedOldDocLines" :key="index" :class="line.class" class="diff-line">
                  {{ line.text }}
                </div>
              </div>
            </div>
          </div>

          <!-- New Document -->
          <div class="col-6 column">
            <div class="bg-green-1 q-pa-md text-center">
              <div class="text-subtitle1 text-weight-bold text-green-8">
                <q-icon name="add_circle" class="q-mr-xs" />
                New Document
              </div>
            </div>
            <div class="diff-content new-content">
              <div class="diff-lines">
                <div v-for="(line, index) in formattedNewDocLines" :key="index" :class="line.class" class="diff-line">
                  {{ line.text }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDialogPluginComponent } from "quasar";

interface Props {
  oldDocument: any;
  newDocument: any;
}

const props = defineProps<Props>();
const emit = defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

function okClicked() {
  onDialogOK();
}

interface DiffResult {
  added: string[];
  modified: string[];
  removed: string[];
}

// Compute differences between documents
const diffResult = computed((): DiffResult => {
  if (!props.oldDocument || !props.newDocument) {
    return { added: [], modified: [], removed: [] };
  }

  const oldKeys = new Set(Object.keys(props.oldDocument));
  const newKeys = new Set(Object.keys(props.newDocument));

  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];

  // Find added fields
  for (const key of newKeys) {
    if (!oldKeys.has(key)) {
      added.push(key);
    }
  }

  // Find removed fields
  for (const key of oldKeys) {
    if (!newKeys.has(key)) {
      removed.push(key);
    }
  }

  // Find modified fields
  for (const key of oldKeys) {
    if (newKeys.has(key)) {
      const oldValue = JSON.stringify(props.oldDocument[key]);
      const newValue = JSON.stringify(props.newDocument[key]);
      if (oldValue !== newValue) {
        modified.push(key);
      }
    }
  }

  return { added, modified, removed };
});

interface DiffLine {
  text: string;
  class: string;
}

// Format documents with highlighting
const formattedOldDocLines = computed((): DiffLine[] => {
  if (!props.oldDocument) return [{ text: "No old document", class: "" }];
  return formatDocumentWithDiffLines(props.oldDocument, props.newDocument, "old");
});

const formattedNewDocLines = computed((): DiffLine[] => {
  if (!props.newDocument) return [{ text: "No new document", class: "" }];
  return formatDocumentWithDiffLines(props.oldDocument, props.newDocument, "new");
});

function formatDocumentWithDiffLines(oldDoc: any, newDoc: any, type: "old" | "new"): DiffLine[] {
  const doc = type === "old" ? oldDoc : newDoc;
  const otherDoc = type === "old" ? newDoc : oldDoc;

  if (!doc) return [{ text: type === "old" ? "No old document" : "No new document", class: "" }];

  const lines: DiffLine[] = [];
  const allKeys = new Set([...Object.keys(doc), ...Object.keys(otherDoc || {})]);
  const sortedKeys = Array.from(allKeys).sort();

  lines.push({ text: "{", class: "" });

  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    const hasKey = key in doc;
    const hasOtherKey = otherDoc && key in otherDoc;
    const isLast = i === sortedKeys.length - 1;

    if (!hasKey) {
      // Key doesn't exist in this document
      if (type === "old") {
        // Show placeholder for added field
        lines.push({ text: `  // "${key}" was added`, class: "added-placeholder" });
      }
      continue;
    }

    const value = doc[key];
    const otherValue = otherDoc ? otherDoc[key] : undefined;

    let lineClass = "";

    if (!hasOtherKey) {
      // Field was removed/added
      if (type === "old") {
        lineClass = "removed-field";
      } else {
        lineClass = "added-field";
      }
    } else if (JSON.stringify(value) !== JSON.stringify(otherValue)) {
      // Field was modified - use modified-field class for both old and new
      lineClass = "modified-field";
    }

    const formattedValue = formatValue(value);
    const comma = isLast ? "" : ",";
    const lineText = `  "${key}": ${formattedValue}${comma}`;

    lines.push({ text: lineText, class: lineClass });
  }

  lines.push({ text: "}", class: "" });
  return lines;
}

function formatValue(value: any): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  // For objects and arrays, format them nicely
  try {
    return JSON.stringify(value, null, 2)
      .split("\n")
      .map((line, idx) => (idx === 0 ? line : "    " + line))
      .join("\n");
  } catch {
    return String(value);
  }
}

// Computed counts
const addedCount = computed(() => diffResult.value.added.length);
const modifiedCount = computed(() => diffResult.value.modified.length);
const removedCount = computed(() => diffResult.value.removed.length);
</script>

<style scoped lang="scss">
.diff-content {
  flex: 1;
  overflow: auto;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.old-content {
  border-right: 2px solid #f44336;
}

.new-content {
  border-left: 2px solid #4caf50;
}

.diff-lines {
  margin: 0;
  padding: 16px;
  font-family: "Courier New", Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
  background-color: #fafafa;
  min-height: 100%;
  overflow: auto;
}

.diff-line {
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 1px 0;
}

// Diff highlighting styles
.removed-field {
  background-color: #ffcdd2 !important;
  color: #c62828 !important;
  padding: 2px 4px;
  border-radius: 3px;
  text-decoration: line-through;
}

.added-field {
  background-color: #c8e6c9;
  color: #2e7d32;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.modified-field {
  background-color: #ffe0b2 !important;
  color: #ef6c00 !important;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.added-placeholder {
  color: #9e9e9e;
  font-style: italic;
  opacity: 0.7;
}

// Improve overall readability
.diff-line {
  line-height: 1.6;
}
</style>
