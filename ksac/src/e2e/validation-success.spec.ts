/* eslint-disable prettier/prettier */
import 'reflect-metadata';
import 'colors';
import { Container } from 'inversify';
import { DefinitionServices } from "../definition/definition.service";
import { PreferenceService } from '../preference/preference.service';

describe('Success Scenarios', () => {
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

    it('KS without KOs', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-01',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'basic',
                name: 'Name',
                description: 'Description',
            }],
        });
    });

    it('KS with KO and content', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-02',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'cats',
                name: 'Cats',
                description: 'A knowledge source about cats',
                knowledgeObjects: [{
                    content: 'sun',
                    slug: 'george',
                    useCases: '',
                    language: 'markdown',
                }],
            }],
        });
    });

    it('KS with Ko,content and one use case', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-03',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'dogs',
                name: 'Dog',
                description: 'A knowledge source about dogs',
                knowledgeObjects: [{
                    slug: 'ko-test',
                    content: 'Content text',
                    useCases: 'Opus 1',
                    language: 'markdown',
                }],
            }],
        });
    });

    it('KS with Ko,content and 2 use cases', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-04',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'dogs',
                name: 'Dog',
                description: 'A knowledge source about dogs',
                knowledgeObjects: [{
                    slug: 'ko-test',
                    content: 'Content text',
                    useCases: 'Opus 1\nOpus 2',
                    language: 'markdown',
                }],
            }],
        });
    });

    it('KS with Ko,content and empty use case', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-05',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'dogs',
                name: 'Dog',
                description: 'A knowledge source about dogs',
                knowledgeObjects: [{
                    slug: 'ko-test',
                    content: 'Content text',
                    useCases: '',
                    language: 'markdown',
                }],
            }],
        });
    });

    it('KS with Ko,content,use case and language', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-06',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'dogs',
                name: 'Dog',
                description: 'A knowledge source about dogs',
                knowledgeObjects: [{
                    slug: 'ko-test',
                    content: 'Content text',
                    useCases: 'Empty',
                    language: 'golang',
                }],
            }],
        });
    });

    it('should accept empty files', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-07',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'basic',
                name: 'Name',
                description: 'Description',
            }],
        });
    });

    it('should import content from file with ./', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-08',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'dogs',
                name: 'Dog',
                description: 'A knowledge source about dogs',
                knowledgeObjects: [{
                    slug: 'ko-test',
                    content: 'External content text',
                    useCases: 'Empty',
                    language: 'golang',
                }],
            }],
        });
    });

    it('should import content from file without ./', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-09',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'dogs',
                name: 'Dog',
                description: 'A knowledge source about dogs',
                knowledgeObjects: [{
                    slug: 'ko-test',
                    content: 'External content text',
                    useCases: 'Empty',
                    language: 'golang',
                }],
            }],
        });
    });

    it('should import content from file relative to HCL path', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-10',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'dogs',
                name: 'Dog',
                description: 'A knowledge source about dogs',
                knowledgeObjects: [{
                    slug: 'ko-test',
                    content: 'External content text',
                    useCases: 'Empty',
                    language: 'golang',
                }],
            }],
        });
    });

    it('should trim content', async () => {
        preferenceService.setOptions({
            path: 'test/e2e/success/scenario-11',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                slug: 'dogs',
                name: 'Dog',
                description: 'A knowledge source about dogs',
                knowledgeObjects: [{
                    slug: 'ko-test-1',
                    content: 'Content text',
                    useCases: 'Empty',
                    language: 'golang',
                }, {
                    slug: 'ko-test-2',
                    content: 'External content text',
                    useCases: 'Empty',
                    language: 'golang',
                }],
            }],
        });
    });

    it('should chunk successfully', async () => {
        preferenceService.setOptions({
            chunkThreshold: 60,
            chunkSize: 50,
            path: 'test/e2e/success/scenario-12',
        });
        const definition = await service.getDefinitions();

        expect(definition).toMatchObject({
            knowledgeSources: [{
                knowledgeObjects: [{
                    content: "# Lorem ipsum dolor\n\nLorem ipsum dolor sit amet, consectetur",
                    slug: "ko-slug-chunk-0",
                    language: "markdown",
                    useCases: "",
                }, {
                    content: "adipiscing elit\nsed do eiusmod tempor incididunt ut labore",
                    slug: "ko-slug-chunk-1",
                    language: "markdown",
                    useCases: "",
                }, {
                    content: "et dolore magna\naliqua.",
                    slug: "ko-slug-chunk-2",
                    language: "markdown",
                    useCases: "",
                }]
            }]
        });
    });
});
