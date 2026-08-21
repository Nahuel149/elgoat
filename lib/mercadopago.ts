import { MercadoPagoConfig, Preference } from 'mercadopago';

// Access token from environment or fallback
const accessToken = process.env.MP_ACCESS_TOKEN || '';

const client = accessToken
  ? new MercadoPagoConfig({
      accessToken,
      options: { timeout: 7000 },
    })
  : null;

export const isMercadoPagoConfigured = Boolean(accessToken && accessToken.length > 10);

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
  if (!client || !isMercadoPagoConfigured) {
    throw new Error(
      'Mercado Pago no está configurado. Agregá tu MP_ACCESS_TOKEN en .env.local o utilizá el Modo Simulación.'
    );
  }

  const preference = new Preference(client);

  const cleanBaseUrl = input.baseUrl.replace(/\/$/, '');

  const response = await preference.create({
    body: {
      items: [
        {
          id: `vote-${input.playerId}`,
          title: `Voto para ${input.playerName} - El GOAT`,
          description: input.comment
            ? `Bancando a ${input.playerName}: "${input.comment}"`
            : `Voto oficial por ${input.playerName} en el ranking del GOAT`,
          quantity: 1,
          unit_price: Number(input.amount),
          currency_id: 'ARS',
        },
      ],
      payer: {
        name: input.donorName || 'Votante Futbolero',
      },
      back_urls: {
        success: `${cleanBaseUrl}/?status=approved&voteId=${input.voteId}&player=${encodeURIComponent(input.playerName)}&amount=${input.amount}`,
        failure: `${cleanBaseUrl}/?status=failure`,
        pending: `${cleanBaseUrl}/?status=pending&voteId=${input.voteId}`,
      },
      auto_return: 'approved',
      external_reference: input.voteId,
      notification_url: `${cleanBaseUrl}/api/webhooks/mercadopago`,
      statement_descriptor: 'GOAT FUTBOL',
      metadata: {
        vote_id: input.voteId,
        player_id: input.playerId,
        player_name: input.playerName,
        donor_name: input.donorName,
      },
    },
  });

  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
  };
}
