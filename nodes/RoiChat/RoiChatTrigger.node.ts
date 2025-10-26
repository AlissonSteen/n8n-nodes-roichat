import type {
        IHookFunctions,
        INodeType,
        INodeTypeDescription,
        IWebhookFunctions,
        IWebhookResponseData,
} from 'n8n-workflow';

export class RoiChatTrigger implements INodeType {
        description: INodeTypeDescription = {
                displayName: 'Requisicao Externa RoiChat Trigger',
                name: 'roiChatTrigger',
                icon: 'file:roichat.svg',
                group: ['trigger'],
                version: 1,
                description: 'Recebe requisições externas do RoiChat via webhook',
                defaults: {
                        name: 'Requisicao Externa RoiChat Trigger',
                },
                inputs: [],
                outputs: ['main'],
                credentials: [],
                usableAsTool: true,
                webhooks: [
                        {
                                name: 'default',
                                httpMethod: '={{$parameter["httpMethod"]}}',
                                responseMode: '={{$parameter["responseMode"]}}',
                                path: '={{$parameter["path"]}}',
                        },
                ],
                properties: [
                        {
                                displayName: 'HTTP Method',
                                name: 'httpMethod',
                                type: 'options',
                                options: [
                                        {
                                                name: 'DELETE',
                                                value: 'DELETE',
                                        },
                                        {
                                                name: 'GET',
                                                value: 'GET',
                                        },
                                        {
                                                name: 'HEAD',
                                                value: 'HEAD',
                                        },
                                        {
                                                name: 'PATCH',
                                                value: 'PATCH',
                                        },
                                        {
                                                name: 'POST',
                                                value: 'POST',
                                        },
                                        {
                                                name: 'PUT',
                                                value: 'PUT',
                                        },
                                ],
                                default: 'POST',
                                description: 'O método HTTP a ser usado',
                        },
                        {
                                displayName: 'Path',
                                name: 'path',
                                type: 'string',
                                default: 'webhook',
                                required: true,
                                description: 'O caminho para escutar as requisições',
                        },
                        {
                                displayName: 'Authentication',
                                name: 'authentication',
                                type: 'options',
                                options: [
                                        {
                                                name: 'None',
                                                value: 'none',
                                        },
                                ],
                                default: 'none',
                                description: 'Método de autenticação a ser usado',
                        },
                        {
                                displayName: 'Respond',
                                name: 'responseMode',
                                type: 'options',
                                options: [
                                        {
                                                name: 'Immediately',
                                                value: 'onReceived',
                                                description: 'Responde assim que o webhook é recebido',
                                        },
                                        {
                                                name: 'When Last Node Finishes',
                                                value: 'lastNode',
                                                description: 'Responde quando o último node do workflow terminar',
                                        },
                                        {
                                                name: 'Using Respond to Webhook Node',
                                                value: 'responseNode',
                                                description: 'Responde usando o node "Respond to Webhook"',
                                        },
                                ],
                                default: 'onReceived',
                                description: 'Quando responder à requisição',
                        },
                        {
                                displayName: 'Response Code',
                                name: 'responseCode',
                                type: 'number',
                                displayOptions: {
                                        hide: {
                                                responseMode: ['responseNode'],
                                        },
                                },
                                typeOptions: {
                                        minValue: 100,
                                        maxValue: 599,
                                },
                                default: 200,
                                description: 'Código de status HTTP da resposta',
                        },
                        {
                                displayName: 'Response Data',
                                name: 'responseData',
                                type: 'string',
                                displayOptions: {
                                        show: {
                                                responseMode: ['lastNode'],
                                        },
                                },
                                default: 'firstEntryJson',
                                description: 'Dados a serem retornados',
                                options: [
                                        {
                                                name: 'All Entries',
                                                value: 'allEntries',
                                                description: 'Retorna todos os itens de entrada',
                                        },
                                        {
                                                name: 'First Entry JSON',
                                                value: 'firstEntryJson',
                                                description: 'Retorna o JSON da primeira entrada',
                                        },
                                        {
                                                name: 'First Entry Binary',
                                                value: 'firstEntryBinary',
                                                description: 'Retorna os dados binários da primeira entrada',
                                        },
                                        {
                                                name: 'No Response Body',
                                                value: 'noData',
                                                description: 'Não retorna dados no corpo da resposta',
                                        },
                                ],
                        },
                        {
                                displayName: 'Options',
                                name: 'options',
                                type: 'collection',
                                placeholder: 'Add Option',
                                default: {},
                                options: [
                                        {
                                                displayName: 'Binary Property',
                                                name: 'binaryPropertyName',
                                                type: 'string',
                                                default: 'data',
                                                description: 'Nome da propriedade binária a ser retornada',
                                                displayOptions: {
                                                        show: {
                                                                '/responseData': ['firstEntryBinary'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Response Headers',
                                                name: 'responseHeaders',
                                                placeholder: 'Add Response Header',
                                                description: 'Adiciona cabeçalhos à resposta',
                                                type: 'fixedCollection',
                                                typeOptions: {
                                                        multipleValues: true,
                                                },
                                                default: {},
                                                options: [
                                                        {
                                                                displayName: 'Entries',
                                                                name: 'entries',
                                                                values: [
                                                                        {
                                                                                displayName: 'Name',
                                                                                name: 'name',
                                                                                type: 'string',
                                                                                default: '',
                                                                                description: 'Nome do cabeçalho',
                                                                        },
                                                                        {
                                                                                displayName: 'Value',
                                                                                name: 'value',
                                                                                type: 'string',
                                                                                default: '',
                                                                                description: 'Valor do cabeçalho',
                                                                        },
                                                                ],
                                                        },
                                                ],
                                        },
                                ],
                        },
                ],
        };

        webhookMethods = {
                default: {
                        async checkExists(this: IHookFunctions): Promise<boolean> {
                                return true;
                        },
                        async create(this: IHookFunctions): Promise<boolean> {
                                return true;
                        },
                        async delete(this: IHookFunctions): Promise<boolean> {
                                return true;
                        },
                },
        };

        async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
                const req = this.getRequestObject();
                const res = this.getResponseObject();
                const responseCode = this.getNodeParameter('responseCode', 200) as number;
                const options = this.getNodeParameter('options', {}) as {
                        responseHeaders?: {
                                entries?: Array<{ name: string; value: string }>;
                        };
                };

                // Preparar dados do webhook
                const webhookData = {
                        body: req.body || {},
                        headers: req.headers || {},
                        query: req.query || {},
                };

                // Adicionar cabeçalhos de resposta customizados
                if (options.responseHeaders?.entries) {
                        for (const header of options.responseHeaders.entries) {
                                res.setHeader(header.name, header.value);
                        }
                }

                // Definir código de status
                res.status(responseCode);

                return {
                        workflowData: [this.helpers.returnJsonArray(webhookData)],
                };
        }
}
