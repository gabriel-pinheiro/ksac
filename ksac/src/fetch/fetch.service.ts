import { injectable } from 'inversify';
import { AuthService } from '../auth/auth.service';
import { CommandError } from '../command/command.error';
import {
    KnowledgeObject as ApiKnowledgeObject,
    KnowledgeSource as ApiKnowledgeSource,
} from 'stkai-sdk';

const debug = require('debug')('ksac:fetch:service');

@injectable()
export class FetchService {
    constructor(private readonly authService: AuthService) {}

    async fetch(slug: string): Promise<string> {
        const ks = await this.fetchKnowledgeSource(slug);
        const kos = await this.fetchKnowledgeObjects(slug);

        const kosString = kos
            .map((ko, index) => this.formatKnowledgeObject(ko, index))
            .join('');

        return this.formatKnowledgeSource(ks, kosString);
    }

    private formatKnowledgeObject(kos: ApiKnowledgeObject, index: number) {
        return `

    knowledge_object "ko-${index + 1}" {
        content = <<EOF
${kos.page_content}
EOF
    }`;
    }

    private formatKnowledgeSource(ks: ApiKnowledgeSource, kosString: string) {
        return `knowledge_source "${ks.slug}" {
    name = ${JSON.stringify(ks.name)}
    description = ${JSON.stringify(ks.description)}${kosString}
}`;
    }

    private async fetchKnowledgeSource(slug: string) {
        const stk = await this.authService.getStackSpot();
        debug(`fetching KS '${slug}'`);
        try {
            return await stk.getKnowledgeSource(slug);
        } catch (e) {
            const data = e.response?.data;
            if (data?.type === 'NotFoundError') {
                throw new CommandError(`Knowledge Source '${slug}' not found`);
            }

            if (data?.message && data?.code) {
                throw new CommandError(
                    `Failed to fetch knowledge source '${slug}', ${data.message} (${data.code})`,
                );
            }

            throw e;
        }
    }

    private async fetchKnowledgeObjects(ksSlug: string) {
        const stk = await this.authService.getStackSpot();
        debug(`fetching KOs from KS '${ksSlug}'`);
        try {
            return await stk.getKnowledgeObjects(ksSlug);
        } catch (e) {
            const data = e.response?.data;
            if (data?.message && data?.code) {
                throw new CommandError(
                    `Failed to fetch knowledge objects for knowledge source '${ksSlug}', ${data.message} (${data.code})`,
                );
            }

            throw e;
        }
    }
}
