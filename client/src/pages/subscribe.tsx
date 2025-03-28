import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

// Load Stripe outside of component to avoid recreating on render
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder';
const stripePromise = loadStripe(stripeKey);

// Monthly subscription plans
const subscriptionPlans = [
  {
    id: "done-for-you-monthly",
    name: "Done For You",
    description: "Professional management solution with complete features",
    price: 35,
    interval: "month",
    priceId: "price_your_stripe_price_id_here", // Replace with actual Stripe price ID
    features: [
      "Complete site management",
      "Unlimited projects",
      "Premium support",
      "Regular updates",
      "Cloud storage included",
      "Data analytics"
    ],
    popular: true
  }
];

// SubscriptionForm component
const SubscriptionForm = () => {
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
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Successful",
        description: "Thank you for subscribing!",
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
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Processing...
          </span>
        ) : (
          "Subscribe Now"
        )}
      </Button>
    </form>
  );
};

// Main subscribe page component
export default function SubscribePage() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(subscriptionPlans[0]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Create subscription when component mounts
    apiRequest("POST", "/api/get-or-create-subscription", { 
      priceId: selectedPlan.priceId
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast({
            title: "Error",
            description: data.error.message,
            variant: "destructive"
          });
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(error => {
        console.error("Error creating subscription:", error);
        toast({
          title: "Subscription Error",
          description: "Could not set up subscription. Please try again later.",
          variant: "destructive"
        });
      });
  }, [selectedPlan, user, toast]);

  if (!user) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Subscribe</h1>
          <p className="text-muted-foreground">Please log in to subscribe</p>
        </div>
        <Button asChild>
          <Link href="/auth">Log In</Link>
        </Button>
      </div>
    );
  }

  if (!selectedPlan.priceId) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Subscription Not Available</h1>
          <p className="text-muted-foreground">Subscription is currently unavailable. Please contact support.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Go Back Home</Link>
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
        <h1 className="text-2xl font-bold mb-1">Subscribe to {selectedPlan.name}</h1>
        <p className="text-muted-foreground">Complete your subscription to access premium features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="font-medium">{selectedPlan.name}</span>
              <span className="font-bold">€{selectedPlan.price}/{selectedPlan.interval}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{selectedPlan.description}</p>
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Includes:</p>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="mr-2 text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Secure subscription processing by Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscriptionForm />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}