import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import { NativePaymentButton } from "../components/NativePaymentButton";

const stripePublicKey = "pk_live_aiaR8bh0yCqQqHVYcNXcEDkq";
const stripePromise = loadStripe(stripePublicKey);
const IndexPage = () => (
  <div>
    Hi
    <Elements stripe={stripePromise}>
      <NativePaymentButton />
    </Elements>
  </div>
);

export default IndexPage;
