// Course index. One card per available session.
import { draftNotice, loadManifest } from "../draft.js";

export async function mount(el) {
  el.innerHTML = `
    <section class="home-hero">
      <span class="eyebrow">Drafts, written in public</span>
      <h1>Hartsock Courses</h1>
      <p>Interactive material for courses in progress. Each page says what revision it is on, who wrote which parts, and what has been reviewed. Pages can ask a language model questions; choose where its answers come from with the button at the top right, once. Your choice is remembered in this browser.</p>
    </section>
    <div class="cards"></div>`;
  const { courses } = await loadManifest();
  for (const course of courses) {
    const card = document.createElement("a");
    card.className = "card";
    card.href = "/courses/" + course.slug + "/";
    const title = document.createElement("h2");
    title.textContent = course.title;
    const description = document.createElement("p");
    description.textContent = course.description;
    card.append(title, description);
    el.querySelector(".cards").append(card);
  }
  el.prepend(await draftNotice("home"));
}
