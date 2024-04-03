import { Dialog } from "quasar";

export const dialogService = {
  alert(title: string, message: string) {
    return new Promise((accept) => {
      Dialog.create({
        title,
        message,
      })
        .onOk(() => {
          accept(true);
        })
        .onCancel(() => {
          accept(false);
        })
        .onDismiss(() => {
          accept(false);
        });
    });
  },

  confirm(title: string, message: string) {
    return new Promise((accept) => {
      Dialog.create({
        title,
        message,
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          accept(true);
        })
        .onCancel(() => {
          accept(false);
        })
        .onDismiss(() => {
          accept(false);
        });
    });
  },

  prompt(title: string, message: string, initialValue: string): Promise<string | null> {
    return new Promise((accept) => {
      Dialog.create({
        title,
        message,
        prompt: {
          model: initialValue,
          type: "text",
        },
        cancel: true,
        persistent: true,
      })
        .onOk((answer) => {
          accept(answer);
        })
        .onCancel(() => {
          accept(null);
        })
        .onDismiss(() => {
          accept(null);
        });
    });
  },
};
