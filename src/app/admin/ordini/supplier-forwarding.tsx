'use client';

import { useState, useEffect } from 'react';
import { Save, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SupplierForwardingProps {
  orderId: number;
  orderNumber: string;
  onRefresh: () => void;
}

interface Supplier {
  id: number;
  name: string;
  email: string | null;
}

interface SupplierForwarding {
  id: number;
  deliveryType: 'drop_ship' | 'sede_mos';
  supplierId: number;
  emailStatus: 'pending' | 'sent' | 'failed';
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
}

export function SupplierForwardingSection({
  orderId,
  orderNumber,
  onRefresh,
}: SupplierForwardingProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [forwarding, setForwarding] = useState<SupplierForwarding | null>(null);
  const [deliveryType, setDeliveryType] = useState<'drop_ship' | 'sede_mos'>('drop_ship');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forwarding_status, setForwardingStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [suppliersRes, forwardingRes] = await Promise.all([
          fetch('/api/admin/suppliers?limit=100'),
          fetch(`/api/admin/supplier-orders?orderId=${orderId}`),
        ]);

        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData.suppliers || []);

        const forwardingData = await forwardingRes.json();
        if (forwardingData.forwarding) {
          setForwarding(forwardingData.forwarding);
          setDeliveryType(forwardingData.forwarding.deliveryType);
          setSelectedSupplierId(forwardingData.forwarding.supplierId);
        }
      } catch (err) {
        console.error('Errore caricamento fornitori:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleSaveForwarding = async () => {
    if (!selectedSupplierId) {
      alert('Selezionare un fornitore');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/supplier-orders', {
        method: forwarding ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          deliveryType,
          supplierId: selectedSupplierId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setForwarding(data.forwarding);
        setForwardingStatus('success');
        setTimeout(() => setForwardingStatus(''), 2000);
        onRefresh();
      }
    } catch (err) {
      console.error('Errore salvataggio inoltra:', err);
      setForwardingStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleResendEmail = async () => {
    if (!forwarding) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/supplier-orders/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierOrderId: forwarding.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setForwarding(data.forwarding);
        onRefresh();
      }
    } catch (err) {
      console.error('Errore reinvio email:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Caricamento...</div>;
  }

  const getEmailStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const getEmailStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'In sospeso',
      sent: 'Inviato',
      failed: 'Errore',
    };
    return labels[status] || status;
  };

  const getEmailStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-heading font-bold text-navy mb-4">Inoltra al fornitore</h3>

      {forwarding && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Stato inoltro:</strong> Ordine inoltrato il{' '}
            {new Date(forwarding.createdAt).toLocaleDateString('it-IT')}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-blue-900">
              <strong>Email:</strong>
            </p>
            {getEmailStatusIcon(forwarding.emailStatus)}
            <span className={`text-xs px-2 py-0.5 rounded-full ${getEmailStatusColor(forwarding.emailStatus)}`}>
              {getEmailStatusLabel(forwarding.emailStatus)}
            </span>
          </div>
          {forwarding.emailStatus === 'failed' && forwarding.emailError && (
            <p className="text-xs text-red mt-2">{forwarding.emailError}</p>
          )}
          {forwarding.emailSentAt && (
            <p className="text-xs text-gray-600 mt-2">
              Inviato il {new Date(forwarding.emailSentAt).toLocaleString('it-IT')}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-500 font-medium block mb-1">Tipo di consegna</label>
          <select
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value as 'drop_ship' | 'sede_mos')}
            disabled={!!forwarding}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="drop_ship">DROP SHIP (al cliente)</option>
            <option value="sede_mos">CONSEGNA SEDE MOS</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {deliveryType === 'drop_ship'
              ? 'Il fornitore spedirà direttamente al cliente'
              : 'Il fornitore spedirà alla sede MOS'}
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-500 font-medium block mb-1">Fornitore</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
            disabled={!!forwarding}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value={0}>Seleziona un fornitore...</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.email ? `(${s.email})` : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedSupplier && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-700">{selectedSupplier.name}</p>
            {selectedSupplier.email && (
              <p className="text-gray-600">{selectedSupplier.email}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          {!forwarding ? (
            <button
              onClick={handleSaveForwarding}
              disabled={saving || !selectedSupplierId}
              className="flex items-center gap-1 px-4 py-2 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
            >
              <Send size={14} />
              {saving ? 'Inoltro...' : 'Inoltra al fornitore'}
            </button>
          ) : (
            <>
              <button
                onClick={handleResendEmail}
                disabled={saving || forwarding.emailStatus === 'sent'}
                className="flex items-center gap-1 px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                <Send size={14} />
                {saving ? 'Invio...' : 'Reinvia email'}
              </button>
              <button
                onClick={() => {
                  setForwarding(null);
                  setSelectedSupplierId(0);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Modifica
              </button>
            </>
          )}
        </div>

        {forwarding_status === 'success' && (
          <p className="text-sm text-green-600 font-medium">Salvato con successo!</p>
        )}
        {forwarding_status === 'error' && (
          <p className="text-sm text-red font-medium">Errore nel salvataggio</p>
        )}
      </div>
    </div>
  );
}
