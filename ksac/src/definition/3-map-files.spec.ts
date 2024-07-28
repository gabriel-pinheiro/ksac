import 'reflect-metadata';
import { parse } from 'hcl-parser';
import { DefinitionMapperService } from './definition-mapper.service';
import { RawDefinition } from './data/models';

const fileFactory = (hcl: string) => ({
    name: 'file1.hcl',
    content: parse(hcl)[0],
});

describe('ksac validate - step 3: Map Files', () => {
    let service: DefinitionMapperService;

    beforeEach(() => {
        service = new DefinitionMapperService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('DefinitionMapperService#mapFileToRawDefinition', () => {
        it('should map full KSs', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        language = "javascript"
                        use_cases = ["uc1", "uc2"]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = service.mapFileToRawDefinition(file);
            const expected: RawDefinition = {
                fileName: 'file1.hcl',
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [{
                        slug: 'ko-slug',
                        content: 'content',
                        useCases: ['uc1', 'uc2'],
                        language: 'javascript',
                    }],
                }],
            };

            expect(rawDefinition).toEqual(expected);
        });

        it('should map without KOs', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = service.mapFileToRawDefinition(file);
            const expected: RawDefinition = {
                fileName: 'file1.hcl',
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [],
                }],
            };

            expect(rawDefinition).toEqual(expected);
        });

        it('should map without use cases', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        language = "javascript"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = service.mapFileToRawDefinition(file);
            const expected: RawDefinition = {
                fileName: 'file1.hcl',
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [{
                        slug: 'ko-slug',
                        content: 'content',
                        useCases: [],
                        language: 'javascript',
                    }],
                }],
            };

            expect(rawDefinition).toEqual(expected);
        });

        it('should map without language', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        use_cases = ["uc1", "uc2"]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = service.mapFileToRawDefinition(file);
            const expected: RawDefinition = {
                fileName: 'file1.hcl',
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [{
                        slug: 'ko-slug',
                        content: 'content',
                        useCases: ['uc1', 'uc2'],
                        language: 'markdown',
                    }],
                }],
            };

            expect(rawDefinition).toEqual(expected);
        });

        it('should map KOs with only content', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = service.mapFileToRawDefinition(file);
            const expected: RawDefinition = {
                fileName: 'file1.hcl',
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [{
                        slug: 'ko-slug',
                        content: 'content',
                        useCases: [],
                        language: 'markdown',
                    }],
                }],
            };

            expect(rawDefinition).toEqual(expected);
        });

        it('should remove snake case from keys', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        use_cases = ["uc1", "uc2"]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = service.mapFileToRawDefinition(file);

            expect(rawDefinition).not.toHaveProperty('knowledge_source');
            expect(rawDefinition.knowledgeSources[0]).not.toHaveProperty('knowledge_object');
            expect(rawDefinition.knowledgeSources[0].knowledgeObjects[0]).not.toHaveProperty('use_cases');
        });

        it('should not break without content', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                    }
                }
            `;
            const file = fileFactory(hcl);
            expect(() => service.mapFileToRawDefinition(file)).not.toThrow();
        });
    });
});
