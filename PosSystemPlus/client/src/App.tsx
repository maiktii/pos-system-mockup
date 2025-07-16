import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import CartList from "@/pages/cart-list";
import ProductCatalog from "@/pages/product-catalog";
import CartDetail from "@/pages/cart-detail";
import PaymentConfirmation from "@/pages/payment-confirmation";
import AllProducts from "@/pages/all-products";
import TransactionHistory from "@/pages/transaction-history";
import TransactionDetail from "@/pages/transaction-detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/carts" component={CartList} />
      <Route path="/products/:cartId" component={ProductCatalog} />
      <Route path="/cart/:id" component={CartDetail} />
      <Route path="/payment/:orderId" component={PaymentConfirmation} />
      <Route path="/all-products" component={AllProducts} />
      <Route path="/transactions" component={TransactionHistory} />
      <Route path="/transaction/:id" component={TransactionDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
