import axios from 'axios';
import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { loadStripe, PaymentRequest } from "@stripe/stripe-js";
import React, { useEffect, useState } from "react";

const eventApiId = 'evt-9FLb0YWFrpW3Rwn'
const currency = 'usd';
const amountCents = 1000;
const stripeAccountId = 'acct_1GdONDIK9ODWQCg3';
const stripePublicKey = 'pk_live_aiaR8bh0yCqQqHVYcNXcEDkq';

export const useNativePay = (): {
  isLoading: boolean;
  paymentRequest: PaymentRequest | null;
} => {
  const [isLoading, setIsLoading] = useState(true);

  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null
  );

  const setupPaymentRequest = async () => {
    try {
      const stripeConnect = await loadStripe(stripePublicKey, {
        stripeAccount: stripeAccountId,
      });

      if (!stripeConnect) {
        console.error('fuck no connect')
        setIsLoading(false)
        return
      }

      const pr = stripeConnect.paymentRequest({
        country: "US",
        currency: currency,
        total: {
          label: "Event Ticket",
          amount: amountCents,
        },
        requestPayerEmail: true,
      });

      // Check the availability of the Payment Request API.
      const result = await pr.canMakePayment();

      if (result) {
        setPaymentRequest(pr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setupPaymentRequest();
  }, []);

  return {
    isLoading,
    paymentRequest,
  };
};

export const NativePaymentButton = () => {
  const {paymentRequest, isLoading} = useNativePay()


  if (isLoading) {
    return <div>Loading</div>
  }

  if (!paymentRequest ) {
    return <div>No payment request</div>
  }

  const collectPayment = async () => {
    const { client_secret } = await axios.post(
      "https://api.zmurl.com/payments/start-payment-intent",
      {
        payment_method_id: "payment-request-api",
        event_api_id: eventApiId,
        email: 'victor+apple@pont.is',
        payment_type: 'registration',
        registration_answers: null,
        amount_cents: amountCents,
      }
    );
    paymentRequest.on("paymentmethod", async (ev) => {
      const stripeConnect = await loadStripe(stripePublicKey, {
        stripeAccount: stripeAccountId,
      });

      if (!stripeConnect) {
        console.error('why no connect');
        return;
      }

      // Confirm the PaymentIntent without handling potential next actions (yet).
      const { error: confirmError } = await stripeConnect.confirmCardPayment(
        client_secret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: true }
      );

      if (confirmError) {
        // Report to the browser that the payment failed, prompting it to
        // re-show the payment interface, or show an error message and close
        // the payment interface.
        ev.complete("fail");
        return;
      }

      // Report to the browser that the confirmation was successful, prompting
      // it to close the browser payment method collection interface.
      ev.complete("success");

      // TODO: Stripe docs have another confirmCardPayment here, do we need that?
    });
  };


  return (
    <PaymentRequestButtonElement
      options={{ paymentRequest }}
      onClick={collectPayment}
    />
  );
};
