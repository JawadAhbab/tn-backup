import { BackupConfigs } from './backupConfigs';
declare type Item = {
    directory: boolean;
    fullpath: string;
    relfolder: string;
};
export declare const backupFileLister: (config: BackupConfigs) => Item[];
export {};
