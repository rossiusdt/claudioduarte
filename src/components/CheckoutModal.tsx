import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mail, Phone, User, CreditCard, Copy, CheckCircle, AlertCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { createPix, getTransactionStatus, type PixItem, type PixCustomer } from '../lib/buckpay';
import { track } from '../lib/analytics';

type Step = 'form' | 'pix' | 'success' | 'error';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSummary: string;
  items: PixItem[];
  totalAmount: number;
}

function formatCPF(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validateCPF(cpf: string) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(d[10]);
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function generateExternalId() {
  return `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const PAID_STATUSES = ['paid', 'approved', 'complete', 'completed'];
const FAILED_STATUSES = ['refused', 'expired', 'canceled', 'failed', 'chargeback'];

export default function CheckoutModal({ isOpen, onClose, selectedSummary, items, totalAmount }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [visible, setVisible] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [brcode, setBrcode] = useState('');
  const [qrcode, setQrcode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      stopPolling();
    }
  }, [isOpen, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startPolling = useCallback((id: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const status = await getTransactionStatus(id);
        setPollCount(c => c + 1);
        if (PAID_STATUSES.includes(status)) {
          stopPolling();
          track('payment_success', { total: totalAmount, summary: selectedSummary });
          setStep('success');
        } else if (FAILED_STATUSES.includes(status)) {
          stopPolling();
          setErrorMessage('Pagamento recusado ou expirado. Tente novamente.');
          setStep('error');
        }
      } catch {
        // keep polling on transient errors
      }
    }, 4000);
  }, [stopPolling]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().split(' ').length < 2) e.name = 'Informe seu nome completo';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Informe um e-mail válido';
    if (phone.replace(/\D/g, '').length < 10) e.phone = 'Informe um telefone válido';
    if (!validateCPF(cpf)) e.cpf = 'CPF inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const customer: PixCustomer = {
        name: name.trim(),
        email: email.trim(),
        cpf: cpf.replace(/\D/g, ''),
        phone: phone.replace(/\D/g, ''),
      };
      const tx = await createPix({
        externalId: generateExternalId(),
        amount: totalAmount,
        items,
        customer,
      });
      setBrcode(tx.brcode);
      setQrcode(tx.qrcode);
      setStep('pix');
      track('pix_generated', { total: totalAmount, summary: selectedSummary });
      startPolling(tx.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar o Pix. Tente novamente.';
      setErrorMessage(msg);
      track('payment_error', { error: msg, total: totalAmount });
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // silent
    }
  };

  const handleRetry = () => {
    stopPolling();
    setStep('form');
    setErrorMessage('');
    setBrcode('');
    setQrcode('');
    setPollCount(0);
  };

  const handleClose = () => {
    stopPolling();
    onClose();
    setTimeout(() => {
      setStep('form');
      setErrorMessage('');
      setBrcode('');
      setQrcode('');
      setPollCount(0);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300 overflow-hidden ${
          visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
        }`}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#1a0a0a] to-[#3d0f0f] px-6 pt-8 pb-6 text-center">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <img src="/sympla-logo.png" alt="Sympla" className="h-8 object-contain mx-auto mb-4 brightness-0 invert" />
          <h2 className="text-white text-xl font-bold leading-tight">
            {step === 'form' && 'Finalizar Compra'}
            {step === 'pix' && 'Pague com Pix'}
            {step === 'success' && 'Pagamento Confirmado!'}
            {step === 'error' && 'Algo deu errado'}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {step === 'form' && 'Preencha seus dados para continuar'}
            {step === 'pix' && 'Escaneie o QR Code ou copie o código'}
            {step === 'success' && 'Seu ingresso foi confirmado'}
            {step === 'error' && 'Não foi possível processar o pagamento'}
          </p>
        </div>

        {/* Summary pill */}
        {step !== 'success' && (
          <div className="mx-6 -mt-3 mb-5">
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500 font-medium shrink-0">Selecionado</p>
              <p className="text-sm font-semibold text-gray-800 text-right leading-tight">{selectedSummary}</p>
            </div>
          </div>
        )}

        {/* STEP: Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <Field label="Nome completo" icon={<User className="w-4 h-4 text-gray-400" />} error={errors.name}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome completo"
                className={inputClass(!!errors.name)}
              />
            </Field>

            <Field label="E-mail" icon={<Mail className="w-4 h-4 text-gray-400" />} error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={inputClass(!!errors.email)}
              />
            </Field>

            <Field label="Telefone / WhatsApp" icon={<Phone className="w-4 h-4 text-gray-400" />} error={errors.phone}>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className={inputClass(!!errors.phone)}
              />
            </Field>

            <Field label="CPF" icon={<CreditCard className="w-4 h-4 text-gray-400" />} error={errors.cpf}>
              <input
                type="text"
                value={cpf}
                onChange={e => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                className={inputClass(!!errors.cpf)}
              />
            </Field>

            <div className="pt-1">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900 text-base">{formatCurrency(totalAmount)}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1a0a0a] to-[#3d0f0f] hover:from-[#0d0505] hover:to-[#5a1515] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Gerando Pix...</>
                ) : (
                  <>Gerar Pix <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
            <p className="text-xs text-center text-gray-400">Seus dados são usados apenas para emissão do ingresso</p>
          </form>
        )}

        {/* STEP: Pix QR Code */}
        {step === 'pix' && (
          <div className="px-6 pb-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Valor a pagar</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>

            <div className="flex justify-center">
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-inner">
                {qrcode ? (
                  <img
                    src={qrcode.startsWith('data:') ? qrcode : `data:image/png;base64,${qrcode}`}
                    alt="QR Code Pix"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {brcode && (
              <div className="space-y-2">
                <p className="text-xs text-center text-gray-500 font-medium uppercase tracking-wide">Pix Copia e Cola</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start gap-2">
                  <p className="text-xs text-gray-600 flex-1 break-all font-mono leading-relaxed line-clamp-3">{brcode}</p>
                  <button
                    onClick={() => { handleCopy(); track('pix_copied', { total: totalAmount }); }}
                    className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      copied ? 'bg-green-100 text-green-700' : 'bg-red-50 text-[#3d0f0f] hover:bg-red-100'
                    }`}
                  >
                    {copied ? (
                      <><CheckCircle className="w-3.5 h-3.5" /> Copiado</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copiar</>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3d0f0f]" />
              <span>Aguardando pagamento{pollCount > 0 ? ` (verificado ${pollCount}x)` : ''}...</span>
            </div>

            <p className="text-xs text-center text-gray-400">
              O QR Code expira em 24 horas. Assim que o pagamento for confirmado, seu ingresso será enviado por e-mail.
            </p>

            <button
              onClick={handleRetry}
              className="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Recomeçar
            </button>
          </div>
        )}

        {/* STEP: Success */}
        {step === 'success' && (
          <div className="px-6 pb-8 text-center space-y-4">
            <div className="flex justify-center pt-2">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pagamento confirmado!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Seu ingresso foi processado com sucesso. Confira seu e-mail{' '}
                <span className="font-medium text-gray-700">{email}</span> em breve.
              </p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <p className="text-xs text-green-700 font-medium">{selectedSummary}</p>
              <p className="text-lg font-bold text-green-800 mt-0.5">{formatCurrency(totalAmount)}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        )}

        {/* STEP: Error */}
        {step === 'error' && (
          <div className="px-6 pb-8 text-center space-y-4">
            <div className="flex justify-center pt-2">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ops, algo deu errado</h3>
              <p className="text-sm text-gray-500 mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-[#1a0a0a] to-[#3d0f0f] hover:from-[#0d0505] hover:to-[#5a1515] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </button>
            <button
              onClick={handleClose}
              className="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-colors ${
    hasError
      ? 'border-red-400 focus:border-red-500 bg-red-50'
      : 'border-gray-200 focus:border-[#e8a838] bg-gray-50 focus:bg-white'
  }`;
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
