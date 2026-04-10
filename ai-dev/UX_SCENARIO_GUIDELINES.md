# UX Scenario Guidelines: Barista Interaction & ML Feedback

Because CogniBrew is an Open-Set Facial Recognition system, it will encounter unpredictable edge cases. The UI must handle each scenario with a natural barista workflow that **implicitly** generates ML feedback — the barista never has to think about labeling data.

---

## How Feedback Works

Every barista action on the AI Insights panel maps 1:1 to an ML classification signal. Feedback is sent to `POST /api/feedback` as a fire-and-forget call (non-blocking). The barista is never aware they are generating training data.

| Barista Action | UI Element | Feedback Type | API Trigger |
|---|---|---|---|
| Accepts AI identification + checks out | Profile → Checkout | `true_positive` | At checkout |
| Rings up a guest + checks out | Guest Profile → Checkout | `true_negative` | At checkout |
| Reports wrong identification | "Wrong Person" button | `false_positive` | Immediately |
| Reports misclassified regular | "Not a Guest" button | `false_negative` | Immediately |
| Clears a walk-by detection | "Skip" button | `ignored` | Immediately |

---

## Scenario 1: True Positive (Accurate Identification)

The AI correctly identifies a registered customer. The barista confirms by interacting with the customer card.

### 1A. Happy Path — accepts all suggestions
1. AI detects face → renders **Registered Customer Card** (name, photo, loyalty status)
2. Barista taps **Customer Profile** → links customer to the active order
3. Barista taps **Usual Order** → item added to cart with saved modifiers
4. Barista taps **Upsell Suggestion** → additional item added to cart
5. Barista taps **Checkout** → order submitted + `true_positive` feedback sent

### 1B. Status Quo — accepts usual order, declines upsell
1. Same as above, but barista skips step 4
2. On **Checkout** → `true_positive` feedback sent

### 1C. Pivot — customer changes their mind
1. Barista taps **Customer Profile** (to link loyalty points)
2. Barista ignores AI suggestions and uses the **Menu Panel** to manually add items
3. On **Checkout** → `true_positive` feedback sent (identification was still correct)

> **Key insight:** All three sub-scenarios produce `true_positive` because the *identity* was correct, regardless of whether the *recommendations* were accepted.

---

## Scenario 2: True Negative (Guest Correctly Classified)

The AI detects a face but cannot match it to any registered customer. The system renders a Guest Card.

1. AI detects unrecognized face → renders **Guest Card** (generic avatar, "Unregistered Profile")
2. Barista taps **Guest Profile** → links as guest to the active order
3. Barista uses **Popular Right Now** suggestions or the **Menu Panel** to build the order
4. Barista taps **Checkout** → order submitted + `true_negative` feedback sent

> **Key insight:** The guest truly is a guest. The system correctly classified them as unrecognized.

---

## Scenario 3: False Positive (Wrong Person — Critical Social Risk)

The AI misidentifies a customer as someone else. This is the highest-risk failure mode — greeting someone by the wrong name is socially damaging.

1. AI detects face → renders **Registered Customer Card** with the wrong name/photo
2. Barista recognizes the error
3. Barista taps **"Wrong Person"** → `false_positive` feedback sent immediately
4. Customer card is dismissed from the queue
5. Barista proceeds with manual POS

> **Key insight:** This feedback is critical for model retraining. The face embedding that triggered this match needs to be flagged in the training pipeline.

---

## Scenario 4: False Negative (Regular Not Recognized)

The AI fails to recognize a returning customer and incorrectly renders a Guest Card.

1. AI detects face → renders **Guest Card**
2. Barista recognizes the customer as a known regular
3. Barista taps **"Not a Guest"** → `false_negative` feedback sent immediately
4. Guest card is dismissed from the queue
5. Barista can optionally use **Membership Lookup** (phone number) to manually identify the customer and link their loyalty account

> **Key insight:** This tells the ML system its face embedding database has a gap — this person should have been matched but wasn't.

---

## Scenario 5: Ignored (Walk-by / No Order)

A person walks past the camera without intending to order. The AI detects them but they never reach the counter.

1. AI detects face → renders either a **Guest Card** or **Registered Customer Card**
2. Person doesn't approach the counter
3. Barista taps **"Skip"** → `ignored` feedback sent immediately
4. Card is dismissed from the queue

> **Key insight:** Not an ML error — the detection was technically correct. High skip rates indicate the detection trigger sensitivity may need tuning (camera angle, distance threshold, dwell time).

---

## System Failures & Graceful Degradation

The system relies on two distinct ML services. The UI handles their failure states independently:

### Recommendation Engine Failure
- **Condition:** Face recognition works, but the recommendation engine fails to retrieve usual order / upsell data
- **UI Behavior:** Customer/Guest card still renders with the profile (so loyalty points can be applied), but the suggestions section displays **"Recommendations Unavailable"**
- **Barista action:** Use the Menu Panel to build orders manually

### Face Recognition Failure (Total Blackout)
- **Condition:** The core vision pipeline, camera, or network is down
- **UI Behavior:** The entire AI Insights panel displays a **"System Down"** state with a clear visual indicator
- **Barista action:** Ignore the AI panel entirely and use the standard POS (Menu + Order panels) as a traditional register

---

## Feedback Payload Schema

All feedback is sent to `POST /api/feedback` with the following structure:

```json
{
  "type": "true_positive | true_negative | false_positive | false_negative | ignored",
  "customerId": "abc123",
  "customerName": "Sarah Johnson",
  "isGuest": false,
  "orderId": "ORD-185",
  "timestamp": "2026-04-10T14:00:00.000Z"
}
```

- `orderId` is present only for `true_positive` and `true_negative` (linked to a completed order)
- `isGuest` indicates whether the AI classified this detection as a guest
- Feedback is fire-and-forget — failures never block the order submission or UI