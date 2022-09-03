import { cardHTMLGenerator, detailPageHTMLGenerator } from "./htmlGenerator.js";

class ThemeToggler {
	currentTheme = "system-preferred";
	constructor({ root, button, darkClass, lightClass }) {
		this.root = root;
		this.button = button;
		this.darkClass = darkClass;
		this.lightClass = lightClass;

		this.themeHandler = this.themeHandler.bind(this);

		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "dark") {
			this.darkTheme();
		} else if (savedTheme === "light") {
			this.lightTheme();
		}
	}

	themeHandler() {
		// system > light > dark - reverse
		if (this.currentTheme == "system-preferred") {
			this.lightTheme();
		} else if (this.currentTheme == "light") {
			this.darkTheme();
		} else {
			this.systemTheme();
		}
	}

	systemTheme() {
		this.root.classList.remove(this.lightClass, this.darkClass);

		this.currentTheme = "system-preferred";
		this.button.textContent = "System Preference";
		this.saveTheme("system-preferred");
	}
	lightTheme() {
		this.root.classList.add(this.lightClass);
		this.root.classList.remove(this.darkClass);

		this.currentTheme = "light";
		this.button.textContent = "Light mode";
		this.saveTheme("light");
	}
	darkTheme() {
		this.root.classList.add(this.darkClass);
		this.root.classList.remove(this.lightClass);

		this.currentTheme = "dark";
		this.button.textContent = "Dark mode";
		this.saveTheme("dark");
	}
	saveTheme(theme) {
		localStorage.setItem("theme", theme);
	}
}

const themeButton = document.getElementById("theme-toggler");
const themeToggler = new ThemeToggler({
	root: document.documentElement,
	button: themeButton,
	lightClass: "root_theme_light",
	darkClass: "root_theme_dark",
});
themeButton.addEventListener("click", themeToggler.themeHandler);

const countriesContainer = document.querySelector(".countries-container");

const data = await getData();
const countriesRawJSON = await data.json();
const countriesJSON = countriesRawJSON.map((country) => {
	return {
		name: country.name.common,
		nativeName:
			country.name.nativeName &&
			Object.values(country.name.nativeName)
				.map((nativeName) => nativeName.official)
				.join(", "),
		flagSrc: country.flags.png,
		population: country.population,
		region: country.region,
		subRegion: country.subregion,
		capital: country.capital?.join(", "),
		tld: country.tld?.join(" ,"),
		currencies:
			country.currencies &&
			Object.values(country.currencies)
				.map((currency) => currency.name)
				.join(", "),
		languages: country.languages && Object.values(country.languages).join(", "),
		borderCountries: country.borders?.map(
			(borderCountryShortName) =>
				countriesRawJSON.find((country) => country.cca3 == borderCountryShortName).name
					.common
		),
	};
});
const countriesByRegion = {};
const processedCountries = [];
let currentlyShowingCountries = processedCountries.concat();

/*
	processedCountries - Countries that came with loadButton (immutable)
	currentlyShowinglLis - Countries that are actually shown (mutable)
	Loadbutton is only for main list
*/

countriesJSON.forEach((country) => {
	const sortedListContainingOneRegion = countriesByRegion[country.region.toLowerCase()];
	if (!sortedListContainingOneRegion) {
		countriesByRegion[country.region.toLowerCase()] = [country];
		return;
	}

	sortedListContainingOneRegion.push(country);
});
const countriesPages = [];
const COUNTRIES_PER_PAGE = 10;
for (let i = 0; i < countriesJSON.length; i++) {
	if (i % COUNTRIES_PER_PAGE === 0) {
		countriesPages.push([]);
	}

	const currentPage = countriesPages.at(-1);
	currentPage.push(countriesJSON[i]);
}

let currentPage = 1;

loadCountriesCardsByPageNum(currentPage);
countriesContainer.insertAdjacentHTML("beforeend", loadButton());

const loadBtnElem = document.getElementById("load-btn");
loadBtnElem.addEventListener("click", () => {
	loadCountriesCardsByPageNum(++currentPage);
	countriesContainer.append(loadBtnElem);
});

const COUNTRY_HIDDEN_CLASS = "country-card_hidden";
const searchInput = document.getElementById("search-box");
const filterCountriesBySearch = [];
const clearOldSearchFilterCountries = () => {
	filterCountriesBySearch.forEach((country) => country.elem.remove());
	filterCountriesBySearch.splice(0, 1);
};
(() => {
	let timeout;
	const previouslyShowingCountries = currentlyShowingCountries;
	const searchAndShowCountries = function (name) {
		previouslyShowingCountries.forEach((country) =>
			country.elem.classList.add(COUNTRY_HIDDEN_CLASS)
		);
		loadBtnElem.hidden = true;
		countriesJSON.forEach((country) => {
			if (
				!country.name.toLowerCase().startsWith(name) ||
				listContainsCountry(filterCountriesBySearch, country)
			)
				return;
			if (countryInPreviousList(country)) {
				country.elem.classList.remove(COUNTRY_HIDDEN_CLASS);
			} else {
				loadCountryCard(country);
			}
			filterCountriesBySearch.push(country);
		});
		filterCountriesBySearch.length ||
			countriesContainer.classList.add("countries-container__found_404");
	};

	searchInput.addEventListener("input", () => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			const searchInputValue = searchInput.value.trim().toLowerCase();

			countriesContainer.classList.remove("countries-container__found_404");
			clearOldSearchFilterCountries();

			if (!searchInputValue) {
				filterCountriesBySearch.forEach((country) => {
					if (!countryInPreviousList(country)) country.elem.remove();
				});
				previouslyShowingCountries.forEach((country) => {
					country.elem.classList.remove(COUNTRY_HIDDEN_CLASS);
				});
				filterCountriesBySearch.splice(0, filterCountriesBySearch.length);

				loadBtnElem.hidden = false;
				countriesContainer.append(loadBtnElem);
				return;
			}
			searchAndShowCountries(searchInputValue);
		}, 1500);
	});
})();

