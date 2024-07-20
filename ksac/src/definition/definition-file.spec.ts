import 'reflect-metadata';
import { DefinitionFileService } from './definition-file.service';
import { promises } from 'fs';
import { parse } from 'hcl-parser';
import { CommandError } from '../command/command.error';

jest.mock('fs', () => ({
    promises: {
        readdir: jest.fn(),
        lstat: jest.fn(),
        readFile: jest.fn(),
    },
}));

jest.mock('hcl-parser', () => ({
    parse: jest.fn(),
}));

jest.mock('@hapi/hoek', () => ({
    ignore: jest.fn(),
}));

const { readdir, lstat, readFile } = promises;

describe('DefinitionFileService', () => {
    let service: DefinitionFileService;

    beforeEach(() => {
        service = new DefinitionFileService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('parseFiles', () => {
        it('should parse files correctly', async () => {
            const fileNames = ['file1.hcl', 'file2.hcl'];
            const fileContent = 'content';
            const parsedData = { key: 'value' };

            (readFile as jest.Mock).mockResolvedValue(fileContent);
            (parse as jest.Mock).mockReturnValue([parsedData, null]);

            const result = await service.parseFiles(fileNames);

            expect(result).toEqual([
                { name: 'file1.hcl', content: parsedData },
                { name: 'file2.hcl', content: parsedData },
            ]);
        });

        it('should throw CommandError if file reading fails', async () => {
            const fileNames = ['file1.hcl'];

            (readFile as jest.Mock).mockRejectedValue(new Error('Read error'));

            await expect(service.parseFiles(fileNames)).rejects.toThrow(CommandError);
        });

        it('should throw CommandError if file parsing fails', async () => {
            const fileNames = ['file1.hcl'];
            const fileContent = 'content';
            const parseError = { Pos: { Line: 1, Column: 1 } };

            (readFile as jest.Mock).mockResolvedValue(fileContent);
            (parse as jest.Mock).mockReturnValue([null, parseError]);

            await expect(service.parseFiles(fileNames)).rejects.toThrow(CommandError);
        });
    });

    describe('getDefinitionFiles', () => {
        it('should get definition files correctly', async () => {
            const path = '.';
            const rootFileNames = ['file1.hcl', 'file2.hcl', 'dir'];
            const dirFileNames = ['file3.hcl', 'sub_dir'];
            const subDirFileNames = ['file4.hcl'];

            (readdir as jest.Mock).mockImplementation(async (path: string) => {
                if (path === '.') return rootFileNames;
                if (path === 'dir') return dirFileNames;
                if (path === 'dir/sub_dir') return subDirFileNames;
            });
            (lstat as jest.Mock).mockImplementation(async (path: string) => {
                const isDir = path === 'dir' || path === 'dir/sub_dir';
                return { isDirectory: () => isDir } as any;
            });

            const result = await service.getDefinitionFiles(path);

            expect(result).toEqual([
                'file1.hcl',
                'file2.hcl',
                'dir/file3.hcl',
                'dir/sub_dir/file4.hcl'
            ]);
        });

        it('should ignore other extensions', async () => {
            const path = '.';
            const fileNames = ['file1.hcl', 'file2.txt'];

            (readdir as jest.Mock).mockResolvedValue(fileNames);
            (lstat as jest.Mock).mockResolvedValue({ isDirectory: () => false });

            const result = await service.getDefinitionFiles(path);

            expect(result).toEqual(['file1.hcl']);
        });

        it('should ignore hidden files', async () => {
            const path = '.';
            const fileNames = ['file1.hcl', '.file2.hcl'];

            (readdir as jest.Mock).mockResolvedValue(fileNames);
            (lstat as jest.Mock).mockResolvedValue({ isDirectory: () => false });

            const result = await service.getDefinitionFiles(path);

            expect(result).toEqual(['file1.hcl']);
        });

        it('should ignore hidden directories', async () => {
            const path = '.';
            const rootFileNames = ['file1.hcl', '.dir'];
            const dirFileNames = ['file2.hcl'];

            (readdir as jest.Mock).mockImplementation(async (path: string) => {
                if (path === '.') return rootFileNames;
                if (path === '.dir') return dirFileNames;
            });
            (lstat as jest.Mock).mockImplementation(async (path: string) => {
                const isDir = path === '.dir';
                return { isDirectory: () => isDir } as any;
            });

            const result = await service.getDefinitionFiles(path);

            expect(result).toEqual(['file1.hcl']);
        });

        it('should ignore node_modules', async () => {
            const path = '.';
            const rootFileNames = ['file1.hcl', 'node_modules'];
            const dirFileNames = ['file2.hcl'];

            (readdir as jest.Mock).mockImplementation(async (path: string) => {
                if (path === '.') return rootFileNames;
                if (path === 'node_modules') return dirFileNames;
            });
            (lstat as jest.Mock).mockImplementation(async (path: string) => {
                const isDir = path === 'node_modules';
                return { isDirectory: () => isDir } as any;
            });

            const result = await service.getDefinitionFiles(path);

            expect(result).toEqual(['file1.hcl']);
        });

        it('should throw CommandError if readdir fails', async () => {
            const path = '.';

            (readdir as jest.Mock).mockRejectedValue(new Error('Read error'));

            await expect(service.getDefinitionFiles(path)).rejects.toThrow(CommandError);
        });
    });
});
