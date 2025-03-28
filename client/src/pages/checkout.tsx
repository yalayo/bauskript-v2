import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PricingCards from "@/components/payment/pricing-cards";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder';
const stripePromise = loadStripe(stripeKey);

const CheckoutForm = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/settings?tab=subscription&status=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <span className="flex items-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Processing...
          </span>
        ) : (
          `Pay €${amount}`
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: number;
    description: string;
    features: string[];
  } | null>(null);
  const [showPricingCards, setShowPricingCards] = useState(true);

  useEffect(() => {
    // Only create PaymentIntent when a plan is selected
    if (selectedPlan) {
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: selectedPlan.price,
        currency: "eur" 
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch(error => {
          console.error("Error creating payment intent:", error);
        });
    }
  }, [selectedPlan]);

  const handlePlanSelect = (plan: {
    name: string;
    price: number;
    description: string;
    features: string[];
  }) => {
    setSelectedPlan(plan);
    setShowPricingCards(false);
  };

  if (showPricingCards) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-dark mb-3">Choose Your Plan</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Select the plan that best fits your needs. All plans include access to our construction site management system.
          </p>
        </div>
        <PricingCards onSelectPlan={handlePlanSelect} />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-dark mb-1">Checkout</h1>
          <p className="text-gray-500">Please select a plan to proceed with checkout</p>
        </div>
        <Button 
          onClick={() => setShowPricingCards(true)}
          variant="outline"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Plans
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-dark mb-1">Checkout</h1>
        <p className="text-gray-500">Complete your payment to access the selected plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="font-medium">{selectedPlan.name}</span>
              <span className="font-bold">€{selectedPlan.price}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{selectedPlan.description}</p>
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Includes:</p>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <i className="fas fa-check text-success mr-2"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>€{selectedPlan.price}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setShowPricingCards(true)}
            >
              Change Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Secure payment processing by Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm amount={selectedPlan.price} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
