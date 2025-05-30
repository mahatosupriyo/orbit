import { BuyNowButton } from "./paymentbtn";


export function ProductCard() {
  return (
    <div className="w-full max-w-sm overflow-hidden">
      <div className="p-0">
        <div>
          <img
            src="https://plus.unsplash.com/premium_photo-1747054588178-d2e3f110232a?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8"
            alt="Product image"
            className="object-cover"
            style={{
              height: 300
            }}
          />
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Air Jordan 1</h3>
          <p className="text-sm text-muted-foreground">
            Iconic basketball sneaker blending style, heritage, and performance.
          </p>
        </div>
        <div className="mt-4 font-medium">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(9999)}
        </div>
      </div>
      <div className="p-6 pt-0">
        <BuyNowButton />
      </div>
    </div>
  );
}