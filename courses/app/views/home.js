// Course index. One card per available session.
import { draftNotice } from "../draft.js";

export async function mount(el) {
  el.innerHTML = `
    <section class="home-hero">
      <span class="eyebrow">Drafts, written in public</span>
      <h1>Hartsock Courses</h1>
      <p>Interactive material for courses in progress. Each page says what revision it is on, who wrote which parts, and what has been reviewed. Pages can ask a language model questions; choose where its answers come from with the button at the top right, once. Your choice is remembered in this browser.</p>
    </section>
    <div class="cards">
      <a class="card" href="#/ai-theology/session-3">
        <span class="eyebrow">Making Minds? · Session 3</span>
        <h3>What an engine can represent</h3>
        <p class="muted">Lovelace’s claim about origination, a model’s next-word odds, and a map of how a model places words like grace, soul and machine.</p>
      </a>
    </div>`;
  el.prepend(await draftNotice("home"));
}
