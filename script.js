// === RAZORPAY + GOOGLE SHEET (WORKING TEST PATTERN) ===

const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyfYWZA2Tpl-tbHxTFa2hqj4ktXhNY13KhN_Iu8tdTWTGFSh6I1qCTaY0VwYxE2__7Tmw/exec';
const RAZORPAY_KEY = 'rzp_test_S2TDNhiJ6htGeJ'; // tumhara test key

// Betting time: 6:00 AM to 8:00 PM
function isBettingOpen() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 6 && hour < 20;
}

const betStatusEl = document.getElementById("bet-status");
const betForm = document.getElementById("bet-form");
const payBtn = document.getElementById("pay-btn");

// Status text
if (!isBettingOpen()) {
  betStatusEl.textContent = "closed. You can .. between 6:00 AM and 8:00 PM.";
  betStatusEl.style.color = "#f97316";
  payBtn.disabled = true;
} else {
  betStatusEl.textContent = "is open. Place your ... now.";
  betStatusEl.style.color = "#22c55e";
}

// Form submit handler
betForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!isBettingOpen()) {
    alert("Betting time is over for today.");
   return;
  }

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const email = document.getElementById("email").value.trim();
  const amount = document.getElementById("amount").value;
  const symbol = document.getElementById("symbol").value;

  console.log('FORM DATA:', {name, mobile, email, amount, symbol});

  if (!name || !mobile || !email || !amount || !symbol) {
    alert("Please fill all fields.");
    return;
  }

  // Razorpay standard checkout
  const options = {
    key: RAZORPAY_KEY,
    amount: Number(amount) * 100, // paise
    currency: "INR",
    name: "Pakoli Game",
    description: `Bet on ${symbol}`,
    handler: function (response) {
      // Yeh part tab chalega jab Razorpay payment SUCCESS hogi
      const payload = {
        name,
        mobile,
        email,
        amount: Number(amount),
        symbol,
        razorpay_payment_id: response.razorpay_payment_id || 'TEST_PAYMENT_ID',
        status: "SUCCESS"
      };
       console.log('PAYLOAD BHEJNE WALA:', payload); // <-- ADD YEH BHI

      // Yahi wahi fetch hai jo tumhare TEST me kaam kar raha tha
      fetch(APPSCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }).then(res => console.log('RESPONSE:', res)).catch(err => console.log('ERROR:', err));

      //alert("Payment successful & bet saved (Sheet).");
      betForm.reset();
    },
    prefill: {
      name: name,
      email: email,
      contact: mobile
    },
    theme: {
      color: "#22c55e"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
});

// === Winners (static demo) ===
const winnersList = document.getElementById("winners-list");

const winners = [
  {
    date: "2026-01-10",
    name: "Rahul Kumar",
    symbol: "Kite",
    amountWon: 1000,
    photoUrl: ""
  },
  {
    date: "2026-01-09",
    name: "Atish Singh",
    symbol: "Star",
    amountWon: 500,
    photoUrl: ""
  }
];

function renderWinners() {
  winnersList.innerHTML = "";
  winners.forEach((w) => {
    const card = document.createElement("div");
    card.className = "winner-card";

    const photo = document.createElement("div");
    photo.className = "winner-photo";
    if (w.photoUrl) {
      photo.style.backgroundImage = `url(${w.photoUrl})`;
      photo.style.backgroundSize = "cover";
    }

    const text = document.createElement("div");
    text.innerHTML = `
      <div><strong>${w.name}</strong> (${w.date})</div>
      <div>Symbol: ${w.symbol} • Won: ₹${w.amountWon}</div>
    `;

    card.appendChild(photo);
    card.appendChild(text);
    winnersList.appendChild(card);
  });
}

renderWinners();
