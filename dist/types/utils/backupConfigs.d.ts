export declare type BackupConfigsExclude = string | {
    regexp: string;
};
export declare type BackupConfigsSave = {
    filename: string;
    path: string;
    frequency: 'everytime' | 'minutely' | 'hourly' | 'daily' | 'monthly' | 'yearly';
};
export interface BackupConfigs {
    base: string;
    excludes: BackupConfigsExclude[];
    includes: string[];
    saves: BackupConfigsSave[];
}
export declare const backupConfigs: () => Promise<void | BackupConfigs>;
