import { isPackaged } from "electron-is-packaged";
import path from "path";

function RootPath(): string {
  if (isPackaged) {
    if (process.env.PORTABLE_EXECUTABLE_DIR == undefined) {
      if (process.platform === "linux") {
        return process.cwd();
      }
      if (process.platform === "darwin") {
        return path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(__dirname))))));
      }
    } else {
      return process.env.PORTABLE_EXECUTABLE_DIR;
    }
  } else {
    return path.dirname(path.dirname(__dirname));
  }

  return undefined;
}

export default RootPath;
