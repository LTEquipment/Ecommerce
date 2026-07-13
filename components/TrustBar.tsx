import { Truck, Shield, Card, Chat } from "./icons";

export default function TrustBar() {
  return (
    <div className="trust">
      <div className="wrap">
        <div className="t">
          <Truck />
          <div>
            <div className="tt">Ships in 24–48 hours</div>
            <div className="ts">Free freight over $999</div>
          </div>
        </div>
        <div className="t">
          <Shield />
          <div>
            <div className="tt">NSF-certified</div>
            <div className="ts">Full specs on every listing</div>
          </div>
        </div>
        <div className="t">
          <Card />
          <div>
            <div className="tt">Buy now, pay later</div>
            <div className="ts">Monthly payments with Affirm</div>
          </div>
        </div>
        <div className="t">
          <Chat />
          <div>
            <div className="tt">Spec support by phone</div>
            <div className="ts">Staffed by working chefs</div>
          </div>
        </div>
      </div>
    </div>
  );
}

