import 'reflect-metadata';
import { PreferenceService } from '../preference/preference.service';
import { DefinitionEnricherService } from './definition-enricher.service';
import { RawKnowledgeObject } from './data/models';

describe('Pre-chunking', () => {
    let preference: PreferenceService;
    let service: DefinitionEnricherService;

    beforeEach(() => {
        preference = new PreferenceService();
        service = new DefinitionEnricherService(preference);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('countNonSpaceChars', () => {
        it('should count non-space characters in mixed text', () => {
            const content = 'foo\n   bar\nbaz';
            const result = service['countNonSpaceChars'](content);

            expect(result).toBe(9);
        });

        it('should count non-space characters in text with only spaces', () => {
            const content = '   ';
            const result = service['countNonSpaceChars'](content);

            expect(result).toBe(0);
        });

        it('should count non-space chars in dense text', () => {
            const content = 'abc';
            const result = service['countNonSpaceChars'](content);

            expect(result).toBe(3);
        });

        it('should count non-space chars in empty text', () => {
            const content = '';
            const result = service['countNonSpaceChars'](content);

            expect(result).toBe(0);
        });
    });

    describe('createKnowledgeObject', () => {
        it('should create with one chunk', () => {
            const content = 'foo bar';
            const language = 'javascript';
            const rawDefinition: RawKnowledgeObject = {
                slug: 'ko-slug',
                useCases: [],
                language,
                content,
            };
            const result = service['createKnowledgeObject'](
                rawDefinition,
                content,
                0,
                1,
            );

            expect(result).toMatchObject({
                content,
                slug: 'ko-slug',
                language,
                useCases: '',
            });
        });

        it('should create with multiple chunks', () => {
            const content = 'foo bar';
            const language = 'javascript';
            const rawDefinition: RawKnowledgeObject = {
                slug: 'ko-slug',
                useCases: [],
                language,
                content,
            };
            const result = service['createKnowledgeObject'](
                rawDefinition,
                content,
                0,
                2,
            );

            expect(result).toMatchObject({
                content,
                slug: 'ko-slug-chunk-0',
                language,
                useCases: '',
            });
        });
    });

    describe('chunkContent', () => {
        it('should not chunk when below threshold', () => {
            preference.setOptions({ chunkThreshold: 10 });
            const content = 'foo  bar  baz';
            const result = service['chunkContent'](content);

            expect(result).toEqual([content]);
        });

        it('should chunk when above threshold', () => {
            preference.setOptions({ chunkThreshold: 5, chunkSize: 4 });
            const content = 'foo bar baz';
            const result = service['chunkContent'](content);

            expect(result).toEqual(['foo b', 'ar ba', 'z']);
        });

        it('should trim chunks', () => {
            preference.setOptions({ chunkThreshold: 5, chunkSize: 3 });
            const content = 'foo bar baz';
            const result = service['chunkContent'](content);

            expect(result).toEqual(['foo', 'bar', 'baz']);
        });
    });
});
