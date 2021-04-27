export type UserConfig = {
  fontSize: number;
  rowHeight: number;
  fontFamily: string;
  maxLineNum: number;
  asciiMode: boolean;
  darkMode: boolean;
  asciiMaxWidth: number;
};

export type metaConfig = {
  user: string;
  date: string;
  location: string;
  expName: string;
  expDescription: string;
  deviceCode: string;
  memo: string;
};

export type SysConfig = {
  baudrate: number;
};
