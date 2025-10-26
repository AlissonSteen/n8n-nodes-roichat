import {
        IExecuteFunctions,
        ILoadOptionsFunctions,
        INodeExecutionData,
        INodePropertyOptions,
        INodeType,
        INodeTypeDescription,
        IDataObject,
        NodeOperationError,
} from 'n8n-workflow';

export class RoiChat implements INodeType {
        description: INodeTypeDescription = {
                displayName: 'RoiChat',
                name: 'roiChat',
                icon: 'file:roichat.svg',
                group: ['transform'],
                version: 1,
                subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
                description: 'Integração com a API do RoiChat',
                defaults: {
                        name: 'RoiChat',
                },
                inputs: ['main'],
                outputs: ['main'],
                credentials: [
                        {
                                name: 'roiChatApi',
                                required: true,
                        },
                ],
                usableAsTool: true,
                properties: [
                        {
                                displayName: 'Recurso',
                                name: 'resource',
                                type: 'options',
                                noDataExpression: true,
                                options: [
                                        {
                                                name: 'Campo Personalizado',
                                                value: 'customField',
                                                description: 'Operações com campos personalizados',
                                        },
                                        {
                                                name: 'Contato',
                                                value: 'subscriber',
                                                description: 'Operações com contatos (assinantes)',
                                        },
                                        {
                                                name: 'Disparo',
                                                value: 'broadcast',
                                                description: 'Disparos em massa',
                                        },
                                        {
                                                name: 'Fluxo',
                                                value: 'flow',
                                                description: 'Enviar fluxos para contatos',
                                        },
                                        {
                                                name: 'LiveChat',
                                                value: 'conversation',
                                                description: 'Histórico de conversas',
                                        },
                                        {
                                                name: 'Tag',
                                                value: 'tag',
                                                description: 'Operações com tags',
                                        },
                                        {
                                                name: 'WhatsApp Template',
                                                value: 'whatsappTemplate',
                                                description: 'Templates do WhatsApp',
                                        },
                                ],
                                default: 'subscriber',
                        },

                        // ===============================
                        // SUBSCRIBER OPERATIONS
                        // ===============================
                        {
                                displayName: 'Operação',
                                name: 'operation',
                                type: 'options',
                                noDataExpression: true,
                                displayOptions: {
                                        show: {
                                                resource: ['subscriber'],
                                        },
                                },
                                options: [
                                        {
                                                name: 'Atualizar',
                                                value: 'update',
                                                description: 'Atualizar dados de um contato',
                                                action: 'Atualizar contato',
                                        },
                                        {
                                                name: 'Buscar Contatos',
                                                value: 'search',
                                                description: 'Buscar contatos com filtros avançados',
                                                action: 'Buscar contatos',
                                        },
                                        {
                                                name: 'Criar',
                                                value: 'create',
                                                description: 'Criar um novo contato',
                                                action: 'Criar contato',
                                        },
                                        {
                                                name: 'Deletar',
                                                value: 'delete',
                                                description: 'Deletar um contato',
                                                action: 'Deletar contato',
                                        },
                                        {
                                                name: 'Obter Por ID',
                                                value: 'get',
                                                description: 'Buscar um contato específico pelo ID',
                                                action: 'Buscar contato por ID',
                                        },
                                ],
                                default: 'create',
                        },

                        // Subscriber: user_ns (for get, update, delete)
                        {
                                displayName: 'User NS',
                                name: 'userNs',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['subscriber'],
                                                operation: ['get', 'update', 'delete'],
                                        },
                                },
                                default: '',
                                description: 'Identificador único do contato (user_ns)',
                        },

                        // Subscriber: Create fields
                        {
                                displayName: 'Primeiro Nome',
                                name: 'firstName',
                                type: 'string',
                                displayOptions: {
                                        show: {
                                                resource: ['subscriber'],
                                                operation: ['create'],
                                        },
                                },
                                default: '',
                                description: 'Primeiro nome do contato',
                        },
                        {
                                displayName: 'Sobrenome',
                                name: 'lastName',
                                type: 'string',
                                displayOptions: {
                                        show: {
                                                resource: ['subscriber'],
                                                operation: ['create'],
                                        },
                                },
                                default: '',
                                description: 'Sobrenome do contato',
                        },
                        {
                                displayName: 'Email',
                                name: 'email',
                                type: 'string',
                                placeholder: 'nome@email.com',
                                displayOptions: {
                                        show: {
                                                resource: ['subscriber'],
                                                operation: ['create'],
                                        },
                                },
                                default: '',
                                description: 'Email do contato',
                        },
                        {
                                displayName: 'Telefone',
                                name: 'phone',
                                type: 'string',
                                displayOptions: {
                                        show: {
                                                resource: ['subscriber'],
                                                operation: ['create'],
                                        },
                                },
                                default: '',
                                description: 'Telefone do contato',
                        },

