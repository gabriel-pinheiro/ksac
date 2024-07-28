import 'reflect-metadata';
import { parse } from 'hcl-parser';
import { DefinitionMapperService } from './definition-mapper.service';
import { DefinitionEnricherService } from './definition-enricher.service';
import { DefinitionValidationService } from './definition-validator.service';
import { CommandError } from '../command/command.error';

const fileFactory = (hcl: string) => ({
    name: 'file1.hcl',
    content: parse(hcl)[0],
});

describe('ksac validate - step 7: Validate Content', () => {
    let mapper: DefinitionMapperService;
    let enricher: DefinitionEnricherService;
    let service: DefinitionValidationService;

    beforeEach(() => {
        enricher = new DefinitionEnricherService();
        mapper = new DefinitionMapperService();
        service = new DefinitionValidationService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('DefinitionValidationService#validateContent', () => {
        it('should accept minimal KSs', async () => {
            const hcl = `
                knowledge_source "ks-slug-1" {
                    name = "Name 1"
                    description = "Description 1"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).not.toThrow();
        });

        it('should accept minimal KOs', async () => {
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
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).not.toThrow();
        });

        it('should accept full definitions', async () => {
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
                knowledge_source "ks-slug-2" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        language = "javascript"
                        use_cases = ["uc1", "uc2"]
                    }

                    knowledge_object "ko-slug-2" {
                        content = "content"
                        language = "javascript"
                        use_cases = ["uc1", "uc2"]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).not.toThrow();
        });

        it('should reject duplicated KSs', async () => {
            const hcl = `
                knowledge_source "ks-slug-1" {
                    name = "Name 1"
                    description = "Description 1"
                }
                knowledge_source "ks-slug-1" {
                    name = "Name 1"
                    description = "Description 1"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).toThrow(CommandError);
        });

        it('should reject duplicated KOs', async () => {
            const hcl = `
                knowledge_source "ks-slug-1" {
                    name = "Name 1"
                    description = "Description 1"

                    knowledge_object "ko-slug" {
                        content = "content"
                    }
                    knowledge_object "ko-slug" {
                        content = "content"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).toThrow(CommandError);
        });

        it('should reject invalid KS slug', async () => {
            const hcl = `
                knowledge_source "ks slug" {
                    name = "Name 1"
                    description = "Description 1"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).toThrow(CommandError);
        });

        it('should reject short KS slug', async () => {
            const hcl = `
                knowledge_source "a" {
                    name = "Name 1"
                    description = "Description 1"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).toThrow(CommandError);
        });

        it('should reject long KS slug', async () => {
            const hcl = `
                knowledge_source "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" {
                    name = "Name 1"
                    description = "Description 1"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).toThrow(CommandError);
        });

        it('should reject invalid KO slug', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name 1"
                    description = "Description 1"

                    knowledge_object "ko slug" {
                        content = "content"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).toThrow(CommandError);
        });

        it('should reject short KO slug', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name 1"
                    description = "Description 1"

                    knowledge_object "a" {
                        content = "content"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).toThrow(CommandError);
        });

        it('should reject long KO slug', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name 1"
                    description = "Description 1"

                    knowledge_object "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" {
                        content = "content"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).toThrow(CommandError);
        });

        it('should reject empty content', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name 1"
                    description = "Description 1"

                    knowledge_object "ko" {
                        content = "   "
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            expect(() => service.validateContent(definition)).toThrow(CommandError);
        });

    });
});
