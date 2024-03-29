"use strict";

import { fetchData } from "./api.js";
import { numberToKilo } from "./module.js";

const addEventOnElements = function ($elements, eventType, callback) {
  for (const $item of $elements) {
    $item.addEventListener(eventType, callback);
  }
};

const $header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  $header.classList[window.scrollY > 50 ? "add" : "remove"]("active");
});

const $searchToggler = document.querySelector("[data-search-toggler]");
const $searchField = document.querySelector("[data-search-field]");

let isExpanded = false;

$searchToggler.addEventListener("click", function () {
  $header.classList.toggle("search-active");
  isExpanded = isExpanded ? false : true;
  this.setAttribute("aria-expanded", isExpanded);
  $searchField.focus();
});

const $tabBtns = document.querySelectorAll("[data-tab-btn]");

const $tabPanels = document.querySelectorAll("[data-tab-panel]");

let [$lastActiveTabBtn] = $tabBtns;
let [$lastActiveTabPanel] = $tabPanels;

addEventOnElements($tabBtns, "click", function () {
  $lastActiveTabBtn.setAttribute("aria-selected", "false");
  $lastActiveTabPanel.setAttribute("hidden", "");
  this.setAttribute("aria-selected", "true");
  const $currentTabPanel = document.querySelector(
    `#${this.getAttribute("aria-controls")}`
  );
  $currentTabPanel.removeAttribute("hidden");
  $lastActiveTabBtn = this;
  $lastActiveTabPanel = $currentTabPanel;
});

addEventOnElements($tabBtns, "keydown", function (e) {
  const $nextElement = this.nextElementSibling;
  const $previousElement = this.previousElementSibling;
  if (e.key === "ArrowRight" && $nextElement) {
    this.setAttribute("tabindex", "-1");
    $nextElement.setAttribute("tabindex", "0");
    $nextElement.focus();
  } else if (e.key === "ArrowLeft" && $previousElement) {
    this.setAttribute("tabindex", "-1");
    $previousElement.setAttribute("tabindex", "0");
    $previousElement.focus();
  }
});

const $searchSubmit = document.querySelector("[data-search-submit]");
let apiUrl = "https://api.github.com/users/iamatifmoin";

let repoUrl = "";

const searchUser = function () {
  if (!$searchField.value) return;
  apiUrl = `https://api.github.com/users/${$searchField.value}`;
  updateProfile(apiUrl);
};

$searchSubmit.addEventListener("click", searchUser);

$searchField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchUser();
});

const $profileCard = document.querySelector("[data-profile-card]");
const $repoPanel = document.querySelector("[data-repo-panel]");

const $error = document.querySelector("[data-error]");
var num_of_data = 0;

