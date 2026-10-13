import React, { useState, useEffect } from 'react';
import { ProgressBar } from './ProgressBar';
import { ShippingForm } from './ShippingForm';
import { PaymentForm } from './PaymentForm';
import { OrderReview } from './OrderReview';
import { Confirmation } from './Confirmation';
import { ShippingData, PaymentData, Order } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useSessionStore } from '../../store/sessionStore';
import { tracker } from '../../lib/tracker';
import { api } from '../../lib/api';

const defaultShipping: ShippingData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
};

const defaultPayment: PaymentData = {
  method: 'credit_card',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardholderName: '',
};

export const CheckoutWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [shippingData, setShippingData] = useState<ShippingData>(defaultShipping);
  const [paymentData, setPaymentData] = useState<PaymentData>(defaultPayment);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { cart, fetchCart } = useCartStore();
  const completeTask = useSessionStore((state) => state.completeTask);

  useEffect(() => {
    fetchCart();
    tracker.track('checkout_step', 'checkout_wizard', { step: 1, stepName: 'shipping' });
  }, [fetchCart]);

  const handleShippingSubmit = (data: ShippingData) => {
    setShippingData(data);
    setCurrentStep(2);
    tracker.track('checkout_step', 'checkout_wizard', { step: 2, stepName: 'payment' });
  };

  const handlePaymentSubmit = (data: PaymentData) => {
    setPaymentData(data);
    setCurrentStep(3);
    tracker.track('checkout_step', 'checkout_wizard', { step: 3, stepName: 'review' });
  };

  const handleStepBack = (toStep: number) => {
    tracker.track('checkout_back', 'checkout_wizard', { fromStep: currentStep, toStep });
    setCurrentStep(toStep);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const sessionId = tracker.getSessionId();
      const order = await api.createOrder({
        sessionId,
        shippingData,
        paymentMethod: paymentData.method,
      });

      setPlacedOrder(order);
      setCurrentStep(4);

      tracker.track('checkout_complete', 'checkout_wizard', {
        orderId: order.id,
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount,
        paymentMethod: order.paymentMethod,
      });

      // Also mark Task 5 (or any active checkout task) completed
      completeTask('task_5');
    } catch (err: any) {
      alert('Error finalizing order: ' + (err?.message || 'Please try again.'));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProgressBar
        currentStep={currentStep}
        onStepClick={(step) => handleStepBack(step)}
      />

      <div className="max-w-3xl mx-auto">
        {currentStep === 1 && (
          <ShippingForm
            initialValues={shippingData}
            onSubmit={handleShippingSubmit}
          />
        )}

        {currentStep === 2 && (
          <PaymentForm
            initialValues={paymentData}
            onSubmit={handlePaymentSubmit}
            onBack={() => handleStepBack(1)}
          />
        )}

        {currentStep === 3 && (
          <OrderReview
            shippingData={shippingData}
            paymentData={paymentData}
            cart={cart}
            onEditShipping={() => handleStepBack(1)}
            onEditPayment={() => handleStepBack(2)}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => handleStepBack(2)}
            isPlacingOrder={isPlacingOrder}
          />
        )}

        {currentStep === 4 && (
          <Confirmation order={placedOrder} />
        )}
      </div>
    </div>
  );
};
