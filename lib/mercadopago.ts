import { MercadoPagoConfig, Preference } from 'mercadopago';

export function getMercadoPagoClient(): MercadoPagoConfig | null {
  const token = (process.env.MP_ACCESS_TOKEN || '').trim();
  if (!token || token.length < 10) {
    return null;
  }
  return new MercadoPagoConfig({
    accessToken: token,
    options: { timeout: 10000 },
  });
}

export function isMercadoPagoConfigured(): boolean {
  const token = (process.env.MP_ACCESS_TOKEN || '').trim();
  return Boolean(token && token.length > 10);
}

export interface CreatePreferenceInput {
  voteId: string;
  playerId: string;
  playerName: string;
  amount: number;
  donorName: string;
  comment?: string;
  baseUrl: string;
}

export async function createMercadoPagoPreference(input: CreatePreferenceInput) {
  const client = getMercadoPagoClient();
  if (!client) {
    throw new Error(
      'Mercado Pago no está configurado. Agregá tu MP_ACCESS_TOKEN en las variables de entorno de Vercel.'
    );
  }

  const preference = new Preference(client);
  const cleanBaseUrl = input.baseUrl.replace(/\/$/, '');

  const preferenceBody: any = {
    items: [
      {
        id: `vote-${input.playerId}`,
        title: `Voto para ${input.playerName} - El GOAT`,
        description: input.comment
          ? `Bancando a ${input.playerName}: "${input.comment}"`
          : `Voto oficial por ${input.playerName} en el ranking de El GOAT`,
        quantity: 1,
        unit_price: Number(input.amount),
        currency_id: 'ARS',
      },
    ],
    payer: {
      name: input.donorName || 'Hincha Futbolero',
    },
    back_urls: {
      success: `${cleanBaseUrl}/?status=approved&voteId=${input.voteId}&player=${encodeURIComponent(input.playerName)}&amount=${input.amount}`,
      failure: `${cleanBaseUrl}/?status=failure`,
      pending: `${cleanBaseUrl}/?status=pending&voteId=${input.voteId}`,
    },
    auto_return: 'approved',
    external_reference: input.voteId,
    statement_descriptor: 'EL GOAT',
    metadata: {
      vote_id: input.voteId,
      player_id: input.playerId,
      player_name: input.playerName,
      donor_name: input.donorName,
    },
  };

  // Only attach notification_url if using public HTTPS URL (Mercado Pago rejects localhost/http)
  if (cleanBaseUrl.startsWith('https://')) {
    preferenceBody.notification_url = `${cleanBaseUrl}/api/webhooks/mercadopago`;
  }

  const response = await preference.create({ body: preferenceBody });

  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
  };
}