window.updateProfile = function (profileUrl) {
  $error.style.display = "none";
  document.body.style.overflowY = "visible";

  $profileCard.innerHTML = `
    <div class="profile-skeleton">
        <div class="skeleton avatar-skeleton"></div>
        <div class="skeleton title-skeleton"></div>
        <div class="skeleton text-skeleton text-1"></div>
        <div class="skeleton text-skeleton text-2"></div>
        <div class="skeleton text-skeleton text-3"></div>
    </div>`;

  $tabBtns[0].click();
  $repoPanel.innerHTML = `
    <div class="card repo-skeleton">
        <div class="card-body">
            <div class="skeleton title-skeleton"></div>
            <div class="skeleton text-skeleton text-1"></div>
            <div class="skeleton text-skeleton text-2"></div>
        </div>
        <div class="card-footer">
            <div class="skeleton text-skeleton"></div>
            <div class="skeleton text-skeleton"></div>
            <div class="skeleton text-skeleton"></div>
        </div>
    </div>
    `.repeat(6);

  fetchData(
    profileUrl,
    (data) => {
      const {
        type,
        avatar_url,
        name,
        login: username,
        html_url: githubPage,
        bio,
        location,
        company,
        blog: website,
        twitter_username,
        public_repos,
        followers,
        following,
        repos_url,
      } = data;

      repoUrl = repos_url;

      num_of_data = public_repos;

      $profileCard.innerHTML = `
    <figure class="${
      type === "User" ? "avatar-circle" : "avatar-rounded"
    } img-holder" style="--width:280;--height:280">
        <img src="${avatar_url}" width="280" height="280" alt="${username}" class="img-cover">
    </figure>
    ${name ? `<h1 class="title-2">${name}</h1>` : ""}
    <p class="username text-primary">${username}</p>
    ${bio ? `<p class="bio">${bio}</p>` : ""}
    
    <a href="${githubPage}" target="_blank" class="btn btn-secondary">
        <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
        <span class="span">See on GitHub</span>
    </a>
    <ul class="profile-meta">
        ${
          location
            ? `
            <li class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">location_on</span>
                <span class="meta-text">${location}</span>`
            : ""
        }
        </li>
        ${
          company
            ? `
        <li class="meta-item">
            <span class="material-symbols-rounded" aria-hidden="true">apartment</span>
            <span class="meta-text">${company}</span>
        </li>`
            : ""
        }
        ${
          website
            ? `
        <li class="meta-item">
            <span class="material-symbols-rounded" aria-hidden="true">captive_portal</span>
            <a href="${website}" target="_blank" class="meta-text">${website.replace(
                "https://",
                ""
              )}
            </a>
        </li>
        `
            : ""
        }
        ${
          twitter_username
            ? `
        <li class="meta-item">
            <span class="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19.9441 7.92638C19.9568 8.10403 19.9568 8.28173 19.9568 8.45938C19.9568 13.8781 15.8325 20.1218 8.29441 20.1218C5.97207 20.1218 3.81473 19.4492 2 18.2817C2.32996 18.3198 2.64719 18.3325 2.98984 18.3325C4.90605 18.3325 6.67004 17.6853 8.07867 16.5812C6.27664 16.5431 4.76648 15.3629 4.24617 13.7386C4.5 13.7766 4.75379 13.802 5.02031 13.802C5.38832 13.802 5.75637 13.7512 6.09898 13.6624C4.22082 13.2817 2.81215 11.632 2.81215 9.63958V9.58884C3.35781 9.89341 3.99238 10.0838 4.66492 10.1091C3.56086 9.37306 2.83754 8.11673 2.83754 6.6954C2.83754 5.93399 3.04055 5.23603 3.3959 4.62688C5.41367 7.11419 8.44668 8.73853 11.8477 8.91622C11.7842 8.61165 11.7461 8.29442 11.7461 7.97716C11.7461 5.71825 13.5736 3.87817 15.8451 3.87817C17.0253 3.87817 18.0913 4.3731 18.84 5.17259C19.7664 4.99493 20.6547 4.65228 21.4416 4.18274C21.137 5.13454 20.4898 5.93403 19.6395 6.44161C20.4644 6.35282 21.2639 6.12435 21.9999 5.80712C21.4416 6.61927 20.7436 7.34259 19.9441 7.92638Z"
                        fill="var(--on-background)"></path>
                    </svg>
            </span>
            <a href="https://twitter.com/${twitter_username}" target="_blank" class="meta-text">${twitter_username}</a>
        </li>
        `
            : ""
        }
    </ul>
    <ul class="profile-stats">
        <li class="stats-item">
            <span class="body">${public_repos}</span> Repos
        </li>
        <li class="stats-item">
            <span class="body">${numberToKilo(followers)}</span> Followers
        </li>
        <li class="stats-item">
            <span class="body">${numberToKilo(following)}</span> Following
        </li>
    </ul>
    <div class="footer">
        <p class="copyright">
            &copy; 2023 iamatifmoin
        </p>
    </div>
    `;
      updateRepository();
      pageGenerator(itemPerPage);
    },
    () => {
      $error.style.display = "grid";
      document.body.style.overflowY = "hidden";
      $error.innerHTML = `
    <p class="title-1">Uh Oh!</p>
    <p class="text">Account not found.</p>
    `;
    }
  );
};