const filterRegionInput = document.getElementById("filter-box");
filterRegionInput.addEventListener("change", () => {
	clearOldSearchFilterCountries();
	const requestedFilter = filterRegionInput.value;
	currentlyShowingCountries.forEach((country) =>
		country.elem.classList.add(COUNTRY_HIDDEN_CLASS)
	);

	if (requestedFilter == "no-filter") {
		currentlyShowingCountries.forEach((country) => {
			if (listContainsCountry(processedCountries, country)) {
				country.elem.classList.remove(COUNTRY_HIDDEN_CLASS);
				return;
			}
			country.elem.remove();
		});

		countriesContainer.append(loadBtnElem);
		loadBtnElem.hidden = false;

		currentlyShowingCountries = processedCountries.concat();
		return;
	}

	countriesByRegion[requestedFilter].forEach((country) => {
		if (listContainsCountry(currentlyShowingCountries, country)) {
			country.elem.classList.remove(COUNTRY_HIDDEN_CLASS);
		} else {
			loadCountryCard(country);
			currentlyShowingCountries.push(country);
		}
	});
	loadBtnElem.hidden = true;
});

function loadCountriesCardsByPageNum(pageNum) {
	countriesPages[pageNum - 1].forEach((country) => {
		loadCountryCard(country);
		processedCountries.push(country);
		currentlyShowingCountries.push(country);
	});
}

function loadCountryCard(country) {
	countriesContainer.insertAdjacentHTML("beforeend", cardHTMLGenerator(country));
	const countryCard = countriesContainer.lastElementChild;

	countryCard.addEventListener("click", () => getCountryDetailPage(country));

	countryCard.addEventListener("keyup", (e) => {
		if (e.key == "Enter") getCountryDetailPage(country);
	});

	country.elem = countryCard;
}

function getCountryDetailPage(countryObj) {
	const initialDetailPage = showDetailPage({
		name: countryObj.name,
		flagSrc: countryObj.flagSrc,
		properties: countryObj,
		borderCountries: countryObj.borderCountries,
	});

	const outOfScreenElements = document.querySelectorAll(
		"body :is(input, select, .country-card, .load-more-btn):not(.country-page__back-btn):not(.border-country button)"
	);
	outOfScreenElements.forEach((elem) => (elem.tabIndex = -1));

	initialDetailPage.querySelector(".country-page__back-btn").addEventListener("click", () => {
		initialDetailPage.classList.add("country-page__removing");
		outOfScreenElements.forEach((elem) => (elem.tabIndex = 0));
		initialDetailPage.addEventListener("animationend", () => {
			initialDetailPage.remove();
		});
		document.documentElement.dataset.scroll = true;
	});

	initialDetailPage.querySelector(".border-country__list").addEventListener("click", (e) => {
		const target = e.target;
		if (!e.target.closest("button")) return;

		const countryObj = getCountryObj(target.dataset.country);
		const newDetailPage = getCountryDetailPage(countryObj);

		newDetailPage.addEventListener("animationend", () => {
			initialDetailPage.remove();
		});
	});

	document.documentElement.dataset.scroll = false;
	return initialDetailPage;
}
function showDetailPage({ name, flagSrc, properties, borderCountries }) {
	const main = document.querySelector("main");
	main.insertAdjacentHTML(
		"beforeend",
		detailPageHTMLGenerator({
			name,
			flagSrc,
			properties,
			borderCountries,
		})
	);
	return main.lastElementChild;
}

async function getData() {
	return fetch("https://restcountries.com/v3.1/all");
}
function getCountryObj(countryName) {
	const countryObj = countriesJSON.find((country) => country.name == countryName);
	if (!countryObj) {
		alert("Error occured! Can't find country\nTry refreshing the page");
		throw new DOMException("Can't find the country name in Countries List.");
	}
	return countryObj;
}
function loadButton() {
	return `<button class="load-more-btn" id="load-btn">Load more</button>`;
}
function listContainsCountry(list, countryToLookFor) {
	return list.some((country) => country.elem == countryToLookFor.elem);
}
function countryInPreviousList(country) {
	return listContainsCountry(currentlyShowingCountries, country);
}
