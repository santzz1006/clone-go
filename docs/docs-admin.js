const transition = document.createElement("div");
transition.className = "page-transition";
document.body.appendChild(transition);
document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.origin !== window.location.origin || link.hash || link.target === "_blank") return;
    event.preventDefault();
    transition.classList.add("is-active");
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 170);
  });
});
document.querySelectorAll(".doc-section").forEach((section, index) => {
  section.style.animationDelay = `${Math.min(index * 12, 240)}ms`;
});