updateProfile(apiUrl);
const updateRepository = function () {
  fetchData(
    `${repoUrl}?sort=created&per_page=${itemPerPage}&page=${pageNumber}`,
    function (data) {
      $repoPanel.innerHTML = `
    <h2 class="sr-only">Repositories</h2>
    `;
      const repositories = data;
      if (repositories.length) {
        for (const repo of repositories) {
          const {
            name,
            html_url,
            description,
            private: isPrivate,
            language,
            stargazers_count: stars_count,
            forks_count,
            topics,
          } = repo;

          const $repoCard = document.createElement("article");
          $repoCard.classList.add("card", "repo-card");
          $repoCard.innerHTML = `
        <div class="card-body">
            <a href="${html_url}" target="_blank" class="card-title">
                <h3 class="title-3">${name}</h3>
            </a>
            ${
              description
                ? `
            <p class="card-text">${description}</p>
            `
                : ""
            }
            <span class="badge">${isPrivate ? "Private" : "Public"}</span>
        ${
          topics
            ? `
        <div class="topics">
            ${
              topics[0]
                ? `
            <span class="topic">${topics[0]}</span>
            `
                : ""
            }
            ${
              topics[1]
                ? `
            <span class="topic">${topics[1]}</span>
            `
                : ""
            }
            ${
              topics[2]
                ? `
            <span class="topic">${topics[2]}</span>
            `
                : ""
            }
        </div>`
            : ""
        }
        </div>
        <div class="card-footer">
        ${
          language
            ? `
            <div class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
                <span class="span">${language}</span>
            </div>
            `
            : ""
        }
            <div class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">star_rate</span>
                <span class="span">${numberToKilo(stars_count)}</span>
            </div>
            <div class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">family_history</span>
                <span class="span">${numberToKilo(forks_count)}</span>
            </div>
            
        </div>
        `;
          $repoPanel.appendChild($repoCard);
        }
      } else {
        $repoPanel.innerHTML = `
        <div class="error-content">
            <p class="title-1">Oops!</p>
            <p class="text">User does not have any public repositories yet.</p>
        </div>
        `;
      }
    }
  );
};

var itemShow = document.querySelector("#itemperpage");
var itemPerPage = 10;

itemShow.onchange = giveItemPerPage;

function giveItemPerPage() {
  itemPerPage = Number(this.value);
  pageNumber = 1;
  updateProfile(apiUrl);
}

var pageUl = document.querySelector(".pagination");
var load_count = 0;
var pageNumber = 0;
function pageGenerator(getem) {
  if (num_of_data <= getem) {
    pageUl.style.display = "none";
  } else {
    load_count++;
    if (load_count > 1) {
      const pageNum = pageUl.querySelectorAll(".list");
      pageNum.forEach((n) => n.remove());
    }
    pageUl.style.display = "flex";
    const num_of_page = Math.ceil(num_of_data / getem);
    for (let i = 0; i < num_of_page; i++) {
      const li = document.createElement("li");
      li.className = "list";
      const a = document.createElement("a");
      a.href = "#";
      a.innerText = i + 1;
      a.setAttribute("data-page", li);
      a.setAttribute("value", i + 1);
      a.addEventListener("click", () => {
        pageNumber = a.innerText;
        var inactivePages = pageUl.querySelectorAll(".list");
        inactivePages.forEach((inactivePage) =>
          inactivePage.classList.remove("active")
        );
        li.classList.add("active");
        updateRepository();
      });
      li.appendChild(a);
      pageUl.insertBefore(li, pageUl.querySelector(".next"));
    }
    var firstActivePage = pageUl.querySelectorAll(".list")[0];
    firstActivePage.classList.add("active");
  }
}
