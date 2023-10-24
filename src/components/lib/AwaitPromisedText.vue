<template>
  {{ promiseValue }}
</template>

<script lang="ts">
import { Ref, defineComponent, ref } from "vue";

export default defineComponent({
  name: "AwaitPromisedText",
  props: {
    promise: {
      type: Promise,
      required: true,
    },
  },
  setup(props) {
    const promiseValue: Ref<any> = ref(null);

    try {
      props.promise
        .then((value) => (promiseValue.value = value))
        .catch((ex) => {
          console.error(ex);
          promiseValue.value = "Error";
        });
    } catch (ex) {
      console.error(ex);
      promiseValue.value = "Error";
    }

    return {
      promiseValue,
    };
  },
});
</script>
