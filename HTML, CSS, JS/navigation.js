// navigation.js — common navigation for all pages

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".bottom-nav span").forEach((item) => {
    item.classList.remove("active");

    if (
      (currentPage === "" || currentPage === "discovery.html") && item.dataset.page === "discovery" ||
      (currentPage === "inbox.html") && item.dataset.page === "inbox" ||
      (currentPage === "profile.html") && item.dataset.page === "profile"
    ) {
      item.classList.add("active");
    }
  });
});

function goTo(page) {
  window.location.href = page;
}