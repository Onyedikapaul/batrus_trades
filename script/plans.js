const plans = [
  {
    name: "STANDARD PLAN",
    roi: 5,
    duration: "24 hours",
    min: 50,
    max: 499
  },
  {
    name: "MAGNATE PLAN",
    roi: 8,
    duration: "24 hours",
    min: 500,
    max: 999
  },
  {
    name: "PLATINUM PLAN",
    roi: 12,
    duration: "24 hours",
    min: 1000,
    max: 4999
  },
  {
    name: "EXECUTIVE PLAN",
    roi: 25,
    duration: "48 hours",
    min: 5000,
    max: 9999
  },
  {
    name: "PREMIUM PLAN",
    roi: 35,
    duration: "72 hours",
    min: 10000,
    max: "Unlimited"
  }
];

const grid = document.getElementById("plansGrid");

plans.forEach((plan, index) => {

  const card = `
    <div class="plan-card reveal d${index + 1}">
      
      <div class="plan-name">${plan.name}</div>

      <div class="plan-rate">
        <sup>%</sup>${plan.roi}
        <span class="plan-per"> after ${plan.duration}</span>
      </div>

      <div class="plan-desc">
        Earn ${plan.roi}% return on your investment after ${plan.duration}.
      </div>

      <hr class="plan-divider" />

      <ul class="plan-feats">
        <li><span class="tick">✓</span> Min. deposit: $${plan.min}</li>
        <li><span class="tick">✓</span> Max. deposit: $${plan.max}</li>
        <li><span class="tick">✓</span> Profit after ${plan.duration}</li>
        <li><span class="tick">✓</span> 10% referral commission</li>
      </ul>

      <a href="/auth/signup.html"
        class="btn btn-outline-white"
        style="width:100%;justify-content:center"
      >
        Get Started
      </a>

    </div>
  `;

  grid.insertAdjacentHTML("beforeend", card);

});