                        // Subscriber: Update fields
                        {
                                displayName: 'Update Fields',
                                name: 'updateFields',
                                type: 'collection',
                                placeholder: 'Adicionar Campo',
                                default: {},
                                displayOptions: {
                                        show: {
                                                resource: ['subscriber'],
                                                operation: ['update'],
                                        },
                                },
                                options: [
                                        {
                                                displayName: 'Primeiro Nome',
                                                name: 'first_name',
                                                type: 'string',
                                                default: '',
                                        },
                                        {
                                                displayName: 'Sobrenome',
                                                name: 'last_name',
                                                type: 'string',
                                                default: '',
                                        },
                                        {
                                                displayName: 'Email',
                                                name: 'email',
                                                type: 'string',
                                                placeholder: 'nome@email.com',
                                                default: '',
                                                description: 'Endereço de email',
                                        },
                                        {
                                                displayName: 'Telefone',
                                                name: 'phone',
                                                type: 'string',
                                                default: '',
                                                description: 'Número de telefone',
                                        },
                                ],
                        },

                        // Subscriber: Search filters
                        {
                                displayName: 'Filtros',
                                name: 'filters',
                                type: 'collection',
                                placeholder: 'Adicionar Filtro',
                                default: {},
                                displayOptions: {
                                        show: {
                                                resource: ['subscriber'],
                                                operation: ['search'],
                                        },
                                },
                                options: [
                                        {
                                                displayName: 'Bot Interagiu Nas Últimas 24h',
                                                name: 'is_bot_interacted_in_last_24h',
                                                type: 'options',
                                                options: [
                                                        { name: 'Sim', value: 'yes' },
                                                        { name: 'Não', value: 'no' },
                                                ],
                                                default: 'yes',
                                                description: 'Bot interagiu com o contato nas últimas 24 horas',
                                        },
                                        {
                                                displayName: 'Campo Customizado NS',
                                                name: 'user_field_ns',
                                                type: 'string',
                                                default: '',
                                                description: 'Filtrar por campo customizado (user_field_ns)',
                                        },
                                        {
                                                displayName: 'Canal',
                                                name: 'is_channel',
                                                type: 'options',
                                                options: [
                                                        { name: 'API Chat', value: 'apichat' },
                                                        { name: 'Facebook', value: 'facebook' },
                                                        { name: 'Google', value: 'google' },
                                                        { name: 'Instagram', value: 'instagram' },
                                                        { name: 'LINE', value: 'line' },
                                                        { name: 'Telegram', value: 'telegram' },
                                                        { name: 'Viber', value: 'viber' },
                                                        { name: 'VK', value: 'vk' },
                                                        { name: 'Web', value: 'web' },
                                                        { name: 'WeChat', value: 'wechat' },
                                                        { name: 'WhatsApp', value: 'whatsapp' },
                                                        { name: 'WhatsApp Cloud', value: 'whatsapp_cloud' },
                                                ],
                                                default: 'apichat',
                                                description: 'Filtrar por canal de origem',
                                        },
                                        {
                                                displayName: 'Email',
                                                name: 'email',
                                                type: 'string',
                                                placeholder: 'name@email.com',
                                                default: '',
                                                description: 'Buscar por email',
                                        },
                                        {
                                                displayName: 'Event NS',
                                                name: 'event_ns',
                                                type: 'string',
                                                default: '',
                                                description: 'Filtrar por evento customizado (event_ns)',
                                        },
                                        {
                                                displayName: 'Interagiu Nas Últimas 24h',
                                                name: 'is_interacted_in_last_24h',
                                                type: 'options',
                                                options: [
                                                        { name: 'Sim', value: 'yes' },
                                                        { name: 'Não', value: 'no' },
                                                ],
                                                default: 'yes',
                                                description: 'Contato interagiu nas últimas 24 horas',
                                        },
                                        {
                                                displayName: 'Label ID',
                                                name: 'label_id',
                                                type: 'number',
                                                default: 0,
                                                description: 'Filtrar por ID da label',
                                        },
                                        {
                                                displayName: 'Limite',
                                                name: 'limit',
                                                type: 'number',
                                                typeOptions: {
                                                        minValue: 1,
                                                        maxValue: 100,
                                                },
                                                default: 50,
                                                description: 'Max number of results to return',
                                        },
                                        {
                                                displayName: 'Nome',
                                                name: 'name',
                                                type: 'string',
                                                default: '',
                                                description: 'Buscar por nome',
                                        },
                                        {
                                                displayName: 'Opt-in Email',
                                                name: 'is_opt_in_email',
                                                type: 'options',
                                                options: [
                                                        { name: 'Sim', value: 'yes' },
                                                        { name: 'Não', value: 'no' },
                                                ],
                                                default: 'yes',
                                                description: 'Contato aceitou receber emails',
                                        },
                                        {
                                                displayName: 'Opt-in SMS',
                                                name: 'is_opt_in_sms',
                                                type: 'options',
                                                options: [
                                                        { name: 'Sim', value: 'yes' },
                                                        { name: 'Não', value: 'no' },
                                                ],
                                                default: 'yes',
                                                description: 'Contato aceitou receber SMS',
                                        },
                                        {
                                                displayName: 'Página',
                                                name: 'page',
                                                type: 'number',
                                                typeOptions: {
                                                        minValue: 1,
                                                        maxValue: 1000,
                                                },
                                                default: 1,
                                                description: 'Número da página (1-1000)',
                                        },
                                        {
                                                displayName: 'Tag NS',
                                                name: 'tag_ns',
                                                type: 'string',
                                                default: '',
                                                description: 'Filtrar por tag (tag_ns)',
                                        },
                                        {
                                                displayName: 'Telefone',
                                                name: 'phone',
                                                type: 'string',
                                                default: '',
                                                description: 'Buscar por telefone',
                                        },
                                        {
                                                displayName: 'Última Mensagem Nas Últimas 24h',
                                                name: 'is_last_message_in_last_24h',
                                                type: 'options',
                                                options: [
                                                        { name: 'Sim', value: 'yes' },
                                                        { name: 'Não', value: 'no' },
                                                ],
                                                default: 'yes',
                                                description: 'Última mensagem foi nas últimas 24 horas',
                                        },
                                        {
                                                displayName: 'Valor Do Campo Customizado',
                                                name: 'user_field_value',
                                                type: 'string',
                                                default: '',
                                                description: 'Valor do campo customizado especificado em "Campo Customizado NS"',
                                        },
                                ],
                        },

