import { useCallback, useEffect, useState } from "react";
import api from "../utils/api";

const Premium = () => {
  const [isUserPremium, setIsUserPremium] = useState(false);

  const verifyPremiumUser = useCallback(async () => {
    try {
      const res = await api.get("/premium/verify");
      if (res.data.isPremium) setIsUserPremium(true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    verifyPremiumUser();
  }, [verifyPremiumUser]);

  const handleBuyClick = async (type: string) => {
    const order = await api.post("/payment/create", {
      membershipType: type,
    }).catch((err) => {
      console.error(err);
      return null;
    });
    if (!order) return;

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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-stretch">

        {/* Silver Membership */}
        {/* Silver Membership */}
        <div className="card relative flex-1 overflow-hidden rounded-2xl border border-slate-300/40 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white shadow-[0_0_30px_rgba(203,213,225,0.12)] transition-all duration-300 hover:-translate-y-2 hover:border-slate-200/70 hover:shadow-[0_0_35px_rgba(203,213,225,0.22)]">

          {/* Metallic top accent */}
          <div className="h-2 bg-gradient-to-r from-slate-500 via-white to-slate-400" />

          <div className="card-body items-center gap-5 p-6 sm:p-8">

            {/* Silver icon */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-300/30 bg-gradient-to-br from-slate-500/40 to-slate-900/60 text-6xl shadow-inner">
              🥈
            </div>

            <div className="badge border-slate-300/50 bg-slate-200/10 px-4 py-3 font-bold tracking-widest text-slate-100">
              SILVER PLAN
            </div>

            <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Silver Membership
            </h2>

            <p className="text-center text-sm leading-relaxed text-slate-300 sm:text-base">
              Start building meaningful connections.
            </p>

            <div className="divider my-0 before:bg-slate-400/30 after:bg-slate-400/30" />

            <ul className="w-full space-y-5 text-sm sm:text-base">
              <li className="flex items-start gap-3">
                <span className="text-lg font-bold text-emerald-400">✓</span>
                <span>Chat with other people</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg font-bold text-emerald-400">✓</span>
                <span>100 connection requests per day</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg font-bold text-emerald-400">✓</span>
                <span>Blue Tick verification</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg font-bold text-emerald-400">✓</span>
                <span>3 months membership</span>
              </li>
            </ul>

            <div className="card-actions mt-5 w-full">
              <button
                onClick={() => handleBuyClick("silver")}
                className="btn w-full border-0 bg-gradient-to-r from-slate-200 via-white to-slate-300 text-slate-900 shadow-lg transition-all duration-300 hover:brightness-110"
              >
                <span className="font-bold">Get Silver</span>
                <span>🥈</span>
              </button>
            </div>

          </div>
        </div>

        {/* OR Divider */}
        <div className="divider my-0 text-sm font-bold text-base-content/50 md:divider-horizontal md:my-auto">
          OR
        </div>

        {/* Gold Membership */}
        <div className="card relative flex-1 overflow-hidden border border-amber-400/40 bg-base-100 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <div className="absolute right-3 top-5">
            <div className="badge badge-warning gap-1 font-semibold">
              ⭐ POPULAR
            </div>
          </div>

          <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-200" />

          <div className="card-body items-center gap-5 p-6 sm:p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400/15 text-5xl">
              👑
            </div>

            <div className="badge badge-warning badge-outline">
              GOLD PLAN
            </div>

            <h2 className="text-center text-3xl font-extrabold">
              Gold Membership
            </h2>

            <p className="text-center text-sm text-base-content/60">
              Unlock more opportunities to connect.
            </p>

            <div className="divider my-0" />

            <ul className="w-full space-y-4 text-sm sm:text-base">
              <li className="flex items-start gap-3">
                <span className="text-success">✓</span>
                <span>Chat with other people</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-success">✓</span>
                <span>Unlimited connection requests per day</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-success">✓</span>
                <span>Blue Tick verification</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-success">✓</span>
                <span>6 months membership</span>
              </li>
            </ul>

            <div className="card-actions mt-4 w-full">
              <button
                onClick={() => handleBuyClick("gold")}
                className="btn btn-warning w-full"
              >
                Get Gold 👑
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Premium;