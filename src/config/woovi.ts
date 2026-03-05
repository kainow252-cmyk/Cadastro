/**
 * Woovi/OpenPix Configuration
 * 
 * API Documentation: https://developers.woovi.com
 * Webhook Docs: https://developers.woovi.com/docs/webhook
 */

export interface WooviConfig {
  appId: string;
  baseUrl: string;
  webhookPublicKey: string;
}

export interface WooviCustomer {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    zipcode?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    complement?: string;
    country?: string;
  };
  taxID: {
    taxID: string;
    type: 'BR:CPF' | 'BR:CNPJ';
  };
  correlationID?: string;
}

export interface WooviCharge {
  correlationID: string;
  value: number; // em centavos
  comment?: string;
  customer: WooviCustomer;
  additionalInfo?: Array<{
    key: string;
    value: string;
  }>;
}

export interface WooviSubscription {
  customer: WooviCustomer;
  dayGenerateCharge: number; // 1-28
  value: number; // em centavos
  status: 'ACTIVE' | 'INACTIVE';
  correlationID: string;
}

export interface WooviSplitRule {
  pixKey: string;
  value: number; // em centavos (valor fixo)
}

export interface WooviChargeResponse {
  charge: {
    correlationID: string;
    value: number;
    status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
    brCode: string; // PIX Copia e Cola
    qrCodeImage: string; // URL da imagem QR Code
    paymentLinkUrl: string; // URL para pagamento
    globalID?: string;
  };
}

export interface WooviSubscriptionResponse {
  subscription: {
    customer: WooviCustomer;
    dayGenerateCharge: number;
    value: number;
    status: 'ACTIVE' | 'INACTIVE';
    correlationID: string;
    pixRecurring?: {
      recurrencyId: string;
      emv: string;
      journey: string;
      status: string;
    };
    globalID: string;
  };
}

export interface WooviWebhookEvent {
  event: 
    | 'OPENPIX:CHARGE_CREATED'
    | 'OPENPIX:CHARGE_COMPLETED'
    | 'OPENPIX:CHARGE_EXPIRED'
    | 'OPENPIX:SUBSCRIPTION_CREATED'
    | 'OPENPIX:SUBSCRIPTION_PAID'
    | 'OPENPIX:SUBSCRIPTION_CANCELLED'
    | 'OPENPIX:TRANSACTION_RECEIVED';
  charge?: any;
  subscription?: any;
  transaction?: any;
}

/**
 * Adaptadores para converter entre Asaas e Woovi
 */
export class WooviAdapter {
  /**
   * Converte CPF/CNPJ para formato Woovi
   */
  static adaptTaxID(cpfCnpj: string): { taxID: string; type: 'BR:CPF' | 'BR:CNPJ' } {
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '');
    return {
      taxID: cleanCpfCnpj,
      type: cleanCpfCnpj.length === 11 ? 'BR:CPF' : 'BR:CNPJ'
    };
  }

  /**
   * Converte valor decimal (R$) para centavos
   */
  static adaptValue(decimalValue: number): number {
    return Math.round(decimalValue * 100);
  }

  /**
   * Converte centavos para decimal (R$)
   */
  static adaptValueToCurrency(centavos: number): number {
    return centavos / 100;
  }

  /**
   * Converte cliente Asaas para Woovi
   */
  static adaptCustomer(asaasCustomer: any): WooviCustomer {
    return {
      name: asaasCustomer.name,
      email: asaasCustomer.email,
      phone: asaasCustomer.mobilePhone || asaasCustomer.phone,
      taxID: this.adaptTaxID(asaasCustomer.cpfCnpj),
      correlationID: asaasCustomer.externalReference || undefined
    };
  }

  /**
   * Converte split Asaas (walletId) para Woovi (pixKey)
   * 
   * ATENÇÃO: Na Woovi, o split é feito por chave PIX da subconta,
   * não por walletId como no Asaas.
   */
  static adaptSplit(asaasSplit: any, subaccountPixKey: string): WooviSplitRule {
    return {
      pixKey: subaccountPixKey,
      value: this.adaptValue(asaasSplit.fixedValue)
    };
  }

  /**
   * Gera correlationID único
   */
  static generateCorrelationID(prefix: string = 'charge'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * Cliente API Woovi
 */
export class WooviClient {
  private appId: string;
  private baseUrl: string;

  constructor(appId: string, baseUrl: string = 'https://api.woovi.com/api/v1') {
    this.appId = appId;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.appId,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Woovi API Error [${response.status}]: ${errorBody}`
      );
    }

    return response.json();
  }

  /**
   * Criar cobrança PIX simples
   */
  async createCharge(charge: WooviCharge): Promise<WooviChargeResponse> {
    return this.request<WooviChargeResponse>('/charge', {
      method: 'POST',
      body: JSON.stringify(charge),
    });
  }

  /**
   * Buscar cobrança por correlationID
   */
  async getCharge(correlationID: string): Promise<WooviChargeResponse> {
    return this.request<WooviChargeResponse>(`/charge?correlationID=${correlationID}`);
  }

  /**
   * Criar assinatura PIX Automático
   */
  async createSubscription(
    subscription: WooviSubscription
  ): Promise<WooviSubscriptionResponse> {
    return this.request<WooviSubscriptionResponse>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
    });
  }

  /**
   * Buscar assinatura por correlationID
   */
  async getSubscription(correlationID: string): Promise<WooviSubscriptionResponse> {
    return this.request<WooviSubscriptionResponse>(
      `/subscriptions?correlationID=${correlationID}`
    );
  }

  /**
   * Listar todas as assinaturas
   */
  async listSubscriptions(skip: number = 0, limit: number = 100) {
    return this.request<{
      subscriptions: any[];
      pageInfo: {
        skip: number;
        limit: number;
        totalCount: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
      };
    }>(`/subscriptions?skip=${skip}&limit=${limit}`);
  }
}

export default WooviClient;
