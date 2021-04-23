import Store, { Schema } from "electron-store";
import { UserConfig, SysConfig, metaConfig } from "./CanvasViewer/Types";

export const userDefaultValue: UserConfig = {
  fontSize: 14,
  rowHeight: 20,
  fontFamily: "JetBrains Mono, Source Han Code JP, Menlo, Consolas",
  maxLineNum: 16,
  asciiMode: false,
  asciiMaxWidth: 650,
};

export const sysDefaultValue: SysConfig = {
  baudrate: 9600,
};

export const metaDefaultValue: metaConfig = {
  user: "",
  date: "",
  location: "",
  expName: "",
  expDescription: "",
  deviceCode: "",
  memo: "",
};

export class ConfigStore {
  public userSchema: Schema<UserConfig>;
  public userStore: Store<UserConfig>;

  public sysSchema: Schema<SysConfig>;
  public sysStore: Store<SysConfig>;

  public metaSchema: Schema<metaConfig>;
  public metaStore: Store<metaConfig>;

  constructor() {
    this.userStore = new Store<UserConfig>({
      clearInvalidConfig: true,
      defaults: userDefaultValue,
      schema: this.userSchema,
      name: "serimon_userconfig",
      cwd: require("os").homedir(),
      watch: true,
    });

    this.sysStore = new Store<SysConfig>({
      clearInvalidConfig: true,
      defaults: sysDefaultValue,
      schema: this.sysSchema,
      name: "serimon_sysconfig",
      cwd: require("os").homedir(),
      watch: true,
    });

    this.metaStore = new Store<metaConfig>({
      clearInvalidConfig: true,
      defaults: metaDefaultValue,
      schema: this.metaSchema,
      name: "serimon_metaConfig",
      cwd: require("os").homedir(),
      watch: true,
    });
  }

  public getData(): UserConfig {
    let data: UserConfig = userDefaultValue;
    for (const key in userDefaultValue) {
      data[key] = this.userStore.get(key);
    }
    return data;
  }
}

export default new ConfigStore();
