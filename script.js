let filters = { tools: [], languages: [], level: [], role: [] };

async function fetchJsonFile() {
  const response = await fetch("./data.json");
  const data = await response.json();

  return data;
}

function createJobItem(job) {
  const jobItem = document.createElement("article");

  const companyLogo = document.createElement("img");
  companyLogo.src = job.logo;
  companyLogo.alt = job.company;
  jobItem.append(companyLogo);

  const jobNews = document.createElement("div");
  jobNews.className = "job-news";

  const company = document.createElement("p");
  company.className = "company";
  company.textContent = job.company;
  jobNews.append(company);

  if (job.new || job.featured) {
    const sectionTag = document.createElement("div");
    sectionTag.className = "tag-section";
    if (job.new) {
      const newBadge = document.createElement("div");
      newBadge.className = "new-badge";
      newBadge.innerHTML = "<p>NEW!</p>";

      sectionTag.append(newBadge);
    }

    if (job.featured) {
      const featuredBadge = document.createElement("div");
      featuredBadge.className = "featured-badge";
      featuredBadge.innerHTML = "<p>FEATURED</p>";

      sectionTag.append(featuredBadge);

      jobItem.classList.add("featured");
    }

    jobNews.append(sectionTag);
  }

  jobItem.append(jobNews);

  const jobTitle = document.createElement("h2");
  jobTitle.textContent = job.position;
  jobItem.append(jobTitle);

  const categoryList = createCategoriesList(job);

  const infos = document.createElement("div");
  infos.className = "infos";

  const date = document.createElement("p");
  date.textContent = job.postedAt;

  const time = document.createElement("p");
  time.textContent = job.contract;

  const location = document.createElement("p");
  location.textContent = job.location;

  //join with a point between each element
  infos.append(date, time, location);

  const part1 = document.createElement("div");
  part1.append(jobNews, jobTitle, infos);

  const divider = document.createElement("div");
  divider.className = "divider";

  const part2 = document.createElement("div");
  part2.append(categoryList);

  const container = document.createElement("div");
  container.className = "job-container";
  container.append(part1, divider, part2);

  jobItem.append(container);

  return jobItem;
}

function filterJobs(jobs) {
  return jobs.filter((job) => {
    const matchLevel =
      filters.level.length === 0 || filters.level.includes(job.level);
    const matchRole =
      filters.role.length === 0 || filters.role.includes(job.role);
    const matchLanguages =
      filters.languages.length === 0 ||
      filters.languages.every((lang) => job.languages.includes(lang));
    const matchTools =
      filters.tools.length === 0 ||
      filters.tools.every((tool) => job.tools.includes(tool));

    return matchLevel && matchRole && matchLanguages && matchTools;
  });
}

function clearFilter(category, value) {
  filters[category] = filters[category].filter((c) => c !== value);
  renderFilteredJobs();
  displayFilters();
}

function clearAllFilters() {
  filters = { tools: [], languages: [], level: [], role: [] };
  renderFilteredJobs();
  displayFilters();
}

function renderFilteredJobs() {
  fetchJsonFile().then((jobs) => {
    const filteredJobs = filterJobs(jobs);
    displayJobs(filteredJobs);
  });
}

function updateFilters(category, value) {
  if (!filters[category].includes(value)) {
    filters[category].push(value);
  }
  renderFilteredJobs();
  displayFilters();
}

function createCategoriesList(job) {
  const categoryList = document.createElement("div");
  categoryList.className = "category-list";

  // LEVEL
  const levelBtn = document.createElement("button");
  levelBtn.textContent = job.level;
  categoryList.append(levelBtn);
  levelBtn.addEventListener("click", () => {
    updateFilters("level", job.level);
  });

  // ROLE
  const roleBtn = document.createElement("button");
  roleBtn.textContent = job.role;
  categoryList.append(roleBtn);
  roleBtn.addEventListener("click", () => {
    updateFilters("role", job.role);
  });

  // LANGUAGES
  if (job.languages.length > 0) {
    job.languages.forEach((language) => {
      const languageBtn = document.createElement("button");
      languageBtn.textContent = language;
      categoryList.append(languageBtn);

      languageBtn.addEventListener("click", () => {
        updateFilters("languages", language);
      });
    });
  }

  // TOOLS
  if (job.tools.length > 0) {
    job.tools.forEach((tool) => {
      const toolBtn = document.createElement("button");
      toolBtn.textContent = tool;
      categoryList.append(toolBtn);
      toolBtn.addEventListener("click", () => {
        updateFilters("tools", tool);
      });
    });
  }

  return categoryList;
}

function displayFilters() {
  const filtersContainer = document.getElementById("job-filters");
  filtersContainer.innerHTML = "";

  let hasFilters = false;

  const filtersDiv = document.createElement("div");
  filtersDiv.className = "filters";

  Object.keys(filters).forEach((category) => {
    filters[category].forEach((value) => {
      hasFilters = true;

      const filterTag = document.createElement("div");
      filterTag.className = "filter-tag";
      filterTag.innerHTML = `
        <span>${value}</span>
        <button class="remove-filter" data-category="${category}" data-value="${value}">&times;</button>
      `;
      filtersDiv.append(filterTag);
    });
  });

  filtersContainer.append(filtersDiv);

  const removeButton = document.querySelectorAll(".remove-filter");
  removeButton.forEach((button) => {
    button.addEventListener("click", (e) => {
      const category = e.target.dataset.category;
      const value = e.target.dataset.value;

      clearFilter(category, value);
    });
  });

  if (hasFilters) {
    const resetAllFiltersBtn = document.createElement("button");
    resetAllFiltersBtn.className = "reset-all-filters";
    resetAllFiltersBtn.textContent = "Clear";

    resetAllFiltersBtn.addEventListener("click", () => clearAllFilters());

    filtersContainer.append(resetAllFiltersBtn);

    const jobList = document.getElementById("job-list");
    jobList.style.paddingTop = "100px";
  }

  filtersContainer.classList.toggle("hidden", !hasFilters);
}

function displayJobs(jobs) {
  const jobListContainer = document.getElementById("job-list");
  jobListContainer.innerHTML = "";

  jobs.forEach((job) => {
    const jobItem = createJobItem(job);
    jobListContainer.append(jobItem);
  });
}

(async () => {
  const jobs = await fetchJsonFile();
  displayJobs(jobs);
})();
