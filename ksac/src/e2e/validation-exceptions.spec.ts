import 'reflect-metadata';
import 'colors';
import { Container } from 'inversify';
import { DefinitionServices } from "../definition/definition.service";
import { PreferenceService } from '../preference/preference.service';

describe('Exceptions Scenarios', () => {
    let service: DefinitionServices;
    let preferenceService: PreferenceService;

    beforeEach(() => {
        const container = new Container({
            autoBindInjectable: true,
            defaultScope: 'Singleton',
        });

        service = container
            .resolve<DefinitionServices>(DefinitionServices);
        preferenceService = container
            .resolve<PreferenceService>(PreferenceService);
    });

    it('should not accept KS without name', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-01',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('"knowledgeSources[0].name" is required');
    });

    it('should not accept KS without description', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-02',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('"knowledgeSources[0].description" is required');
    });

    it('should not accept KS write wrong', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-03',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('contains invalid keys: knowledge_sorce');
    });

    it('should not accept KS without slug', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-04',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('contains an invalid Knowledge Source. Make sure it has a slug');
    });

    it('should not accept KS with upercase slug', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-05',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('\'Basic\' is an invalid slug');
    });

    it('should not accept KS with space', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-06',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('\'basic name\' is an invalid slug');
    });

    it('should not accept KS with short slug', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-07',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('\'b\' is too short');
    });

    it('should not accept KS with long slug', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-08',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('\'testestestestestestestestestestestestes\' is too long');
    });

    it('should not accept KO write wrong', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-09',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('"knowledgeSources[0].knowledge_oject" is not allowed');
    });

    it('should not accept KO without slug', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-10',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('contains an invalid Knowledge Object. Make sure it has a slug');
    });

    it('should not accept KO without content', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-11',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('"knowledgeSources[0].knowledgeObjects[0]" must contain at least one of [content, importFile]');
    });

    it('should not accept KO with empty content', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-12',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('"knowledgeSources[0].knowledgeObjects[0].content" is not allowed to be empty');
    });

    it('should not accept KO with both content and import_file', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-13',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow('"knowledgeSources[0].knowledgeObjects[0]" contains a conflict between exclusive peers [content, importFile]');
    });

    it('should not accept import_files for a path that doesnt exist', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-14',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow("no such file or directory, open 'test/e2e/exceptions/scenario-14/file.txt'");
    });

    it('should not accept whitespace content', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-15',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow("has no content");
    });

    it('should not accept whitespace content from imported file', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/exceptions/scenario-16',
        });
        const definitionPromise = service.getDefinitions();
        await expect(definitionPromise).rejects
            .toThrow("has no content");
    });
});
