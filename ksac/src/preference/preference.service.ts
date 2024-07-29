import { injectable } from 'inversify';

const DEFAULT_DEFINITIONS_PATH = '.';

@injectable()
export class PreferenceService {
    private _definitionsPath = DEFAULT_DEFINITIONS_PATH;

    setOptions(options: any) {
        if (options.path) {
            this._definitionsPath = options.path;
        }
    }

    get definitionsPath() {
        return this._definitionsPath;
    }
}
