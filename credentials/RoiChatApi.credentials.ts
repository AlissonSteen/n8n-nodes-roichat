import {
        IAuthenticateGeneric,
        ICredentialTestRequest,
        ICredentialType,
        INodeProperties,
        Icon,
} from 'n8n-workflow';

export class RoiChatApi implements ICredentialType {
        name = 'roiChatApi';
        displayName = 'RoiChat API';
        documentationUrl = 'https://roichatpartner.com.br/api';
        icon: Icon = 'file:roichat.svg';
        properties: INodeProperties[] = [
                {
                        displayName: 'API Key',
                        name: 'apiKey',
                        type: 'string',
                        typeOptions: {
                                password: true,
                        },
                        default: '',
                        required: true,
                        description: 'API Key para autenticação na API do RoiChat',
                },
        ];

        authenticate: IAuthenticateGeneric = {
                type: 'generic',
                properties: {
                        headers: {
                                'Authorization': '=Bearer {{$credentials.apiKey}}',
                        },
                },
        };

        test: ICredentialTestRequest = {
                request: {
                        baseURL: 'https://roichatpartner.com.br/api',
                        url: '/flow/bot-fields',
                        method: 'GET',
                },
        };
}
