import { injectable } from 'inversify';

const DEFAULT_DEFINITIONS_PATH = '.';
const DEFAULT_CHUNK_THRESHOLD = 2000;
const DEFAULT_CHUNK_SIZE = 1700;

@injectable()
export class PreferenceService {
    private _definitionsPath = DEFAULT_DEFINITIONS_PATH;
    private _chunkThreshold = DEFAULT_CHUNK_THRESHOLD;
    private _chunkSize = DEFAULT_CHUNK_SIZE;

    setOptions(options: any) {
        if (options.path) {
            this._definitionsPath = options.path;
        }

        if (options.chunkThreshold) {
            this._chunkThreshold = options.chunkThreshold;
        }

        if (options.chunkSize) {
            this._chunkSize = options.chunkSize;
        }
    }

    get definitionsPath() {
        return this._definitionsPath;
    }

    get chunkThreshold() {
        return this._chunkThreshold;
    }

    get chunkSize() {
        return this._chunkSize;
    }
}
