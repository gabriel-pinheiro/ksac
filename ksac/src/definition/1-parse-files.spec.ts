import 'reflect-metadata';
import { DefinitionFileService } from './definition-file.service';
import { promises } from 'fs';
import { parse } from 'hcl-parser';
import { CommandError } from '../command/command.error';
import { PreferenceService } from '../preference/preference.service';

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
    },
}));

jest.mock('hcl-parser', () => ({
    parse: jest.fn(),
}));

const { readFile } = promises;

describe('ksac validate - step 1: Parse Files', () => {
    let service: DefinitionFileService;
    let preferenceService: PreferenceService;

    beforeEach(() => {
        preferenceService = new PreferenceService();
        service = new DefinitionFileService(preferenceService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('DefinitionFileService#parseFiles', () => {
        it('should parse files correctly', async () => {
            const fileName = 'file1.hcl';
            const fileContent = 'content';
            const parsedData = { key: 'value' };

            (readFile as jest.Mock).mockResolvedValue(fileContent);
            (parse as jest.Mock).mockReturnValue([parsedData, null]);

            const result = await service.parseFiles([fileName]);

            expect(result[0]).toEqual({ name: 'file1.hcl', content: parsedData });
        });

        it('should throw CommandError if file reading fails', async () => {
            const fileName = 'file1.hcl';

            (readFile as jest.Mock).mockRejectedValue(new Error('Read error'));

            await expect(service.parseFiles([fileName])).rejects.toThrow(CommandError);
        });

        it('should throw CommandError if file parsing fails', async () => {
            const fileName = 'file1.hcl';
            const fileContent = 'content';
            const parseError = { Pos: { Line: 1, Column: 1 } };

            (readFile as jest.Mock).mockResolvedValue(fileContent);
            (parse as jest.Mock).mockReturnValue([null, parseError]);

            await expect(service.parseFiles([fileName])).rejects.toThrow(CommandError);
        });
    });
});
