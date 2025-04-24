import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import PricingCards from "../components/payment/pricing-cards";
import { Link } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder';
const stripePromise = loadStripe(stripeKey);

// Function to check if Stripe key is a placeholder
const isStripeKeyValid = () => {
  return stripeKey !== 'pk_test_placeholder';
};

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
      setIsProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      // The confirmation happens on the return_url page
    }
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
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Processing...
          </span>
        ) : (
          `Pay €${(amount / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    description: string;
    price: number;
    priceDisplay: string;
    features: string[];
    subscription?: boolean;
  } | null>(null);
  const [showPricingCards, setShowPricingCards] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Only create PaymentIntent for one-time payments when a plan is selected
    if (selectedPlan && !selectedPlan.subscription) {
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: selectedPlan.price * 100, // Convert to cents for API
        currency: "eur" 
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast({
              title: "Payment Error",
              description: data.error.message || "Could not create payment intent",
              variant: "destructive"
            });
          } else {
            setClientSecret(data.clientSecret);
          }
        })
        .catch(error => {
          console.error("Error creating payment intent:", error);
          toast({
            title: "Payment Error",
            description: "Could not setup payment. Please try again.",
            variant: "destructive"
          });
        });
    }
  }, [selectedPlan, toast]);

  const handlePlanSelect = (plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    priceDisplay: string;
    features: string[];
    subscription?: boolean;
  }) => {
    // If subscription plan is selected, redirect to subscription page
    if (plan.subscription) {
      window.location.href = "/subscribe";
      return;
    }
    
    setSelectedPlan(plan);
    setShowPricingCards(false);
  };

  if (showPricingCards) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your needs. All plans include access to our construction site management system.
          </p>
        </div>
        <PricingCards onSelectPlan={handlePlanSelect} />
      </div>
    );
  }

  if (!isStripeKeyValid()) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Checkout Unavailable</h1>
          <p className="text-muted-foreground">
            The Stripe public key is not configured. Please add the VITE_STRIPE_PUBLIC_KEY
            environment variable with a valid Stripe public key.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Go Back Home</Link>
        </Button>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Checkout</h1>
          <p className="text-muted-foreground">Please select a plan to proceed with checkout</p>
        </div>
        <Button 
          onClick={() => setShowPricingCards(true)}
          variant="outline"
        >
          <span className="mr-2">←</span>
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
        <h1 className="text-2xl font-bold mb-1">Checkout</h1>
        <p className="text-muted-foreground">Complete your payment to access the selected plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="font-medium">{selectedPlan.name}</span>
              <span className="font-bold">{selectedPlan.priceDisplay}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{selectedPlan.description}</p>
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Includes:</p>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="text-primary mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{selectedPlan.priceDisplay}</span>
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
              <CheckoutForm amount={selectedPlan.price * 100} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
