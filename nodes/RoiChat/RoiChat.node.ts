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
          { name: 'Campo Personalizado', value: 'customField', description: 'Operações com campos personalizados' },
          { name: 'Contato', value: 'subscriber', description: 'Operações com contatos (assinantes)' },
          { name: 'Disparo', value: 'broadcast', description: 'Disparos em massa' },
          { name: 'Fluxo', value: 'flow', description: 'Enviar fluxos para contatos' },
          { name: 'LiveChat', value: 'conversation', description: 'Histórico de conversas' },
          { name: 'Tag', value: 'tag', description: 'Operações com tags' },
          { name: 'WhatsApp Template', value: 'whatsappTemplate', description: 'Templates do WhatsApp' },
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
        displayOptions: { show: { resource: ['subscriber'] } },
        options: [
          { name: 'Atualizar', value: 'update', description: 'Atualizar dados de um contato', action: 'Atualizar contato' },
          { name: 'Buscar Contatos', value: 'search', description: 'Buscar contatos com filtros avançados', action: 'Buscar contatos' },
          { name: 'Criar', value: 'create', description: 'Criar um novo contato', action: 'Criar contato' },
          { name: 'Deletar', value: 'delete', description: 'Deletar um contato', action: 'Deletar contato' },
          { name: 'Obter Por ID', value: 'get', description: 'Buscar um contato específico pelo ID', action: 'Buscar contato por ID' },
        ],
        default: 'create',
      },

      // ---------- Contatos (dropdown com paginação/busca) ----------
      {
        displayName: 'Página (Contatos)',
        name: 'subsPage',
        type: 'number',
        typeOptions: { minValue: 1 },
        default: 1,
        description: 'Navegue pelas páginas de contatos (10 por página).',
        displayOptions: {
          show: {
            resource: ['subscriber', 'tag', 'customField', 'flow', 'whatsappTemplate', 'conversation'],
            operation: ['get', 'update', 'delete', 'addToSubscriber', 'addMultipleTags', 'removeFromSubscriber', 'removeMultipleTags', 'setFieldValue', 'setMultipleFields', 'sendToSubscriber', 'send', 'getHistory'],
          },
        },
      },
      {
        displayName: 'Buscar (Contatos)',
        name: 'subsSearch',
        type: 'string',
        default: '',
        description: 'Filtra contatos por nome/telefone/email (se suportado pela API).',
        displayOptions: {
          show: {
            resource: ['subscriber', 'tag', 'customField', 'flow', 'whatsappTemplate', 'conversation'],
            operation: ['get', 'update', 'delete', 'addToSubscriber', 'addMultipleTags', 'removeFromSubscriber', 'removeMultipleTags', 'setFieldValue', 'setMultipleFields', 'sendToSubscriber', 'send', 'getHistory'],
          },
        },
      },
      {
        displayName: 'User NS',
        name: 'userNs',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getSubscribers',
          loadOptionsDependsOn: ['subsPage', 'subsSearch'],
        },
        required: true,
        displayOptions: {
          show: {
            resource: ['subscriber'],
            operation: ['get', 'update', 'delete'],
          },
        },
        default: '',
        description: 'Identificador único do contato (user_ns).',
      },

      // Subscriber: Create fields
      {
        displayName: 'Primeiro Nome',
        name: 'firstName',
        type: 'string',
        displayOptions: { show: { resource: ['subscriber'], operation: ['create'] } },
        default: '',
        description: 'Primeiro nome do contato',
      },
      {
        displayName: 'Sobrenome',
        name: 'lastName',
        type: 'string',
        displayOptions: { show: { resource: ['subscriber'], operation: ['create'] } },
        default: '',
        description: 'Sobrenome do contato',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'nome@email.com',
        displayOptions: { show: { resource: ['subscriber'], operation: ['create'] } },
        default: '',
        description: 'Email do contato',
      },
      {
        displayName: 'Telefone',
        name: 'phone',
        type: 'string',
        displayOptions: { show: { resource: ['subscriber'], operation: ['create'] } },
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
        displayOptions: { show: { resource: ['subscriber'], operation: ['update'] } },
        options: [
          { displayName: 'Primeiro Nome', name: 'first_name', type: 'string', default: '' },
          { displayName: 'Sobrenome', name: 'last_name', type: 'string', default: '' },
          { displayName: 'Email', name: 'email', type: 'string', placeholder: 'nome@email.com', default: '' },
          { displayName: 'Telefone', name: 'phone', type: 'string', default: '' },
        ],
      },

      // Subscriber: Search filters
      {
        displayName: 'Filtros',
        name: 'filters',
        type: 'collection',
        placeholder: 'Adicionar Filtro',
        default: {},
        displayOptions: { show: { resource: ['subscriber'], operation: ['search'] } },
        options: [
          { displayName: 'Bot Interagiu Nas Últimas 24h', name: 'is_bot_interacted_in_last_24h', type: 'options', options: [{ name: 'Sim', value: 'yes' }, { name: 'Não', value: 'no' }], default: 'yes' },
          { displayName: 'Campo Customizado NS', name: 'user_field_ns', type: 'string', default: '' },
          {
            displayName: 'Canal',
            name: 'is_channel',
            type: 'options',
            options: [
              { name: 'API Chat', value: 'apichat' }, { name: 'Facebook', value: 'facebook' }, { name: 'Google', value: 'google' },
              { name: 'Instagram', value: 'instagram' }, { name: 'LINE', value: 'line' }, { name: 'Telegram', value: 'telegram' },
              { name: 'Viber', value: 'viber' }, { name: 'VK', value: 'vk' }, { name: 'Web', value: 'web' },
              { name: 'WeChat', value: 'wechat' }, { name: 'WhatsApp', value: 'whatsapp' }, { name: 'WhatsApp Cloud', value: 'whatsapp_cloud' },
            ],
            default: 'apichat',
          },
          { displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '' },
          { displayName: 'Event NS', name: 'event_ns', type: 'string', default: '' },
          { displayName: 'Interagiu Nas Últimas 24h', name: 'is_interacted_in_last_24h', type: 'options', options: [{ name: 'Sim', value: 'yes' }, { name: 'Não', value: 'no' }], default: 'yes' },
          { displayName: 'Label ID', name: 'label_id', type: 'number', default: 0 },
          { displayName: 'Limite', name: 'limit', type: 'number', typeOptions: { minValue: 1, maxValue: 100 }, default: 50 },
          { displayName: 'Nome', name: 'name', type: 'string', default: '' },
          { displayName: 'Opt-in Email', name: 'is_opt_in_email', type: 'options', options: [{ name: 'Sim', value: 'yes' }, { name: 'Não', value: 'no' }], default: 'yes' },
          { displayName: 'Opt-in SMS', name: 'is_opt_in_sms', type: 'options', options: [{ name: 'Sim', value: 'yes' }, { name: 'Não', value: 'no' }], default: 'yes' },
          { displayName: 'Página', name: 'page', type: 'number', typeOptions: { minValue: 1, maxValue: 1000 }, default: 1 },
          { displayName: 'Tag NS', name: 'tag_ns', type: 'string', default: '' },
          { displayName: 'Telefone', name: 'phone', type: 'string', default: '' },
          { displayName: 'Última Mensagem Nas Últimas 24h', name: 'is_last_message_in_last_24h', type: 'options', options: [{ name: 'Sim', value: 'yes' }, { name: 'Não', value: 'no' }], default: 'yes' },
          { displayName: 'Valor Do Campo Customizado', name: 'user_field_value', type: 'string', default: '' },
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
        displayOptions: { show: { resource: ['tag'] } },
        options: [
          { name: 'Adicionar Ao Contato', value: 'addToSubscriber', description: 'Adicionar uma tag a um contato', action: 'Adicionar tag ao contato' },
          { name: 'Adicionar Multiplas Tags', value: 'addMultipleTags', description: 'Adicionar múltiplas tags a um contato (até 20)', action: 'Adicionar multiplas tags' },
          { name: 'Criar', value: 'create', description: 'Criar uma nova tag', action: 'Criar tag' },
          { name: 'Deletar', value: 'delete', description: 'Deletar uma tag', action: 'Deletar tag' },
          { name: 'Listar', value: 'getMany', description: 'Listar todas as tags', action: 'Listar tags' },
          { name: 'Remover Do Contato', value: 'removeFromSubscriber', description: 'Remover uma tag de um contato', action: 'Remover tag do contato' },
          { name: 'Remover Multiplas Tags', value: 'removeMultipleTags', description: 'Remover múltiplas tags de um contato (até 20)', action: 'Remover multiplas tags' },
        ],
        default: 'addToSubscriber',
      },

      // Contato (dropdown) para operações de tag que exigem um contato
      {
        displayName: 'User NS',
        name: 'userNs',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getSubscribers', loadOptionsDependsOn: ['subsPage', 'subsSearch'] },
        required: true,
        displayOptions: { show: { resource: ['tag'], operation: ['addToSubscriber', 'addMultipleTags', 'removeFromSubscriber', 'removeMultipleTags'] } },
        default: '',
        description: 'Identificador único do contato (user_ns)',
      },

      // ---------- Tags (dropdown com paginação/busca) ----------
      {
        displayName: 'Página (Tags)',
        name: 'tagsPage',
        type: 'number',
        typeOptions: { minValue: 1 },
        default: 1,
        description: 'Navegue pelas páginas de tags (10 por página).',
        displayOptions: {
          show: {
            resource: ['tag', 'broadcast'],
            operation: ['addToSubscriber', 'removeFromSubscriber', 'delete', 'addMultipleTags', 'removeMultipleTags', 'sendByTag'],
          },
        },
      },
      {
        displayName: 'Buscar (Tags)',
        name: 'tagsSearch',
        type: 'string',
        default: '',
        description: 'Filtra tags por nome.',
        displayOptions: {
          show: {
            resource: ['tag', 'broadcast'],
            operation: ['addToSubscriber', 'removeFromSubscriber', 'delete', 'addMultipleTags', 'removeMultipleTags', 'sendByTag'],
          },
        },
      },

      // Tag única (dropdown)
      {
        displayName: 'Nome Da Tag',
        name: 'tagName',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getTags',
          loadOptionsDependsOn: ['tagsPage', 'tagsSearch'],
        },
        required: true,
        displayOptions: {
          show: { resource: ['tag'], operation: ['addToSubscriber', 'removeFromSubscriber', 'delete'] },
        },
        default: '',
      },

      // Tag múltipla (dropdown multi)
      {
        displayName: 'Tags',
        name: 'tagNames',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getTags',
          loadOptionsDependsOn: ['tagsPage', 'tagsSearch'],
        },
        required: true,
        displayOptions: { show: { resource: ['tag'], operation: ['addMultipleTags', 'removeMultipleTags'] } },
        default: [],
        description: 'Selecione múltiplas tags (até 20).',
      },

      // Tag: criar (texto)
      {
        displayName: 'Nome Da Tag',
        name: 'tagNameCreate',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['tag'], operation: ['create'] } },
        default: '',
      },

      // Tag: GetMany options
      {
        displayName: 'Opções',
        name: 'options',
        type: 'collection',
        placeholder: 'Adicionar Opção',
        default: {},
        displayOptions: { show: { resource: ['tag'], operation: ['getMany'] } },
        options: [
          { displayName: 'Limite', name: 'limit', type: 'number', typeOptions: { minValue: 1 }, default: 50 },
          { displayName: 'Nome', name: 'name', type: 'string', default: '' },
          { displayName: 'Página', name: 'page', type: 'number', default: 1 },
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
        displayOptions: { show: { resource: ['customField'] } },
        options: [
          { name: 'Definir Multiplos Campos', value: 'setMultipleFields', description: 'Definir valores de múltiplos campos (até 20)', action: 'Definir multiplos campos' },
          { name: 'Definir Valor', value: 'setFieldValue', description: 'Definir valor de um campo personalizado', action: 'Definir valor do campo' },
          { name: 'Listar', value: 'getMany', description: 'Listar campos personalizados', action: 'Listar campos personalizados' },
        ],
        default: 'setFieldValue',
      },

      // Custom Field: contato (dropdown compartilhado)
      {
        displayName: 'User NS',
        name: 'userNs',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getSubscribers', loadOptionsDependsOn: ['subsPage', 'subsSearch'] },
        required: true,
        displayOptions: { show: { resource: ['customField'], operation: ['setFieldValue'] } },
        default: '',
        description: 'Identificador único do contato (user_ns)',
      },
      {
        displayName: 'User NS',
        name: 'userNs',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getSubscribers', loadOptionsDependsOn: ['subsPage', 'subsSearch'] },
        required: true,
        displayOptions: { show: { resource: ['customField'], operation: ['setMultipleFields'] } },
        default: '',
        description: 'Identificador único do contato (user_ns)',
      },

      // Custom Field: field name
      {
        displayName: 'Nome Ou ID Do Campo Name or ID',
        name: 'fieldName',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getCustomFields' },
        required: true,
        displayOptions: { show: { resource: ['customField'], operation: ['setFieldValue'] } },
        default: '',
        description: 'Escolha da lista ou especifique um ID usando uma expressão.',
      },

      // Custom Field: field value
      {
        displayName: 'Valor Do Campo',
        name: 'fieldValue',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['customField'], operation: ['setFieldValue'] } },
        default: '',
        description: 'Valor do campo personalizado',
      },

      // Custom Field: multiple fields
      {
        displayName: 'Campos',
        name: 'fieldsUi',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        required: true,
        displayOptions: { show: { resource: ['customField'], operation: ['setMultipleFields'] } },
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
                typeOptions: { loadOptionsMethod: 'getCustomFields' },
                default: '',
                description: 'Escolha da lista ou especifique um ID usando uma expressão.',
              },
              { displayName: 'Valor Do Campo', name: 'fieldValue', type: 'string', default: '' },
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
        displayOptions: { show: { resource: ['flow'] } },
        options: [
          { name: 'Enviar Para Contato', value: 'sendToSubscriber', description: 'Enviar fluxo para um contato', action: 'Enviar fluxo para contato' },
          { name: 'Listar', value: 'getMany', description: 'Listar fluxos disponíveis', action: 'Listar fluxos' },
        ],
        default: 'sendToSubscriber',
      },

      // Flow: contato (dropdown)
      {
        displayName: 'User NS',
        name: 'userNs',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getSubscribers', loadOptionsDependsOn: ['subsPage', 'subsSearch'] },
        required: true,
        displayOptions: { show: { resource: ['flow'], operation: ['sendToSubscriber'] } },
        default: '',
        description: 'Identificador único do contato (user_ns)',
      },

      // Flow: controles do dropdown de fluxos
      {
        displayName: 'Página (Fluxos)',
        name: 'flowsPage',
        type: 'number',
        typeOptions: { minValue: 1 },
        default: 1,
        description: 'Navegue pelas páginas de fluxos (10 por página).',
        displayOptions: { show: { resource: ['flow'], operation: ['sendToSubscriber'] } },
      },
      {
        displayName: 'Buscar (Fluxos)',
        name: 'flowsSearch',
        type: 'string',
        default: '',
        description: 'Filtra por nome do fluxo.',
        displayOptions: { show: { resource: ['flow'], operation: ['sendToSubscriber'] } },
      },

      // Flow: flow name (dropdown paginado)
      {
        displayName: 'Nome Ou ID Do Fluxo Name or ID',
        name: 'flowName',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getFlows', loadOptionsDependsOn: ['flowsPage', 'flowsSearch'] },
        required: true,
        displayOptions: { show: { resource: ['flow'], operation: ['sendToSubscriber'] } },
        default: '',
        description: 'Escolha da lista ou especifique um ID usando uma expressão.',
      },

      // ===============================
      // BROADCAST OPERATIONS
      // ===============================
      {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['broadcast'] } },
        options: [
          { name: 'Enviar', value: 'send', description: 'Enviar broadcast para contatos específicos', action: 'Enviar broadcast' },
          { name: 'Enviar Por Tag', value: 'sendByTag', description: 'Enviar broadcast para contatos com uma tag', action: 'Enviar broadcast por tag' },
        ],
        default: 'send',
      },
      {
        displayName: 'Mensagem',
        name: 'message',
        type: 'string',
        typeOptions: { rows: 4 },
        required: true,
        displayOptions: { show: { resource: ['broadcast'], operation: ['send', 'sendByTag'] } },
        default: '',
        description: 'Conteúdo da mensagem do broadcast',
      },
      {
        displayName: 'Lista De User NS',
        name: 'userNsList',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['broadcast'], operation: ['send'] } },
        default: '',
        description: 'Lista de user_ns separados por vírgula',
      },

      // Broadcast por TAG — usa dropdown de tags
      {
        displayName: 'Página (Tags)',
        name: 'tagsPage',
        type: 'number',
        typeOptions: { minValue: 1 },
        default: 1,
        description: 'Navegue pelas páginas de tags (10 por página).',
        displayOptions: { show: { resource: ['broadcast'], operation: ['sendByTag'] } },
      },
      {
        displayName: 'Buscar (Tags)',
        name: 'tagsSearch',
        type: 'string',
        default: '',
        description: 'Filtra tags por nome.',
        displayOptions: { show: { resource: ['broadcast'], operation: ['sendByTag'] } },
      },
      {
        displayName: 'Nome Da Tag',
        name: 'tagName',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getTags', loadOptionsDependsOn: ['tagsPage', 'tagsSearch'] },
        required: true,
        displayOptions: { show: { resource: ['broadcast'], operation: ['sendByTag'] } },
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
        displayOptions: { show: { resource: ['whatsappTemplate'] } },
        options: [{ name: 'Enviar', value: 'send', description: 'Enviar template do WhatsApp para um contato', action: 'Enviar template' }],
        default: 'send',
      },

      // WhatsApp Template: contato (dropdown)
      {
        displayName: 'User NS',
        name: 'userNs',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getSubscribers', loadOptionsDependsOn: ['subsPage', 'subsSearch'] },
        required: true,
        displayOptions: { show: { resource: ['whatsappTemplate'], operation: ['send'] } },
        default: '',
        description: 'Identificador único do contato (user_ns)',
      },

      // WhatsApp Template: controles de paginação/busca
      {
        displayName: 'Página (Templates)',
        name: 'templatePage',
        type: 'number',
        typeOptions: { minValue: 1 },
        default: 1,
        description: 'Navegue pelas páginas de templates (10 por página).',
        displayOptions: { show: { resource: ['whatsappTemplate'], operation: ['send'] } },
      },
      {
        displayName: 'Buscar (Templates)',
        name: 'templateSearch',
        type: 'string',
        default: '',
        description: 'Filtra templates por nome.',
        displayOptions: { show: { resource: ['whatsappTemplate'], operation: ['send'] } },
      },

      // WhatsApp Template: template name (dropdown paginado)
      {
        displayName: 'Template Name or ID',
        name: 'templateName',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getTemplates', loadOptionsDependsOn: ['templatePage', 'templateSearch'] },
        required: true,
        displayOptions: { show: { resource: ['whatsappTemplate'], operation: ['send'] } },
        default: '',
        description: 'Choose from the list, or specify an ID using an expression',
      },

      // WhatsApp Template: parameters (optional)
      {
        displayName: 'Parâmetros Do Template',
        name: 'templateParameters',
        type: 'string',
        displayOptions: { show: { resource: ['whatsappTemplate'], operation: ['send'] } },
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
        displayOptions: { show: { resource: ['conversation'] } },
        options: [{ name: 'Obter Historico', value: 'getHistory', description: 'Obter histórico de mensagens de uma conversa', action: 'Obter historico' }],
        default: 'getHistory',
      },

      // Conversation: contato (dropdown)
      {
        displayName: 'User NS',
        name: 'userNs',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getSubscribers', loadOptionsDependsOn: ['subsPage', 'subsSearch'] },
        required: true,
        displayOptions: { show: { resource: ['conversation'], operation: ['getHistory'] } },
        default: '',
        description: 'Identificador único do contato (user_ns)',
      },

      // Conversation: limit
      {
        displayName: 'Limite',
        name: 'limit',
        type: 'number',
        typeOptions: { minValue: 1 },
        displayOptions: { show: { resource: ['conversation'], operation: ['getHistory'] } },
        default: 50,
        description: 'Max number of results to return',
      },
    ],
  };

  methods = {
    loadOptions: {
      // ---------- Subscribers (paginação + busca) ----------
      async getSubscribers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const options: INodePropertyOptions[] = [];
        try {
          const page = (this.getCurrentNodeParameter('subsPage', 1) as number) || 1;
          const search = (this.getCurrentNodeParameter('subsSearch', '') as string) || '';

          const qs: IDataObject = { limit: 10, page };
          // Ajuste conforme tua API: aqui envio "name" como busca básica
          if (search) qs.name = search;

          const res = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
            method: 'GET',
            url: 'https://roichatpartner.com.br/api/subscribers',
            qs,
            json: true,
          });

          let subs: IDataObject[] = [];
          if (Array.isArray(res)) subs = res as IDataObject[];
          else if ((res as IDataObject).data && Array.isArray((res as IDataObject).data)) subs = (res as IDataObject).data as IDataObject[];

          for (const s of subs) {
            const id = (s.user_ns || s.id || s._id) as string;
            const first = (s.first_name || (s as any).firstName || '') as string;
            const last = (s.last_name || (s as any).lastName || '') as string;
            const phone = (s.phone || '') as string;
            const email = (s.email || '') as string;
            const label = [`${first} ${last}`.trim(), phone || email || id].filter(Boolean).join(' — ');
            if (id) options.push({ name: label || id, value: id, description: `NS: ${id}` });
          }

          return options;
        } catch (error: any) {
          throw new NodeOperationError(this.getNode(), `Erro ao carregar contatos: ${error.message}`);
        }
      },

      // ---------- Tags (paginação + busca) ----------
      async getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        try {
          const page = (this.getCurrentNodeParameter('tagsPage', 1) as number) || 1;
          const search = (this.getCurrentNodeParameter('tagsSearch', '') as string) || '';

          const qs: IDataObject = { per_page: 10, page };
          if (search) qs.name = search;

          const res = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
            method: 'GET',
            url: 'https://roichatpartner.com.br/api/flow/tags',
            qs,
            json: true,
          });

          let tags: IDataObject[] = [];
          if (Array.isArray(res)) tags = res as IDataObject[];
          else if ((res as IDataObject).data && Array.isArray((res as IDataObject).data)) tags = (res as IDataObject).data as IDataObject[];

          for (const t of tags) {
            const name = (t.name || (t as any).tag_name) as string;
            if (name) returnData.push({ name, value: name });
          }

          return returnData;
        } catch (error: any) {
          throw new NodeOperationError(this.getNode(), `Erro ao carregar tags: ${error.message}`);
        }
      },

      // ---------- Flows (paginação + busca) ----------
      async getFlows(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        try {
          const page = (this.getCurrentNodeParameter('flowsPage', 1) as number) || 1;
          const search = (this.getCurrentNodeParameter('flowsSearch', '') as string) || '';

          const qs: IDataObject = { per_page: 10, page };
          if (search) qs.search = search; // ajuste para o param real (ex.: name)

          const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
            method: 'GET',
            url: 'https://roichatpartner.com.br/api/flow/subflows',
            qs,
            json: true,
          });

          let flows: IDataObject[] = [];
          if (Array.isArray(responseData)) {
            flows = responseData;
          } else if ((responseData as IDataObject).data && Array.isArray((responseData as IDataObject).data)) {
            flows = (responseData as IDataObject).data as IDataObject[];
          }

          for (const flow of flows) {
            const flowId = (flow.sub_flow_ns || (flow as any).flow_id || (flow as any).id || (flow as any)._id) as string;
            const flowName = (flow.name || (flow as any).flow_name || flowId) as string;
            if (flowId && flowName) {
              returnData.push({ name: flowName, value: flowId, description: `NS: ${(flow as any).sub_flow_ns || flowId}` });
            }
          }
          return returnData;
        } catch (error: any) {
          throw new NodeOperationError(this.getNode(), `Erro ao carregar fluxos: ${error.message}`);
        }
      },

      // ---------- Custom Fields ----------
      async getCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        try {
          const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
            method: 'GET',
            url: 'https://roichatpartner.com.br/api/flow/user-fields',
            json: true,
          });

          let fields: IDataObject[] = [];
          if (Array.isArray(responseData)) fields = responseData;
          else if ((responseData as IDataObject).data && Array.isArray((responseData as IDataObject).data)) fields = (responseData as IDataObject).data as IDataObject[];

          for (const field of fields) {
            const fieldName = (field.name || (field as any).field_name) as string;
            const fieldId = (field.var_ns || (field as any).id || (field as any)._id) as string;
            if (fieldName && fieldId) returnData.push({ name: fieldName, value: fieldId });
          }
          return returnData;
        } catch (error: any) {
          throw new NodeOperationError(this.getNode(), `Erro ao carregar campos personalizados: ${error.message}`);
        }
      },

      // ---------- Templates (paginação + busca) ----------
      async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        try {
          const page = (this.getCurrentNodeParameter('templatePage', 1) as number) || 1;
          const search = (this.getCurrentNodeParameter('templateSearch', '') as string) || '';

          // API de templates é POST — enviamos paginação/busca no body
          const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
            method: 'POST',
            url: 'https://roichatpartner.com.br/api/whatsapp-template/list',
            body: { page, per_page: 10, search },
            json: true,
          });

          let templates: IDataObject[] = [];
          if (Array.isArray(responseData)) templates = responseData;
          else if ((responseData as IDataObject).data && Array.isArray((responseData as IDataObject).data)) templates = (responseData as IDataObject).data as IDataObject[];

          for (const template of templates) {
            const templateName = template.name as string;
            const templateLanguage = (template.language || 'pt_BR') as string;
            if (templateName) returnData.push({ name: `${templateName} (${templateLanguage})`, value: templateName });
          }
          return returnData;
        } catch (error: any) {
          throw new NodeOperationError(this.getNode(), `Erro ao carregar templates WhatsApp: ${error.message}`);
        }
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
            const firstName = this.getNodeParameter('firstName', i) as string;
            const lastName = this.getNodeParameter('lastName', i) as string;
            const email = this.getNodeParameter('email', i) as string;
            const phone = this.getNodeParameter('phone', i) as string;

            const body: IDataObject = {};
            if (firstName) body.first_name = firstName;
            if (lastName) body.last_name = lastName;
            if (email) body.email = email;
            if (phone) body.phone = phone;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'POST',
              url: 'https://roichatpartner.com.br/api/subscriber/create',
              body,
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'get') {
            const userNs = this.getNodeParameter('userNs', i) as string;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'GET',
              url: 'https://roichatpartner.com.br/api/subscriber/get-info',
              qs: { user_ns: userNs },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'search') {
            const filters = this.getNodeParameter('filters', i) as IDataObject;

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

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'GET',
              url: 'https://roichatpartner.com.br/api/subscribers',
              qs,
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'update') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

            const body: IDataObject = { user_ns: userNs };
            Object.assign(body, updateFields);

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'PUT',
              url: 'https://roichatpartner.com.br/api/subscriber/update',
              body,
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'delete') {
            const userNs = this.getNodeParameter('userNs', i) as string;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'DELETE',
              url: 'https://roichatpartner.com.br/api/subscriber/delete',
              body: { user_ns: userNs },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          }
        } else if (resource === 'tag') {
          if (operation === 'addToSubscriber') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const tagName = this.getNodeParameter('tagName', i) as string;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'POST',
              url: 'https://roichatpartner.com.br/api/subscriber/add-tag-by-name',
              body: { user_ns: userNs, tag_name: tagName },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'addMultipleTags') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const tagNames = this.getNodeParameter('tagNames', i) as string[];

            const data = (tagNames || []).map((name) => ({ tag_name: name }));

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'POST',
              url: 'https://roichatpartner.com.br/api/subscriber/add-tags-by-name',
              body: { user_ns: userNs, data },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'removeFromSubscriber') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const tagName = this.getNodeParameter('tagName', i) as string;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'DELETE',
              url: 'https://roichatpartner.com.br/api/subscriber/remove-tag-by-name',
              body: { user_ns: userNs, tag_name: tagName },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'removeMultipleTags') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const tagNames = this.getNodeParameter('tagNames', i) as string[];

            const data = (tagNames || []).map((name) => ({ tag_name: name }));

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'DELETE',
              url: 'https://roichatpartner.com.br/api/subscriber/remove-tags-by-name',
              body: { user_ns: userNs, data },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'create') {
            const tagName = this.getNodeParameter('tagNameCreate', i) as string;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'POST',
              url: 'https://roichatpartner.com.br/api/flow/create-tag',
              body: { name: tagName },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'delete') {
            const tagName = this.getNodeParameter('tagName', i) as string;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'DELETE',
              url: 'https://roichatpartner.com.br/api/flow/delete-tag-by-name',
              body: { name: tagName },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'getMany') {
            const options = this.getNodeParameter('options', i) as IDataObject;

            const qs: IDataObject = {};
            if (options.limit) qs.limit = options.limit;
            if (options.page) qs.page = options.page;
            if (options.name) qs.name = options.name;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'GET',
              url: 'https://roichatpartner.com.br/api/flow/tags',
              qs,
              json: true,
            });
            returnData.push(responseData as IDataObject);
          }
        } else if (resource === 'customField') {
          if (operation === 'getMany') {
            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'GET',
              url: 'https://roichatpartner.com.br/api/flow/user-fields',
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'setFieldValue') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const varNs = this.getNodeParameter('fieldName', i) as string;
            const fieldValue = this.getNodeParameter('fieldValue', i) as string;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'PUT',
              url: 'https://roichatpartner.com.br/api/subscriber/set-user-field',
              body: { user_ns: userNs, var_ns: varNs, value: fieldValue },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'setMultipleFields') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const fieldsUi = this.getNodeParameter('fieldsUi', i) as IDataObject;

            const fields = (fieldsUi.fieldValues as IDataObject[]) || [];
            const data = fields.map((field) => ({ var_ns: field.fieldName as string, value: field.fieldValue as string }));

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'PUT',
              url: 'https://roichatpartner.com.br/api/subscriber/set-user-fields',
              body: { user_ns: userNs, data },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          }
        } else if (resource === 'flow') {
          if (operation === 'sendToSubscriber') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const flowId = this.getNodeParameter('flowName', i) as string;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'POST',
              url: 'https://roichatpartner.com.br/api/subscriber/send-sub-flow',
              body: { user_ns: userNs, flow_id: flowId },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'getMany') {
            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'GET',
              url: 'https://roichatpartner.com.br/api/flow/subflows',
              json: true,
            });
            returnData.push(responseData as IDataObject);
          }
        } else if (resource === 'broadcast') {
          if (operation === 'send') {
            const message = this.getNodeParameter('message', i) as string;
            const userNsList = this.getNodeParameter('userNsList', i) as string;
            const users = userNsList.split(',').map((u) => u.trim());

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'POST',
              url: 'https://roichatpartner.com.br/api/subscriber/broadcast',
              body: { user_ns_list: users, content: message },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          } else if (operation === 'sendByTag') {
            const message = this.getNodeParameter('message', i) as string;
            const tagName = this.getNodeParameter('tagName', i) as string;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'POST',
              url: 'https://roichatpartner.com.br/api/subscriber/broadcast-by-tag',
              body: { tag_name: tagName, content: message },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          }
        } else if (resource === 'whatsappTemplate') {
          if (operation === 'send') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const templateName = this.getNodeParameter('templateName', i) as string;
            const templateParameters = this.getNodeParameter('templateParameters', i, '') as string;

            const body: IDataObject = { user_ns: userNs, template_name: templateName };
            if (templateParameters) {
              try {
                body.parameters = JSON.parse(templateParameters);
              } catch {
                throw new NodeOperationError(this.getNode(), 'Parâmetros do template devem ser um JSON válido');
              }
            }

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'POST',
              url: 'https://roichatpartner.com.br/api/subscriber/send-whatsapp-template',
              body,
              json: true,
            });
            returnData.push(responseData as IDataObject);
          }
        } else if (resource === 'conversation') {
          if (operation === 'getHistory') {
            const userNs = this.getNodeParameter('userNs', i) as string;
            const limit = this.getNodeParameter('limit', i) as number;

            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'roiChatApi', {
              method: 'GET',
              url: 'https://roichatpartner.com.br/api/subscriber/chat-messages',
              qs: { user_ns: userNs, limit },
              json: true,
            });
            returnData.push(responseData as IDataObject);
          }
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ error: (error as any).message });
          continue;
        }
        throw error;
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}