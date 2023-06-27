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
};
