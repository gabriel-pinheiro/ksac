import { injectable } from "inversify";
import { promises } from "fs";
import { join } from "path";
import { parse } from 'hcl-parser';
import * as Hoek from '@hapi/hoek';
import { CommandError } from "../command/command.error";
import { PreferenceService } from "../preference/preference.service";

const debug = require('debug')('ksac:definition-file:service');
const { readdir, lstat, readFile } = promises;

export type FileOrDir = {
    name: string,
    isDir: boolean,
};

export type DefinitionFile = {
    name: string,
    content: any,
};

const HCL_EXTENSION = ".hcl";

@injectable()
export class DefinitionFileService {
    constructor(
        private readonly preferenceService: PreferenceService,
    ) { }

    async parseFiles(fileNames: string[]): Promise<DefinitionFile[]> {
        const files: DefinitionFile[] = [];

        for (const name of fileNames) {
            debug(`parsing file '${name}'`);
            const content = await readFile(name)
                .catch(Hoek.ignore);
            if (!content) {
                throw new CommandError(`Failed to read file '${name}'`);
            }

            const [data, error] = parse(content.toString());
            if(error) {
                throw new CommandError(`Failed to parse file '${name}:${error.Pos.Line}:${error.Pos.Column}'`);
            }

            files.push({ name, content: data });
        }

        return files;
    }

    async getDefinitionFiles(): Promise<string[]> {
        const path = this.preferenceService.definitionsPath;
        return await this.getDefinitionFilesByPath(path);
    }

    async getDefinitionFilesByPath(path: string): Promise<string[]> {
        debug(`loading definitions from '${path}'`);
        const fileNames = await readdir(path)
            .catch(Hoek.ignore);

        if(!fileNames) {
            throw new CommandError(`Failed to load definitions from '${path}/', make sure it's a directory and your user has read permission on its files`);
        }

        const files = await this.getFilesWithStats(path, fileNames);
        const definitionFiles = this.filterDefinitionFiles(files);
        definitionFiles.forEach(f =>
            debug(`found definition file '${join(path, f.name)}'`));

        const subDirs = this.filterSubDirectories(files);
        const subDirContents = await this.getSubDirectoryContents(path, subDirs);

        const dirContents = definitionFiles
            .map(d => join(path, d.name));

        return [...dirContents, ...subDirContents];
    }

    private async getFilesWithStats(path: string, fileNames: string[]): Promise<FileOrDir[]> {
        const files: FileOrDir[] = [];
        for (const name of fileNames) {
            const stat = await lstat(join(path, name));
            const isDir = stat.isDirectory();
            files.push({ name, isDir });
        }
        return files;
    }

    private filterDefinitionFiles(files: FileOrDir[]): FileOrDir[] {
        return files
            .filter(f => !f.isDir)
            .filter(f => !f.name.startsWith('.'))
            .filter(f => f.name.endsWith(HCL_EXTENSION));
    }

    private filterSubDirectories(files: FileOrDir[]): FileOrDir[] {
        return files
            .filter(f => f.isDir)
            .filter(f => f.name !== 'node_modules')
            .filter(f => !f.name.startsWith('.'));
    }

    private async getSubDirectoryContents(path: string, subDirs: FileOrDir[]): Promise<string[]> {
        const subDirContents: string[] = [];
        for (const d of subDirs) {
            const dirContents = await this.getDefinitionFilesByPath(join(path, d.name));
            subDirContents.push(...dirContents);
        }
        return subDirContents;
    }
}
