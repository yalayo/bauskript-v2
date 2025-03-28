import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  features: string[];
  popular?: boolean;
  oneTime?: boolean;
  subscription?: boolean;
  priceId?: string;
}

const plans: PricingPlan[] = [
  {
    id: "done-by-you",
    name: "Done By You",
    description: "Perfect for DIY construction managers",
    price: 950,
    priceDisplay: "€950",
    oneTime: true,
    features: [
      "One-time installation package",
      "Full access to all features",
      "Basic setup and configuration",
      "Limited email support",
      "Access to knowledge base"
    ]
  },
  {
    id: "done-for-you",
    name: "Done For You",
    description: "Professional management solution",
    price: 35,
    priceDisplay: "€35/month",
    popular: true,
    subscription: true,
    priceId: "price_your_stripe_price_id_here", // This should be replaced with the actual Stripe price ID
    features: [
      "Complete site management",
      "Unlimited projects",
      "Premium support",
      "Regular updates",
      "Cloud storage included",
      "Data analytics"
    ]
  },
  {
    id: "done-with-you",
    name: "Done With You",
    description: "Comprehensive enterprise solution",
    price: 2700,
    priceDisplay: "€2,700",
    oneTime: true,
    features: [
      "One-time enterprise setup",
      "Customized implementation",
      "Dedicated support team",
      "System integration",
      "Staff training included",
      "Custom feature development"
    ]
  }
];

interface PricingCardsProps {
  onSelectPlan?: (plan: PricingPlan) => void;
  standalone?: boolean;
}

export default function PricingCards({ onSelectPlan, standalone = false }: PricingCardsProps) {
  const [, setLocation] = useLocation();

  const handlePlanSelect = (plan: PricingPlan) => {
    if (standalone) {
      if (plan.subscription) {
        // Navigate to subscription page for monthly plans
        setLocation("/subscribe");
      } else {
        // Navigate to checkout for one-time payment
        setLocation("/checkout");
      }
    } else if (onSelectPlan) {
      // If not standalone, call the parent component's handler
      onSelectPlan(plan);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}
        >
          <CardHeader>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="mb-4">
              <span className="text-3xl font-bold">{plan.priceDisplay.split('/')[0]}</span>
              {plan.subscription && <span className="text-muted-foreground"> /month</span>}
              {plan.oneTime && <span className="text-muted-foreground"> one-time</span>}
            </div>
            <ul className="space-y-2 text-sm">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant={plan.popular ? "default" : "outline"}
              className="w-full"
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.subscription ? "Subscribe" : "Select Plan"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}