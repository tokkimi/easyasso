import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, requireApiPermission } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';

const FULFILLMENT = new Set(['UNFULFILLED', 'PREPARING', 'ON_HOLD', 'FULFILLED', 'CANCELLED']);
const DELIVERY = new Set(['NOT_SHIPPED', 'READY_TO_SHIP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'CANCELLED']);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.LOGISTICS_EDIT);
    const { id } = await params;
    const order = await prisma.order.findFirst({ where: { id, organizationId: ctx.org.id } });
    if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    const b = await req.json().catch(() => ({}));
    const fulfillmentStatus = String(b.fulfillmentStatus || order.fulfillmentStatus);
    const deliveryStatus = String(b.deliveryStatus || order.deliveryStatus);
    if (!FULFILLMENT.has(fulfillmentStatus) || !DELIVERY.has(deliveryStatus)) return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
    const trackingNumber = String(b.trackingNumber ?? order.trackingNumber).trim().slice(0, 160);
    if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(deliveryStatus) && !trackingNumber) {
      return NextResponse.json({ error: 'Ajoutez le numéro de suivi avant de déclarer cette commande expédiée.' }, { status: 400 });
    }
    const now = new Date();
    const trackingUrl = String(b.trackingUrl ?? order.trackingUrl).trim().slice(0, 1000);
    const carrier = String(b.carrier ?? order.carrier).trim().slice(0, 100);
    const customerNote = String(b.customerNote ?? order.customerNote).trim().slice(0, 2000);
    const internalNote = String(b.internalNote ?? order.internalNote).trim().slice(0, 4000);
    const changed = [
      fulfillmentStatus !== order.fulfillmentStatus ? `Préparation : ${fulfillmentStatus}` : '',
      deliveryStatus !== order.deliveryStatus ? `Livraison : ${deliveryStatus}` : '',
      trackingNumber !== order.trackingNumber ? `Suivi : ${trackingNumber || 'retiré'}` : '',
    ].filter(Boolean).join(' · ');
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id },
        data: {
          fulfillmentStatus, deliveryStatus, trackingNumber, trackingUrl, carrier, customerNote, internalNote,
          status: deliveryStatus === 'CANCELLED' || fulfillmentStatus === 'CANCELLED' ? 'CANCELLED' : ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(deliveryStatus) ? 'SHIPPED' : order.paymentStatus === 'PAID' ? 'PAID' : order.status,
          ...(fulfillmentStatus === 'PREPARING' && !order.preparingAt ? { preparingAt: now } : {}),
          ...(['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(deliveryStatus) && !order.shippedAt ? { shippedAt: now } : {}),
          ...(deliveryStatus === 'DELIVERED' && !order.deliveredAt ? { deliveredAt: now } : {}),
          ...((deliveryStatus === 'CANCELLED' || fulfillmentStatus === 'CANCELLED') && !order.cancelledAt ? { cancelledAt: now } : {}),
        },
        include: { items: true, events: { orderBy: { createdAt: 'desc' } } },
      });
      if (changed || customerNote !== order.customerNote) await tx.orderEvent.create({
        data: {
          orderId: id, type: 'STATUS_UPDATED', title: deliveryStatus === 'DELIVERED' ? 'Commande livrée' : deliveryStatus === 'IN_TRANSIT' ? 'Commande expédiée' : fulfillmentStatus === 'PREPARING' ? 'Préparation en cours' : 'Commande mise à jour',
          detail: customerNote || changed, actorType: 'STAFF', actorId: ctx.userId, actorName: 'Équipe logistique', visibleToCustomer: true,
          metadata: { fulfillmentStatus, deliveryStatus, carrier, trackingNumber },
        },
      });
      return result;
    });
    return NextResponse.json({ order: updated });
  } catch (e) { return handleApiError(e); }
}
