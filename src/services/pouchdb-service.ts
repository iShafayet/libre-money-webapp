import { sleep } from "src/utils/misc-utils";

const LOCAL_DB_NAME = "cash-keeper-main";

const pouchdb = new PouchDB(LOCAL_DB_NAME);

let collectionIndexCreated = false;
async function createCollectionIndexIfNeeded() {
  if (collectionIndexCreated) {
    return;
  }
  await pouchdb.createIndex({
    index: {
      fields: ["$collection"],
    },
  });
  collectionIndexCreated = true;
}

const knownTemporaryFields = ["_currencySign"];

function stripKnownTemporaryFields(doc: any) {
  knownTemporaryFields.forEach((field) => {
    delete doc[field];
  });
}

const INTENTIONAL_DELAY = 300;

async function delayIntentionally() {
  await sleep(INTENTIONAL_DELAY);
}

export const pouchdbService = {
  getDb() {
    return pouchdb;
  },

  async upsertDoc(doc: PouchDB.Core.PostDocument<any>) {
    await delayIntentionally();

    doc = JSON.parse(JSON.stringify(doc));
    stripKnownTemporaryFields(doc);
    if (doc._id) {
      return pouchdb.put(doc);
    } else {
      return pouchdb.post(doc);
    }
  },

  async listDocs() {
    await delayIntentionally();

    return await pouchdb.allDocs({
      include_docs: true,
    });
  },

  async listByCollection(collectionName: string) {
    await delayIntentionally();

    await createCollectionIndexIfNeeded();

    return await pouchdb.find({
      selector: {
        $collection: collectionName,
      },
    });
  },

  async getDocById(_id: string) {
    await delayIntentionally();

    return await pouchdb.get(_id);
  },

  async removeDoc(doc: PouchDB.Core.PostDocument<any>) {
    await delayIntentionally();

    return await pouchdb.remove(doc._id, doc._rev);
  },
};
