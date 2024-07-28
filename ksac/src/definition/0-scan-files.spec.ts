import 'reflect-metadata';
import { DefinitionFileService } from './definition-file.service';
import { promises } from 'fs';
import { CommandError } from '../command/command.error';
import { PreferenceService } from '../preference/preference.service';

jest.mock('fs', () => ({
    promises: {
        readdir: jest.fn(),
        lstat: jest.fn(),
        readFile: jest.fn(),
    },
}));

const { readdir, lstat } = promises;

describe('ksac validate - step 0: Scan Files', () => {
    let service: DefinitionFileService;
    let preferenceService: PreferenceService;

    beforeEach(() => {
        preferenceService = new PreferenceService();
        service = new DefinitionFileService(preferenceService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('DefinitionFileService#scanFiles', () => {
        it('should get definition files correctly', async () => {
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

            const result = await service.scanFiles();

            expect(result).toEqual([
                'file1.hcl',
                'file2.hcl',
                'dir/file3.hcl',
                'dir/sub_dir/file4.hcl'
            ]);
        });

        it('should ignore other extensions', async () => {
            const fileNames = ['file1.hcl', 'file2.txt'];

            (readdir as jest.Mock).mockResolvedValue(fileNames);
            (lstat as jest.Mock).mockResolvedValue({ isDirectory: () => false });

            const result = await service.scanFiles();

            expect(result).toEqual(['file1.hcl']);
        });

        it('should ignore hidden files', async () => {
            const fileNames = ['file1.hcl', '.file2.hcl'];

            (readdir as jest.Mock).mockResolvedValue(fileNames);
            (lstat as jest.Mock).mockResolvedValue({ isDirectory: () => false });

            const result = await service.scanFiles();

            expect(result).toEqual(['file1.hcl']);
        });

        it('should ignore hidden directories', async () => {
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

            const result = await service.scanFiles();

            expect(result).toEqual(['file1.hcl']);
        });

        it('should ignore node_modules', async () => {
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

            const result = await service.scanFiles();

            expect(result).toEqual(['file1.hcl']);
        });

        it('should throw CommandError if readdir fails', async () => {
            (readdir as jest.Mock).mockRejectedValue(new Error('Read error'));

            await expect(service.scanFiles()).rejects.toThrow(CommandError);
        });

        it('should throw CommandError if no files are found', async () => {
            (readdir as jest.Mock).mockResolvedValue([]);

            await expect(service.scanFiles()).rejects.toThrow(CommandError);
        });
    });
});