                        // ===============================
                        // TAG OPERATIONS
                        // ===============================
                        {
                                displayName: 'Operação',
                                name: 'operation',
                                type: 'options',
                                noDataExpression: true,
                                displayOptions: {
                                        show: {
                                                resource: ['tag'],
                                        },
                                },
                                options: [
                                        {
                                                name: 'Adicionar Ao Contato',
                                                value: 'addToSubscriber',
                                                description: 'Adicionar uma tag a um contato',
                                                action: 'Adicionar tag ao contato',
                                        },
                                        {
                                                name: 'Adicionar Multiplas Tags',
                                                value: 'addMultipleTags',
                                                description: 'Adicionar múltiplas tags a um contato (até 20)',
                                                action: 'Adicionar multiplas tags',
                                        },
                                        {
                                                name: 'Criar',
                                                value: 'create',
                                                description: 'Criar uma nova tag',
                                                action: 'Criar tag',
                                        },
                                        {
                                                name: 'Deletar',
                                                value: 'delete',
                                                description: 'Deletar uma tag',
                                                action: 'Deletar tag',
                                        },
                                        {
                                                name: 'Listar',
                                                value: 'getMany',
                                                description: 'Listar todas as tags',
                                                action: 'Listar tags',
                                        },
                                        {
                                                name: 'Remover Do Contato',
                                                value: 'removeFromSubscriber',
                                                description: 'Remover uma tag de um contato',
                                                action: 'Remover tag do contato',
                                        },
                                        {
                                                name: 'Remover Multiplas Tags',
                                                value: 'removeMultipleTags',
                                                description: 'Remover múltiplas tags de um contato (até 20)',
                                                action: 'Remover multiplas tags',
                                        },
                                ],
                                default: 'addToSubscriber',
                        },

