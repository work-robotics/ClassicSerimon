import Store, { Schema } from "electron-store";
import { UserConfig } from "./CanvasViewer/Params";

const defaultValue: UserConfig = {
  fontSize: 16,
  rowHeight: 20,
  fontFamily: "JetBrains Mono, Source Han Code JP, Menlo, Consolas",
  maxLineNum: 16,
};

export class ConfigStore {
  public schema: Schema<UserConfig>;
  public store: Store<UserConfig>;
  constructor() {
    this.store = new Store<UserConfig>({
      clearInvalidConfig: true,
      defaults: defaultValue,
      schema: this.schema,
      name: "serimon_config",
      cwd: require("os").homedir(),
      watch: true,
    });
  }

  public getData(): UserConfig {
    let data: UserConfig = defaultValue;
    for (const key in defaultValue) {
      data[key] = this.store.get(key);
    }
    return data;
  }
}

export default new ConfigStore();
