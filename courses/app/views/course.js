export async function mount(el, { course }) {
  const back = document.createElement("a");
  back.href = "/courses/";
  back.textContent = "All courses";
  const title = document.createElement("h1");
  title.textContent = course.title;
  const description = document.createElement("p");
  description.textContent = course.description;
  const sessions = document.createElement("div");
  sessions.className = "cards";
  for (const session of course.sessions) {
    const card = document.createElement("a");
    card.className = "card";
    card.href = `/courses/${course.slug}/${session.slug}/`;
    const heading = document.createElement("h2");
    heading.textContent = session.title;
    const detail = document.createElement("p");
    detail.textContent = session.description || "";
    card.append(heading, detail);
    sessions.append(card);
  }
  if (!course.sessions.length) sessions.textContent = "No sessions published yet.";
  el.append(back, title, description, sessions);
}
