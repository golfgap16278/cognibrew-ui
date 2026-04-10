# CogniBrew: Project Overview & Core Philosophy

## System Purpose
CogniBrew is a near real-time customer recognition system designed to eliminate "Late-Stage Identification" in the cafe industry. Currently, cafes only identify customers at checkout, missing the chance for personalized service. CogniBrew shifts identification to the moment the customer walks in the door.

## The Frontend Goal: Barista Augmentation
The React frontend acts as a **Barista Augmentation Dashboard**. It does not replace the barista; it empowers them. Before a customer reaches the counter, the dashboard must display a "Customer Insight Card" containing the customer's name, their usual order, and an intelligent upsell prompt. 

## Core Design Principles
1. **Zero-Friction Fallback (Graceful Degradation):** The ML system is an advisory engine. If the AI fails, hallucinates, or the network drops, the system must gracefully degrade to a standard manual POS. The right side of the screen must always function independently of the AI insights on the left.
2. **Human-in-the-Loop Data Collection:** The barista’s interactions with the UI (tapping "Usual Order", "Skip", or "Wrong Person") serve as explicit ground-truth labels. The UI is intentionally designed to capture this feedback to continually retrain the edge model without the barista realizing they are doing data entry.
3. **Speed is Paramount:** The entire pipeline (detection to UI render) has a strict latency target of < 1.5 seconds. The UI must feel instantaneous, snappy, and touch-friendly for high-volume cafe environments.