const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "https://dwosrwbutepaifdwiitl.supabase.co";
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3b3Nyd2J1dGVwYWlmZHdpaXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTQ3NTcsImV4cCI6MjA5MzczMDc1N30.r0JBp8eMdRzdgm4C9kqMG9icTcVbMJJDsAXaPoqPdPs";

function edgeHeaders() {
  return {
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface PixItem {
  title: string;
  unitPrice: number;
  quantity: number;
}

export interface PixCustomer {
  name: string;
  email: string;
  cpf: string;
  phone: string;
}

export interface CreatePixParams {
  externalId: string;
  amount: number;
  items: PixItem[];
  customer: PixCustomer;
}

export interface PixTransaction {
  id: string;
  brcode: string;
  qrcode: string;
  status: string;
}

export async function createPix(params: CreatePixParams): Promise<PixTransaction> {
  const body = {
    external_id: params.externalId,
    payment_method: "pix",
    amount: params.amount,
    pix: { expires_in_days: 1 },
    items: params.items.map(i => ({
      title: i.title,
      unit_price: i.unitPrice,
      quantity: i.quantity,
    })),
    buyer: {
      name: params.customer.name,
      email: params.customer.email,
      cpf: params.customer.cpf,
      phone: `55${params.customer.phone}`,
    },
  };

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-pix-charge`, {
    method: "POST",
    headers: edgeHeaders(),
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Resposta inválida do servidor (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const detail = data?.error?.detail ?? data?.message ?? data?.error ?? data;
    const msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
    throw new Error(msg || `Erro ao gerar Pix (${res.status})`);
  }

  const tx = data.data ?? data;
  return {
    id: tx.id,
    brcode: tx.pix?.code ?? "",
    qrcode: tx.pix?.qrcode_base64 ?? "",
    status: tx.status,
  };
}

export async function getTransactionStatus(id: string): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/check-pix-status?id=${encodeURIComponent(id)}`,
    { headers: edgeHeaders() }
  );

  if (!res.ok) return "unknown";

  const text = await res.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    return "unknown";
  }
  const tx = (data.data ?? data) as Record<string, unknown>;
  return tx.status as string;
}
