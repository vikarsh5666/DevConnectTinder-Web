import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";

const Premium = () => {
  const [isUserPremium, setIsUserPremium] = useState(false);
  useEffect(() => {
    verifyPremiumUser();
  }, []);

  const verifyPremiumUser = async () => {
    const res = await axios.get(BASE_URL + "/premium/verify", {
      withCredentials: true,
    });

    if (res.data.isPremium) {
      setIsUserPremium(true);
    }
  };

  const handleBuyClick = async (type: string) => {
    const order = await axios.post(
      BASE_URL + "/payment/create",
      {
        membershipType: type,
      },
      { withCredentials: true }
    );

    const { amount, keyId, currency, notes, orderId } = order.data;

    const options = {
      key: keyId,
      amount,
      currency,
      name: "Dev Connect Tinder",
      description: "Connect to other developers",
      order_id: orderId,
      prefill: {
        name: notes.firstName + " " + notes.lastName,
        email: notes.emailId,
        contact: "9999999999",
      },
      theme: {
        color: "#F37254",
      },
      handler: verifyPremiumUser,
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const alreadyPremiumElement = () => {
    return (<div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="card w-full max-w-md border border-amber-400/30 bg-base-100 shadow-2xl">
        <div className="card-body items-center gap-4 text-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400/15">
            <span className="text-5xl">👑</span>
          </div>

          <div className="badge badge-warning badge-outline">
            PREMIUM MEMBER
          </div>

          <h2 className="card-title text-2xl font-bold">
            You're Already Premium!
          </h2>

          <p className="text-base-content/70">
            You're already enjoying the premium experience.
            Keep connecting with developers and building your network!
          </p>

          <div className="card-actions mt-3 w-full">
            <button
              className="btn btn-warning w-full"
              onClick={() => window.history.back()}
            >
              Continue Exploring
            </button>
          </div>

        </div>
      </div>
    </div>
    )
  };
  return isUserPremium ? (
    alreadyPremiumElement()
  ) : (
    <div className="m-10">
      <div className="flex w-full">
        <div className="card bg-base-300 rounded-box grid h-80 flex-grow place-items-center">
          <h1 className="font-bold text-3xl">Silver Membership</h1>
          <ul>
            <li> - Chat with other people</li>
            <li> - 100 connection Requests per day</li>
            <li> - Blue Tick</li>
            <li> - 3 months</li>
          </ul>
          <button
            onClick={() => handleBuyClick("silver")}
            className="btn btn-secondary"
          >
            Buy Silver
          </button>
        </div>
        <div className="divider divider-horizontal">OR</div>
        <div className="card bg-base-300 rounded-box grid h-80 flex-grow place-items-center">
          <h1 className="font-bold text-3xl">Gold Membership</h1>
          <ul>
            <li> - Chat with other people</li>
            <li> - Inifiniye connection Requests per day</li>
            <li> - Blue Tick</li>
            <li> - 6 months</li>
          </ul>
          <button
            onClick={() => handleBuyClick("gold")}
            className="btn btn-primary"
          >
            Buy Gold
          </button>
        </div>
      </div>
    </div>
  );
};
export default Premium;