                        // Tag: user_ns (for single add/remove operations)
                        {
                                displayName: 'User NS',
                                name: 'userNs',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['tag'],
                                                operation: [
                                                        'addToSubscriber',
                                                        'removeFromSubscriber',
                                                ],
                                        },
                                },
                                default: '',
                                description: 'Identificador único do contato (user_ns)',
                        },

                        // Tag: user_ns (for multiple tags operations)
                        {
                                displayName: 'User NS',
                                name: 'userNs',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['tag'],
                                                operation: [
                                                        'addMultipleTags',
                                                        'removeMultipleTags',
                                                ],
                                        },
                                },
                                default: '',
                                description: 'Identificador único do contato (user_ns)',
                        },

                        // Tag: single tag name
                        {
                                displayName: 'Nome Da Tag',
                                name: 'tagName',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['tag'],
                                                operation: [
                                                        'addToSubscriber',
                                                        'removeFromSubscriber',
                                                        'create',
                                                        'delete',
                                                ],
                                        },
                                },
                                default: '',
                        },

                        // Tag: multiple tags
                        {
                                displayName: 'Tags',
                                name: 'tagsUi',
                                type: 'fixedCollection',
                                typeOptions: {
                                        multipleValues: true,
                                },
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['tag'],
                                                operation: ['addMultipleTags', 'removeMultipleTags'],
                                        },
                                },
                                default: {},
                                placeholder: 'Adicionar Tag',
                                description: 'Lista de tags (até 20)',
                                options: [
                                        {
                                                name: 'tagValues',
                                                displayName: 'Tag',
                                                values: [
                                                        {
                                                                displayName: 'Nome Da Tag',
                                                                name: 'tagName',
                                                                type: 'string',
                                                                default: '',
                                                        },
                                                ],
                                        },
                                ],
                        },

                        // Tag: GetMany options
                        {
                                displayName: 'Opções',
                                name: 'options',
                                type: 'collection',
                                placeholder: 'Adicionar Opção',
                                default: {},
                                displayOptions: {
                                        show: {
                                                resource: ['tag'],
                                                operation: ['getMany'],
                                        },
                                },
                                options: [
                                        {
                                                displayName: 'Limite',
                                                name: 'limit',
                                                type: 'number',
                                                typeOptions: {
                                                        minValue: 1,
                                                },
                                                description: 'Max number of results to return',
                                                default: 50,
                                        },
                                        {
                                                displayName: 'Nome',
                                                name: 'name',
                                                type: 'string',
                                                default: '',
                                                description: 'Buscar por nome da tag',
                                        },
                                        {
                                                displayName: 'Página',
                                                name: 'page',
                                                type: 'number',
                                                default: 1,
                                                description: 'Número da página',
                                        },
                                ],
                        },

                        // ===============================
                        // CUSTOM FIELD OPERATIONS
                        // ===============================
                        {
                                displayName: 'Operação',
                                name: 'operation',
                                type: 'options',
                                noDataExpression: true,
                                displayOptions: {
                                        show: {
                                                resource: ['customField'],
                                        },
                                },
                                options: [
                                        {
                                                name: 'Definir Multiplos Campos',
                                                value: 'setMultipleFields',
                                                description: 'Definir valores de múltiplos campos (até 20)',
                                                action: 'Definir multiplos campos',
                                        },
                                        {
                                                name: 'Definir Valor',
                                                value: 'setFieldValue',
                                                description: 'Definir valor de um campo personalizado',
                                                action: 'Definir valor do campo',
                                        },
                                        {
                                                name: 'Listar',
                                                value: 'getMany',
                                                description: 'Listar campos personalizados',
                                                action: 'Listar campos personalizados',
                                        },
                                ],
                                default: 'setFieldValue',
                        },

                        // Custom Field: user_ns (single field)
                        {
                                displayName: 'User NS',
                                name: 'userNs',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['customField'],
                                                operation: ['setFieldValue'],
                                        },
                                },
                                default: '',
                                description: 'Identificador único do contato (user_ns)',
                        },

                        // Custom Field: user_ns (multiple fields)
                        {
                                displayName: 'User NS',
                                name: 'userNs',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['customField'],
                                                operation: ['setMultipleFields'],
                                        },
                                },
                                default: '',
                                description: 'Identificador único do contato (user_ns)',
                        },

                        // Custom Field: field name
                        {
                                displayName: 'Nome Ou ID Do Campo Name or ID',
                                name: 'fieldName',
                                type: 'options',
                                typeOptions: {
                                        loadOptionsMethod: 'getCustomFields',
                                },
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['customField'],
                                                operation: ['setFieldValue'],
                                        },
                                },
                                default: '',
                                description: 'Escolha da lista ou especifique um ID usando uma <a href="https://docs.n8n.io/code/expressions/">expressão</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
                        },

                        // Custom Field: field value
                        {
                                displayName: 'Valor Do Campo',
                                name: 'fieldValue',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['customField'],
                                                operation: ['setFieldValue'],
                                        },
                                },
                                default: '',
                                description: 'Valor do campo personalizado',
                        },

                        // Custom Field: multiple fields
                        {
                                displayName: 'Campos',
                                name: 'fieldsUi',
                                type: 'fixedCollection',
                                typeOptions: {
                                        multipleValues: true,
                                },
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['customField'],
                                                operation: ['setMultipleFields'],
                                        },
                                },
                                default: {},
                                placeholder: 'Adicionar Campo',
                                description: 'Lista de campos (até 20)',
                                options: [
                                        {
                                                name: 'fieldValues',
                                                displayName: 'Campo',
                                                values: [
                                                        {
                                                                displayName: 'Nome Ou ID Do Campo Name or ID',
                                                                name: 'fieldName',
                                                                type: 'options',
                                                                typeOptions: {
                                                                        loadOptionsMethod: 'getCustomFields',
                                                                },
                                                                default: '',
                                                                description: 'Escolha da lista ou especifique um ID usando uma <a href="https://docs.n8n.io/code/expressions/">expressão</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
                                                        },
                                                        {
                                                                displayName: 'Valor Do Campo',
                                                                name: 'fieldValue',
                                                                type: 'string',
                                                                default: '',
                                                        },
                                                ],
                                        },
                                ],
                        },

                        // ===============================
                        // FLOW OPERATIONS
                        // ===============================
                        {
                                displayName: 'Operação',
                                name: 'operation',
                                type: 'options',
                                noDataExpression: true,
                                displayOptions: {
                                        show: {
                                                resource: ['flow'],
                                        },
                                },
                                options: [
                                        {
                                                name: 'Enviar Para Contato',
                                                value: 'sendToSubscriber',
                                                description: 'Enviar fluxo para um contato',
                                                action: 'Enviar fluxo para contato',
                                        },
                                        {
                                                name: 'Listar',
                                                value: 'getMany',
                                                description: 'Listar fluxos disponíveis',
                                                action: 'Listar fluxos',
                                        },
                                ],
                                default: 'sendToSubscriber',
                        },

                        // Flow: user_ns
                        {
                                displayName: 'User NS',
                                name: 'userNs',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['flow'],
                                                operation: ['sendToSubscriber'],
                                        },
                                },
                                default: '',
                                description: 'Identificador único do contato (user_ns)',
                        },

                        // Flow: flow name
                        {
                                displayName: 'Nome Ou ID Do Fluxo Name or ID',
                                name: 'flowName',
                                type: 'options',
                                typeOptions: {
                                        loadOptionsMethod: 'getFlows',
                                },
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['flow'],
                                                operation: ['sendToSubscriber'],
                                        },
                                },
                                default: '',
                                description: 'Escolha da lista ou especifique um ID usando uma <a href="https://docs.n8n.io/code/expressions/">expressão</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
                        },

                        // ===============================
                        // BROADCAST OPERATIONS
                        // ===============================
                        {
                                displayName: 'Operação',
                                name: 'operation',
                                type: 'options',
                                noDataExpression: true,
                                displayOptions: {
                                        show: {
                                                resource: ['broadcast'],
                                        },
                                },
                                options: [
                                        {
                                                name: 'Enviar',
                                                value: 'send',
                                                description: 'Enviar broadcast para contatos específicos',
                                                action: 'Enviar broadcast',
                                        },
                                        {
                                                name: 'Enviar Por Tag',
                                                value: 'sendByTag',
                                                description: 'Enviar broadcast para contatos com uma tag',
                                                action: 'Enviar broadcast por tag',
                                        },
                                ],
                                default: 'send',
                        },

                        // Broadcast: message
                        {
                                displayName: 'Mensagem',
                                name: 'message',
                                type: 'string',
                                typeOptions: {
                                        rows: 4,
                                },
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['broadcast'],
                                                operation: ['send', 'sendByTag'],
                                        },
                                },
                                default: '',
                                description: 'Conteúdo da mensagem do broadcast',
                        },

                        // Broadcast: user_ns list (for send)
                        {
                                displayName: 'Lista De User NS',
                                name: 'userNsList',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['broadcast'],
                                                operation: ['send'],
                                        },
                                },
                                default: '',
                                description: 'Lista de user_ns separados por vírgula',
                        },

                        // Broadcast: tag name (for sendByTag)
                        {
                                displayName: 'Nome Da Tag',
                                name: 'tagName',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['broadcast'],
                                                operation: ['sendByTag'],
                                        },
                                },
                                default: '',
                                description: 'Nome da tag para filtrar contatos',
                        },

                        // ===============================
                        // WHATSAPP TEMPLATE OPERATIONS
                        // ===============================
                        {
                                displayName: 'Operação',
                                name: 'operation',
                                type: 'options',
                                noDataExpression: true,
                                displayOptions: {
                                        show: {
                                                resource: ['whatsappTemplate'],
                                        },
                                },
                                options: [
                                        {
                                                name: 'Enviar',
                                                value: 'send',
                                                description: 'Enviar template do WhatsApp para um contato',
                                                action: 'Enviar template',
                                        },
                                ],
                                default: 'send',
                        },

                        // WhatsApp Template: user_ns
                        {
                                displayName: 'User NS',
                                name: 'userNs',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['whatsappTemplate'],
                                                operation: ['send'],
                                        },
                                },
                                default: '',
                                description: 'Identificador único do contato (user_ns)',
                        },

                        // WhatsApp Template: template name
                        {
                                displayName: 'Template Name or ID',
                                name: 'templateName',
                                type: 'options',
                                typeOptions: {
                                        loadOptionsMethod: 'getTemplates',
                                },
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['whatsappTemplate'],
                                                operation: ['send'],
                                        },
                                },
                                default: '',
                                description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                        },

                        // WhatsApp Template: parameters (optional)
                        {
                                displayName: 'Parâmetros Do Template',
                                name: 'templateParameters',
                                type: 'string',
                                displayOptions: {
                                        show: {
                                                resource: ['whatsappTemplate'],
                                                operation: ['send'],
                                        },
                                },
                                default: '',
                                description: 'Parâmetros do template em formato JSON (opcional)',
                        },

                        // ===============================
                        // CONVERSATION OPERATIONS
                        // ===============================
                        {
                                displayName: 'Operação',
                                name: 'operation',
                                type: 'options',
                                noDataExpression: true,
                                displayOptions: {
                                        show: {
                                                resource: ['conversation'],
                                        },
                                },
                                options: [
                                        {
                                                name: 'Obter Historico',
                                                value: 'getHistory',
                                                description: 'Obter histórico de mensagens de uma conversa',
                                                action: 'Obter historico',
                                        },
                                ],
                                default: 'getHistory',
                        },

                        // Conversation: user_ns
                        {
                                displayName: 'User NS',
                                name: 'userNs',
                                type: 'string',
                                required: true,
                                displayOptions: {
                                        show: {
                                                resource: ['conversation'],
                                                operation: ['getHistory'],
                                        },
                                },
                                default: '',
                                description: 'Identificador único do contato (user_ns)',
                        },

                        // Conversation: limit
                        {
                                displayName: 'Limite',
                                name: 'limit',
                                type: 'number',
                                typeOptions: {
                                        minValue: 1,
                                },
                                displayOptions: {
                                        show: {
                                                resource: ['conversation'],
                                                operation: ['getHistory'],
                                        },
                                },
                                default: 50,
                                description: 'Max number of results to return',
                        },
                ],
        };

        methods = {
                loadOptions: {
                        async getFlows(
                                this: ILoadOptionsFunctions,
                        ): Promise<INodePropertyOptions[]> {
                                const returnData: INodePropertyOptions[] = [];
                                try {
                                        const responseData =
                                                await this.helpers.httpRequestWithAuthentication.call(
                                                        this,
                                                        'roiChatApi',
                                                        {
                                                                method: 'GET',
                                                                url: 'https://roichatpartner.com.br/api/flow/subflows',
                                                                json: true,
                                                        },
                                                );

                                        let flows: IDataObject[] = [];

                                        if (Array.isArray(responseData)) {
                                                flows = responseData;
                                        } else if (
                                                (responseData as IDataObject).data &&
                                                Array.isArray((responseData as IDataObject).data)
                                        ) {
                                                flows = (responseData as IDataObject)
                                                        .data as IDataObject[];
                                        }

                                        for (const flow of flows) {
                                                const flowId = (flow.sub_flow_ns || flow.flow_id || flow.id || flow._id) as string;
                                                const flowName = (flow.name || flow.flow_name || flowId) as string;
                                                if (flowId && flowName) {
                                                        returnData.push({
                                                                name: flowName,
                                                                value: flowId,
                                                        });
                                                }
                                        }
                                } catch (error) {
                                        throw new NodeOperationError(
                                                this.getNode(),
                                                `Erro ao carregar fluxos: ${error.message}`,
                                        );
                                }
                                return returnData;
                        },
                        async getCustomFields(
                                this: ILoadOptionsFunctions,
                        ): Promise<INodePropertyOptions[]> {
                                const returnData: INodePropertyOptions[] = [];
                                try {
                                        const responseData =
                                                await this.helpers.httpRequestWithAuthentication.call(
                                                        this,
                                                        'roiChatApi',
                                                        {
                                                                method: 'GET',
                                                                url: 'https://roichatpartner.com.br/api/flow/user-fields',
                                                                json: true,
                                                        },
                                                );

                                        let fields: IDataObject[] = [];

                                        if (Array.isArray(responseData)) {
                                                fields = responseData;
                                        } else if (
                                                (responseData as IDataObject).data &&
                                                Array.isArray((responseData as IDataObject).data)
                                        ) {
                                                fields = (responseData as IDataObject)
                                                        .data as IDataObject[];
                                        }

                                        for (const field of fields) {
                                                const fieldName = (field.name || field.field_name) as string;
                                                const fieldId = (field.var_ns || field.id || field._id) as string;
                                                if (fieldName && fieldId) {
                                                        returnData.push({
                                                                name: fieldName,
                                                                value: fieldId,
                                                        });
                                                }
                                        }
                                } catch (error) {
                                        throw new NodeOperationError(
                                                this.getNode(),
                                                `Erro ao carregar campos personalizados: ${error.message}`,
                                        );
                                }
                                return returnData;
                        },
                        async getTemplates(
                                this: ILoadOptionsFunctions,
                        ): Promise<INodePropertyOptions[]> {
                                const returnData: INodePropertyOptions[] = [];
                                try {
                                        const responseData =
                                                await this.helpers.httpRequestWithAuthentication.call(
                                                        this,
                                                        'roiChatApi',
                                                        {
                                                                method: 'POST',
                                                                url: 'https://roichatpartner.com.br/api/whatsapp-template/list',
                                                                json: true,
                                                        },
                                                );

                                        let templates: IDataObject[] = [];

                                        if (Array.isArray(responseData)) {
                                                templates = responseData;
                                        } else if (
                                                (responseData as IDataObject).data &&
                                                Array.isArray((responseData as IDataObject).data)
                                        ) {
                                                templates = (responseData as IDataObject)
                                                        .data as IDataObject[];
                                        }

                                        for (const template of templates) {
                                                const templateName = (template.name) as string;
                                                const templateLanguage = (template.language || 'pt_BR') as string;
                                                if (templateName) {
                                                        returnData.push({
                                                                name: `${templateName} (${templateLanguage})`,
                                                                value: templateName,
                                                        });
                                                }
                                        }
                                } catch (error) {
                                        throw new NodeOperationError(
                                                this.getNode(),
                                                `Erro ao carregar templates WhatsApp: ${error.message}`,
                                        );
                                }
                                return returnData;
                        },
                },
        };

        async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
                const items = this.getInputData();
                const returnData: IDataObject[] = [];
                const resource = this.getNodeParameter('resource', 0) as string;
                const operation = this.getNodeParameter('operation', 0) as string;

                for (let i = 0; i < items.length; i++) {
                        try {
                                if (resource === 'subscriber') {
                                        if (operation === 'create') {
                                                const firstName = this.getNodeParameter(
                                                        'firstName',
                                                        i,
                                                ) as string;
                                                const lastName = this.getNodeParameter(
                                                        'lastName',
                                                        i,
                                                ) as string;
                                                const email = this.getNodeParameter(
                                                        'email',
                                                        i,
                                                ) as string;
                                                const phone = this.getNodeParameter(
                                                        'phone',
                                                        i,
                                                ) as string;

                                                const body: IDataObject = {};
                                                if (firstName) body.first_name = firstName;
                                                if (lastName) body.last_name = lastName;
                                                if (email) body.email = email;
                                                if (phone) body.phone = phone;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'POST',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/create',
                                                                        body,
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'get') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'GET',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/get-info',
                                                                        qs: { user_ns: userNs },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'search') {
                                                const filters = this.getNodeParameter(
                                                        'filters',
                                                        i,
                                                ) as IDataObject;

                                                const qs: IDataObject = {};
                                                if (filters.limit) qs.limit = filters.limit;
                                                if (filters.page) qs.page = filters.page;
                                                if (filters.name) qs.name = filters.name;
                                                if (filters.phone) qs.phone = filters.phone;
                                                if (filters.email) qs.email = filters.email;
                                                if (filters.is_channel) qs.is_channel = filters.is_channel;
                                                if (filters.is_opt_in_email) qs.is_opt_in_email = filters.is_opt_in_email;
                                                if (filters.is_opt_in_sms) qs.is_opt_in_sms = filters.is_opt_in_sms;
                                                if (filters.is_interacted_in_last_24h) qs.is_interacted_in_last_24h = filters.is_interacted_in_last_24h;
                                                if (filters.is_bot_interacted_in_last_24h) qs.is_bot_interacted_in_last_24h = filters.is_bot_interacted_in_last_24h;
                                                if (filters.is_last_message_in_last_24h) qs.is_last_message_in_last_24h = filters.is_last_message_in_last_24h;
                                                if (filters.tag_ns) qs.tag_ns = filters.tag_ns;
                                                if (filters.label_id) qs.label_id = filters.label_id;
                                                if (filters.event_ns) qs.event_ns = filters.event_ns;
                                                if (filters.user_field_ns) qs.user_field_ns = filters.user_field_ns;
                                                if (filters.user_field_value) qs.user_field_value = filters.user_field_value;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'GET',
                                                                        url: 'https://roichatpartner.com.br/api/subscribers',
                                                                        qs,
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'update') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const updateFields = this.getNodeParameter(
                                                        'updateFields',
                                                        i,
                                                ) as IDataObject;

                                                const body: IDataObject = { user_ns: userNs };
                                                Object.assign(body, updateFields);

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'PUT',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/update',
                                                                        body,
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'delete') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'DELETE',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/delete',
                                                                        body: { user_ns: userNs },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        }
                                } else if (resource === 'tag') {
                                        if (operation === 'addToSubscriber') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const tagName = this.getNodeParameter(
                                                        'tagName',
                                                        i,
                                                ) as string;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'POST',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/add-tag-by-name',
                                                                        body: {
                                                                                user_ns: userNs,
                                                                                tag_name: tagName,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'addMultipleTags') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const tagsUi = this.getNodeParameter(
                                                        'tagsUi',
                                                        i,
                                                ) as IDataObject;

                                                const tags = (tagsUi.tagValues as IDataObject[]) || [];
                                                
                                                const data = tags.map((tag) => ({
                                                        tag_name: tag.tagName as string,
                                                }));

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'POST',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/add-tags-by-name',
                                                                        body: {
                                                                                user_ns: userNs,
                                                                                data,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'removeFromSubscriber') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const tagName = this.getNodeParameter(
                                                        'tagName',
                                                        i,
                                                ) as string;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'DELETE',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/remove-tag-by-name',
                                                                        body: {
                                                                                user_ns: userNs,
                                                                                tag_name: tagName,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'removeMultipleTags') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const tagsUi = this.getNodeParameter(
                                                        'tagsUi',
                                                        i,
                                                ) as IDataObject;

                                                const tags = (tagsUi.tagValues as IDataObject[]) || [];
                                                
                                                const data = tags.map((tag) => ({
                                                        tag_name: tag.tagName as string,
                                                }));

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'DELETE',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/remove-tags-by-name',
                                                                        body: {
                                                                                user_ns: userNs,
                                                                                data,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'create') {
                                                const tagName = this.getNodeParameter(
                                                        'tagName',
                                                        i,
                                                ) as string;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'POST',
                                                                        url: 'https://roichatpartner.com.br/api/flow/create-tag',
                                                                        body: { name: tagName },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'delete') {
                                                const tagName = this.getNodeParameter(
                                                        'tagName',
                                                        i,
                                                ) as string;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'DELETE',
                                                                        url: 'https://roichatpartner.com.br/api/flow/delete-tag-by-name',
                                                                        body: { name: tagName },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'getMany') {
                                                const options = this.getNodeParameter(
                                                        'options',
                                                        i,
                                                ) as IDataObject;

                                                const qs: IDataObject = {};
                                                if (options.limit) qs.limit = options.limit;
                                                if (options.page) qs.page = options.page;
                                                if (options.name) qs.name = options.name;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'GET',
                                                                        url: 'https://roichatpartner.com.br/api/flow/tags',
                                                                        qs,
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        }
                                } else if (resource === 'customField') {
                                        if (operation === 'getMany') {
                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'GET',
                                                                        url: 'https://roichatpartner.com.br/api/flow/user-fields',
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'setFieldValue') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const varNs = this.getNodeParameter(
                                                        'fieldName',
                                                        i,
                                                ) as string;
                                                const fieldValue = this.getNodeParameter(
                                                        'fieldValue',
                                                        i,
                                                ) as string;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'PUT',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/set-user-field',
                                                                        body: {
                                                                                user_ns: userNs,
                                                                                var_ns: varNs,
                                                                                value: fieldValue,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'setMultipleFields') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const fieldsUi = this.getNodeParameter(
                                                        'fieldsUi',
                                                        i,
                                                ) as IDataObject;

                                                const fields = (fieldsUi.fieldValues as IDataObject[]) || [];
                                                
                                                const data = fields.map((field) => ({
                                                        var_ns: field.fieldName as string,
                                                        value: field.fieldValue as string,
                                                }));

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'PUT',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/set-user-fields',
                                                                        body: {
                                                                                user_ns: userNs,
                                                                                data,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        }
                                } else if (resource === 'flow') {
                                        if (operation === 'sendToSubscriber') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const flowId = this.getNodeParameter(
                                                        'flowName',
                                                        i,
                                                ) as string;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'POST',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/send-sub-flow',
                                                                        body: {
                                                                                user_ns: userNs,
                                                                                flow_id: flowId,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'getMany') {
                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'GET',
                                                                        url: 'https://roichatpartner.com.br/api/flow/subflows',
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        }
                                } else if (resource === 'broadcast') {
                                        if (operation === 'send') {
                                                const message = this.getNodeParameter(
                                                        'message',
                                                        i,
                                                ) as string;
                                                const userNsList = this.getNodeParameter(
                                                        'userNsList',
                                                        i,
                                                ) as string;

                                                const users = userNsList
                                                        .split(',')
                                                        .map((u) => u.trim());

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'POST',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/broadcast',
                                                                        body: {
                                                                                user_ns_list: users,
                                                                                content: message,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        } else if (operation === 'sendByTag') {
                                                const message = this.getNodeParameter(
                                                        'message',
                                                        i,
                                                ) as string;
                                                const tagName = this.getNodeParameter(
                                                        'tagName',
                                                        i,
                                                ) as string;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'POST',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/broadcast-by-tag',
                                                                        body: {
                                                                                tag_name: tagName,
                                                                                content: message,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        }
                                } else if (resource === 'whatsappTemplate') {
                                        if (operation === 'send') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const templateName = this.getNodeParameter(
                                                        'templateName',
                                                        i,
                                                ) as string;
                                                const templateParameters = this.getNodeParameter(
                                                        'templateParameters',
                                                        i,
                                                        '',
                                                ) as string;

                                                const body: IDataObject = {
                                                        user_ns: userNs,
                                                        template_name: templateName,
                                                };

                                                if (templateParameters) {
                                                        try {
                                                                body.parameters =
                                                                        JSON.parse(
                                                                                templateParameters,
                                                                        );
                                                        } catch {
                                                                throw new NodeOperationError(
                                                                        this.getNode(),
                                                                        'Parâmetros do template devem ser um JSON válido',
                                                                );
                                                        }
                                                }

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'POST',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/send-whatsapp-template',
                                                                        body,
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        }
                                } else if (resource === 'conversation') {
                                        if (operation === 'getHistory') {
                                                const userNs = this.getNodeParameter(
                                                        'userNs',
                                                        i,
                                                ) as string;
                                                const limit = this.getNodeParameter(
                                                        'limit',
                                                        i,
                                                ) as number;

                                                const responseData =
                                                        await this.helpers.httpRequestWithAuthentication.call(
                                                                this,
                                                                'roiChatApi',
                                                                {
                                                                        method: 'GET',
                                                                        url: 'https://roichatpartner.com.br/api/subscriber/chat-messages',
                                                                        qs: {
                                                                                user_ns: userNs,
                                                                                limit,
                                                                        },
                                                                        json: true,
                                                                },
                                                        );
                                                returnData.push(responseData as IDataObject);
                                        }
                                }
                        } catch (error) {
                                if (this.continueOnFail()) {
                                        returnData.push({ error: error.message });
                                        continue;
                                }
                                throw error;
                        }
                }

                return [this.helpers.returnJsonArray(returnData)];
        }
}
