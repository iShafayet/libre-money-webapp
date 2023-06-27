const LOCAL_DB_NAME = "cash-keeper-main";

const pouchdb = new PouchDB(LOCAL_DB_NAME);

export const pouchdbService = {
  async upsertDoc(doc: PouchDB.Core.PostDocument<any>) {
    if (doc._id) {
      return pouchdb.put(doc);
    } else {
      return pouchdb.post(doc);
    }
  },

  async listDocs() {
    return await pouchdb.allDocs({
      include_docs: true,
    });
  },

  async getDocById(_id: string) {
    return await pouchdb.get(_id);
  },

  async removeDoc(doc: PouchDB.Core.PostDocument<any>) {
    return await pouchdb.remove(doc._id, doc._rev);
  },
};
