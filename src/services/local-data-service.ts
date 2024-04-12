import { dialogService } from "./dialog-service";
import { loginService } from "./login-service";
import { pouchdbService } from "./pouchdb-service";

class LocalDataService {
  async removeLocalData() {
    const answer = await dialogService.confirm("Remove Local Data", "Are you sure you want to remove all local data? Any un-synced data will be lost forever.");
    if (!answer) return;

    await pouchdbService.getDb().destroy();
    await loginService.logout();

    localStorage.clear();
    sessionStorage.clear();

    // @ts-ignore
    window.location.reload(true);
  }
}

export const localDataService = new LocalDataService();
